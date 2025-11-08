package com.abhilash.stocktracker.model;

public class User {
    private String username;
    private String password;

    // 🔁 No-arg constructor (needed for deserialization)
    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // ✅ Getters
    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    // ✅ Setters (needed for deserialization)
    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
