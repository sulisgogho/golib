import { redirect } from 'next/navigation'

export default function RootPage() {
  // Langsung lempar siapapun yang buka halaman utama ke halaman login
  redirect('/login')
}
