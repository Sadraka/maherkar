'use client'

import * as React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '@/theme/theme'
import EmotionCache from './EmotionCache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'
import { Global, css } from '@emotion/react'

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const options = {
    key: 'mui',
    stylisPlugins: [prefixer, rtlPlugin],
  }

  return (
    <EmotionCache options={options}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Global
          styles={css`
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansX-Regular.woff2') format('woff2'),
                  url('/fonts/IRANSansX-Regular.woff') format('woff');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            
            @font-face {
              font-family: 'IRANSansX';
              src: url('/fonts/IRANSansX-Bold.woff2') format('woff2'),
                  url('/fonts/IRANSansX-Bold.woff') format('woff');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }
            
            html,
            body,
            button,
            input,
            select,
            textarea,
            .MuiTypography-root,
            .MuiButton-root,
            .MuiInputBase-root,
            .MuiMenuItem-root,
            .MuiListItem-root,
            .MuiTab-root,
            .MuiChip-root {
              font-family: 'IRANSansX', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
          `}
        />
        {children}
      </ThemeProvider>
    </EmotionCache>
  )
} 