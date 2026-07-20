import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from 'recharts';

interface ExamByProgramChartProps {
  data: Array<{ programId: string; programName: string; passed: number; failed: number }>;
}

const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

export const ExamByProgramChart: React.FC<ExamByProgramChartProps> = ({ data }) => {
  const rows = data
    .filter((row) => row.passed + row.failed > 0)
    .sort((a, b) => (b.passed + b.failed) - (a.passed + a.failed))
    .map((row) => ({ ...row, label: truncate(row.programName, 28) }));

  return (
    <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
            <ClipboardCheck size={16} className="text-violet-500" />
          </div>
          ผลสอบแยกตามหลักสูตร
        </h3>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardCheck className="mx-auto text-gray-200 mb-3" size={40} />
          <p className="text-gray-400 text-xs font-bold">ยังไม่มีผลสอบของปีนี้</p>
        </div>
      ) : (
        <div style={{ height: Math.max(220, rows.length * 56) }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F5" />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#B0B0B0' }} />
              <YAxis
                dataKey="label"
                type="category"
                axisLine={false}
                tickLine={false}
                width={150}
                tick={{ fontSize: 12, fontWeight: 700, fill: '#4B5563' }}
              />
              <Tooltip
                cursor={{ fill: '#F9FAFB' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #F0F0F5',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.programName}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
              <Bar dataKey="passed" name="สอบผ่าน" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={18}>
                <LabelList dataKey="passed" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#059669' }} />
              </Bar>
              <Bar dataKey="failed" name="สอบไม่ผ่าน" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={18}>
                <LabelList dataKey="failed" position="right" style={{ fontSize: 11, fontWeight: 700, fill: '#dc2626' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
