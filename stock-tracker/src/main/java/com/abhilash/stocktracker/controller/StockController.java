package com.abhilash.stocktracker.controller;

import com.abhilash.stocktracker.service.StockAPIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.OPTIONS}
)
public class StockController {
    @Autowired
    private StockAPIService stockAPIService;

    @GetMapping("/{symbol}/price")
    public ResponseEntity<Double> getLivePrice(@PathVariable String symbol) {
        double price = stockAPIService.getLivePrice(symbol);
        if (price > 0) {
            return ResponseEntity.ok(price);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}