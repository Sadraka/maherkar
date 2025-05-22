import type { Metadata } from 'next'
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry'
import Header from '@/components/layout/Header'
import PromoBar from '@/components/layout/PromoBar'
import "./globals.css"
import "./fonts.css"
import { iranSansFont } from '@/lib/fonts'
import { JobSeekerThemeProvider } from '@/contexts/JobSeekerThemeContext'
import { Toaster } from 'react-hot-toast'
import { AuthInitializer } from '@/components/auth'
import { AuthProvider } from '@/contexts/AuthContext'

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
    <html lang="fa" dir="rtl" className={iranSansFont.variable}>
      <head>
        <style type="text/css">
          {`
            html, body, input, button, textarea, select {
              font-family: 'IRANSansX', system-ui, sans-serif !important;
            }
          `}
        </style>
      </head>
      <body className={iranSansFont.className}>
        <ThemeRegistry>
          <JobSeekerThemeProvider>
            <AuthProvider>
              <Toaster position="top-center" />
              <AuthInitializer />
              <PromoBar />
              <Header />
              {children}
            </AuthProvider>
          </JobSeekerThemeProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
