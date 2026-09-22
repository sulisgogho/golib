'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, ShoppingCart, Clock, Calendar } from 'lucide-react'

// Definisi Tipe Data (Agar lebih rapi dari 'any')
interface HeatmapItem {
  day: number
  hour: number
  value: number
}

interface SummaryData {
  total_orders: number
  unique_users: number
  avg_days_gap: number
}

export default function ExecutiveSummary() {
  const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  // Label Hari & Jam
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, heatRes] = await Promise.all([axios.get('http://localhost:8000/api/dashboard/summary'), axios.get('http://localhost:8000/api/analytics/heatmap')])
        setSummary(sumRes.data)
        setHeatmapData(heatRes.data)
      } catch (err) {
        console.error('Gagal mengambil data:', err)
      } finally {
        // Loading dimatikan baik sukses maupun gagal
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helper untuk mendapatkan warna heatmap
  const getColor = (value: number) => {
    if (!value) return 'bg-gray-100'
    if (value > 35000) return 'bg-green-700'
    if (value > 25000) return 'bg-green-600'
    if (value > 15000) return 'bg-green-500'
    if (value > 10000) return 'bg-green-400'
    if (value > 5000) return 'bg-green-300'
    return 'bg-green-200'
  }

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-500 animate-pulse">Memuat Data Analytics...</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Summary</h1>
        <p className="text-gray-500 mt-1">Overview kesehatan bisnis Instacart secara real-time.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <ShoppingCart size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900">{summary?.total_orders?.toLocaleString() || 0}</div>
          </div>
        </div>

        {/* Card 2: Unique Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">User Unik</div>
            <div className="text-2xl font-bold text-gray-900">{summary?.unique_users?.toLocaleString() || 0}</div>
          </div>
        </div>

        {/* Card 3: Avg Days Gap */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Jeda Belanja (Avg)</div>
            <div className="text-2xl font-bold text-gray-900">
              {summary?.avg_days_gap || 0} <span className="text-sm font-normal text-gray-500">Hari</span>
            </div>
          </div>
        </div>
      </div>

      {/* HEATMAP SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
          <Clock size={20} className="text-green-600" />
          Traffic Heatmap: Waktu Tersibuk Belanja
        </h3>

        {/* Container Scrollable untuk layar kecil */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            {/* Header Jam (0 - 23) */}
            <div className="flex mb-2">
              <div className="w-12"></div> {/* Spacer label hari */}
              {hours.map((h) => (
                <div key={h} className="flex-1 text-center text-xs text-gray-400 font-medium">
                  {h}
                </div>
              ))}
            </div>

            {/* Grid Baris per Hari */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center mt-1">
                {/* Label Hari (Sen, Sel, ...) */}
                <div className="w-12 text-xs font-semibold text-gray-500">{day}</div>

                {/* Sel Jam */}
                {hours.map((hour) => {
                  // Cari data (Performa: .find di dalam loop ini O(N^2),
                  // tapi aman untuk data kecil 7x24 = 168 item)
                  const cellData = heatmapData.find((d) => d.day === dayIndex && d.hour === hour)
                  const val = cellData ? cellData.value : 0

                  return (
                    <div
                      key={hour}
                      className={`
                            flex-1 h-10 mx-[1px] rounded-sm relative group transition-all duration-200 
                            hover:scale-105 hover:z-10 hover:shadow-lg cursor-pointer
                            ${getColor(val)}
                        `}
                    >
                      {/* Tooltip Hover */}
                      <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                        <span className="font-bold">Pukul {hour}:00</span> <br />
                        Total: {val.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend / Keterangan Warna */}
        <div className="mt-6 flex justify-end items-center gap-3 text-xs text-gray-500 font-medium">
          <span>Low Traffic</span>
          {/* Perbaikan Syntax Gradient Tailwind */}
          <div className="w-32 h-3 bg-gradient-to-r from-green-100 to-green-700 rounded-full"></div>
          <span>High Traffic</span>
        </div>
      </div>
    </div>
  )
}
