package com.abhilash.stocktracker.service;

import com.abhilash.stocktracker.model.Stock;
import com.abhilash.stocktracker.model.User;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.*;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

public class FilePersistenceService {

    private static final Gson gson = new Gson();

    public static void savePortfolio(String username, Map<String, Stock> portfolio) {
        String filePath = "data/" + username + "_portfolio.dat";
        File file = new File(filePath);

        try {
            file.getParentFile().mkdirs(); // ✅ Ensure 'data/' directory exists
            try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(file))) {
                oos.writeObject(portfolio);
            }
        } catch (IOException e) {
            System.err.println("❌ Failed to save portfolio for " + username);
            e.printStackTrace();
        }
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Stock> loadPortfolio(String username) {
        File file = new File("data/" + username + "_portfolio.dat");
        if (!file.exists()) return new HashMap<>();

        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file))) {
            return (Map<String, Stock>) ois.readObject();
        } catch (Exception e) {
            System.err.println("❌ Failed to load portfolio for " + username);
            e.printStackTrace();
            return new HashMap<>();
        }
    }

    public static void saveUsersToFile(String path, Map<String, User> users) {
        File file = new File(path);

        try {
            file.getParentFile().mkdirs(); // ✅ Ensure 'data/' directory exists
            try (FileWriter writer = new FileWriter(file)) {
                gson.toJson(users, writer);
            }
        } catch (IOException e) {
            System.err.println("❌ Failed to save users file.");
            e.printStackTrace();
        }
    }

    public static Map<String, User> readUsersFromFile(String path) {
        File file = new File(path);
        if (!file.exists()) return new HashMap<>();

        try (Reader reader = new FileReader(file)) {
            Type type = new TypeToken<Map<String, User>>() {}.getType();
            return gson.fromJson(reader, type);
        } catch (IOException e) {
            System.err.println("❌ Failed to load users file.");
            e.printStackTrace();
            return new HashMap<>();
        }
    }
}
