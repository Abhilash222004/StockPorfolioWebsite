package com.abhilash.stocktracker.controller;

import com.abhilash.stocktracker.model.User;
import com.abhilash.stocktracker.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (authService.signup(user.getUsername(), user.getPassword())) {
            return ResponseEntity.ok("User registered successfully");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        logger.info("Login attempt for username: {}", user.getUsername());
        User loggedInUser = authService.login(user.getUsername(), user.getPassword());
        if (loggedInUser != null) {
            logger.info("Login successful for username: {}", user.getUsername());
            return ResponseEntity.ok(loggedInUser);
        } else {
            logger.warn("Login failed for username: {}", user.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
}