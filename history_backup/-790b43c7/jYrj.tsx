import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Settings, LayoutGrid, Plus, BarChart2, Calendar, Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

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

  // 1. LOGIKA RENTANG WAKTU DINAMIS (Tetap sama)
  const now = new Date()
  let startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  let endDate = new Date()
  let dateLabel = ''

  if (currentRange === '7_hari') {
    startDate = new Date(now); startDate.setDate(now.getDate() - 7)
    dateLabel = '7 HARI TERAKHIR'
  } else if (currentRange === 'kustom' && startParam && endParam) {
    startDate = new Date(startParam); endDate = new Date(endParam)
    endDate.setHours(23, 59, 59, 999)
    dateLabel = `${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(startDate)} - ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(endDate)}`.toUpperCase()
  } else {
    dateLabel = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(now).toUpperCase()
  }

  // 2. TARIK DATA & CEK STATUS PASANGAN
  const account = await prisma.account.findUnique({ where: { id: accountId } })
  if (!account) return <div>Akun tidak ditemukan.</div>

  const hasPartner = !!account.partner_1_name && !!account.partner_2_name
  const partner1 = account.partner_1_name || 'Partner 1'
  const partner2 = account.partner_2_name || 'Partner 2'

  const transactions = await prisma.transaction.findMany({
    where: { account_id: accountId, transaction_date: { gte: startDate, lte: endDate } },
    include: { category: true },
  })

  // 3. OLAH DATA
  let totalBulanIni = 0
  let p1Total = 0
  let p2Total = 0
  const categoryData: Record<string, { total: number }> = {}

  transactions.forEach((trx) => {
    const amount = Number(trx.amount)
    totalBulanIni += amount

    // Logika pembagian saldo yang lebih akurat
    if (trx.paid_by?.toLowerCase() === partner1.toLowerCase()) p1Total += amount
    if (trx.paid_by?.toLowerCase() === partner2.toLowerCase()) p2Total += amount

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

  // ... (Logika gradient donut tetap sama)
  let currentPercent = 0
  const gradientParts = sortedCategories.map((cat) => {
    const start = currentPercent
    const catPercent = (cat.total / totalBulanIni) * 100
    currentPercent += catPercent
    return `${cat.color} ${start}% ${currentPercent}%`
  }).join(', ')

  const donutBackground = totalBulanIni > 0 ? `conic-gradient(${gradientParts})` : '#E2E8F0'
  const fokusKategori = sortedCategories.length > 0 ? sortedCategories[0].name : 'Belum Ada'

  const myFirstName = account.client_name.toUpperCase().split(' ')[0]
  const initial = myFirstName.charAt(0)

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      <header className="flex justify-between items-center px-6 py-5 bg-[#F7F9F8]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">{initial}</div>
          <span className="text-xs font-bold text-[#0B4D3C] uppercase tracking-tighter">{account.client_name}</span>
        </div>
        <h1 className="text-sm font-bold text-[#0B4D3C] absolute left-1/2 -translate-x-1/2">Laporan</h1>
        <LogoutButton />
      </header>

      {/* FILTER WAKTU (Tetap Sama) */}
      <div className="px-6 py-2 flex justify-between items-center">
        <div className="flex bg-gray-100/80 p-1 rounded-full overflow-x-auto scrollbar-hide">
          {['bulan_ini', '7_hari', 'kustom'].map((r) => (
            <Link key={r} href={`/laporan?range=${r}`} className={`whitespace-nowrap text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors ${currentRange === r ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
              {r.replace('_', ' ').toUpperCase()}
            </Link>
          ))}
        </div>
        <button className="flex items-center gap-1 text-[9px] font-bold text-[#0B4D3C] bg-white border border-[#EFFFF6] px-3 py-1.5 rounded-full shadow-sm">
          <Calendar className="w-3 h-3" /> {dateLabel}
        </button>
      </div>

      {currentRange === 'kustom' && (
        <form className="px-6 pb-2 pt-2 flex items-center gap-2" method="GET" action="/laporan">
          <input type="hidden" name="range" value="kustom" />
          <input type="date" name="start" defaultValue={startParam || ''} required className="bg-white border border-gray-200 text-gray-800 text-[10px] rounded-lg w-full p-2" />
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <input type="date" name="end" defaultValue={endParam || ''} required className="bg-white border border-gray-200 text-gray-800 text-[10px] rounded-lg w-full p-2" />
          <button type="submit" className="bg-[#0B4D3C] text-white p-2 rounded-lg"><Calendar className="w-4 h-4" /></button>
        </form>
      )}

      <main className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 pb-24 space-y-6">
        {/* KARTU ALOKASI KATEGORI */}
        <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-50">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-extrabold text-[#0B4D3C] text-lg leading-tight">Alokasi Kategori</h2>
              <p className="text-[10px] text-gray-500">Analisis pengeluaran periode ini</p>
            </div>
            <div className="text-right bg-[#EFFFF6] px-3 py-2 rounded-xl">
              <h3 className="font-extrabold text-[#0B4D3C] text-lg leading-none">Rp{formatK(totalBulanIni)}k</h3>
              <p className="text-[8px] font-bold text-[#0B4D3C] tracking-wider mt-1 uppercase text-center">TOTAL</p>
            </div>
          </div>

          <div className="flex justify-center mb-8 relative">
            <div className="w-48 h-48 rounded-full flex items-center justify-center shadow-inner" style={{ background: donutBackground }}>
              <div className="w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center shadow-sm text-center px-4">
                <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-1">TERBANYAK</p>
                <p className="text-sm font-extrabold text-[#0B4D3C] leading-tight">{fokusKategori}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {sortedCategories.map((cat, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-xs font-bold text-gray-800">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#0B4D3C]">Rp{formatK(cat.total)}k</p>
                  <p className="text-[8px] font-bold text-gray-400 tracking-wider uppercase">{Math.round((cat.total / totalBulanIni) * 100)}% Alokasi</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KARTU WAWASAN - HANYA MUNCUL JIKA ADA PASANGAN */}
        {hasPartner ? (
          <div className="bg-white p-6 rounded-[30px] shadow-sm border border-gray-50">
            <div className="mb-6">
              <h2 className="font-extrabold text-[#0B4D3C] text-lg leading-tight">Wawasan Pasangan</h2>
              <p className="text-[10px] text-gray-500 mt-1 italic">Sinkronisasi antara {partner1} & {partner2}</p>
            </div>

            {[
              { name: partner1, total: p1Total, color: '#10B981' },
              { name: partner2, total: p2Total, color: '#475569' }
            ].map((p, idx) => (
              <div key={idx} className={idx === 0 ? "mb-5" : ""}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-600 uppercase">{p.name.substring(0,2)}</div>
                    <span className="text-xs font-bold text-gray-800">{p.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#0B4D3C]">Rp{formatK(p.total)}k</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: p.color, width: `${totalBulanIni > 0 ? (p.total / totalBulanIni) * 100 : 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* JIKA SINGLE - TAMPILKAN RINGKASAN GAYA HIDUP */
          <div className="bg-[#0B4D3C] p-6 rounded-[30px] shadow-lg text-white">
            <h2 className="font-bold text-lg mb-2">Kesehatan Keuangan</h2>
            <p className="text-xs opacity-80 mb-4">Hebat! Kamu sudah mencatat {transactions.length} transaksi dalam rentang ini. Jaga terus disiplinmu, El!</p>
            <div className="flex items-center gap-2">
               <div className="bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">Akun Personal</div>
            </div>
          </div>
        )}

        <a
          href={`/api/export?range=${currentRange}&start=${startParam || ''}&end=${endParam || ''}`}
          className="w-full flex items-center justify-center gap-2 bg-white text-[#0B4D3C] border-2 border-[#0B4D3C] py-4 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-colors mt-4"
        >
          <Download className="w-4 h-4" />
          Ekspor Data (XLSX)
        </a>
      </main>

      {/* NAVIGASI BAWAH (Tetap Sama) */}
      <nav className="bg-white border-t border-gray-100 flex justify-between items-center px-10 py-3 relative z-20">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400">
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-extrabold tracking-widest mt-0.5">BERANDA</span>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link href="/tambah" className="w-14 h-14 bg-[#0B4D3C] rounded-full flex items-center justify-center text-white shadow-lg border-[6px] border-white">
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </Link>
        </div>
        <Link href="/laporan" className="flex flex-col items-center gap-1 text-[#0B4D3C]">
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-extrabold tracking-widest mt-0.5">LAPORAN</span>
        </Link>
      </nav>
    </div>
  )
}