import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TrendChart = ({ data, year }: { data: Array<{ month: number; count: number }>, year: number }) => (
  <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
          <TrendingUp size={16} className="text-emerald-500" />
        </div>
        แนวโน้มการสมัครรายเดือน
      </h3>
      <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5 text-[12px] font-bold text-gray-400">
        <BarChart3 size={12} />
        ปี {year}
      </div>
    </div>
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF613E" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#FF613E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F5" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fontWeight: 600, fill: '#B0B0B0' }}
            tickFormatter={(val) => ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][val - 1]}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#B0B0B0' }} width={30} />
          <Tooltip
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid #F0F0F5', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              fontSize: '12px',
              fontWeight: 600
            }}
            labelFormatter={(val) => `เดือนที่ ${val}`}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#FF613E" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#colorCount)" 
            dot={{ r: 3, fill: '#FF613E', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 5, fill: '#FF613E', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
