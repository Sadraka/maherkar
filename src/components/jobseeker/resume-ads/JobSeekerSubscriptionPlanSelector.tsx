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
				const response = await apiGet('/subscriptions/plans/');
				const activePlans = (response.data as SubscriptionPlan[]).filter(plan => plan.active);
				setPlans(activePlans);

				if (activePlans.length > 0 && !autoSelectRef.current) {
					autoSelectRef.current = true;
					setTimeout(() => {
						onPlanChange(activePlans[0]);
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

	const activeDuration = useCustomDuration ? parseInt(customDays) || 0 : selectedDuration;

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
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 1.5, sm: 2 }, mb: 4 }}>
				{durationOptions.map((option) => {
					const isSelected = !useCustomDuration && selectedDuration === option.days;
					return (
						<Paper
							key={option.days}
							elevation={0}
							sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center', borderRadius: 3, boxShadow: '0 4px 15px rgba(76,175,80,0.05)', cursor: 'pointer', position: 'relative', border: isSelected ? `2px solid ${JOB_SEEKER_THEME.primary}` : `2px solid transparent`, bgcolor: isSelected ? 'rgba(76,175,80,0.05)' : 'background.paper', transition: 'all 0.25s ease', '&:hover': { boxShadow: '0 6px 18px rgba(76,175,80,0.12)', transform: 'translateY(-2px)', borderColor: JOB_SEEKER_THEME.primary } }}
							onClick={() => { setUseCustomDuration(false); setCustomDays(''); onDurationChange(option.days); }}
						>
							{option.popular && (
								<Box sx={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', bgcolor: '#ff4081', color: 'white', px: 1.5, py: 0.3, borderRadius: 10, fontSize: '0.7rem', fontWeight: 'bold', zIndex: 1 }}>محبوب</Box>
							)}
							<AccessTimeIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: isSelected ? JOB_SEEKER_THEME.primary : 'text.secondary', mb: { xs: 0.5, sm: 1 } }} />
							<Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, fontSize: { xs: '0.9rem', sm: '1.25rem' }, color: isSelected ? JOB_SEEKER_THEME.primary : 'text.primary' }}>{option.label}</Typography>
						</Paper>
					);
				})}
			</Box>

			<Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: useCustomDuration ? `2px solid ${JOB_SEEKER_THEME.primary}` : '2px solid #e0e0e0', mb: 4, transition: 'all 0.25s ease', '&:hover': { borderColor: JOB_SEEKER_THEME.primary } }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
					<Radio checked={useCustomDuration} onChange={() => setUseCustomDuration(true)} sx={{ color: JOB_SEEKER_THEME.primary }} />
					<Typography variant="subtitle1" fontWeight="bold">انتخاب روز دلخواه</Typography>
				</Box>
				<TextField fullWidth type="number" label="تعداد روز (۱ تا ۳۶۵)" value={customDays} onChange={(e) => { setCustomDays(e.target.value); setUseCustomDuration(true); const days = parseInt(e.target.value) || 0; if (days >= 1 && days <= 365) { onDurationChange(days); } }} inputProps={{ min: 1, max: 365 }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: JOB_SEEKER_THEME.primary } } }} />
			</Paper>

			<Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, color: JOB_SEEKER_THEME.primary, fontSize: { xs: '1rem', sm: '1.1rem' } }}>انتخاب طرح اشتراک</Typography>
			<RadioGroup value={selectedPlan?.id || ''} onChange={(e) => { const plan = plans.find(p => p.id === e.target.value); if (plan) onPlanChange(plan); }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
					{plans.map((plan) => {
						const isSelected = selectedPlan?.id === plan.id;
						const planInfo = getPlanInfo(plan);
						const price = calculatePrice(plan, activeDuration);
						return (
							<Paper key={plan.id} elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: '0 4px 15px rgba(76,175,80,0.05)', cursor: 'pointer', border: isSelected ? `2px solid ${JOB_SEEKER_THEME.primary}` : '2px solid #e0e0e0', bgcolor: isSelected ? 'rgba(76,175,80,0.05)' : 'background.paper', transition: 'all 0.25s ease', '&:hover': { boxShadow: '0 6px 18px rgba(76,175,80,0.12)', transform: 'translateY(-2px)', borderColor: JOB_SEEKER_THEME.primary } }} onClick={() => onPlanChange(plan)}>
							<Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 2 } }}>
								<Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1.5, sm: 2 }, flex: 1, width: '100%' }}>
									<FormControlLabel value={plan.id} control={<Radio sx={{ color: JOB_SEEKER_THEME.primary, alignSelf: { xs: 'flex-start', sm: 'center' }, mt: { xs: 0.5, sm: 0 } }} />} label="" sx={{ m: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }} />
									<Box sx={{ p: { xs: 1, sm: 1.5 }, borderRadius: 2, bgcolor: planInfo.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{planInfo.icon}</Box>
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1, mb: 0.5, flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap' }}>
											<Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, lineHeight: { xs: 1.2, sm: 1.3 } }}>{plan.name}</Typography>
											<Chip label={planInfo.badge} size="small" sx={{ bgcolor: planInfo.color, color: 'white', fontWeight: 'bold', fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }} />
										</Box>
										<Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, lineHeight: { xs: 1.3, sm: 1.4 } }}>{planInfo.description}</Typography>
									</Box>
								</Box>
								<Box sx={{ textAlign: { xs: 'center', sm: 'left' }, mt: { xs: 2, sm: 0 }, alignSelf: { xs: 'stretch', sm: 'center' }, minWidth: { xs: 'auto', sm: '120px' }, width: { xs: '100%', sm: 'auto' } }}>
									{plan.is_free ? (
										<Typography variant="h5" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' }, lineHeight: 1.2 }}>رایگان</Typography>
									) : (
										<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'flex-end' } }}>
											<Typography variant="h5" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, lineHeight: 1.2, textAlign: { xs: 'center', sm: 'right' } }}>{toPersianDigits(price.toLocaleString())} تومان</Typography>
											<Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, textAlign: { xs: 'center', sm: 'right' }, mt: 0.5 }}>برای {toPersianDigits(activeDuration)} روز</Typography>
										</Box>
									)}
								</Box>
							</Box>
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
										<Typography variant="h5" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' }, textAlign: { xs: 'left', sm: 'right' } }}>{toPersianDigits(calculatePrice(selectedPlan, activeDuration).toLocaleString())} تومان</Typography>
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


