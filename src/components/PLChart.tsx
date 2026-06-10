
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '../types/dashboard';
import { BarChart3 } from 'lucide-react';

interface PLChartProps {
  data: ChartDataPoint[];
}

export function PLChart({ data }: PLChartProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-nano-text-bright flex items-center gap-2">
          <BarChart3 className="text-nano-primary" /> Profit & Loss
        </h2>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b2d35" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1c1e26', borderColor: '#2b2d35', color: '#f3f4f6' }}
              itemStyle={{ color: '#eab308' }}
              formatter={(value: any) => {
                if (typeof value === 'number') return [`$${value.toFixed(2)}`, 'Profit'];
                return [`$${value}`, 'Profit'];
              }}
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#eab308" 
              fillOpacity={1} 
              fill="url(#colorProfit)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
