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
import java.util.Base64;
import java.util.Map;

@RestController
public class PaymentController {

    private static final String RAZORPAY_KEY = "rzp_test_XXXXX"; // 🔑 Replace with your Key ID
    private static final String RAZORPAY_SECRET = "YOUR_SECRET_KEY"; // 🔑 Replace with your Secret Key

    private RazorpayClient razorpayClient;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private NotificationService notificationService;

    // ✅ Initialize Razorpay client once
    @PostConstruct
    public void init() throws Exception {
        this.razorpayClient = new RazorpayClient(RAZORPAY_KEY, RAZORPAY_SECRET);
    }

    // ✅ Step 1: Create Razorpay Order (returns JSON cleanly)
    @PostMapping("/create_order")
    public ResponseEntity<?> createOrder(@RequestParam int amount) {
        try {
            JSONObject options = new JSONObject();
            options.put("amount", amount * 100); // amount in paise
            options.put("currency", "INR");
            options.put("receipt", "txn_" + System.currentTimeMillis());
            options.put("payment_capture", 1);

            Order order = razorpayClient.orders.create(options);

            // Convert Order JSON → Map
            Map<String, Object> response = new Gson().fromJson(order.toString(), Map.class);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Step 2–6: Verify + Save Booking + Notify
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmBooking(
            @RequestParam String razorpay_order_id,
            @RequestParam String razorpay_payment_id,
            @RequestParam String razorpay_signature,
            @RequestParam String name,
            @RequestParam String address,
            @RequestParam String mobile) {
        try {
            // Step 2: Verify Payment Signature
            String payload = razorpay_order_id + "|" + razorpay_payment_id;
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(RAZORPAY_SECRET.getBytes(), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            String generatedSignature = Base64.getEncoder().encodeToString(
                    sha256_HMAC.doFinal(payload.getBytes()));

            if (!generatedSignature.equals(razorpay_signature)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Payment verification failed"));
            }

            // Step 3–5: Save booking + assign voucher
            Prebooking booking = bookingService.confirmBooking(name, address, mobile);

            // Step 6: Build confirmation message
            String msg = "Hello " + booking.getName() + ",\n" +
                    "🎉 Your payment was successful!\n\n" +
                    "Receipt No: " + booking.getReceiptNo() + "\n" +
                    "Coupon No: " + booking.getCouponNo() + "\n" +
                    "Name: " + booking.getName() + "\n" +
                    "Mobile: " + booking.getContact() + "\n" +
                    "Address: " + booking.getAddress() + "\n\n" +
                    "✅ Thank you for booking with EVOLVE MOTOCORP!\n" +
                    "🎁 Your gift will be delivered within 7 days.";

            // Step 7: Send SMS & WhatsApp
            notificationService.sendSms(mobile, msg);
            notificationService.sendWhatsApp(mobile, msg);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Booking confirmed, SMS & WhatsApp sent",
                    "receiptNo", booking.getReceiptNo(),
                    "couponNo", booking.getCouponNo()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
