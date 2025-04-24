import type { Metadata } from 'next'
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry'
import Header from '@/components/layout/Header'
import PromoBar from '@/components/layout/PromoBar'
import "./globals.css"
import { vazirFont } from '@/lib/fonts'

export const metadata: Metadata = {
  title: "ماهرکار - سامانه کاریابی",
  description: "سامانه کاریابی و استخدام متخصصین",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirFont.className}>
        <ThemeRegistry>
          <PromoBar />
          <Header />
        {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
