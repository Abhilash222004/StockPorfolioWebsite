package com.abhilash.stocktracker.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class StockAPIService {

    private static final Logger logger = LoggerFactory.getLogger(StockAPIService.class);
    // TODO: Replace with your own Alpha Vantage API key
    private static final String API_KEY = "2EIJ1H5RZYMPZ3V3"; // Replace with your own key
    private static final String BASE_URL = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=%s&apikey=" + API_KEY;

    public double getLivePrice(String symbol) {
        String url = String.format(BASE_URL, symbol);
        logger.debug("Fetching live price for symbol: {} from URL: {}", symbol, url);
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(url);
            return httpClient.execute(request, response -> {
                int statusCode = response.getCode();
                if (statusCode != 200) {
                    logger.error("API request failed with response code: {}", statusCode);
                    logger.error("Response: {}", EntityUtils.toString(response.getEntity()));
                    return -1.0;
                }
                HttpEntity entity = response.getEntity();
                String responseBody = EntityUtils.toString(entity);
                logger.debug("Raw API response for {}: {}", symbol, responseBody);
                JsonObject jsonObject = JsonParser.parseString(responseBody).getAsJsonObject();
                logger.debug("Parsed JSON object for {}: {}", symbol, jsonObject.toString());
                JsonObject quote = jsonObject.getAsJsonObject("Global Quote");

                if (quote == null || quote.size() == 0 || !quote.has("05. price")) {
                    logger.error("Invalid or missing data in API response for symbol: {}", symbol);
                    return -1.0;
                }
                return Double.parseDouble(quote.get("05. price").getAsString());
            });
        } catch (Exception e) {
            logger.error("Error fetching stock price for {}: {}", symbol, e.getMessage());
            return -1.0;
        }
    }
}
