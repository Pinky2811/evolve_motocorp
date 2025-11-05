package com.evolve.controller;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

@RestController
public class DevToggleController {

    private static final String SECRET_TOKEN = "workismoreimportant"; // your secret key
    private static final String SESSION_KEY = "devtools_enabled";

    @GetMapping("/enable_dev")
    public String enableDevTools(@RequestParam String token, HttpSession session) {
        if (SECRET_TOKEN.equals(token)) {
            session.setAttribute(SESSION_KEY, true);
            return "✅ DevTools Enabled for this browser session.";
        }
        return "❌ Invalid token.";
    }

    @GetMapping("/disable_dev")
    public String disableDevTools(HttpSession session) {
        session.removeAttribute(SESSION_KEY);
        return "🚫 DevTools Disabled again.";
    }

    @GetMapping("/check_dev")
    public boolean checkDev(HttpSession session) {
        Object flag = session.getAttribute(SESSION_KEY);
        return flag != null && (boolean) flag;
    }
}
