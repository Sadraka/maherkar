'use client'

import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Button,
  Paper
} from '@mui/material';

export default function DailyHiring() {
  return (
    <Box sx={{ py: 6, backgroundColor: '#fff' }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography 
              variant="h4" 
              component="h2"
              sx={{ 
                fontWeight: 'bold',
                mb: 2
              }}
            >
              استخدام روزانه!
            </Typography>
            <Typography 
              variant="h5" 
              component="h3"
              sx={{ 
                fontWeight: 'medium',
                mb: 3 
              }}
            >
              همین حالا شانس خود را امتحان کنید
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ mb: 4, color: '#666' }}
            >
              ثبت آگهی سریع و بدون هیچ پیچیدگی
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ 
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
                py: 1.5,
                px: 4
              }}
            >
              آگهی خود را ثبت کنید
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              sx={{
                width: '100%',
                height: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #ccc',
                backgroundColor: '#f9f9f9'
              }}
            >
              <Typography color="text.secondary">تصویر تبلیغاتی</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 