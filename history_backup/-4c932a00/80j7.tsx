'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'
import { Users, CalendarClock, TrendingDown } from 'lucide-react'

export default function CustomerPage() {
  const [loyaltyData, setLoyaltyData] = useState([])
  const [intervalData, setIntervalData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loyaltyRes, intervalRes] = await Promise.all([axios.get('http://localhost:8000/api/analytics/loyalty'), axios.get('http://localhost:8000/api/analytics/interval')])
        setLoyaltyData(loyaltyRes.data)
        setIntervalData(intervalRes.data)
      } catch (err) {
        console.error('Error fetching customer data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Memuat Data Pelanggan...</span>
        </div>
      </div>
    )

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Customer 360</h1>
        <p className="text-gray-500 text-sm mt-1">Analisis mendalam tentang retensi dan kebiasaan belanja pelanggan.</p>
      </div>

      {/* Chart 1: Loyalty Funnel (Retention) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={20} />
              </div>
              Loyalty Funnel (Retensi)
            </h2>
            <p className="text-sm text-gray-500 mt-2 ml-1">Grafik ini menunjukkan berapa banyak pelanggan yang bertahan melakukan order ulang.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
            <TrendingDown size={14} />
            Churn Analysis
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={loyaltyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="order_seq" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} label={{ value: 'Order Ke-', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#6b7280', marginBottom: '0.5rem' }}
                labelFormatter={(label) => `Order ke-${label}`}
                formatter={(value: number) => [<span className="font-bold text-blue-600">{value.toLocaleString()}</span>, 'User Bertahan']}
              />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Shopping Interval */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <CalendarClock size={20} />
              </div>
              Pola Jeda Belanja
            </h2>
            <p className="text-sm text-gray-500 mt-2 ml-1">Distribusi hari yang ditunggu pelanggan sebelum belanja kembali.</p>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={intervalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="days" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: '#f3f4f6', radius: 4 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(label) => `${label} Hari Jeda`}
                formatter={(value: number) => [<span className="font-bold text-purple-600">{value.toLocaleString()}</span>, 'Transaksi']}
              />
              {/* Warna Ungu Modern */}
              <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insight Box */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl flex gap-3 items-start">
          <div className="mt-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-900">Key Insight:</span> Terlihat dua puncak aktivitas yang sangat jelas. Puncak pertama di <span className="font-bold text-purple-600">7 hari</span> (belanja mingguan) dan puncak kedua
            di <span className="font-bold text-purple-600">30 hari</span> (belanja bulanan). Ini mengindikasikan bahwa mayoritas user Instacart memiliki pola rutin yang terprediksi.
          </div>
        </div>
      </div>
    </div>
  )
}
