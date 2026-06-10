
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint } from '../types/dashboard';
import { TrendingUp } from 'lucide-react';

interface CapitalChartProps {
  data: ChartDataPoint[];
}

export function CapitalChart({ data }: CapitalChartProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-nano-text-bright flex items-center gap-2">
          <TrendingUp size={20} className="text-nano-primary" /> Total Capital
        </h3>
      </div>
      
      <div className="flex-1 min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b2d35" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              domain={['dataMin - 100', 'dataMax + 100']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1c1e26', borderColor: '#2b2d35', color: '#f3f4f6', fontSize: '12px' }}
              itemStyle={{ color: '#22c55e' }}
              formatter={(value: any) => {
                if (typeof value === 'number') return [`$${value.toFixed(2)}`, 'Capital'];
                return [`$${value}`, 'Capital'];
              }}
            />
            <Line 
              type="monotone" 
              dataKey="capital" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#1c1e26', stroke: '#22c55e', strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
