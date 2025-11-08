package com.abhilash.stocktracker.controller;

import com.abhilash.stocktracker.model.Stock;
import com.abhilash.stocktracker.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @PostMapping("/{username}/add")
    public ResponseEntity<?> addStock(@PathVariable String username, @RequestBody Stock stock) {
        portfolioService.addStock(username, stock);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getPortfolio(@PathVariable String username) {
        return ResponseEntity.ok(portfolioService.getPortfolio(username));
    }

    @PostMapping("/{username}/sell")
    public ResponseEntity<?> sellStock(@PathVariable String username, @RequestBody Stock stock) {
        portfolioService.sellStock(username, stock);
        return ResponseEntity.ok().build();
    }
}