import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { EMPLOYER_THEME } from '@/constants/colors';

interface EmptySearchResultsProps {
  searchQuery: string;
  onClearSearch: () => void;
}

const EmptySearchResults: React.FC<EmptySearchResultsProps> = ({
  searchQuery,
  onClearSearch
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: `1px solid ${EMPLOYER_THEME.light}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <SearchOffIcon
        sx={{
          fontSize: { xs: 64, sm: 80 },
          color: 'text.secondary',
          mb: 2
        }}
      />
      
      <Typography
        variant="h5"
        component="h2"
        sx={{
          mb: 1,
          color: 'text.primary',
          fontWeight: 600,
          fontSize: { xs: '1.2rem', sm: '1.4rem' }
        }}
      >
        نتیجه‌ای یافت نشد
      </Typography>
      
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          mb: 3,
          maxWidth: 400,
          fontSize: { xs: '0.9rem', sm: '1rem' }
        }}
      >
        برای عبارت "{searchQuery}" هیچ آگهی‌ای یافت نشد. 
        لطفاً عبارت جستجو را تغییر دهید یا فیلترها را بررسی کنید.
      </Typography>
      
      <Button
        variant="outlined"
        onClick={onClearSearch}
        sx={{
          borderColor: EMPLOYER_THEME.primary,
          color: EMPLOYER_THEME.primary,
          '&:hover': {
            borderColor: EMPLOYER_THEME.dark,
            backgroundColor: 'rgba(66, 133, 244, 0.04)'
          }
        }}
      >
        پاک کردن جستجو
      </Button>
    </Box>
  );
};

export default EmptySearchResults; 