import React, { useState } from 'react';
import { X, DollarSign, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SellStockModalProps {
  symbol: string;
  onClose: () => void;
}

export default function SellStockModal({ symbol, onClose }: SellStockModalProps) {
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, portfolio, sellStock } = useAuth();

  const stock = portfolio.find(s => s.symbol === symbol); // Get stock from portfolio

  const handleSell = async () => {
    if (!stock || !quantity || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (parseInt(quantity) > stock.quantity) {
      setError(`You can only sell up to ${stock.quantity} shares`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:8083/api/portfolio/${user?.name}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          quantity: parseInt(quantity),
          avgBuyPrice: stock.buyPrice, // Pass existing buy price, though not strictly needed for sell
          currentPrice: stock.currentPrice, // Pass current price for transaction record
        }),
      });

      if (response.ok) {
        sellStock(symbol, parseInt(quantity), stock.currentPrice); // Update local state
        onClose();
      } else {
        setError('Failed to sell stock. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    }
    setIsLoading(false);
  };

  const totalValue = stock && quantity ? stock.currentPrice * parseInt(quantity || '0') : 0;

  if (!stock) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Sell Stock</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stock Information */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{symbol}</h3>
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-gray-300 text-sm mb-2">{stock.name}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-xl font-bold text-white">${stock.currentPrice.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Available</p>
                <p className="text-white font-medium">{stock.quantity} shares</p>
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity to Sell
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              max={stock.quantity}
              placeholder="Enter quantity"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Total Value */}
          {totalValue > 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Total Value:</span>
                <span className="text-xl font-bold text-white">${totalValue.toFixed(2)}</span>
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
              onClick={handleSell}
              disabled={!quantity || isLoading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Sell Stock'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}