import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Bell, Settings, Filter, Utensils, ShoppingBag, LayoutGrid, Plus, BarChart2, ReceiptText, Car, Home, MoreHorizontal, Trash2, Calendar, ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import Link from 'next/link'
import { hapusTransaksi } from '@/app/actions/transaction'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

const getCategoryIcon = (categoryName: string) => {
  switch (categoryName) {
    case 'Kuliner':
      return <Utensils className="w-5 h-5" />
    case 'Gaya Hidup':
      return <ShoppingBag className="w-5 h-5" />
    case 'Transportasi':
      return <Car className="w-5 h-5" />
    case 'Hunian':
      return <Home className="w-5 h-5" />
    default:
      return <MoreHorizontal className="w-5 h-5" />
  }
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ filter?: string; range?: string; start?: string; end?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const accountId = (session.user as any).id

  const resolvedParams = await searchParams
  const currentFilter = resolvedParams.filter || 'semua'
  const currentRange = resolvedParams.range || 'bulan_ini'
  const startParam = resolvedParams.start
  const endParam = resolvedParams.end

  // 1. TENTUKAN RENTANG WAKTU SAAT INI DAN PERIODE SEBELUMNYA
  const now = new Date()
  let startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  let endDate = new Date()

  let prevStartDate = new Date()
  let prevEndDate = new Date()

  let dateLabel = ''
  let titleRange = 'BULAN INI'
  let compareText = 'vs bulan lalu'

  if (currentRange === '7_hari') {
    startDate = new Date(now)
    startDate.setDate(now.getDate() - 7)
    dateLabel = '7 HARI TERAKHIR'
    titleRange = '7 HARI TERAKHIR'

    // Mundur 7 hari lagi untuk perbandingan
    prevStartDate = new Date(startDate)
    prevStartDate.setDate(startDate.getDate() - 7)
    prevEndDate = new Date(endDate)
    prevEndDate.setDate(endDate.getDate() - 7)
    compareText = 'vs 7 hr sebelumnya'
  } else if (currentRange === 'kustom' && startParam && endParam) {
    startDate = new Date(startParam)
    endDate = new Date(endParam)
    endDate.setHours(23, 59, 59, 999)
    const formatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
    dateLabel = `${formatter.format(startDate)} - ${formatter.format(endDate)}`.toUpperCase()
    titleRange = 'RENTANG PILIHAN'

    // Cari durasi kustom, lalu tarik mundur untuk perbandingan
    const diffTime = endDate.getTime() - startDate.getTime()
    prevStartDate = new Date(startDate.getTime() - diffTime)
    prevEndDate = new Date(endDate.getTime() - diffTime)
    compareText = 'vs periode lalu'
  } else {
    dateLabel = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(now).toUpperCase()

    // Tarik mundur 1 bulan penuh
    prevStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1)
    prevEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0, 23, 59, 59, 999)
  }

  // 2. AMBIL DATA DARI DATABASE (Saat ini & Sebelumnya)
  const baseWhere: any = { account_id: accountId }
  if (currentFilter === 'tyo') baseWhere.paid_by = 'Tyo'
  if (currentFilter === 'el') baseWhere.paid_by = 'El'

  const account = await prisma.account.findUnique({ where: { id: accountId } })

  // Transaksi Saat Ini
  const transactions = await prisma.transaction.findMany({
    where: { ...baseWhere, transaction_date: { gte: startDate, lte: endDate } },
    orderBy: { transaction_date: 'desc' },
    include: { category: true },
  })

  // Transaksi Periode Sebelumnya
  const prevTransactions = await prisma.transaction.findMany({
    where: { ...baseWhere, transaction_date: { gte: prevStartDate, lte: prevEndDate } },
  })

  if (!account) return <div>Akun tidak ditemukan.</div>

  const firstName = account.partner_1_name?.toUpperCase() || account.client_name.toUpperCase().split(' ')[0]
  const initial = firstName.charAt(0)

  // 3. KALKULASI PERSENTASE NAIK/TURUN
  const totalPengeluaran = transactions.reduce((sum, trx) => sum + Number(trx.amount), 0)
  const totalSebelumnya = prevTransactions.reduce((sum, trx) => sum + Number(trx.amount), 0)

  let percentageDiff = 0
  let isMenurun = false
  let isSama = false

  if (totalSebelumnya === 0) {
    percentageDiff = totalPengeluaran > 0 ? 100 : 0
    isMenurun = false
    isSama = totalPengeluaran === 0
  } else {
    const diff = totalPengeluaran - totalSebelumnya
    percentageDiff = Math.abs(Math.round((diff / totalSebelumnya) * 100))
    isMenurun = diff < 0 // Menurun = Hemat (Kabar Baik)
    isSama = diff === 0
  }

  const kustomParams = currentRange === 'kustom' && startParam && endParam ? `&start=${startParam}&end=${endParam}` : ''

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-6">
        <header className="flex justify-between items-center p-6 bg-white sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0B4D3C] text-white flex items-center justify-center font-bold shadow-sm">{initial}</div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">HALO, {firstName}</p>
              <h1 className="text-sm font-bold text-[#0B4D3C]">{account.client_name}</h1>
            </div>
          </div>
          <div className="flex gap-4 text-[#0B4D3C]">
            <Bell className="w-5 h-5 cursor-pointer" />
            <Settings className="w-5 h-5 cursor-pointer" />
          </div>
        </header>

        <section className="px-6 py-4">
          <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">TOTAL PENGELUARAN {currentFilter === 'semua' ? titleRange : `OLEH ${currentFilter.toUpperCase()} (${titleRange})`}</p>
          <div className="flex items-baseline gap-1 mb-2">
            <h2 className="text-4xl font-extrabold text-[#0B4D3C] tracking-tight">Rp{totalPengeluaran.toLocaleString('id-ID')}</h2>
          </div>

          {/* INDIKATOR PERSENTASE DINAMIS */}
          <div className="flex items-center gap-2">
            {isSama ? (
              <div className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                <Minus className="w-3 h-3" /> Stabil 0%
              </div>
            ) : isMenurun ? (
              <div className="bg-[#D1F0E0] text-[#0B4D3C] px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Menurun {percentageDiff}%
              </div>
            ) : (
              <div className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Naik {percentageDiff}%
              </div>
            )}
            <span className="text-xs text-gray-400 font-medium">{compareText}</span>
          </div>
        </section>

        <section className="px-6 py-2 flex justify-between items-center border-t border-gray-100 mt-2">
          <div className="flex bg-gray-100/80 p-1 rounded-full overflow-x-auto scrollbar-hide">
            <Link
              href={`/dashboard?filter=${currentFilter}&range=bulan_ini`}
              className={`whitespace-nowrap text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors ${currentRange === 'bulan_ini' ? 'bg-white text-[#0B4D3C] shadow-sm' : 'text-gray-500'}`}
            >
              Bulan Ini
            </Link>
            <Link
              href={`/dashboard?filter=${currentFilter}&range=7_hari`}
              className={`whitespace-nowrap text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors ${currentRange === '7_hari' ? 'bg-white text-[#0B4D3C] shadow-sm' : 'text-gray-500'}`}
            >
              7 Hari
            </Link>
            <Link
              href={`/dashboard?filter=${currentFilter}&range=kustom`}
              className={`whitespace-nowrap text-[10px] font-bold px-4 py-1.5 rounded-full transition-colors ${currentRange === 'kustom' ? 'bg-white text-[#0B4D3C] shadow-sm' : 'text-gray-500'}`}
            >
              Kustom
            </Link>
          </div>
          <button className="flex items-center gap-1 text-[9px] font-bold text-[#0B4D3C] bg-white border border-[#EFFFF6] px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
            <Calendar className="w-3 h-3" /> {dateLabel}
          </button>
        </section>

        {currentRange === 'kustom' && (
          <form className="px-6 pb-4 pt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border-b border-gray-50" method="GET" action="/dashboard">
            <input type="hidden" name="filter" value={currentFilter} />
            <input type="hidden" name="range" value="kustom" />
            <input type="date" name="start" defaultValue={startParam || ''} required className="bg-white border border-gray-200 text-gray-800 text-[10px] rounded-lg w-full p-2 focus:outline-none focus:border-[#0B4D3C] shadow-sm" />
            <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
            <input type="date" name="end" defaultValue={endParam || ''} required className="bg-white border border-gray-200 text-gray-800 text-[10px] rounded-lg w-full p-2 focus:outline-none focus:border-[#0B4D3C] shadow-sm" />
            <button type="submit" className="bg-[#0B4D3C] text-white p-2 rounded-lg hover:bg-[#083A2D] shadow-sm">
              <Calendar className="w-4 h-4" />
            </button>
          </form>
        )}

        <section className="px-6 py-4">
          <div className="flex justify-between items-center mb-4 mt-2">
            <h3 className="font-bold text-gray-800">Riwayat Transaksi</h3>
            <button className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
              <Filter className="w-3 h-3" /> Filter
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <Link
              href={`/dashboard?filter=semua&range=${currentRange}${kustomParams}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${currentFilter === 'semua' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              Semua
            </Link>
            <Link
              href={`/dashboard?filter=tyo&range=${currentRange}${kustomParams}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${currentFilter === 'tyo' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              Tyo
            </Link>
            <Link
              href={`/dashboard?filter=el&range=${currentRange}${kustomParams}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${currentFilter === 'el' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              El
            </Link>
          </div>

          <div className="mb-6">
            {transactions.length === 0 ? (
              <div className="text-center bg-white p-8 rounded-2xl border border-gray-100 mt-4">
                <ReceiptText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-800">Belum ada catatan</p>
              </div>
            ) : (
              transactions.map((trx) => {
                const catName = trx.category?.name || 'Lainnya'
                const deleteTrx = hapusTransaksi.bind(null, trx.id)

                const formattedDate = new Intl.DateTimeFormat('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }).format(new Date(trx.transaction_date))

                return (
                  <div key={trx.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm mb-3 border border-gray-50 group hover:border-[#D1F0E0] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E6F5EE] flex items-center justify-center text-[#0B4D3C]">{getCategoryIcon(catName)}</div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">{trx.description}</p>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{formattedDate}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            Oleh <span className="font-bold text-gray-600">{trx.paid_by}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-800">Rp{Number(trx.amount).toLocaleString('id-ID')}</p>
                        <p className="text-[9px] font-bold text-[#0B4D3C] tracking-wider uppercase mt-1">{catName}</p>
                      </div>

                      <form action={deleteTrx}>
                        <button type="submit" title="Hapus transaksi" className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>

      <nav className="bg-white border-t border-gray-100 flex justify-between items-center px-10 py-3 relative z-20">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#0B4D3C]">
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase mt-0.5">BERANDA</span>
        </Link>
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link href="/tambah" className="w-14 h-14 bg-[#0B4D3C] rounded-full flex items-center justify-center text-white shadow-lg border-[6px] border-white hover:scale-105 transition-transform">
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </Link>
        </div>
        <Link href="/laporan" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0B4D3C] transition-colors">
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase mt-0.5">LAPORAN</span>
        </Link>
      </nav>
    </div>
  )
}
