'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Receipt, Calendar, Wallet, Tag, AlignLeft, Loader2 } from 'lucide-react'
import { simpanTransaksi } from '@/app/actions/transaction'

export default function TambahPengeluaranPage() {
  const router = useRouter()
  const [paidBy, setPaidBy] = useState('Tyo')
  const [isLoading, setIsLoading] = useState(false)

  // Fungsi saat tombol "Simpan Transaksi" ditekan
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('paid_by', paidBy) // Masukkan state "paidBy" ke dalam data form

    try {
      await simpanTransaksi(formData)
      router.push('/dashboard') // Kembali ke dasbor setelah sukses menyimpan
    } catch (error) {
      console.error('Gagal menyimpan:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-6 bg-white sticky top-0 z-10 border-b border-gray-100">
        <Link href="/dashboard" className="p-2 -ml-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-bold text-gray-800 tracking-wide">CATAT PENGELUARAN</h1>
        <div className="w-9"></div>
      </header>

      {/* Ubah elemen main menjadi form agar bisa di-submit */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pb-10">
          <div className="mb-8">
            <button type="button" className="w-full bg-[#0B4D3C] text-white rounded-2xl p-5 shadow-[0_8px_20px_rgba(11,77,60,0.2)] hover:bg-[#083A2D] transition-colors flex items-center justify-between relative overflow-hidden group">
              <div className="relative z-10 text-left">
                <p className="text-xs font-bold text-[#D1F0E0] tracking-widest uppercase mb-1">FITUR PREMIUM</p>
                <h2 className="text-lg font-bold">Scan Struk Otomatis</h2>
                <p className="text-xs text-gray-300 mt-1">Biarkan AI CatetDuit yang mencatat untukmu.</p>
              </div>
              <div className="relative z-10 bg-white/10 p-3 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="absolute right-[-20px] top-[-20px] opacity-10">
                <Receipt className="w-32 h-32" />
              </div>
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Atau Catat Manual</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">NOMINAL (RP)</label>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-400 mr-2">Rp</span>
                <input type="number" name="amount" required placeholder="0" className="w-full text-4xl font-extrabold text-[#0B4D3C] bg-transparent focus:outline-none placeholder-gray-300" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2 ml-1">NAMA PEDAGANG / KETERANGAN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AlignLeft className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="Misal: Kopi Kenangan, Bensin..."
                  className="bg-white border border-gray-100 text-gray-800 text-sm font-medium rounded-xl block w-full pl-11 p-4 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C] shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2 ml-1">TANGGAL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="transaction_date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="bg-white border border-gray-100 text-gray-800 text-xs font-medium rounded-xl block w-full pl-9 p-4 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C] shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2 ml-1">KATEGORI</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    name="category"
                    required
                    className="bg-white border border-gray-100 text-gray-800 text-xs font-medium rounded-xl block w-full pl-9 p-4 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C] shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="Kuliner">Kuliner</option>
                    <option value="Gaya Hidup">Gaya Hidup</option>
                    <option value="Transportasi">Transportasi</option>
                    <option value="Hunian">Hunian</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2 ml-1 flex items-center gap-1">
                <Wallet className="w-3 h-3" /> DIBAYAR OLEH
              </label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button type="button" onClick={() => setPaidBy('Tyo')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${paidBy === 'Tyo' ? 'bg-white text-[#0B4D3C] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  Tyo
                </button>
                <button type="button" onClick={() => setPaidBy('El')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${paidBy === 'El' ? 'bg-white text-[#0B4D3C] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  El
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-100 p-6 z-20 mt-auto">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white bg-[#0B4D3C] hover:bg-[#083A2D] disabled:bg-[#0B4D3C]/70 font-bold rounded-xl text-sm px-5 py-4 transition-colors flex justify-center items-center shadow-[0_8px_16px_rgba(11,77,60,0.15)]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </div>
  )
}
