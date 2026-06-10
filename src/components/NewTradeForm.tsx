import React, { useState } from 'react';
import type { Trade, TradeType, TradeSession } from '../types/dashboard';
import { PlusCircle } from 'lucide-react';

interface NewTradeFormProps {
  onAddTrade: (trade: Trade) => void;
}

export function NewTradeForm({ onAddTrade }: NewTradeFormProps) {
  const [pair, setPair] = useState('BTC/USD');
  const [type, setType] = useState<TradeType>('LONG');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [profit, setProfit] = useState('');
  const [session, setSession] = useState<TradeSession>('New York');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryPrice || !exitPrice || !amount || !profit) return;

    const newTrade: Trade = {
      id: Date.now().toString(),
      pair,
      type,
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      amount: parseFloat(amount),
      profit: parseFloat(profit),
      date: new Date().toISOString(),
      session,
    };

    onAddTrade(newTrade);
    
    // Reset fields
    setEntryPrice('');
    setExitPrice('');
    setAmount('');
    setProfit('');
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-nano-text-bright mb-4 flex items-center gap-2">
        <PlusCircle size={20} className="text-nano-primary" /> Register Trade
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-nano-text mb-1">Pair</label>
            <input 
              type="text" 
              value={pair} 
              onChange={(e) => setPair(e.target.value)}
              className="w-full bg-nano-dark border border-nano-border rounded-md px-3 py-2 text-sm text-nano-text-bright focus:outline-none focus:border-nano-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-nano-text mb-1">Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as TradeType)}
              className="w-full bg-nano-dark border border-nano-border rounded-md px-3 py-2 text-sm text-nano-text-bright focus:outline-none focus:border-nano-primary"
            >
              <option value="LONG">Long</option>
              <option value="SHORT">Short</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-nano-text mb-1">Entry Price</label>
            <input 
              type="number" 
              step="any"
              value={entryPrice} 
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full bg-nano-dark border border-nano-border rounded-md px-3 py-2 text-sm text-nano-text-bright focus:outline-none focus:border-nano-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-nano-text mb-1">Exit Price</label>
            <input 
              type="number" 
              step="any"
              value={exitPrice} 
              onChange={(e) => setExitPrice(e.target.value)}
              className="w-full bg-nano-dark border border-nano-border rounded-md px-3 py-2 text-sm text-nano-text-bright focus:outline-none focus:border-nano-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-nano-text mb-1">Amount</label>
            <input 
              type="number" 
              step="any"
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-nano-dark border border-nano-border rounded-md px-3 py-2 text-sm text-nano-text-bright focus:outline-none focus:border-nano-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-nano-text mb-1">Profit/Loss ($)</label>
            <input 
              type="number" 
              step="any"
              value={profit} 
              onChange={(e) => setProfit(e.target.value)}
              className="w-full bg-nano-dark border border-nano-border rounded-md px-3 py-2 text-sm text-nano-text-bright focus:outline-none focus:border-nano-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-nano-text mb-1">Session</label>
          <select 
            value={session} 
            onChange={(e) => setSession(e.target.value as TradeSession)}
            className="w-full bg-nano-dark border border-nano-border rounded-md px-3 py-2 text-sm text-nano-text-bright focus:outline-none focus:border-nano-primary"
          >
            <option value="New York">New York</option>
            <option value="London">London</option>
            <option value="Tokyo">Tokyo</option>
            <option value="Sydney">Sydney</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button 
          type="submit"
          className="w-full bg-nano-primary hover:bg-yellow-400 text-nano-dark font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Add Trade
        </button>
      </form>
    </div>
  );
}
