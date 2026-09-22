'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Receipt, Calendar, Tag, AlignLeft, Loader2, ScanLine } from 'lucide-react'
import { simpanTransaksi } from '@/app/actions/transaction'
import { useSession } from 'next-auth/react'

export default function TambahPengeluaranPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Ambil data user dari session
  const user = session?.user as any
  const myName = user?.name?.split(' ')[0] || 'Saya'
  const partnerName = user?.partnerName // Mengambil hasil filter dari route.ts
  const hasPartner = !!partnerName

  // State untuk form
  const [paidBy, setPaidBy] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('') // Kosongkan dulu untuk cegah hydration error
  const [category, setCategory] = useState('Kuliner')

  // State untuk Loading
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  // Referensi untuk input file tersembunyi
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Effect untuk inisialisasi data setelah session siap
  useEffect(() => {
    if (status === 'authenticated' && user) {
      setPaidBy(myName)
      setDate(new Date().toISOString().split('T')[0])
    }
  }, [status, user, myName])

  // Fungsi Submit Form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    // Paksa gunakan paidBy dari state agar sinkron dengan tombol UI
    formData.set('paid_by', paidBy)

    try {
      await simpanTransaksi(formData)
      router.push('/dashboard')
    } catch (error) {
      console.error('Gagal menyimpan:', error)
      setIsLoading(false)
    }
  }

  const handleScanClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.error) {
        alert(data.error)
      } else {
        if (data.amount) setAmount(data.amount)
        if (data.merchant) setDescription(data.merchant)
        if (data.date) setDate(data.date)
        if (data.category) setCategory(data.category)
      }
    } catch (error) {
      console.error('Gagal scan struk:', error)
      alert('Terjadi kesalahan jaringan saat memproses struk.')
    } finally {
      setIsScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#0B4D3C]" />
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-6 bg-white sticky top-0 z-10 border-b border-gray-100">
        <Link href="/dashboard" className="p-2 -ml-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Catat Pengeluaran</h1>
        <div className="w-9"></div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 pb-10">
          
          <div className="mb-8">
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={handleScanClick}
              disabled={isScanning}
              className="w-full bg-[#0B4D3C] text-white rounded-2xl p-5 shadow-[0_8px_20px_rgba(11,77,60,0.2)] hover:bg-[#083A2D] disabled:opacity-80 transition-all flex items-center justify-between relative overflow-hidden group"
            >
              <div className="relative z-10 text-left">
                <p className="text-xs font-bold text-[#D1F0E0] tracking-widest uppercase mb-1">FITUR PREMIUM</p>
                <h2 className="text-lg font-bold">{isScanning ? 'AI Membaca...' : 'Scan Struk Otomatis'}</h2>
                <p className="text-xs text-gray-300 mt-1">Biarkan AI yang mencatat untukmu.</p>
              </div>
              <div className="relative z-10 bg-white/10 p-3 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                {isScanning ? <ScanLine className="w-6 h-6 animate-pulse" /> : <Camera className="w-6 h-6" />}
              </div>
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manual</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>
          </div>

          <div className="space-y-5">
            {/* NOMINAL */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <label className="block text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">NOMINAL (RP)</label>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-400 mr-2">Rp</span>
                <input
                  type="number"
                  name="amount"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full text-4xl font-extrabold text-[#0B4D3C] bg-transparent focus:outline-none placeholder-gray-300"
                />
              </div>
            </div>

            {/* DESKRIPSI */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2 ml-1">KETERANGAN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AlignLeft className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kopi, Bensin, dll..."
                  className="bg-white border border-gray-100 text-gray-800 text-sm font-medium rounded-xl block w-full pl-11 p-4 focus:ring-2 focus:ring-[#0B4D3C] focus:outline-none shadow-sm"
                />
              </div>
            </div>

            {/* TANGGAL & KATEGORI */}
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
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-white border border-gray-100 text-gray-800 text-xs font-medium rounded-xl block w-full pl-9 p-4 focus:ring-2 focus:ring-[#0B4D3C] focus:outline-none shadow-sm"
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
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-white border border-gray-100 text-gray-800 text-xs font-medium rounded-xl block w-full pl-9 p-4 focus:ring-2 focus:ring-[#0B4D3C] focus:outline-none shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="Kuliner">Kuliner</option>
                    <option value="Gaya Hidup">Gaya Hidup</option>
                    <option value="Transportasi">Transportasi</option>
                    <option value="Hunian">Hunian</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DIBAYAR OLEH */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">DIBAYAR OLEH</label>

              {hasPartner ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaidBy(myName)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${paidBy === myName ? 'bg-[#0B4D3C] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}
                  >
                    {myName}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidBy(partnerName)}
                    className={`py-3 rounded-xl font-bold text-sm transition-all ${paidBy === partnerName ? 'bg-[#0B4D3C] text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100'}`}
                  >
                    {partnerName}
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pribadi</p>
                  <input type="hidden" name="paid_by" value={myName} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-100 p-6 z-20 mt-auto">
          <button
            type="submit"
            disabled={isLoading || isScanning}
            className="w-full text-white bg-[#0B4D3C] hover:bg-[#083A2D] disabled:opacity-70 font-bold rounded-xl text-sm px-5 py-4 transition-all flex justify-center items-center shadow-lg"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </div>
  )
}