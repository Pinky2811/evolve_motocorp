package com.evolve.controller;

import com.evolve.Repository.EVModelRepository;
import com.evolve.model.EVModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/") // Map to root
// @CrossOrigin(origins = "*") // Allow frontend access
@CrossOrigin(origins = {
        "https://evolvemotocorp.com",
        "https://www.evolvemotocorp.com",
        "https://evolve-motocorp-1.onrender.com/Evolve_Ev", // optional
        "http://localhost:8080"
})

public class EVModelController {

    @Autowired
    private EVModelRepository evModelRepository;

    private final String uploadDir = "uploads/ev_models/";

    @GetMapping("/ev_models")
    public List<EVModel> getAllEVModels() {
        return evModelRepository.findAll();
    }

    // Fetch all models
    @GetMapping("/getAllModels")
    public List<EVModel> getAllModels() {
        return evModelRepository.findAll();
    }

    // Add new EV Model
    @PostMapping("/addModel")
    public ResponseEntity<String> addModel(
            @RequestParam("modelName") String modelName,
            @RequestParam("company") String company,
            @RequestParam("price") double price,
            @RequestParam("rangeKm") int rangeKm, // ✅ changed from range → rangeKm
            @RequestParam("topSpeed") int topSpeed,
            @RequestParam("description") String description,
            @RequestParam("features") String features,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            String imagePath = null;
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
                Path path = Paths.get(uploadDir + imageName);
                Files.createDirectories(path.getParent());
                Files.write(path, imageFile.getBytes());
                imagePath = "uploads/ev_models/" + imageName;
            }

            EVModel model = new EVModel();
            model.setModelName(modelName);
            model.setCompany(company);
            model.setPrice(price);
            model.setRangeKm(rangeKm); // ✅ now matches the parameter
            model.setTopSpeed(topSpeed);
            model.setDescription(description);
            model.setFeatures(Arrays.asList(features.split(",")));
            model.setImagePath(imagePath);

            evModelRepository.save(model);
            return ResponseEntity.ok("✅ EV Model added successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error adding model: " + e.getMessage());
        }
    }

    // Update existing EV model
    @PostMapping("/updateModel")
    public ResponseEntity<?> updateModel(
            @ModelAttribute EVModel updatedModel,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        EVModel existingModel = evModelRepository.findById(updatedModel.getId())
                .orElseThrow(() -> new RuntimeException("Model not found"));

        // ✅ Only update fields that are non-null or non-zero
        if (updatedModel.getModelName() != null && !updatedModel.getModelName().isEmpty()) {
            existingModel.setModelName(updatedModel.getModelName());
        }
        if (updatedModel.getCompany() != null && !updatedModel.getCompany().isEmpty()) {
            existingModel.setCompany(updatedModel.getCompany());
        }
        if (updatedModel.getPrice() > 0) {
            existingModel.setPrice(updatedModel.getPrice());
        }
        if (updatedModel.getRangeKm() > 0) {
            existingModel.setRangeKm(updatedModel.getRangeKm());
        }
        if (updatedModel.getTopSpeed() > 0) {
            existingModel.setTopSpeed(updatedModel.getTopSpeed());
        }
        if (updatedModel.getDescription() != null && !updatedModel.getDescription().isEmpty()) {
            existingModel.setDescription(updatedModel.getDescription());
        }

        // ✅ Important fix for your error
        if (updatedModel.getFeatures() != null && !updatedModel.getFeatures().isEmpty()) {
            existingModel.setFeatures(new java.util.ArrayList<>(updatedModel.getFeatures()));
        }

        // ✅ Optional: update image only if a new file is uploaded
        if (image != null && !image.isEmpty()) {
            try {
                String uploadDir = "uploads/ev_models";
                java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }

                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                java.nio.file.Path filePath = uploadPath.resolve(fileName);
                java.nio.file.Files.copy(image.getInputStream(), filePath,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);

                existingModel.setImagePath(uploadDir + "/" + fileName);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body("Failed to upload image.");
            }
        }

        evModelRepository.save(existingModel);
        return ResponseEntity.ok("EV Model updated successfully!");
    }

    // Get single model
    @GetMapping("/getModel/{id}")
    public ResponseEntity<EVModel> getModel(@PathVariable Long id) {
        return evModelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete model
    @DeleteMapping("/deleteModel/{id}")
    public ResponseEntity<String> deleteModel(@PathVariable Long id) {
        try {
            evModelRepository.deleteById(id);
            return ResponseEntity.ok("🗑️ Model deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error deleting model: " + e.getMessage());
        }
    }
}
