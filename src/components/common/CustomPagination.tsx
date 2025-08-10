'use client';

import React from 'react';
import { Box, Select, MenuItem, useTheme, useMediaQuery } from '@mui/material';

// تابع تبدیل اعداد به فارسی
const convertToPersianNumbers = (num: number): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianNumbers[parseInt(d)]);
};

interface CustomPaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  theme: {
    primary: string;
    bgLight: string;
    bgVeryLight: string;
    dark: string;
  };
  showPageSizeSelector?: boolean;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  theme,
  showPageSizeSelector = false
}) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      mt: { xs: 2, sm: 4 },
      gap: { xs: 2, sm: 3 },
      width: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: { xs: 1, sm: 2 },
        // flexWrap: 'wrap', // حذف wrap
        justifyContent: 'center',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        overflowY: 'hidden',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': { background: theme.bgLight, borderRadius: 4 }
      }}>
        {/* انتخاب‌گر تعداد آیتم‌ها */}
        {showPageSizeSelector && (
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            variant="standard"
            disableUnderline
            size="small"
            sx={{
              minWidth: { xs: 40, sm: 50 },
              bgcolor: theme.bgVeryLight,
              borderRadius: 1,
              px: { xs: 0.5, sm: 1 },
              '& .MuiSelect-select': {
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                color: theme.primary,
                py: { xs: 0.3, sm: 0.5 },
                textAlign: 'center',
                fontWeight: 500
              },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '0.8rem', sm: '1rem' },
                color: theme.primary
              },
              '&:hover': {
                bgcolor: theme.bgLight
              }
            }}
          >
            <MenuItem value={2}>۲</MenuItem>
            <MenuItem value={5}>۵</MenuItem>
            <MenuItem value={10}>۱۰</MenuItem>
            <MenuItem value={20}>۲۰</MenuItem>
            <MenuItem value={50}>۵۰</MenuItem>
          </Select>
        )}

        {/* دکمه قبلی */}
        <Box
          onClick={() => page > 1 && onPageChange(page - 1)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
            borderRadius: { xs: 1, sm: 2 },
            cursor: page > 1 ? 'pointer' : 'not-allowed',
            fontFamily: 'IRANSansX, Arial, sans-serif',
            fontWeight: 500,
            fontSize: { xs: '0.8rem', sm: '0.95rem' },
            transition: 'all 0.2s ease',
            backgroundColor: 'transparent',
            color: page > 1 ? theme.dark : '#ccc',
            border: `1px solid ${page > 1 ? theme.bgLight : '#eee'}`,
            opacity: page > 1 ? 1 : 0.5,
            '&:hover': page > 1 ? {
              backgroundColor: theme.bgLight,
              transform: 'translateY(-1px)',
            } : {}
          }}
        >
          ‹
        </Box>

        {/* شماره صفحات */}
        {(() => {
          const pages = [];
          const maxVisiblePages = isMobile ? 3 : 4; // در موبایل کمتر
          
          if (totalPages <= maxVisiblePages) {
            // اگر تعداد صفحات کم است، همه را نمایش بده
            for (let i = 1; i <= totalPages; i++) {
              pages.push(i);
            }
          } else {
            // اگر تعداد صفحات زیاد است، منطق هوشمند
            if (page <= 2) {
              // اگر در صفحات اول هستیم: 1 2 3 ... آخر
              for (let i = 1; i <= 3; i++) {
                pages.push(i);
              }
              pages.push('...');
              pages.push(totalPages);
            } else if (page >= totalPages - 1) {
              // اگر در صفحات آخر هستیم: 1 ... آخر-1 آخر
              pages.push(1);
              pages.push('...');
              for (let i = totalPages - 2; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              // اگر در وسط هستیم: 1 ... صفحه-1 صفحه صفحه+1 ... آخر
              pages.push(1);
              pages.push('...');
              pages.push(page - 1);
              pages.push(page);
              pages.push(page + 1);
              pages.push('...');
              pages.push(totalPages);
            }
          }
          
          return pages.map((pageNumber, index) => {
            if (pageNumber === '...') {
              return (
                <Box
                  key={`ellipsis-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: { xs: 24, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    fontFamily: 'IRANSansX, Arial, sans-serif',
                    fontWeight: 500,
                    fontSize: { xs: '0.7rem', sm: '0.95rem' },
                    color: theme.dark,
                    opacity: 0.6
                  }}
                >
                  ...
                </Box>
              );
            }
            
            const isCurrentPage = pageNumber === page;
            
            return (
              <Box
                key={pageNumber}
                onClick={() => onPageChange(pageNumber as number)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  borderRadius: { xs: 1, sm: 2 },
                  cursor: 'pointer',
                  fontFamily: 'IRANSansX, Arial, sans-serif',
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.95rem' },
                  transition: 'all 0.2s ease',
                  backgroundColor: isCurrentPage ? theme.primary : 'transparent',
                  color: isCurrentPage ? '#fff' : theme.dark,
                  border: `1px solid ${isCurrentPage ? theme.primary : theme.bgLight}`,
                  '&:hover': {
                    backgroundColor: isCurrentPage ? theme.dark : theme.bgLight,
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                {convertToPersianNumbers(pageNumber as number)}
              </Box>
            );
          });
        })()}

        {/* دکمه بعدی */}
        <Box
          onClick={() => page < totalPages && onPageChange(page + 1)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
            borderRadius: { xs: 1, sm: 2 },
            cursor: page < totalPages ? 'pointer' : 'not-allowed',
            fontFamily: 'IRANSansX, Arial, sans-serif',
            fontWeight: 500,
            fontSize: { xs: '0.8rem', sm: '0.95rem' },
            transition: 'all 0.2s ease',
            backgroundColor: 'transparent',
            color: page < totalPages ? theme.dark : '#ccc',
            border: `1px solid ${page < totalPages ? theme.bgLight : '#eee'}`,
            opacity: page < totalPages ? 1 : 0.5,
            '&:hover': page < totalPages ? {
              backgroundColor: theme.bgLight,
              transform: 'translateY(-1px)',
            } : {}
          }}
        >
          ›
        </Box>
      </Box>
    </Box>
  );
};

export default CustomPagination; 