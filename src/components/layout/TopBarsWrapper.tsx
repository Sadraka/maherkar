'use client'

import PromoBar from './PromoBar'
import HeaderWrapper from './HeaderWrapper'
import { usePathname } from 'next/navigation'

export default function TopBarsWrapper() {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register')

  if (isAuthPage) return null

  return (
    <>
      <PromoBar />
      <HeaderWrapper />
    </>
  )
}