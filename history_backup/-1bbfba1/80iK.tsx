'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { AlertTriangle, BrainCircuit, CheckCircle, TrendingDown } from 'lucide-react'

export default function PredictivePage() {
  const [churnData, setChurnData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/predict/churn')
        setChurnData(res.data)
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
          <div className="h-8 w-8 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Menjalankan Model Prediksi...</span>
        </div>
      </div>
    )

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Predictive Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Menggunakan pola data historis untuk mendeteksi risiko di masa depan.</p>
      </div>

      {/* Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl border border-red-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">High Risk Churn</h3>
              <p className="text-sm text-gray-500">Pelanggan yang terdeteksi berhenti belanja secara tidak wajar.</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Algoritma Deteksi</h3>
              <p className="text-sm text-gray-500">
                Menggunakan <i>Gap Analysis Ratio</i> pada 3 juta data transaksi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Churn Monitor Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <TrendingDown size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Churn Risk Monitor (Top 100)</h2>
          </div>
          <span className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1 rounded-full">Action Needed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4 text-center">Total Order</th>
                <th className="px-6 py-4 text-center">Biasanya Belanja (Hari)</th>
                <th className="px-6 py-4 text-center">Terakhir Belanja (Hari)</th>
                <th className="px-6 py-4 text-center">Risk Score</th>
                <th className="px-6 py-4">Status Prediksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {churnData.map((user: any) => (
                <tr key={user.user_id} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">#{user.user_id}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{user.total_orders}x</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">Setiap {user.avg_gap} hari</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-800">{user.last_gap} hari lalu</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-red-600 font-bold">{user.risk_score}x</span> <span className="text-gray-400 text-xs">lebih lama</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                                    ${user.status === 'High Risk' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                                `}
                    >
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
