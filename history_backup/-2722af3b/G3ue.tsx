'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ShoppingBag, Tag, TrendingUp, Link as LinkIcon } from 'lucide-react'

export default function ProductPage() {
  const [deptData, setDeptData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [mbaData, setMbaData] = useState([]) // State baru untuk MBA
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, prodRes, mbaRes] = await Promise.all([
          axios.get('/api/analytics/departments'),
          axios.get('/api/analytics/top-products'),
          axios.get('/api/analytics/mba'), // Fetch data MBA
        ])
        setDeptData(deptRes.data)
        setTopProducts(prodRes.data)
        setMbaData(mbaRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Memuat Data Produk...</span>
        </div>
      </div>
    )

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Product Intelligence</h1>
        <p className="text-gray-500 text-sm mt-1">Analisis performa penjualan dan asosiasi produk.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: Department Performance */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Tag size={20} />
              </div>
              Top Departemen
            </h2>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#4b5563' }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [value.toLocaleString(), 'Terjual']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 2: Market Basket Analysis (FITUR BARU) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-white">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <LinkIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Frequently Bought Together</h2>
              <p className="text-xs text-gray-500">Pasangan produk yang paling sering dibeli bersamaan.</p>
            </div>
          </div>

          <div className="overflow-y-auto h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
                <tr>
                  <th className="px-6 py-3">Produk A</th>
                  <th className="px-6 py-3">Produk B</th>
                  <th className="px-6 py-3 text-right">Frekuensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mbaData.map((pair: any, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-700">{pair.product_a}</td>
                    <td className="px-6 py-3 font-medium text-gray-700">{pair.product_b}</td>
                    <td className="px-6 py-3 text-right font-bold text-blue-600">{pair.frequency.toLocaleString()}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 3: Top 10 Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <ShoppingBag size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Top 10 Best Sellers</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Produk</th>
                <th className="px-6 py-4">Departemen</th>
                <th className="px-6 py-4 text-right">Total Penjualan</th>
                <th className="px-6 py-4 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts.slice(0, 10).map((product: any, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-medium w-16">#{idx + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs border border-gray-200">{product.department}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-800">{product.sales.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center text-green-500">
                    <TrendingUp size={16} className="mx-auto" />
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
