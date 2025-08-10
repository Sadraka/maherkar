import type { Metadata } from 'next'
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry'
import TopBarsWrapper from '@/components/layout/TopBarsWrapper'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { ApiProgressProvider, RealProgressProvider } from '@/components/common'
import DynamicScrollbar from '@/components/common/DynamicScrollbar'
import "./globals.css"
import "./fonts.css"
import { iranSansFont } from '@/lib/fonts'
import { JobSeekerThemeProvider } from '@/contexts/JobSeekerThemeContext'
import { Toaster } from 'react-hot-toast'
import { AuthInitializer } from '@/components/auth'
import { AuthProvider } from '@/contexts/AuthContext'
import { Suspense } from 'react'
import FontLoader from '@/components/common/FontLoader'

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
        <title>ماهرکار - سامانه کاریابی</title>
        <meta name="description" content="سامانه کاریابی و استخدام متخصصین" />
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/IRANSansX-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/IRANSansX-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={iranSansFont.className}>
        <ThemeRegistry>
          <JobSeekerThemeProvider>
            <AuthProvider>
              <ApiProgressProvider>
                <Suspense fallback={null}>
                  <RealProgressProvider />
                </Suspense>
                <DynamicScrollbar />
                <Toaster position="top-center" />
                <FontLoader />
                <AuthInitializer />
                <TopBarsWrapper />
                <ContentWrapper>
                  {children}
                </ContentWrapper>
              </ApiProgressProvider>
            </AuthProvider>
          </JobSeekerThemeProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}
