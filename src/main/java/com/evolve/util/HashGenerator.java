package com.evolve.util;

import org.springframework.security.crypto.bcrypt.BCrypt;

public class HashGenerator {
    public static void main(String[] args) {
        String hashed = BCrypt.hashpw("Rahul0210@", BCrypt.gensalt());
        System.out.println("Hashed password: " + hashed);
    }
}
