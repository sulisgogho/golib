'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react'

export default function PredictivePage() {
  const [churnData, setChurnData] = useState([])
  const [forecastData, setForecastData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [churnRes, forecastRes] = await Promise.all([axios.get('/api/predict/churn'), axios.get('/api/predict/forecast')])
        setChurnData(churnRes.data)
        setForecastData(forecastRes.data)
      } catch (err) {
        console.error(err)
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
          <div className="h-8 w-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Menjalankan Model AI...</span>
        </div>
      </div>
    )

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Predictive Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Estimasi masa depan berdasarkan pola data historis.</p>
      </div>

      {/* Section 1: Sales Forecasting (FITUR BARU) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
              Forecast Penjualan (Minggu Depan)
            </h2>
            <p className="text-sm text-gray-500 mt-1">Proyeksi permintaan harian dengan target pertumbuhan +5%.</p>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number, name: string) => [value.toLocaleString(), name === 'forecast' ? 'Target (Forecast)' : 'Aktual (History)']}
              />
              <Legend iconType="circle" />
              {/* Garis Abu-abu (History) */}
              <Area type="monotone" dataKey="actual" stroke="#9ca3af" fill="transparent" strokeWidth={2} name="History" dot={false} />
              {/* Garis Ungu (Forecast) */}
              <Area type="monotone" dataKey="forecast" stroke="#6366f1" fill="url(#colorForecast)" strokeWidth={3} name="Forecast (+5%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2: Churn Risk Monitor (YANG SUDAH ADA) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <TrendingDown size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Churn Risk Monitor (Top 100)</h2>
          </div>
          <span className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1 rounded-full">Perlu Tindakan</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-sm text-left relative">
            <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4 text-center">Total Order</th>
                <th className="px-6 py-4 text-center">Biasanya Belanja</th>
                <th className="px-6 py-4 text-center">Terakhir Belanja</th>
                <th className="px-6 py-4 text-center">Risk Score</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {churnData.map((user: any) => (
                <tr key={user.user_id} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">#{user.user_id}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{user.total_orders}x</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{user.avg_gap} hari</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-800">{user.last_gap} hari lalu</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-red-600 font-bold">{user.risk_score}x</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.status === 'High Risk' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {user.status === 'High Risk' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
