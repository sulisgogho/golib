import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Bell, Settings, Filter, Utensils, ShoppingBag, LayoutGrid, Plus, BarChart2, ReceiptText, Car, Home, MoreHorizontal, Trash2 } from 'lucide-react'
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

// Daftar bulan untuk ditampilkan di menu geser
const DAFTAR_BULAN = [
  { id: 1, nama: 'Januari' },
  { id: 2, nama: 'Februari' },
  { id: 3, nama: 'Maret' },
  { id: 4, nama: 'April' },
  { id: 5, nama: 'Mei' },
  { id: 6, nama: 'Juni' },
  { id: 7, nama: 'Juli' },
  { id: 8, nama: 'Agustus' },
  { id: 9, nama: 'September' },
  { id: 10, nama: 'Oktober' },
  { id: 11, nama: 'November' },
  { id: 12, nama: 'Desember' },
]

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ filter?: string; month?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const accountId = (session.user as any).id

  // 1. BACA FILTER DARI URL
  const resolvedParams = await searchParams
  const currentFilter = resolvedParams.filter || 'semua'

  // Jika tidak ada bulan di URL, gunakan bulan saat ini secara otomatis
  const currentMonthId = resolvedParams.month ? parseInt(resolvedParams.month) : new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // 2. TENTUKAN RENTANG TANGGAL BULAN YANG DIPILIH
  const startOfMonth = new Date(currentYear, currentMonthId - 1, 1)
  const endOfMonth = new Date(currentYear, currentMonthId, 0, 23, 59, 59, 999)

  // 3. ATUR KONDISI PENCARIAN DATABASE
  const whereCondition: any = {
    account_id: accountId,
    transaction_date: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
  }

  if (currentFilter === 'tyo') whereCondition.paid_by = 'Tyo'
  if (currentFilter === 'el') whereCondition.paid_by = 'El'

  const account = await prisma.account.findUnique({
    where: { id: accountId },
  })

  const transactions = await prisma.transaction.findMany({
    where: whereCondition,
    orderBy: { transaction_date: 'desc' },
    include: { category: true },
  })

  if (!account) return <div>Akun tidak ditemukan.</div>

  const firstName = account.partner_1_name?.toUpperCase() || account.client_name.toUpperCase().split(' ')[0]
  const initial = firstName.charAt(0)

  const totalPengeluaran = transactions.reduce((sum, trx) => sum + Number(trx.amount), 0)

  // Nama bulan aktif untuk teks di atas nominal
  const namaBulanAktif = DAFTAR_BULAN.find((b) => b.id === currentMonthId)?.nama.toUpperCase()

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
          <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">TOTAL PENGELUARAN {currentFilter === 'semua' ? namaBulanAktif : `OLEH ${currentFilter.toUpperCase()} DI BULAN ${namaBulanAktif}`}</p>
          <div className="flex items-baseline gap-1 mb-2">
            <h2 className="text-4xl font-extrabold text-[#0B4D3C] tracking-tight">Rp{totalPengeluaran.toLocaleString('id-ID')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#D1F0E0] text-[#0B4D3C] px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
              <span className="text-[10px]">↘</span> Menurun 12%
            </div>
            <span className="text-xs text-gray-400 font-medium">vs bulan lalu</span>
          </div>
        </section>

        {/* 4. FILTER BULAN DINAMIS */}
        <section className="px-6 py-4 flex gap-6 overflow-x-auto scrollbar-hide text-sm font-bold text-gray-400 border-b border-gray-100">
          {DAFTAR_BULAN.map((bulan) => (
            <Link
              key={bulan.id}
              href={`/dashboard?filter=${currentFilter}&month=${bulan.id}`}
              className={`whitespace-nowrap transition-colors ${currentMonthId === bulan.id ? 'bg-[#0B4D3C] text-white px-4 py-1.5 rounded-full shadow-sm' : 'hover:text-[#0B4D3C] py-1.5'}`}
            >
              {bulan.nama}
            </Link>
          ))}
        </section>

        <section className="px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Riwayat Transaksi</h3>
            <button className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
              <Filter className="w-3 h-3" /> Filter
            </button>
          </div>

          {/* 5. FILTER ORANG (Membawa parameter bulan agar tidak keriset) */}
          <div className="flex gap-2 mb-6">
            <Link
              href={`/dashboard?filter=semua&month=${currentMonthId}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${currentFilter === 'semua' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              Semua
            </Link>
            <Link
              href={`/dashboard?filter=tyo&month=${currentMonthId}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${currentFilter === 'tyo' ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              Tyo
            </Link>
            <Link
              href={`/dashboard?filter=el&month=${currentMonthId}`}
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
