import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
