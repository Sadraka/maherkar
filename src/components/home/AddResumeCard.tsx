'use client'

import {
    Box,
    Typography,
    Card,
    Button,
    useTheme,
    useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import { useJobSeekerTheme } from '@/contexts/JobSeekerThemeContext';

interface AddResumeCardProps {
    // اگر در آینده نیاز به پارامترهایی باشد، می‌توان اینجا اضافه کرد
    onClick?: () => void;
}

export default function AddResumeCard({ onClick }: AddResumeCardProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const jobSeekerColors = useJobSeekerTheme();

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: { xs: 2, sm: 2.5, md: 3 },
                border: `2px dashed rgba(10, 155, 84, 0.3)`,
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: 'rgba(10, 155, 84, 0.02)',
                transition: 'all 0.25s ease-in-out',
                p: 0,
                width: '100%',
                mx: 'auto',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
                    border: `2px dashed rgba(10, 155, 84, 0.5)`,
                }
            }}
        >
            <Box sx={{
                p: { xs: 1.5, sm: 2 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                minHeight: { xs: '250px', sm: '280px', md: 'auto' },
                maxHeight: { xs: '250px', sm: '280px', md: 'none' }
            }}>
                <Box
                    sx={{
                        backgroundColor: 'rgba(10, 155, 84, 0.08)',
                        color: jobSeekerColors.primary,
                        width: { xs: 50, sm: 60 },
                        height: { xs: 50, sm: 60 },
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: { xs: 1.5, sm: 2 }
                    }}
                >
                    <AddIcon sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }} />
                </Box>

                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        fontWeight: 700,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        color: 'text.primary',
                        textAlign: 'center',
                        mb: 1
                    }}
                >
                    رزومه خود را ثبت کنید
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                        textAlign: 'center',
                        mb: { xs: 1.5, sm: 2 },
                        px: 1,
                        display: { xs: '-webkit-box', sm: 'block' },
                        WebkitLineClamp: { xs: 2, sm: 'none' },
                        WebkitBoxOrient: { xs: 'vertical', sm: 'unset' },
                        overflow: { xs: 'hidden', sm: 'visible' }
                    }}
                >
                    با ثبت رزومه، بهترین موقعیت‌های شغلی را پیدا کنید
                </Typography>

                <Button
                    variant="contained"
                    disableElevation
                    onClick={onClick}
                    sx={{
                        py: { xs: 0.7, sm: 0.8 },
                        px: { xs: 1.5, sm: 2 },
                        fontWeight: 'bold',
                        borderRadius: 1.5,
                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                        background: `linear-gradient(135deg, ${jobSeekerColors.light} 0%, ${jobSeekerColors.primary} 100%)`,
                        color: '#fff',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            background: `linear-gradient(135deg, ${jobSeekerColors.primary} 0%, ${jobSeekerColors.dark} 100%)`,
                            boxShadow: `0 4px 8px rgba(10, 155, 84, 0.3)`,
                        }
                    }}
                >
                    ثبت رزومه جدید
                </Button>
            </Box>
        </Card>
    );
} 