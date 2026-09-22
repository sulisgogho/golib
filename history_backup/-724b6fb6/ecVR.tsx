import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect otomatis ke halaman Executive Summary
  redirect('/dashboard/executive')
}
