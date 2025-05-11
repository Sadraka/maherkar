'use client';

import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: isMobile ? '100vh' : 'auto',
                p: 0,
                backgroundColor: isMobile ? theme.palette.background.default : 'transparent'
            }}
        >
            <Container 
                maxWidth="sm" 
                sx={{ 
                    py: isMobile ? 0 : 8,
                    px: isMobile ? 0 : 2,
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: isMobile ? 1 : 0
                }}
                disableGutters={isMobile}
            >
                <RegisterForm />
            </Container>
        </Box>
    );
} 