package com.abhilash.stocktracker.service;

import com.abhilash.stocktracker.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Service
public class AuthService {

    @Autowired
    private DataSource dataSource;

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    public boolean signup(String username, String password) {
        String checkQuery = "SELECT COUNT(*) FROM users WHERE username = ?";
        String insertQuery = "INSERT INTO users (username, password) VALUES (?, ?)";

        try (Connection conn = dataSource.getConnection()) {
            // Step 1: Check if user exists
            try (PreparedStatement checkStmt = conn.prepareStatement(checkQuery)) {
                logger.debug("Checking if username {} exists.", username);
                checkStmt.setString(1, username);
                ResultSet rs = checkStmt.executeQuery();
                if (rs.next() && rs.getInt(1) > 0) {
                    return false; // username already exists
                }
            }

            // Step 2: Insert new user
            try (PreparedStatement insertStmt = conn.prepareStatement(insertQuery)) {
                logger.debug("Inserting new user: {}", username);
                insertStmt.setString(1, username);
                insertStmt.setString(2, password);
                insertStmt.executeUpdate();
                return true;
            }

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }


    public User login(String username, String password) {
        String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        logger.debug("Attempting to log in user: {}", username);

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            stmt.setString(2, password);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                logger.info("User {} logged in successfully.", username);
                return new User(rs.getString("username"), rs.getString("password"));
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        logger.warn("Login failed for user: {}", username);
        return null;
    }
}
