'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Sun, Moon, Truck } from 'lucide-react'

export default function InventoryPage() {
  const [timeData, setTimeData] = useState<any>({ morning: [], night: [] })
  const [weekendData, setWeekendData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [timeRes, weekendRes] = await Promise.all([axios.get('http://localhost:8000/api/inventory/time-pattern'), axios.get('http://localhost:8000/api/inventory/weekend-rush')])
        setTimeData(timeRes.data)
        setWeekendData(weekendRes.data)
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
          <div className="h-8 w-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Memuat Data Logistik...</span>
        </div>
      </div>
    )

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Inventory & Operations</h1>
        <p className="text-gray-500 text-sm mt-1">Optimasi stok gudang berdasarkan pola waktu belanja.</p>
      </div>

      {/* Section 1: Morning vs Night Battle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sun size={100} className="text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Sun className="text-orange-500" size={20} />
            Top Restock: Pagi Hari
            <span className="text-xs font-normal text-gray-500 ml-auto">06:00 - 11:00</span>
          </h3>
          <div className="space-y-3 relative z-10">
            {timeData.morning.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                <span className="font-medium text-gray-700">
                  {idx + 1}. {item.name}
                </span>
                <span className="font-bold text-orange-600">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Night Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Moon size={100} className="text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Moon className="text-indigo-500" size={20} />
            Top Restock: Malam Hari
            <span className="text-xs font-normal text-gray-500 ml-auto">18:00 - 23:00</span>
          </h3>
          <div className="space-y-3 relative z-10">
            {timeData.night.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <span className="font-medium text-gray-700">
                  {idx + 1}. {item.name}
                </span>
                <span className="font-bold text-indigo-600">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Weekend Rush (Aisle Traffic) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Truck size={20} />
              </div>
              Weekend Rush: Lorong Tersibuk
            </h2>
            <p className="text-sm text-gray-500 mt-1">Prioritas pengisian stok lorong untuk Sabtu & Minggu.</p>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekendData.slice(0, 15)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" hide />
              <YAxis dataKey="aisle" type="category" width={140} tick={{ fontSize: 12, fill: '#4b5563' }} />
              <Tooltip cursor={{ fill: '#f0fdf4' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [value.toLocaleString(), 'Unit Terjual']} />
              <Bar dataKey="volume" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
