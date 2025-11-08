import React, { useState } from 'react';
import { X, Search, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BuyStockModalProps {
  onClose: () => void;
  onSuccess?: () => void; // Add callback for successful purchase
}

export default function BuyStockModal({ onClose, onSuccess }: BuyStockModalProps) {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stockInfo, setStockInfo] = useState<{ name: string; price: number } | null>(null);
  const [error, setError] = useState('');
  const { buyStock, user } = useAuth();

  const handleSearch = async () => {
    if (symbol.length > 0) {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8083/api/stocks/${symbol}/price`);
        if (response.ok) {
          const price = await response.json();
          setStockInfo({ name: symbol, price });
          setError('');
        } else {
          setStockInfo(null);
          setError('Stock not found.');
        }
      } catch (error) {
        setStockInfo(null);
        setError('An error occurred while fetching the price.');
      }
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!stockInfo || !quantity || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!user || !user.name) {
      setError('User not logged in.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8083/api/portfolio/${user?.name}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symbol: symbol.toUpperCase(), 
          quantity: parseInt(quantity), 
          avgBuyPrice: stockInfo.price 
        })
      });

      if (response.ok) {
        // Update local state through context
        buyStock(symbol.toUpperCase(), parseInt(quantity), stockInfo.price, stockInfo.name, stockInfo.price);
        
        // Call the success callback to refresh parent component
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      } else {
        const errorText = await response.text();
        setError(`Failed to buy stock: ${errorText}`);
      }
    } catch (error) {
      console.error('Buy stock error:', error);
      setError('An error occurred. Please try again later.');
    }

    setIsLoading(false);
  };

  const totalCost = stockInfo && quantity ? stockInfo.price * parseInt(quantity || '0') : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Buy Stock</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stock Symbol Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stock Symbol
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stock Information */}
          {stockInfo && (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">{symbol}</h3>
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-gray-300 text-sm mb-2">{stockInfo.name}</p>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-xl font-bold text-white">${stockInfo.price.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Quantity Input */}
          {stockInfo && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                placeholder="Enter quantity"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          {/* Total Cost */}
          {totalCost > 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Total Cost:</span>
                <span className="text-xl font-bold text-white">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleBuy}
              disabled={!stockInfo || !quantity || isLoading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Buy Stock'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}