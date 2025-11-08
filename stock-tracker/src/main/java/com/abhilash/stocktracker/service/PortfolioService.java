package com.abhilash.stocktracker.service;

import com.abhilash.stocktracker.model.Stock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PortfolioService {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private StockAPIService stockAPIService;

    private static final Logger logger = LoggerFactory.getLogger(PortfolioService.class);

    public void sellStock(String username, Stock stockToSell) {
        String symbol = stockToSell.getSymbol().toUpperCase();
        Map<String, Stock> portfolio = loadPortfolio(username);

        if (portfolio.containsKey(symbol)) {
            Stock existingStock = portfolio.get(symbol);
            int quantityToSell = stockToSell.getQuantity();

            if (existingStock.getQuantity() >= quantityToSell) {
                int newQty = existingStock.getQuantity() - quantityToSell;
                if (newQty == 0) {
                    // Remove stock from portfolio if quantity becomes 0
                    deleteStock(username, symbol);
                } else {
                    // Update quantity, avgBuyPrice remains the same
                    updateStock(username, symbol, newQty, existingStock.getAvgBuyPrice());
                }
            } else {
                // Handle error: trying to sell more than owned
                throw new IllegalArgumentException("Cannot sell more shares than owned for symbol: " + symbol);
            }
        } else {
            // Handle error: stock not in portfolio
            throw new IllegalArgumentException("Stock not found in portfolio for symbol: " + symbol);
        }
    }

    public Map<String, Stock> getPortfolio(String username) {
        return loadPortfolio(username);
    }

    private Map<String, Stock> loadPortfolio(String username) {
        Map<String, Stock> portfolio = new HashMap<>();
        String sql = "SELECT symbol, quantity, purchase_price FROM portfolio WHERE username = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                String symbol = rs.getString("symbol");
                int qty = rs.getInt("quantity");
                double price = rs.getDouble("purchase_price");
                double livePrice = stockAPIService.getLivePrice(symbol);
                portfolio.put(symbol, new Stock(symbol, qty, price, livePrice == -1.0 ? 0.0 : livePrice)); // Set to 0.0 if API call fails
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return portfolio;
    }

    private void insertStock(String username, String symbol, int quantity, double price) {
        logger.info("Executing INSERT for user: {}, symbol: {}, quantity: {}, price: {}", username, symbol, quantity, price);
        String sql = "INSERT INTO portfolio (username, symbol, quantity, purchase_price) VALUES (?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            stmt.setString(2, symbol);
            stmt.setInt(3, quantity);
            stmt.setDouble(4, price);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void updateStock(String username, String symbol, int quantity, double avgPrice) {
        logger.info("Executing UPDATE for user: {}, symbol: {}, quantity: {}, avgPrice: {}", username, symbol, quantity, avgPrice);
        String sql = "UPDATE portfolio SET quantity = ?, purchase_price = ? WHERE username = ? AND symbol = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, quantity);
            stmt.setDouble(2, avgPrice);
            stmt.setString(3, username);
            stmt.setString(4, symbol);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void deleteStock(String username, String symbol) {
        String sql = "DELETE FROM portfolio WHERE username = ? AND symbol = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            stmt.setString(2, symbol);
            stmt.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void addStock(String username, Stock stock) {
        logger.info("Attempting to add stock: {} for user: {}", stock.getSymbol(), username);
        String symbol = stock.getSymbol().toUpperCase();
        Map<String, Stock> portfolio = loadPortfolio(username);

        if (portfolio.containsKey(symbol)) {
            Stock old = portfolio.get(symbol);
            int newQty = old.getQuantity() + stock.getQuantity();
            double newAvg = ((old.getAvgBuyPrice() * old.getQuantity()) + (stock.getAvgBuyPrice() * stock.getQuantity())) / newQty;
            logger.info("Updating existing stock: {} for user: {} with new quantity: {} and avg price: {}", symbol, username, newQty, newAvg);
            updateStock(username, symbol, newQty, newAvg);
        } else {
            logger.info("Inserting new stock: {} for user: {} with quantity: {} and avg price: {}", symbol, username, stock.getQuantity(), stock.getAvgBuyPrice());
            insertStock(username, symbol, stock.getQuantity(), stock.getAvgBuyPrice());
        }
    }
}
