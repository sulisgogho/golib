import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Settings, LayoutGrid, Plus, BarChart2, Calendar, Sparkles, Download } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

// Palet warna khusus untuk grafik agar senada dengan desain
const COLOR_PALETTE = ['#0B4D3C', '#475569', '#FDBA74', '#14B8A6', '#F43F5E', '#8B5CF6']

export default async function LaporanPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const accountId = (session.user as any).id
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Ambil Data Akun dan Transaksi
  const account = await prisma.account.findUnique({ where: { id: accountId } })
  const transactions = await prisma.transaction.findMany({
    where: { account_id: accountId, transaction_date: { gte: firstDayOfMonth } },
    include: { category: true },
  })

  // OLAH DATA UNTUK GRAFIK & WAWASAN PASANGAN
  let totalBulanIni = 0
  let tyoTotal = 0
  let elTotal = 0
  const categoryData: Record<string, { total: number }> = {}

  transactions.forEach((trx) => {
    const amount = Number(trx.amount)
    totalBulanIni += amount

    // Hitung per orang
    if (trx.paid_by === 'Tyo') tyoTotal += amount
    if (trx.paid_by === 'El') elTotal += amount

    // Hitung per kategori
    const catName = trx.category?.name || 'Lainnya'
    if (!categoryData[catName]) categoryData[catName] = { total: 0 }
    categoryData[catName].total += amount
  })

  // Urutkan kategori dan beri warna dari palet desain
  const sortedCategories = Object.entries(categoryData)
    .map(([name, data], index) => ({
      name,
      total: data.total,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }))
    .sort((a, b) => b.total - a.total)

  // Buat style untuk grafik Donut (CSS Conic Gradient)
  let currentPercent = 0
  const gradientParts = sortedCategories
    .map((cat) => {
      const start = currentPercent
      const catPercent = (cat.total / totalBulanIni) * 100
      currentPercent += catPercent
      return `${cat.color} ${start}% ${currentPercent}%`
    })
    .join(', ')

  const donutBackground = totalBulanIni > 0 ? `conic-gradient(${gradientParts})` : '#E2E8F0' // Warna abu-abu jika kosong

  // Cari kategori terbesar untuk teks di tengah Donut
  const fokusKategori = sortedCategories.length > 0 ? sortedCategories[0].name : 'Belum Ada'

  // Data pengguna
  const firstName = account?.client_name.toUpperCase().split(' ')[0] || 'TYO'
  const initial = firstName.charAt(0)

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      {/* HEADER ATAS */}
      <header className="flex justify-between items-center px-6 py-5 bg-[#F7F9F8]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">{initial}</div>
          <span className="text-xs font-bold text-[#0B4D3C]">The Atelier</span>
        </div>
        <h1 className="text-sm font-bold text-[#0B4D3C] absolute left-1/2 -translate-x-1/2">Laporan</h1>
        <Settings className="w-5 h-5 text-[#0B4D3C] cursor-pointer" />
      </header>

      {/* FILTER BULAN */}
      <div className="px-6 py-2 flex justify-between items-center">
        <div className="flex bg-gray-100/80 p-1 rounded-full">
          <button className="text-[10px] font-bold bg-white text-gray-800 px-4 py-1.5 rounded-full shadow-sm">Bulan Ini</button>
          <button className="text-[10px] font-bold text-gray-500 px-4 py-1.5 rounded-full">7 Hari Terakhir</button>
          <button className="text-[10px] font-bold text-gray-500 px-4 py-1.5 rounded-full">Kustom</button>
        </div>
        <button className="flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
          <Calendar className="w-3 h-3" /> APR 2026
        </button>
      </div>

      {/* AREA KONTEN SCROLL */}
      <main className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 pb-24 space-y-6">
        {/* CARD 1: ALOKASI KATEGORI (Donut Chart) */}
        <div className="bg-white p-6 rounded-[30px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-extrabold text-[#0B4D3C] text-lg">Alokasi Kategori</h2>
              <p className="text-[10px] text-gray-500 mt-1">Analisis distribusi pengeluaran siklus ini</p>
            </div>
            <div className="text-right bg-[#EFFFF6] px-3 py-2 rounded-xl">
              <h3 className="font-extrabold text-[#0B4D3C] text-lg leading-none">Rp{(totalBulanIni / 1000).toFixed(1)}k</h3>
              <p className="text-[8px] font-bold text-[#0B4D3C] tracking-wider mt-1 uppercase">TOTAL PENGELUARAN</p>
            </div>
          </div>

          {/* DONUT CHART CSS */}
          <div className="flex justify-center mb-8 relative">
            <div className="w-48 h-48 rounded-full flex items-center justify-center shadow-inner" style={{ background: donutBackground }}>
              {/* Lubang Putih di Tengah */}
              <div className="w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-1">FOKUS</p>
                <p className="text-base font-extrabold text-[#0B4D3C]">{fokusKategori}</p>
              </div>
            </div>
          </div>

          {/* LIST KATEGORI */}
          <div className="space-y-4">
            {sortedCategories.map((cat, i) => {
              const pct = totalBulanIni > 0 ? Math.round((cat.total / totalBulanIni) * 100) : 0
              return (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-xs font-bold text-gray-800">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#0B4D3C]">Rp{(cat.total / 1000).toFixed(1)}k</p>
                    <p className="text-[8px] font-bold text-gray-400 tracking-wider mt-0.5">{pct}% DARI TOTAL</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CARD 2: WAWASAN PASANGAN */}
        <div className="bg-white p-6 rounded-[30px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="mb-6">
            <h2 className="font-extrabold text-[#0B4D3C] text-lg">Wawasan Pasangan</h2>
            <p className="text-[10px] text-gray-500 mt-1">Sinkronisasi pengeluaran antara Tyo & El</p>
          </div>

          {/* Progress Tyo */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600">TY</div>
                <span className="text-xs font-bold text-gray-800">Tyo</span>
              </div>
              <span className="text-xs font-extrabold text-[#0B4D3C]">Rp{(tyoTotal / 1000).toFixed(1)}k</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-[#10B981] h-2 rounded-full" style={{ width: `${totalBulanIni > 0 ? (tyoTotal / totalBulanIni) * 100 : 0}%` }}></div>
            </div>
          </div>

          {/* Progress El */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600">EL</div>
                <span className="text-xs font-bold text-gray-800">El</span>
              </div>
              <span className="text-xs font-extrabold text-[#0B4D3C]">Rp{(elTotal / 100).toFixed(1)}k</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-[#475569] h-2 rounded-full" style={{ width: `${totalBulanIni > 0 ? (elTotal / totalBulanIni) * 100 : 0}%` }}></div>
            </div>
          </div>

          {/* Target Insight Box */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center text-white">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="text-[9px] font-bold text-[#0B4D3C] tracking-wider uppercase">TARGET TABUNGAN BERSAMA</span>
            </div>
            <p className="text-xs text-[#0B4D3C] leading-relaxed">
              Anda <span className="font-extrabold">12% lebih hemat</span> dibanding bulan lalu. Bersama-sama, Anda telah menabung Rp400k untuk Dana Atelier.
            </p>
          </div>
        </div>

        {/* TOMBOL UNDUH */}
        <button className="w-full flex items-center justify-center gap-2 bg-[#0B4D3C] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#083A2D] transition-colors mt-4">
          <Download className="w-4 h-4" />
          Unduh Laporan (XLSX)
        </button>
      </main>

      {/* NAVIGATION BAR BAWAH */}
      <nav className="bg-white border-t border-gray-100 flex justify-between items-center px-10 py-3 relative z-20">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0B4D3C] transition-colors">
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase mt-0.5">BERANDA</span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link href="/tambah" className="w-14 h-14 bg-[#0B4D3C] rounded-full flex items-center justify-center text-white shadow-[0_8px_16px_rgba(11,77,60,0.2)] border-[6px] border-white hover:scale-105 transition-transform">
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </Link>
        </div>

        <Link href="/laporan" className="flex flex-col items-center gap-1 text-[#0B4D3C]">
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase mt-0.5">LAPORAN</span>
        </Link>
      </nav>
    </div>
  )
}
