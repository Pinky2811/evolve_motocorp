# ========================
# 1️⃣ Build Stage
# ========================
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy Maven config and source
COPY pom.xml .
COPY src ./src

# Build the application (skip tests for speed)
RUN mvn clean package -DskipTests

# ========================
# 2️⃣ Run Stage
# ========================
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose your Spring Boot port
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
