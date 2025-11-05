package com.evolve.controller;

import com.evolve.model.Prebooking;
import com.evolve.service.BookingService;
import com.evolve.service.NotificationService;
import com.google.gson.Gson;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = {
        "https://evolvemotocorp.com",
        "https://www.evolvemotocorp.com",
        "http://localhost:8080"
})
@RestController
public class PaymentController {

    // ✅ Use your LIVE Razorpay keys
    private static final String RAZORPAY_KEY = "rzp_live_RbzgMYaL9gfRdw";
    private static final String RAZORPAY_SECRET = "hfD0kpDwmpARhCkig4IkoKki"; // keep safe!

    private RazorpayClient razorpayClient;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private NotificationService notificationService;

    // ✅ Initialize Razorpay Client
    @PostConstruct
    public void init() throws Exception {
        this.razorpayClient = new RazorpayClient(RAZORPAY_KEY, RAZORPAY_SECRET);
    }

    // ================================================================
    // STEP 1️⃣: Create Razorpay Order
    // ================================================================
    @PostMapping("/create_order")
    public ResponseEntity<?> createOrder(@RequestParam int amount) {
        try {
            JSONObject options = new JSONObject();
            options.put("amount", amount * 100); // amount in paise
            options.put("currency", "INR");
            options.put("receipt", "txn_" + System.currentTimeMillis());
            options.put("payment_capture", 1);

            Order order = razorpayClient.orders.create(options);

            Map<String, Object> response = new Gson().fromJson(order.toString(), Map.class);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ================================================================
    // STEP 2️⃣–6️⃣: Verify Payment + Save Booking + Notify
    // ================================================================
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmBooking(
            @RequestParam String razorpay_order_id,
            @RequestParam String razorpay_payment_id,
            @RequestParam String razorpay_signature,
            @RequestParam String name,
            @RequestParam String address,
            @RequestParam String mobile,
            @RequestParam(required = false) String receiptNo, // ⚙️ Optional but useful
            @RequestParam(required = false) String couponNo // ⚙️ Optional but useful
    ) {
        try {
            // ✅ Step 2: Verify Razorpay Signature (in HEX)
            String payload = razorpay_order_id + "|" + razorpay_payment_id;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(RAZORPAY_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secretKey);

            byte[] hash = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash)
                sb.append(String.format("%02x", b));
            String generatedSignature = sb.toString();

            if (!generatedSignature.equals(razorpay_signature)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "❌ Payment verification failed!"));
            }

            // ✅ Step 3: Confirm booking in DB (assign random or unused voucher internally)
            Prebooking booking = bookingService.confirmBooking(name, address, mobile);

            // ✅ Step 4: Confirmation message
            String msg = "Hello " + booking.getName() + ",\n" +
                    "🎉 Your payment was successful!\n\n" +
                    "Receipt No: " + booking.getReceiptNo() + "\n" +
                    "Coupon No: " + booking.getCouponNo() + "\n" +
                    "Name: " + booking.getName() + "\n" +
                    "Mobile: " + booking.getContact() + "\n" +
                    "Address: " + booking.getAddress() + "\n\n" +
                    "✅ Thank you for booking with EVOLVE MOTOCORP!\n" +
                    "🎁 Your gift will be delivered within 7 days.";

            // ✅ Step 5: Send notifications
            try {
                notificationService.sendSms(mobile, msg);
                notificationService.sendWhatsApp(mobile, msg);
            } catch (Exception ex) {
                System.err.println("⚠ Notification failed: " + ex.getMessage());
            }

            // ✅ Step 6: Send success response
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("status", "success");
            successResponse.put("message", "Payment verified & booking confirmed");
            successResponse.put("receiptNo", booking.getReceiptNo());
            successResponse.put("couponNo", booking.getCouponNo());
            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }
}
