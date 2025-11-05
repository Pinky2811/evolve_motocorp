package com.evolve.controller;

import com.evolve.Repository.PrebookingRepository;
import com.evolve.Repository.VoucherRepository;
import com.evolve.model.Voucher;
import com.evolve.model.VoucherRangeRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@CrossOrigin(origins = {
        "https://evolvemotocorp.com",
        "https://www.evolvemotocorp.com",
        "https://evolve-motocorp-1.onrender.com", // optional
        "http://localhost:8080"
})
@RestController
public class AdminPageController {

    @Autowired
    private PrebookingRepository prebookingRepo;

    @Autowired
    private VoucherRepository voucherRepo;

    // ✅ Hashed password for: Rahul0210@
    private static final String HASHED_PASSWORD = "$2a$10$xzWhombjTvQ0KGPNurVQ/uVVFB2FO8YgNAHt6/uEloyUk83wJX5/S";

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds, HttpSession session) {
        String username = creds.get("username");
        String password = creds.get("password");

        if (!"Rahul".equals(username)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username");
        }

        if (org.springframework.security.crypto.bcrypt.BCrypt.checkpw(password, HASHED_PASSWORD)) {
            session.setAttribute("admin", true); // ✅ store login flag
            return ResponseEntity.ok("Login successful");
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
    }

    @GetMapping("/check_session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        Boolean isAdmin = (Boolean) session.getAttribute("admin");
        if (Boolean.TRUE.equals(isAdmin)) {
            return ResponseEntity.ok("logged_in");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("not_logged_in");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate(); // ✅ clear session
        return ResponseEntity.ok("Logged out");
    }

    @GetMapping("/all_prebookings")
    public ResponseEntity<?> getAllPrebookings(HttpSession session) {
        Boolean isAdmin = (Boolean) session.getAttribute("admin");
        if (isAdmin == null || !isAdmin) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authorized");
        }

        List<Object[]> rows = prebookingRepo.fetchAdminPrebookings();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] r : rows) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", r[0]);
            row.put("name", r[1]);
            row.put("address", r[2]);
            row.put("contact", r[3]);
            row.put("receipt_no", r[4]);
            row.put("coupon_no", r[5]);
            row.put("booked_on", r[6]);
            result.add(row);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/vouchers_generate")
    public ResponseEntity<Map<String, Object>> generateVouchers(@RequestBody VoucherRangeRequest request) {
        Map<String, Object> response = new HashMap<>();
        List<String> duplicates = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        int createdCount = 0;
        int receiptStart = extractNumericPart(request.getReceiptStart());
        int receiptEnd = extractNumericPart(request.getReceiptEnd());
        int couponStart = extractNumericPart(request.getCouponStart());

        for (int i = 0; i <= (receiptEnd - receiptStart); i++) {
            String receiptNo = formatWithPrefix("EVG", receiptStart + i, 5);
            String couponNo = formatWithPrefix("EV", couponStart + i, 5);

            try {
                // ✅ Check for existing voucher before saving
                if (voucherRepo.existsByReceiptNo(receiptNo)) {
                    duplicates.add(receiptNo);
                    continue;
                }

                Voucher voucher = new Voucher();
                voucher.setReceiptNo(receiptNo);
                voucher.setCouponNo(couponNo);
                voucher.setDateAssigned(LocalDate.now());
                voucher.setUsed(false);

                voucherRepo.save(voucher);
                createdCount++;

            } catch (Exception e) {
                errors.add(receiptNo + " (" + e.getMessage() + ")");
            }
        }

        // ✅ Build clean message
        String message = "✅ " + createdCount + " vouchers generated successfully.";
        if (!duplicates.isEmpty()) {
            message += " ⚠️ Skipped " + duplicates.size() + " duplicates.";
        }
        if (!errors.isEmpty()) {
            message += " ❌ " + errors.size() + " failed to save due to errors.";
        }

        response.put("message", message);
        response.put("created", createdCount);
        response.put("duplicates", duplicates);
        response.put("errors", errors);

        // ✅ Return 200 always with detailed info
        return ResponseEntity.ok(response);
    }

    private int extractNumericPart(String code) {
        return Integer.parseInt(code.replaceAll("\\D", ""));
    }

    private String formatWithPrefix(String prefix, int number, int length) {
        return prefix + String.format("%0" + length + "d", number);
    }

    @GetMapping("/vouchers")
    public Voucher getRandomVoucher() {
        return voucherRepo.getRandomUnusedVoucher();
    }

    // ✅ New: delete voucher if not already booked

    @GetMapping("/unused_vouchers")
    public ResponseEntity<?> getUnusedVouchers() {
        List<Voucher> vouchers = voucherRepo.findUnusedVouchersNotBooked();
        return ResponseEntity.ok(vouchers);
    }

    @PostMapping("/delete_vouchers")
    public ResponseEntity<?> deleteVouchers(@RequestBody List<String> receiptNos) {
        List<String> failed = new ArrayList<>();

        for (String receiptNo : receiptNos) {
            boolean isBooked = prebookingRepo.existsByReceiptNo(receiptNo);
            if (!isBooked) {
                voucherRepo.deleteByReceiptNo(receiptNo);
            } else {
                failed.add(receiptNo);
            }
        }

        if (failed.isEmpty()) {
            return ResponseEntity.ok("✅ Selected vouchers deleted successfully!");
        } else {
            return ResponseEntity.ok("⚠️ Some vouchers could not be deleted: " + failed);
        }
    }

}
