'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ShoppingCart, Users, Clock, TrendingUp } from 'lucide-react'


// Tipe Data
interface SummaryData {
  total_orders: number
  unique_users: number
  avg_days_gap: number
}

interface ProductData {
  name: string
  sales: number
}

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [topProducts, setTopProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)

  // Ambil Data dari API Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Panggil endpoint yang sudah kita buat di FastAPI
        const summaryRes = await axios.get('http://localhost:8000/api/dashboard/summary')
        const productsRes = await axios.get('http://localhost:8000/api/products/top')

        setSummary(summaryRes.data)
        setTopProducts(productsRes.data)
        setLoading(false)
      } catch (error) {
        console.error('Gagal mengambil data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-xl text-blue-600 font-bold">Mengambil Data Instacart...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Instacart <span className="text-green-600">Analytics</span>
          </h1>
          <p className="text-gray-500 mt-2">Dashboard monitoring performa penjualan real-time.</p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <ShoppingCart size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Transaksi</p>
                <h3 className="text-3xl font-bold text-gray-900">{summary?.total_orders.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User Unik</p>
                <h3 className="text-3xl font-bold text-gray-900">{summary?.unique_users.toLocaleString()}</h3>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Jeda Belanja (Avg)</p>
                <h3 className="text-3xl font-bold text-gray-900">{summary?.avg_days_gap} Hari</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                Top 10 Produk Terlaris
              </h2>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} interval={0} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="sales" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Placeholder for Next Analysis */}
          <div className="bg-linear-to-br from-gray-800 to-gray-900 p-8 rounded-2xl text-white flex flex-col justify-center items-center text-center">
            <h3 className="text-2xl font-bold mb-4">Analisis Lanjutan</h3>
            <p className="text-gray-300 mb-6">Ruang ini siap untuk model Machine Learning Prediksi Reorder Anda.</p>
            <button className="px-6 py-2 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition">Segera Hadir</button>
          </div>
        </div>
      </div>
    </div>
  )
}
