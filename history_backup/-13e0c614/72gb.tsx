'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, ShoppingCart, Clock, Calendar, TrendingUp } from 'lucide-react'

// Definisi Tipe Data
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
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Warna Heatmap: Menggunakan gradasi Hijau yang segar
  const getColor = (value: number) => {
    if (!value) return 'bg-gray-50' // Sangat terang untuk yang kosong
    if (value > 35000) return 'bg-emerald-600' // Hijau Emerald Tua
    if (value > 25000) return 'bg-emerald-500'
    if (value > 15000) return 'bg-emerald-400'
    if (value > 10000) return 'bg-emerald-300'
    if (value > 5000) return 'bg-emerald-200'
    return 'bg-emerald-100' // Hijau Pucat
  }

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Memuat Dashboard...</span>
        </div>
      </div>
    )

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Executive Summary</h1>
          <p className="text-gray-500 text-sm mt-1">Overview performa bisnis Instacart hari ini.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 w-fit">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          Live Data Updates
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart size={22} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+2.4%</span>
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-gray-800">{summary?.total_orders?.toLocaleString() || 0}</div>
          </div>
        </div>

        {/* Card 2: Unique Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={22} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+1.8%</span>
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium mb-1">User Unik</div>
            <div className="text-3xl font-bold text-gray-800">{summary?.unique_users?.toLocaleString() || 0}</div>
          </div>
        </div>

        {/* Card 3: Avg Days Gap */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <Calendar size={22} />
            </div>
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Avg</span>
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium mb-1">Jeda Belanja</div>
            <div className="text-3xl font-bold text-gray-800">
              {summary?.avg_days_gap || 0} <span className="text-base font-normal text-gray-400">Hari</span>
            </div>
          </div>
        </div>
      </div>

      {/* HEATMAP SECTION (Light Theme) */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Clock size={20} className="text-emerald-500" />
              Traffic Heatmap
            </h3>
            <p className="text-sm text-gray-500 mt-1">Peta intensitas belanja berdasarkan Hari & Jam.</p>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px]">
            {/* Header Jam */}
            <div className="flex mb-3">
              <div className="w-14"></div>
              {hours.map((h) => (
                <div key={h} className="flex-1 text-center text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  {h < 10 ? `0${h}` : h}
                </div>
              ))}
            </div>

            {/* Grid Baris per Hari */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center mb-1.5">
                {/* Label Hari */}
                <div className="w-14 text-xs font-semibold text-gray-400">{day}</div>

                {/* Sel Jam */}
                {hours.map((hour) => {
                  const cellData = heatmapData.find((d) => d.day === dayIndex && d.hour === hour)
                  const val = cellData ? cellData.value : 0

                  return (
                    <div
                      key={hour}
                      className={`
                            flex-1 h-9 mx-[2px] rounded-md relative group transition-all duration-200 
                            hover:scale-110 hover:shadow-lg cursor-pointer border border-transparent hover:border-emerald-300
                            ${getColor(val)}
                        `}
                    >
                      {/* Tooltip (Dark Grey untuk kontras di Light Mode) */}
                      <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none">
                        <span className="font-semibold text-emerald-300">Pukul {hour}:00</span> <br />
                        <span className="text-gray-200">{val.toLocaleString()} Transaksi</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-end items-center gap-3 text-xs text-gray-500 font-medium border-t border-gray-50 pt-4">
          <span>Sepi</span>
          <div className="w-32 h-2 bg-gradient-to-r from-emerald-100 to-emerald-600 rounded-full"></div>
          <span>Ramai</span>
        </div>
      </div>
    </div>
  )
}
