import { Box, Container, Typography, Paper, TextField, MenuItem, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function Hero() {
  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          هوشمند انتخاب کن، سریع استخدام شو
        </Typography>
        
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 4,
            maxWidth: 800,
            mx: 'auto',
            display: 'flex',
            gap: 2,
            flexWrap: { xs: 'wrap', md: 'nowrap' },
          }}
        >
          <TextField
            select
            label="گروه شغلی"
            fullWidth
            variant="outlined"
            defaultValue=""
          >
            <MenuItem value="">همه گروه‌های شغلی</MenuItem>
            <MenuItem value="dev">برنامه‌نویسی</MenuItem>
            <MenuItem value="design">طراحی</MenuItem>
          </TextField>

          <TextField
            select
            label="استان"
            fullWidth
            variant="outlined"
            defaultValue=""
          >
            <MenuItem value="">همه استان‌ها</MenuItem>
            <MenuItem value="tehran">تهران</MenuItem>
            <MenuItem value="isfahan">اصفهان</MenuItem>
          </TextField>

          <TextField
            label="جستجو در مشاغل"
            fullWidth
            variant="outlined"
            placeholder="عنوان شغلی، مهارت یا..."
          />

          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            sx={{ minWidth: 200 }}
          >
            جستجو
          </Button>
        </Paper>
      </Container>
    </Box>
  );
} 