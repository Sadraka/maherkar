import type { Metadata } from 'next'
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry'
import "./globals.css"

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
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
