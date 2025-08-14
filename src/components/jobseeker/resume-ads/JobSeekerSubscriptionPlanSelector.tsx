'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
	Box,
	Typography,
	Paper,
	Button,
	TextField,
	Alert,
	Radio,
	RadioGroup,
	FormControlLabel,
	Chip
} from '@mui/material';
import { apiGet } from '@/lib/axios';
import { JOB_SEEKER_THEME } from '@/constants/colors';
import { SubscriptionPlan } from '@/types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

interface DurationMultiplier {
	days: number;
	label: string;
	multiplier: number;
	popular?: boolean;
}

interface SubscriptionPlanSelectorProps {
	selectedPlan: SubscriptionPlan | null;
	selectedDuration: number;
	onPlanChange: (plan: SubscriptionPlan) => void;
	onDurationChange: (duration: number) => void;
	disabled?: boolean;
}

export default function JobSeekerSubscriptionPlanSelector({
	selectedPlan,
	selectedDuration,
	onPlanChange,
	onDurationChange,
	disabled = false
}: SubscriptionPlanSelectorProps) {
	const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [customDays, setCustomDays] = useState<string>('');
	const [useCustomDuration, setUseCustomDuration] = useState(false);
	const autoSelectRef = useRef(false);

	const durationOptions: DurationMultiplier[] = [
		{ days: 3, label: '۳ روز', multiplier: 1.0 },
		{ days: 7, label: '۷ روز', multiplier: 1.0 },
		{ days: 15, label: '۱۵ روز', multiplier: 1.0, popular: true },
		{ days: 30, label: '۳۰ روز', multiplier: 1.0 },
	];

	useEffect(() => {
		const fetchPlans = async () => {
			try {
				setLoading(true);
				const response = await apiGet('/subscriptions/plans/?ad_type=R');
				const resumePlans = (response.data as SubscriptionPlan[]).filter(plan => plan.active);
				setPlans(resumePlans);

				if (resumePlans.length > 0 && !autoSelectRef.current) {
					autoSelectRef.current = true;
					setTimeout(() => {
						onPlanChange(resumePlans[0]);
						if (selectedDuration === 0) onDurationChange(15);
					}, 100);
				}
			} catch (err) {
				console.error('خطا در دریافت اطلاعات:', err);
				setError('خطا در دریافت اطلاعات اشتراک‌ها');
			} finally {
				setLoading(false);
			}
		};

		fetchPlans();
	}, []);

	const calculateBasePrice = (plan: SubscriptionPlan, duration: number) => {
		if (plan.is_free || duration <= 0) return 0;
		return Math.round(plan.price_per_day * duration * 1.0);
	};

	const calculateTax = (plan: SubscriptionPlan, duration: number) => {
		const basePrice = calculateBasePrice(plan, duration);
		return Math.floor(basePrice * 10 / 100);
	};

	const calculatePrice = (plan: SubscriptionPlan, duration: number) => {
		const basePrice = calculateBasePrice(plan, duration);
		const taxAmount = calculateTax(plan, duration);
		return basePrice + taxAmount;
	};

	const toPersianDigits = (value: number | string): string =>
		value.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

	const getPlanInfo = (plan: SubscriptionPlan) => {
		if (plan.is_free) {
			return {
				icon: <AccessTimeIcon sx={{ fontSize: 24 }} />,
				color: '#4caf50',
				badge: plan.name,
				description: plan.description || 'آگهی پایه بدون ویژگی خاص'
			};
		}

		const planName = plan.name.toLowerCase();
		if (planName.includes('نردبان') || planName.includes('ladder')) {
			return {
				icon: <LocalFireDepartmentIcon sx={{ fontSize: 24 }} />,
				color: '#e53935',
				badge: plan.name,
				description: plan.description || 'نمایش در بالای لیست آگهی‌ها'
			};
		}
		if (planName.includes('ویژه') || planName.includes('special')) {
			return {
				icon: <StarIcon sx={{ fontSize: 24 }} />,
				color: '#ff9800',
				badge: plan.name,
				description: plan.description || 'نمایش با برچسب ویژه'
			};
		}
		if (planName.includes('vip') || planName.includes('پریمیوم')) {
			return {
				icon: <WorkspacePremiumIcon sx={{ fontSize: 24 }} />,
				color: '#9c27b0',
				badge: plan.name,
				description: plan.description || 'بیشترین دید و اولویت نمایش'
			};
		}

		return {
			icon: <WorkspacePremiumIcon sx={{ fontSize: 24 }} />,
			color: JOB_SEEKER_THEME.primary,
			badge: plan.name,
			description: plan.description || 'ویژگی‌های پیشرفته'
		};
	};

	const activeDuration = useCustomDuration ? (parseInt(customDays.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())) || 0) : selectedDuration;

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
				<Typography>در حال بارگذاری...</Typography>
			</Box>
		);
	}

	if (error) {
		return (
			<Alert severity="error" sx={{ borderRadius: 2 }}>
				{error}
			</Alert>
		);
	}

	if (plans.length === 0) {
		return (
			<Alert severity="warning" sx={{ borderRadius: 2 }}>
				هیچ طرح اشتراک فعالی یافت نشد
			</Alert>
		);
	}

	return (
		<Box>
			<Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: JOB_SEEKER_THEME.primary, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
				انتخاب نوع آگهی
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
				نوع آگهی و مدت زمان نمایش را انتخاب کنید
			</Typography>

			<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: JOB_SEEKER_THEME.primary, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
				مدت زمان نمایش
			</Typography>
			<Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
				{durationOptions.map((option) => {
					const isSelected = !useCustomDuration && selectedDuration === option.days;
					return (
						<Paper
							key={option.days}
							elevation={0}
							sx={{ p: { xs: 1, sm: 1.5 }, textAlign: 'center', borderRadius: 2, boxShadow: '0 2px 8px rgba(76,175,80,0.05)', cursor: 'pointer', position: 'relative', border: isSelected ? `2px solid ${JOB_SEEKER_THEME.primary}` : '2px solid #e0e0e0', bgcolor: 'background.paper', transition: 'all 0.25s ease', minWidth: { xs: '80px', sm: '100px' }, maxWidth: { xs: '80px', sm: '100px' }, height: { xs: '60px', sm: '70px' }, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { boxShadow: '0 4px 12px rgba(76,175,80,0.12)', borderColor: JOB_SEEKER_THEME.primary } }}
							onClick={() => { setUseCustomDuration(false); setCustomDays(''); onDurationChange(option.days); }}
						>
							{option.popular && <Box sx={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', bgcolor: '#ff4081', color: 'white', px: 1, py: 0.2, borderRadius: 10, fontSize: '0.6rem', fontWeight: 'bold', zIndex: 1 }}>محبوب</Box>}
							<Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' }, color: isSelected ? JOB_SEEKER_THEME.primary : 'text.primary', lineHeight: 1.2 }}>{option.label}</Typography>
						</Paper>
					);
				})}

				{/* custom duration card */}
				<Paper
					elevation={0}
					sx={{
						p: { xs: 1, sm: 1.5 },
						textAlign: 'center',
						borderRadius: 2,
						boxShadow: '0 2px 8px rgba(76,175,80,0.05)',
						cursor: 'pointer',
						position: 'relative',
						border: useCustomDuration
							? `2px solid ${JOB_SEEKER_THEME.primary}`
							: '2px solid #e0e0e0',
						bgcolor: 'background.paper',
						transition: 'all 0.25s ease',
						minWidth: { xs: '80px', sm: '100px' },
						maxWidth: { xs: '80px', sm: '100px' },
						height: { xs: '60px', sm: '70px' },
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						'&:hover': {
							boxShadow: '0 4px 12px rgba(76,175,80,0.12)',
							borderColor: JOB_SEEKER_THEME.primary
						}
					}}
					onClick={() => setUseCustomDuration(true)}
				>
					{!useCustomDuration ? (
						<Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' }, color: useCustomDuration ? JOB_SEEKER_THEME.primary : 'text.primary', lineHeight: 1.2 }}>دلخواه</Typography>
					) : (
						<TextField size="small" type="text" placeholder="۳" value={customDays} onChange={(e) => { let raw = e.target.value.replace(/[^0-9۰-۹]/g, ''); if (raw.length > 3) raw = raw.slice(0,3); const persianVal = raw.replace(/[0-9]/g, (d)=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)]); setCustomDays(persianVal); const eng = persianVal.replace(/[۰-۹]/g, (d)=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()); let days = parseInt(eng)||0; if(days>365){
      days = 365;
      setCustomDays(toPersianDigits('365'));
  } if(days>=3&&days<=365){onDurationChange(days);} else if(days===0){onDurationChange(0);} }} onBlur={()=>{const eng=customDays.replace(/[۰-۹]/g,(d)=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()); let d=parseInt(eng)||0; if(d<3&&customDays!==''){d=3;} if(d>365) d=365; if(d>0){setCustomDays(toPersianDigits(d.toString())); onDurationChange(d); }}} inputProps={{ maxLength:3, style:{textAlign:'center',fontSize:'0.8rem',direction:'rtl'} }} sx={{ '& .MuiOutlinedInput-root':{ borderRadius:1, height:28, width:'100%', '&.Mui-focused .MuiOutlinedInput-notchedOutline':{ borderColor: JOB_SEEKER_THEME.primary } } }} onClick={(e)=>e.stopPropagation()} onFocus={(e)=>e.stopPropagation()} />
					)}
				</Paper>
			</Box>

			<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, color: JOB_SEEKER_THEME.primary, fontSize: { xs: '1rem', sm: '1.1rem' } }}>انتخاب طرح اشتراک</Typography>
			<RadioGroup value={selectedPlan?.id || ''} onChange={(e) => { const plan = plans.find(p => p.id === e.target.value); if (plan) onPlanChange(plan); }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 }, justifyContent: 'center' }}>
					{plans.map((plan) => {
						const isSelected = selectedPlan?.id === plan.id;
						const planInfo = getPlanInfo(plan);
						const price = calculatePrice(plan, activeDuration);
						return (
							<Paper key={plan.id} elevation={0} sx={{ p:{xs:1.5,sm:3}, borderRadius:3, boxShadow:'0 4px 15px rgba(76,175,80,0.05)', cursor:'pointer', border:isSelected?`2px solid ${JOB_SEEKER_THEME.primary}`:'2px solid #e0e0e0', bgcolor:'background.paper', transition:'all 0.25s ease', flex:{ xs:'1 0 calc(100% - 16px)', sm:'1 0 calc(50% - 24px)', md:'1 0 calc(33.333% - 24px)', lg:'1 0 calc(25% - 24px)' }, maxWidth:'340px', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', height:'100%', '&:hover':{ boxShadow:'0 6px 18px rgba(76,175,80,0.12)', borderColor:JOB_SEEKER_THEME.primary } }} onClick={()=>onPlanChange(plan)}>
								<FormControlLabel
                                    value={plan.id}
                                    control={
                                        <Radio
                                            sx={{
                                                color: JOB_SEEKER_THEME.primary,
                                                '&.Mui-checked': { color: JOB_SEEKER_THEME.primary },
                                                position: 'absolute',
                                                top: 12,
                                                right: 12
                                            }}
                                        />
                                    }
                                    label=""
                                    sx={{ m: 0 }}
                                />

								<Box sx={{ textAlign:'center', mb:3 }}>
									<Chip label={plan.name} size="medium" sx={{ bgcolor:planInfo.color, color:'white', fontWeight:'bold', fontSize:'1rem', height:32, px:2 }} />
								</Box>

								<Box sx={{ textAlign:'center', mb:3 }}>
									{plan.is_free ? (
										<Typography variant="h5" fontWeight="bold" color="success.main" sx={{ fontSize:{xs:'1.3rem', sm:'1.5rem'}, mb:1 }}>رایگان</Typography>
									) : (
										<>
											<Typography variant="h5" fontWeight="bold" sx={{ fontSize:{xs:'1.2rem', sm:'1.4rem'}, mb:0.5, color: JOB_SEEKER_THEME.primary }}>{toPersianDigits(price.toLocaleString())} تومان</Typography>
											<Typography variant="caption" color="text.secondary" sx={{ fontSize:'0.75rem' }}>برای {toPersianDigits(activeDuration)} روز</Typography>
										</>
									)}
								</Box>

								<Box sx={{ mb:3 }}>
									{(plan.description||'').split('\n').filter(Boolean).slice(0,3).map((f,i)=>(
										<Box key={i} sx={{ display:'flex', alignItems:'center', gap:1, mb:1, fontSize:'0.85rem' }}>
											<Box sx={{ width:6, height:6, borderRadius:'50%', bgcolor:JOB_SEEKER_THEME.primary, flexShrink:0 }} />
											<Typography variant="body2" sx={{ fontSize:'inherit' }}>{f}</Typography>
										</Box>
									))}
								</Box>

                                <Button
                                    variant={isSelected ? 'contained' : 'outlined'}
                                    fullWidth
                                    sx={{
                                        borderRadius: 2,
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                        py: 1,
                                        ...(isSelected
                                            ? {
                                                  bgcolor: JOB_SEEKER_THEME.primary,
                                                  backgroundColor: JOB_SEEKER_THEME.primary,
                                                  backgroundImage: 'none',
                                                  color: 'white',
                                                  '&:hover': {
                                                      bgcolor: JOB_SEEKER_THEME.dark,
                                                      backgroundColor: JOB_SEEKER_THEME.dark,
                                                      backgroundImage: 'none'
                                                  }
                                              }
                                            : {
                                                  borderColor: JOB_SEEKER_THEME.primary,
                                                  color: JOB_SEEKER_THEME.primary,
                                                  '&:hover': {
                                                      borderColor: JOB_SEEKER_THEME.dark,
                                                      color: JOB_SEEKER_THEME.dark
                                                  }
                                              })
                                    }}
                                >
                                    {isSelected ? 'انتخاب شده' : 'انتخاب این طرح'}
                                </Button>
							</Paper>
						);
					})}
				</Box>
			</RadioGroup>

			{selectedPlan && activeDuration > 0 && (
				<Paper elevation={0} sx={{ mt: 4, p: { xs: 2, sm: 3 }, borderRadius: 3, border: `2px solid ${JOB_SEEKER_THEME.primary}`, bgcolor: 'rgba(76,175,80,0.05)', boxShadow: '0 4px 15px rgba(76,175,80,0.05)' }}>
					<Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: JOB_SEEKER_THEME.primary, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>خلاصه سفارش</Typography>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 }, pb: 2, borderBottom: '1px solid rgba(76,175,80,0.1)' }}>
							<Box sx={{ flex: 1 }}>
								<Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>{selectedPlan.name}</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>{toPersianDigits(activeDuration)} روز{useCustomDuration && ' (دلخواه)'}</Typography>
							</Box>
							<Chip label={getPlanInfo(selectedPlan).badge} size="small" sx={{ bgcolor: getPlanInfo(selectedPlan).color, color: 'white', fontWeight: 'bold', fontSize: { xs: '0.7rem', sm: '0.75rem' }, alignSelf: { xs: 'flex-start', sm: 'center' } }} />
						</Box>

						{selectedPlan.is_free ? (
							<Box sx={{ textAlign: 'center', py: 2 }}>
								<Typography variant="h5" fontWeight="bold" color="success.main">رایگان</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>هیچ هزینه‌ای دریافت نمی‌شود</Typography>
							</Box>
						) : (
							<>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.5, sm: 0 } }}>
									<Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>قیمت پایه:</Typography>
									<Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, textAlign: { xs: 'left', sm: 'right' } }}>{toPersianDigits(calculateBasePrice(selectedPlan, activeDuration).toLocaleString())} تومان</Typography>
								</Box>
								<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.5, sm: 0 } }}>
									<Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>مالیات بر ارزش افزوده (۱۰٪):</Typography>
									<Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, textAlign: { xs: 'left', sm: 'right' } }}>{toPersianDigits(calculateTax(selectedPlan, activeDuration).toLocaleString())} تومان</Typography>
								</Box>
								<Box sx={{ borderTop: '2px solid rgba(76,175,80,0.2)', pt: 2, mt: 1 }}>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
										<Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>مجموع قابل پرداخت:</Typography>
										<Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' }, textAlign: { xs: 'left', sm: 'right' }, color: JOB_SEEKER_THEME.primary }}>{toPersianDigits(calculatePrice(selectedPlan, activeDuration).toLocaleString())} تومان</Typography>
									</Box>
								</Box>
							</>
						)}
					</Box>
				</Paper>
			)}
		</Box>
	);
}


