import React, { useState } from 'react';
import { LogOut, Plus, Minus, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BuyStockModal from './BuyStockModal';
import SellStockModal from './SellStockModal';

export default function Dashboard() {
  const { user, portfolio, totalInvestment, currentValue, logout } = useAuth();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string>('');

  const totalGainLoss = currentValue - totalInvestment;
  const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  const handleSell = (symbol: string) => {
    setSelectedStock(symbol);
    setShowSellModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">StockTracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Investment</p>
                <p className="text-2xl font-bold text-white">${totalInvestment.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Current Value</p>
                <p className="text-2xl font-bold text-white">${currentValue.toFixed(2)}</p>
              </div>
              <PieChart className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
                </p>
                <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)
                </p>
              </div>
              {totalGainLoss >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-400" /> : 
                <TrendingDown className="h-8 w-8 text-red-400" />
              }
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setShowBuyModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>Buy Stock</span>
          </button>
        </div>

        {/* Portfolio Holdings */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Your Portfolio</h2>
          </div>

          {portfolio.length === 0 ? (
            <div className="p-8 text-center">
              <PieChart className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No stocks in your portfolio yet</p>
              <p className="text-sm text-gray-500 mt-2">Start by buying your first stock</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {portfolio.map((stock) => {
                const gainLoss = (stock.currentPrice - stock.buyPrice) * stock.quantity;
                const gainLossPercent = ((stock.currentPrice - stock.buyPrice) / stock.buyPrice) * 100;

                return (
                  <div key={stock.symbol} className="p-6 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{stock.symbol}</h3>
                          <span className="text-sm text-gray-400">{stock.name}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Quantity</p>
                            <p className="text-white font-medium">{stock.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Avg Cost</p>
                            <p className="text-white font-medium">${stock.buyPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Current Price</p>
                            <p className="text-white font-medium">${stock.currentPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Total Value</p>
                            <p className="text-white font-medium">${(stock.currentPrice * stock.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className={`text-sm font-medium ${gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSell(stock.symbol)}
                          className="flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all"
                        >
                          <Minus className="h-4 w-4" />
                          <span>Sell</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showBuyModal && (
        <BuyStockModal
          onClose={() => setShowBuyModal(false)}
        />
      )}

      {showSellModal && (
        <SellStockModal
          symbol={selectedStock}
          onClose={() => {
            setShowSellModal(false);
            setSelectedStock('');
          }}
        />
      )}
    </div>
  );
}