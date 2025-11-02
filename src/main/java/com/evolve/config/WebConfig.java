package com.evolve.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // ✅ Global CORS configuration
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("*");
            }
        };
    }

    // ✅ Static resource mapping for uploaded and static images
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // 🟢 Dynamic absolute path for uploads/ev_models
        Path uploadDir = Paths.get("uploads/ev_models");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        // Serve EV model images (uploads/ev_models)
        registry.addResourceHandler("/uploads/ev_models/**")
                .addResourceLocations("file:" + uploadPath + "/");

        // Serve other uploaded files (if any)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:D:/Evolve_Ev/uploads/");

        // Serve static images (from classpath or fallback folder)
        registry.addResourceHandler("/images/**")
                .addResourceLocations(
                        "classpath:/static/images/",
                        "file:D:/Evolve_Ev/images/");
    }
}
