import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerClient, createAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [supabase, admin] = [await createServerClient(), createAdminClient()]

  const [listingResult, userResult] = await Promise.all([
    supabase
      .from('listings')
      .select('id, title, description, daily_price, image_url, owner_id, is_available')
      .eq('id', id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (listingResult.error || !listingResult.data) notFound()

  const listing = listingResult.data
  const user = userResult.data.user

  // Use admin client to read owner profile (bypasses profiles RLS)
  const { data: owner } = await admin
    .from('profiles')
    .select('full_name, telegram_handle, university_name')
    .eq('id', listing.owner_id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
            Rentify
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <Link
                href="/profile"
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                My profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 mb-6 inline-block">
          ← All listings
        </Link>

        {/* Image */}
        {listing.image_url && (
          <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-6">
            <Image
              src={listing.image_url}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
        )}

        {/* Details card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Title + price */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{listing.title}</h1>
              {!listing.is_available && (
                <span className="mt-1 inline-block text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Currently unavailable
                </span>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold text-gray-900">${listing.daily_price}</span>
              <span className="text-sm text-gray-500 ml-1">/day</span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6 whitespace-pre-line">
              {listing.description}
            </p>
          )}

          {/* Owner */}
          {owner?.full_name && (
            <p className="text-sm text-gray-500 mb-6">
              Posted by{' '}
              <span className="font-medium text-gray-700">{owner.full_name}</span>
              {owner.university_name && (
                <span className="text-gray-400"> · {owner.university_name}</span>
              )}
            </p>
          )}

          <hr className="border-gray-100 mb-6" />

          {/* Contact CTA */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Contact owner</h2>

            {user ? (
              owner?.telegram_handle ? (
                <a
                  href={`https://t.me/${owner.telegram_handle.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
                  </svg>
                  Message on Telegram (@{owner.telegram_handle.replace(/^@/, '')})
                </a>
              ) : (
                <p className="text-sm text-gray-500">房东暂未填写联系方式。</p>
              )
            ) : (
              <Link
                href={`/login?next=/listings/${listing.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Login to see contact info
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
