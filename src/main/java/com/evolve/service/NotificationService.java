package com.evolve.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    // Replace with your Twilio credentials
    private static final String ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxx";
    private static final String AUTH_TOKEN = "your_auth_token";
    private static final String FROM_SMS = "+1234567890"; // Twilio SMS number
    private static final String FROM_WHATSAPP = "whatsapp:+14155238886"; // Twilio sandbox

    static {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
    }

    // ✅ Send SMS
    public void sendSms(String toMobile, String body) {
        Message.creator(
                new com.twilio.type.PhoneNumber("+91" + toMobile),
                new com.twilio.type.PhoneNumber(FROM_SMS),
                body).create();
    }

    // ✅ Send WhatsApp
    public void sendWhatsApp(String toMobile, String body) {
        Message.creator(
                new com.twilio.type.PhoneNumber("whatsapp:+91" + toMobile),
                new com.twilio.type.PhoneNumber(FROM_WHATSAPP),
                body).create();
    }
}
