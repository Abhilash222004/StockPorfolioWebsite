package com.abhilash.stocktracker.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Stock {
    private String symbol;
    private int quantity;
    private double avgBuyPrice;
    private double currentPrice;

    // Default no-arg constructor (MUST be public and empty)
    public Stock() {
    }

    // Constructor for manual creation
    public Stock(String symbol, int quantity, double avgBuyPrice) {
        this(symbol, quantity, avgBuyPrice, 0.0); // Call new constructor with default currentPrice
    }

    // New constructor including currentPrice
    public Stock(String symbol, int quantity, double avgBuyPrice, double currentPrice) {
        this.symbol = symbol;
        this.quantity = quantity;
        this.avgBuyPrice = avgBuyPrice;
        this.currentPrice = currentPrice;
    }

    // Getters
    public String getSymbol() {
        return symbol;
    }

    public int getQuantity() {
        return quantity;
    }

    public double getAvgBuyPrice() {
        return avgBuyPrice;
    }

    public double getCurrentPrice() {
        return currentPrice;
    }

    // Setters (needed for JSON deserialization)
    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setAvgBuyPrice(double avgBuyPrice) {
        this.avgBuyPrice = avgBuyPrice;
    }

    public void setCurrentPrice(double currentPrice) {
        this.currentPrice = currentPrice;
    }

    @Override
    public String toString() {
        return "Stock{" +
                "symbol='" + symbol + "'" +
                ", quantity=" + quantity +
                ", avgBuyPrice=" + avgBuyPrice +
                ", currentPrice=" + currentPrice +
                '}';
    }
}