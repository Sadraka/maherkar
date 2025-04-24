'use client'

import * as React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '@/theme/theme'
import EmotionCache from './EmotionCache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const options = {
    key: 'mui',
    stylisPlugins: [prefixer, rtlPlugin],
  }

  return (
    <EmotionCache options={options}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionCache>
  )
} 