import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import NewListingForm from './NewListingForm'

export default async function NewListingPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/new')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            Rentify
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Post an item</h1>
        <NewListingForm userId={user.id} />
      </main>
    </div>
  )
}
