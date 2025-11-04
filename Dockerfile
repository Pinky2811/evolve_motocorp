# ================================
# 🏗️ Stage 1 — Build the application
# ================================
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml first and cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build (skip tests for faster deploy)
COPY src ./src
RUN mvn clean package -DskipTests

# ================================
# 🚀 Stage 2 — Run the application
# ================================
FROM openjdk:21-jdk-slim
WORKDIR /app

# Copy the JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Start Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
