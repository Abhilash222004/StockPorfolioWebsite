package com.abhilash.stocktracker.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    private static final String URL = "postgresql://postgres.duuzsonlgjweuwwtdzmy:Abhi@2004@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";
    private static final String USER = "postgres.duuzsonlgjweuwwtdzmy";
    private static final String PASSWORD = "Abhi@2004";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
}
}