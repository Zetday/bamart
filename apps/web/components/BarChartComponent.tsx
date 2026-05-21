"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", produk: 120, order: 80 },
  { name: "Feb", produk: 150, order: 110 },
  { name: "Mar", produk: 90, order: 130 },
  { name: "Apr", produk: 200, order: 160 },
];

export function BarChartComponent() {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="produk" fill="#7D1972" radius={[5, 5, 0, 0]} />
          <Bar dataKey="order" fill="#9b4d94" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
