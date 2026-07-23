import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    template: '%s | zCart',
    default: 'zCart — The all-in-one platform for local shops',
  },
  description:
    'Run your entire shop from one place. Online store, POS billing, inventory, GST invoices, and analytics — built for Indian local businesses.',
  keywords: ['online store', 'POS billing', 'inventory management', 'GST invoice', 'local shop platform'],
  openGraph: {
    title: 'zCart — The all-in-one platform for local shops',
    description: 'Run your entire shop from one place. Online store + POS billing + inventory + GST invoicing.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}

