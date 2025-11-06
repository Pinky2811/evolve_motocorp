package com.evolve.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

        // ✅ Global CORS configuration
        @Override
        public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/**")
                                .allowedOriginPatterns(
                                                "https://evolvemotocorp.com",
                                                "https://www.evolvemotocorp.com",
                                                "https://evolve-motocorp-1.onrender.com:*", // optional
                                                "http://localhost:*",
                                                "http://127.0.0.1:*")
                                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                                .allowedHeaders("*")
                                .allowCredentials(true);
        }

        // ✅ Static resource mapping for uploaded and static images
        @Override
        public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
                Path uploadDir = Paths.get("uploads/ev_models");
                String uploadPath = uploadDir.toFile().getAbsolutePath();

                registry.addResourceHandler("/uploads/ev_models/**")
                                .addResourceLocations("file:" + uploadPath + "/");

                registry.addResourceHandler("/uploads/**")
                                .addResourceLocations("file:D:/Evolve_Ev/uploads/");

                registry.addResourceHandler("/images/**")
                                .addResourceLocations(
                                                "classpath:/static/images/",
                                                "file:D:/Evolve_Ev/images/");
        }
}
