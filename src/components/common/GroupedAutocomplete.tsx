'use client';

import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  ListSubheader,
  FormControl,
  FormHelperText,
  alpha,
  Skeleton,
  CircularProgress
} from '@mui/material';
import { Controller, Control } from 'react-hook-form';

interface GroupedOption {
  id: number | string;
  name: string;
  category?: {
    id: number | string;
    name: string;
  };
  province?: {
    id: number | string;
    name: string;
  };
}

interface GroupedAutocompleteProps {
  name: string;
  control: Control<any>;
  options: GroupedOption[];
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  groupBy: (option: GroupedOption) => string;
  getOptionLabel: (option: GroupedOption) => string;
  theme?: any;
  icon?: React.ReactElement;
  loading?: boolean;
  disabled?: boolean;
}

export default function GroupedAutocomplete({
  name,
  control,
  options,
  label,
  placeholder,
  required = false,
  error = false,
  helperText,
  groupBy,
  getOptionLabel,
  theme,
  icon,
  loading = false,
  disabled = false
}: GroupedAutocompleteProps) {
  const defaultTheme = {
    primary: 'rgb(65, 135, 255)', // رنگ آبی کارفرما
    light: 'rgb(125, 175, 255)',
    dark: 'rgb(35, 95, 215)'
  };

  const currentTheme = theme || defaultTheme;

  // تابع ساده برای تبدیل حروف
  const normalizeText = (text: string): string => {
    return text.replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLowerCase();
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{ 
        validate: (value) => {
          if (required && (!value || value === 0)) {
            return `${label} الزامی است`;
          }
          return true;
        }
      }}
      render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
        <FormControl fullWidth error={Boolean(fieldError || error)}>
          {loading ? (
            <Box sx={{ position: 'relative' }}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={56} 
                sx={{ 
                  borderRadius: 2,
                  bgcolor: 'rgba(0,0,0,0.08)'
                }} 
              />
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CircularProgress size={20} sx={{ color: currentTheme.primary }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  در حال بارگذاری {label}...
                </Typography>
              </Box>
            </Box>
          ) : (
            <Autocomplete
              value={options.find(option => option.id === value) || null}
              onChange={(_, newValue) => onChange(newValue ? newValue.id : 0)}
              options={options}
              groupBy={groupBy}
              getOptionLabel={getOptionLabel}
              disabled={disabled}
              filterOptions={(options, state) => {
                const inputValue = state.inputValue.trim();
                if (!inputValue) return options;
                
                const normalizedInput = normalizeText(inputValue);
                
                return options.filter(option => {
                  const optionName = normalizeText(getOptionLabel(option));
                  const categoryName = normalizeText(option.category?.name || '');
                  const provinceName = normalizeText(option.province?.name || '');
                  
                  return optionName.includes(normalizedInput) || 
                         categoryName.includes(normalizedInput) || 
                         provinceName.includes(normalizedInput);
                });
              }}
              noOptionsText={`${label} یافت نشد`}
              loadingText="در حال جستجو..."
              renderGroup={(params) => (
                <Box key={params.key} sx={{ position: 'relative' }}>
                  <ListSubheader
                    sx={{ 
                      bgcolor: currentTheme.primary,
                      fontWeight: 600,
                      color: 'white',
                      lineHeight: 2,
                      fontSize: '0.85rem',
                      borderBottom: `1px solid ${alpha(currentTheme.primary, 0.2)}`,
                      position: 'sticky',
                      top: 0,
                      zIndex: 999,
                      margin: 0,
                      padding: '8px 16px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                      opacity: 1
                    }}
                  >
                    {params.group}
                  </ListSubheader>
                  <Box sx={{ 
                    bgcolor: 'background.paper',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    {params.children}
                  </Box>
                </Box>
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box
                    component="li"
                    key={key}
                    {...otherProps}
                    sx={{
                      py: 1.5,
                      px: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      '&:hover': { 
                        bgcolor: alpha(currentTheme.primary, 0.08)
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start',
                      flex: 1,
                      minWidth: 0
                    }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500,
                        width: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {getOptionLabel(option)}
                      </Typography>
                      {(option.category || option.province) && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            bgcolor: alpha(currentTheme.primary, 0.1),
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            mt: 0.5,
                            alignSelf: 'flex-start'
                          }}
                        >
                          {option.category?.name || option.province?.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              }}
              slotProps={{
                popper: {
                  sx: {
                    '& .MuiAutocomplete-paper': {
                      width: '100% !important',
                      minWidth: '100% !important',
                      maxHeight: '350px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      border: `1px solid ${alpha(currentTheme.primary, 0.1)}`,
                      borderRadius: 2,
                      overflow: 'hidden',
                      '& .MuiAutocomplete-listbox': {
                        padding: 0,
                        '& .MuiListSubheader-root': {
                          position: 'sticky !important',
                          top: '0 !important',
                          zIndex: '999 !important',
                          backgroundColor: `${currentTheme.primary} !important`,
                          color: 'white !important',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1) !important',
                          margin: '0 !important',
                          padding: '8px 16px !important',
                          borderBottom: `1px solid ${alpha(currentTheme.primary, 0.2)} !important`,
                          transform: 'translateZ(0) !important',
                          willChange: 'transform !important',
                          opacity: '1 !important'
                        },
                        '& .MuiAutocomplete-option': {
                          position: 'relative !important',
                          zIndex: '1 !important',
                          '&:hover': {
                            zIndex: '2 !important'
                          }
                        },
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: 'rgba(0,0,0,0.05)',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: 'rgba(0,0,0,0.15)',
                          borderRadius: '4px',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.25)',
                          },
                        }
                      }
                    },
                  },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={placeholder || `جستجو و انتخاب ${label}...`}
                  error={Boolean(fieldError || error)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '6px !important',
                      minHeight: { xs: '40px !important', sm: '56px !important' },
                      height: { xs: '40px !important', sm: '56px !important' },
                      '&:hover': {
                        bgcolor: alpha(currentTheme.primary, 0.02)
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: currentTheme.primary,
                        borderWidth: 2
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.8rem !important', sm: '1rem !important' },
                      padding: { xs: '8px 14px !important', sm: '16.5px 14px !important' },
                      height: { xs: '24px !important', sm: '24px !important' },
                      lineHeight: { xs: '24px !important', sm: '24px !important' }
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.75rem', sm: '0.75rem' }
                    }
                  }}
                />
              )}
            />
          )}
          {(fieldError || error) && (
            <FormHelperText sx={{ 
              color: 'error.main',
              fontWeight: 500
            }}>
              {fieldError?.message || helperText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
} 