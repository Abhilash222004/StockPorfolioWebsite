import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Stock {
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  quantity: number;
  price: number;
  timestamp: Date;
}

interface AuthContextType {
  user: User | null;
  portfolio: Stock[];
  transactions: Transaction[];
  totalInvestment: number;
  currentValue: number;
  login: (username: string, password: string) => boolean;
  signup: (username: string, password: string) => boolean;
  logout: () => void;
  buyStock: (symbol: string, quantity: number, avgBuyPrice: number, stockName: string, currentPrice: number) => void;
  sellStock: (symbol: string, quantity: number, price: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Stock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8083/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('Login userData:', userData); // Add this for debugging
      
      setUser({
        id: userData.id || username, // Fallback to username if no id
        email: userData.email || '', // Fallback to empty string
        name: userData.username || username, // Use username field consistently
      });

        // Fetch portfolio after successful login
        const portfolioResponse = await fetch(`http://localhost:8083/api/portfolio/${username}`);
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          // Convert the map from backend to an array of Stock objects
          const portfolioArray: Stock[] = Object.keys(portfolioData).map(symbol => ({
            symbol: symbol,
            name: portfolioData[symbol].name || symbol, // Assuming name might not be returned from backend for now
            quantity: portfolioData[symbol].quantity,
            buyPrice: portfolioData[symbol].avgBuyPrice || 0.0, // Ensure it's a number
            currentPrice: portfolioData[symbol].currentPrice || 0.0, // Ensure it's a number
          }));
          setPortfolio(portfolioArray);
        } else {
          console.error('Failed to fetch portfolio:', portfolioResponse.statusText);
          setPortfolio([]);
        }
        return true;
      } else {
        console.error('Login failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const signup = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8083/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({ id: userData.id, email: userData.email, name: userData.username }); // Assuming name is username for now
        setPortfolio([]); // New user has an empty portfolio
        return true;
      } else {
        console.error('Signup failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error during signup:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setPortfolio([]);
    setTransactions([]);
  };

  const buyStock = async (symbol: string, quantity: number, avgBuyPrice: number, stockName: string, currentPrice: number) => {
    // After a successful backend call, update the local state
    // This function is called from BuyStockModal after the backend API call is successful
    setPortfolio(prevPortfolio => {
      const existingStockIndex = prevPortfolio.findIndex(stock => stock.symbol === symbol);

      if (existingStockIndex > -1) {
        const existingStock = prevPortfolio[existingStockIndex];
        const totalQuantity = existingStock.quantity + quantity;
        const newAvgBuyPrice = (existingStock.buyPrice * existingStock.quantity + avgBuyPrice * quantity) / totalQuantity;
        const updatedPortfolio = [...prevPortfolio];
        updatedPortfolio[existingStockIndex] = { ...existingStock, quantity: totalQuantity, buyPrice: newAvgBuyPrice, currentPrice: currentPrice };
        return updatedPortfolio;
      } else {
        return [...prevPortfolio, {
          symbol,
          name: stockName,
          quantity,
          buyPrice: avgBuyPrice,
          currentPrice: currentPrice,
        }];
      }
    });
    setTransactions(prev => [...prev, {
      id: Date.now().toString(),
      type: 'buy',
      symbol,
      quantity,
      price: avgBuyPrice,
      timestamp: new Date(),
    }]);
  };

  const sellStock = (symbol: string, quantity: number, currentPrice: number) => {
    setPortfolio(prevPortfolio => {
      const updatedPortfolio = prevPortfolio.map(stock => {
        if (stock.symbol === symbol) {
          const newQuantity = stock.quantity - quantity;
          if (newQuantity <= 0) {
            return null; // Mark for removal
          }
          return { ...stock, quantity: newQuantity };
        }
        return stock;
      }).filter(Boolean) as Stock[]; // Filter out nulls and assert type
      return updatedPortfolio;
    });

    setTransactions(prev => [...prev, {
      id: Date.now().toString(),
      type: 'sell',
      symbol,
      quantity,
      price: currentPrice,
      timestamp: new Date(),
    }]);
  };

  const totalInvestment = portfolio.reduce((total, stock) => 
    total + (stock.buyPrice * stock.quantity), 0
  );

  const currentValue = portfolio.reduce((total, stock) => 
    total + (stock.currentPrice * stock.quantity), 0
  );

  return (
    <AuthContext.Provider value={{
      user,
      portfolio,
      transactions,
      totalInvestment,
      currentValue,
      login,
      signup,
      logout,
      buyStock,
      sellStock,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

