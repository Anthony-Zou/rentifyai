import Link from 'next/link'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = createServerClient()
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, daily_price, image_url')
    .eq('is_available', true)
    .order('id', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            Rentify
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/new"
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Post your item
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Available Items</h1>

        {error && (
          <p className="text-red-500 text-sm">Failed to load listings. Please try again later.</p>
        )}

        {!error && listings?.length === 0 && (
          <p className="text-gray-500 text-sm">No items available right now. Be the first to post!</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings?.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {listing.image_url ? (
                  <Image
                    src={listing.image_url}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-sm font-medium text-gray-900 truncate">{listing.title}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">${listing.daily_price}</span>
                  {' '}/day
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
