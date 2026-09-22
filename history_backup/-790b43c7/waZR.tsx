import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Settings, LayoutGrid, Plus, BarChart2, Calendar, Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

const COLOR_PALETTE = ['#0B4D3C', '#475569', '#FDBA74', '#14B8A6', '#F43F5E', '#8B5CF6']

const formatK = (num: number) => {
  return parseFloat((num / 1000).toFixed(1)).toLocaleString('id-ID')
}

export default async function LaporanPage({ searchParams }: { searchParams: Promise<{ range?: string; start?: string; end?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const accountId = (session.user as any).id
  const resolvedParams = await searchParams
  const currentRange = resolvedParams.range || 'bulan_ini'

  const startParam = resolvedParams.start
  const endParam = resolvedParams.end

  // LOGIKA RENTANG WAKTU DINAMIS
  const now = new Date()
  let startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  let endDate = new Date()
  let dateLabel = ''

  if (currentRange === '7_hari') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)
    dateLabel = '7 HARI TERAKHIR'
  } else if (currentRange === 'kustom' && startParam && endParam) {
    startDate = new Date(startParam)
    endDate = new Date(endParam)
    endDate.setHours(23, 59, 59, 999)

    const formatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
    dateLabel = `${formatter.format(startDate)} - ${formatter.format(endDate)}`.toUpperCase()
  } else {
    dateLabel = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(now).toUpperCase()
  }

  // TARIK DATA BERDASARKAN RENTANG WAKTU
  const account = await prisma.account.findUnique({ where: { id: accountId } })
  const transactions = await prisma.transaction.findMany({
    where: {
      account_id: accountId,
      transaction_date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { category: true },
  })

  // OLAH DATA
  let totalBulanIni = 0
  let tyoTotal = 0
  let elTotal = 0
  const categoryData: Record<string, { total: number }> = {}

  transactions.forEach((trx) => {
    const amount = Number(trx.amount)
    totalBulanIni += amount

    if (trx.paid_by === 'Tyo') tyoTotal += amount
    if (trx.paid_by === 'El') elTotal += amount

    const catName = trx.category?.name || 'Lainnya'
    if (!categoryData[catName]) categoryData[catName] = { total: 0 }
    categoryData[catName].total += amount
  })

  const sortedCategories = Object.entries(categoryData)
    .map(([name, data], index) => ({
      name,
      total: data.total,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }))
    .sort((a, b) => b.total - a.total)

  let currentPercent = 0
  const gradientParts = sortedCategories
    .map((cat) => {
      const start = currentPercent
      const catPercent = (cat.total / totalBulanIni) * 100
      currentPercent += catPercent
      return `${cat.color} ${start}% ${currentPercent}%`
    })
    .join(', ')

  const donutBackground = totalBulanIni > 0 ? `conic-gradient(${gradientParts})` : '#E2E8F0'
  const fokusKategori = sortedCategories.length > 0 ? sortedCategories[0].name : 'Belum Ada'

  const firstName = account?.client_name.toUpperCase().split(' ')[0] || 'TYO'
  const initial = firstName.charAt(0)
  const accountName = account?.client_name || 'CatetDuit'

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      <header className="flex justify-between items-center px-6 py-5 bg-[#F7F9F8]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">{initial}</div>
          <span className="text-xs font-bold text-[#0B4D3C]">{accountName}</span>
        </div>
        <h1 className="text-sm font-bold text-[#0B4D3C] absolute left-1/2 -translate-x-1/2">Laporan</h1>
        <div>
                    <LogoutButton />
                  </div>
        
      </header>

      {/* NAVIGASI FILTER WAKTU */}
      <div className="px-6 py-2 flex justify-between items-center">
        <div className="flex bg-gray-100/80 p-1 rounded-full overflow-x-auto scrollbar-hide">
          <Link href="/laporan?range=bulan_ini" className={`whitespace-nowrap text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors ${currentRange === 'bulan_ini' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
            Bulan Ini
          </Link>
          <Link href="/laporan?range=7_hari" className={`whitespace-nowrap text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors ${currentRange === '7_hari' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
            7 Hari
          </Link>
          <Link href="/laporan?range=kustom" className={`whitespace-nowrap text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors ${currentRange === 'kustom' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
            Kustom
          </Link>
        </div>

        <button className="flex items-center gap-1 text-[9px] font-bold text-[#0B4D3C] bg-white border border-[#EFFFF6] px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
          <Calendar className="w-3 h-3" /> {dateLabel}
        </button>
      </div>

      {/* FORM INPUT TANGGAL KUSTOM */}
      {currentRange === 'kustom' && (
        <form className="px-6 pb-2 pt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2" method="GET" action="/laporan">
          <input type="hidden" name="range" value="kustom" />
          <input type="date" name="start" defaultValue={startParam || ''} required className="bg-white border border-gray-200 text-gray-800 text-[10px] rounded-lg w-full p-2 focus:outline-none focus:border-[#0B4D3C] shadow-sm" />
          <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
          <input type="date" name="end" defaultValue={endParam || ''} required className="bg-white border border-gray-200 text-gray-800 text-[10px] rounded-lg w-full p-2 focus:outline-none focus:border-[#0B4D3C] shadow-sm" />
          <button type="submit" className="bg-[#0B4D3C] text-white p-2 rounded-lg hover:bg-[#083A2D] shadow-sm">
            <Calendar className="w-4 h-4" />
          </button>
        </form>
      )}

      <main className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 pb-24 space-y-6">
        {/* KARTU ALOKASI KATEGORI */}
        <div className="bg-white p-6 rounded-[30px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-extrabold text-[#0B4D3C] text-lg">Alokasi Kategori</h2>
              <p className="text-[10px] text-gray-500 mt-1">Analisis pengeluaran {currentRange === 'bulan_ini' ? 'bulan' : currentRange === '7_hari' ? 'minggu' : 'rentang'} ini</p>
            </div>
            <div className="text-right bg-[#EFFFF6] px-3 py-2 rounded-xl">
              <h3 className="font-extrabold text-[#0B4D3C] text-lg leading-none">Rp{formatK(totalBulanIni)}k</h3>
              <p className="text-[8px] font-bold text-[#0B4D3C] tracking-wider mt-1 uppercase">TOTAL PENGELUARAN</p>
            </div>
          </div>

          <div className="flex justify-center mb-8 relative">
            <div className="w-48 h-48 rounded-full flex items-center justify-center shadow-inner" style={{ background: donutBackground }}>
              <div className="w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-1">FOKUS</p>
                <p className="text-base font-extrabold text-[#0B4D3C] text-center px-4 leading-tight">{fokusKategori}</p>
              </div>
            </div>
          </div>

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
                    <p className="text-xs font-bold text-[#0B4D3C]">Rp{formatK(cat.total)}k</p>
                    <p className="text-[8px] font-bold text-gray-400 tracking-wider mt-0.5">{pct}% DARI TOTAL</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* KARTU WAWASAN PASANGAN (TANPA KOTAK HIJAU) */}
        <div className="bg-white p-6 rounded-[30px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-50">
          <div className="mb-6">
            <h2 className="font-extrabold text-[#0B4D3C] text-lg">Wawasan Pasangan</h2>
            <p className="text-[10px] text-gray-500 mt-1">Sinkronisasi pengeluaran antara Tyo & El</p>
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600">TY</div>
                <span className="text-xs font-bold text-gray-800">Tyo</span>
              </div>
              <span className="text-xs font-extrabold text-[#0B4D3C]">Rp{formatK(tyoTotal)}k</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-[#10B981] h-2 rounded-full transition-all duration-1000" style={{ width: `${totalBulanIni > 0 ? (tyoTotal / totalBulanIni) * 100 : 0}%` }}></div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600">EL</div>
                <span className="text-xs font-bold text-gray-800">El</span>
              </div>
              <span className="text-xs font-extrabold text-[#0B4D3C]">Rp{formatK(elTotal)}k</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-[#475569] h-2 rounded-full transition-all duration-1000" style={{ width: `${totalBulanIni > 0 ? (elTotal / totalBulanIni) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <a
          href={`/api/export?range=${currentRange}&start=${startParam || ''}&end=${endParam || ''}`}
          className="w-full flex items-center justify-center gap-2 bg-[#0B4D3C] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#083A2D] transition-colors mt-4"
        >
          <Download className="w-4 h-4" />
          Unduh Laporan (XLSX)
        </a>
      </main>

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
