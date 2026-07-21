import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BOQItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  category: string;
}

interface BOQContextProps {
  items: BOQItem[];
  addItem: (item: Omit<BOQItem, 'id' | 'amount'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<BOQItem>) => void;
  clearBOQ: () => void;
  contingency: number;
  setContingency: (val: number) => void;
  overheadProfit: number;
  setOverheadProfit: (val: number) => void;
  tax: number;
  setTax: (val: number) => void;
}

const BOQContext = createContext<BOQContextProps | undefined>(undefined);

export const BOQProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<BOQItem[]>([]);
  const [contingency, setContingency] = useState(5);
  const [overheadProfit, setOverheadProfit] = useState(15);
  const [tax, setTax] = useState(0);

  const addItem = (item: Omit<BOQItem, 'id' | 'amount'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name && i.category === item.category);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + item.quantity, amount: (i.quantity + item.quantity) * i.rate }
            : i
        );
      }
      return [
        ...prev,
        { ...item, id: Math.random().toString(36).substr(2, 9), amount: item.quantity * item.rate },
      ];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id: string, updates: Partial<BOQItem>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const updated = { ...i, ...updates };
          updated.amount = updated.quantity * updated.rate;
          return updated;
        }
        return i;
      })
    );
  };

  const clearBOQ = () => setItems([]);

  return (
    <BOQContext.Provider value={{ items, addItem, removeItem, updateItem, clearBOQ, contingency, setContingency, overheadProfit, setOverheadProfit, tax, setTax }}>
      {children}
    </BOQContext.Provider>
  );
};

export const useBOQ = () => {
  const context = useContext(BOQContext);
  if (context === undefined) {
    throw new Error('useBOQ must be used within a BOQProvider');
  }
  return context;
};
