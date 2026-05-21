'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const userGrowth = [
  { month: 'Jan', users: 200 },
  { month: 'Feb', users: 350 },
  { month: 'Mar', users: 480 },
  { month: 'Apr', users: 600 },
  { month: 'May', users: 750 },
];

export function LineChartComponent() {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={userGrowth}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#7D1972"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
