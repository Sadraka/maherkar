'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { EMPLOYER_THEME } from '@/constants/colors';

interface SimpleLoadingProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
    fullScreen?: boolean;
}

export default function SimpleLoading({ 
    message, 
    size = 'medium',
    fullScreen = false 
}: SimpleLoadingProps) {
    const sizeMap = {
        small: 24,
        medium: 40,
        large: 60
    };

    const content = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                p: 3,
            }}
        >
            <CircularProgress
                size={sizeMap[size]}
                sx={{
                    color: EMPLOYER_THEME.primary,
                }}
            />
            {message && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                    }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );

    if (fullScreen) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {content}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                width: '100%',
            }}
        >
            {content}
        </Box>
    );
} 