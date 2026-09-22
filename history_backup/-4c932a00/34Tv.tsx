"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { Users, Repeat, CalendarClock } from 'lucide-react';

export default function CustomerPage() {
  const [loyaltyData, setLoyaltyData] = useState([]);
  const [intervalData, setIntervalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loyaltyRes, intervalRes] = await Promise.all([
          axios.get("http://localhost:8000/api/analytics/loyalty"),
          axios.get("http://localhost:8000/api/analytics/interval")
        ]);
        setLoyaltyData(loyaltyRes.data);
        setIntervalData(intervalRes.data);
      } catch (err) {
        console.error("Error fetching customer data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-gray-500 animate-pulse">Memuat Data Pelanggan...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer 360</h1>
        <p className="text-gray-500 mt-1">Analisis perilaku retensi dan pola belanja pelanggan.</p>
      </div>

      {/* Chart 1: Loyalty Funnel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Users size={20} className="text-blue-600"/>
              Loyalty Funnel (Retensi User)
            </h2>
            <p className="text-xs text-gray-500 mt-1">Grafik menurun menunjukkan user yang "gugur" setelah order ke-sekian.</p>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={loyaltyData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="order_seq" label={{ value: 'Order Ke-', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `Order ke-${label}`}
                formatter={(value: number) => [value.toLocaleString(), "User Bertahan"]}
              />
              <Area type="monotone" dataKey="users" stroke="#2563EB" fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Shopping Interval */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CalendarClock size={20} className="text-purple-600"/>
              Pola Jeda Belanja (Hari)
            </h2>
            <p className="text-xs text-gray-500 mt-1">Berapa hari biasanya user menunggu sebelum belanja lagi?</p>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={intervalData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="days" />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `${label} Hari Jeda`}
                formatter={(value: number) => [value.toLocaleString(), "Transaksi"]}
                cursor={{fill: 'transparent'}}
              />
              <Bar dataKey="count" fill="#9333ea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <strong>Insight:</strong> Perhatikan lonjakan tinggi di angka <strong>7 hari</strong> (Mingguan) dan <strong>30 hari</strong> (Bulanan). Ini menunjukkan pola belanja rutin pelanggan Instacart.
        </div>
      </div>
    </div>
  );
}