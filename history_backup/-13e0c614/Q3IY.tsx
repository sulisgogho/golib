'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, ShoppingCart, Clock } from 'lucide-react'

export default function ExecutiveSummary() {
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
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
        setLoading(false)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  // Helper untuk mendapatkan warna heatmap berdasarkan volume
  const getColor = (value: number) => {
    if (!value) return 'bg-gray-100'
    // Asumsi max value sekitar 40,000 (sesuaikan dengan data real nanti)
    if (value > 35000) return 'bg-green-700'
    if (value > 25000) return 'bg-green-600'
    if (value > 15000) return 'bg-green-500'
    if (value > 10000) return 'bg-green-400'
    if (value > 5000) return 'bg-green-300'
    return 'bg-green-200'
  }

  if (loading) return <div className="p-10">Loading Dashboard Suite...</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Executive Summary</h1>
        <p className="text-gray-500">Overview kesehatan bisnis Instacart secara real-time.</p>
      </div>

      {/* KPI Cards (Singkat Saja) */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm mb-1">Total Orders</div>
          <div className="text-3xl font-bold">{summary?.total_orders.toLocaleString()}</div>
        </div>
        {/* Tambahkan card lain disini */}
      </div>

      {/* HEATMAP SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-green-600" />
          Traffic Heatmap: Waktu Tersibuk Belanja
        </h3>

        <div className="min-w-[200px]">
          {/* Header Jam */}
          <div className="flex">
            <div className="w-12"></div> {/* Spacer untuk label hari */}
            {hours.map((h) => (
              <div key={h} className="flex-1 text-center text-xs text-gray-400">
                {h}
              </div>
            ))}
          </div>

          {/* Grid Hari */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mt-1">
              <div className="w-12 text-xs font-semibold text-gray-500">{day}</div>
              {hours.map((hour) => {
                // Cari data yang cocok untuk sel ini
                const cellData = heatmapData.find((d) => d.day === dayIndex && d.hour === hour)
                const val = cellData ? cellData.value : 0

                return (
                  <div key={hour} className={`flex-1 h-8 mx-[1px] rounded-sm transition hover:opacity-80 relative group ${getColor(val)}`}>
                    {/* Tooltip sederhana */}
                    <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs p-1 rounded z-10 whitespace-nowrap">Vol: {val.toLocaleString()}</div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end items-center gap-2 text-xs text-gray-500">
          <span>Low Traffic</span>
          <div className="w-20 h-2 bg-gradient-to-r from-green-200 to-green-700 rounded"></div>
          <span>High Traffic</span>
        </div>
      </div>
    </div>
  )
}
