'use client';

import React from 'react';
import { Typography, Box, Paper, Divider } from '@mui/material';
import { EMPLOYER_THEME } from '@/constants/colors';

export default function TermsContent() {
    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                align="center"
                color={EMPLOYER_THEME.primary}
                fontWeight="bold"
                sx={{ mb: 4 }}
            >
                شرایط و قوانین ماهرکار
            </Typography>

            <Divider sx={{ mb: 4 }} />
            
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    مقدمه
                </Typography>
                <Typography paragraph>
                    به ماهرکار خوش آمدید! استفاده از خدمات ما به معنای پذیرش کامل شرایط و قوانین زیر است. لطفاً این قوانین را به دقت مطالعه کنید.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    ثبت‌نام و حساب کاربری
                </Typography>
                <Typography paragraph>
                    برای استفاده از خدمات ماهرکار، باید یک حساب کاربری ایجاد کنید. اطلاعاتی که در فرآیند ثبت‌نام ارائه می‌دهید باید دقیق، کامل و به‌روز باشد.
                </Typography>
                <Typography paragraph>
                    شما مسئول حفظ امنیت حساب کاربری خود هستید و نباید اطلاعات ورود خود را در اختیار افراد دیگر قرار دهید.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    حریم خصوصی
                </Typography>
                <Typography paragraph>
                    ما به حریم خصوصی شما احترام می‌گذاریم و از داده‌های شخصی شما مطابق با سیاست حریم خصوصی خود محافظت می‌کنیم.
                </Typography>
                <Typography paragraph>
                    با ثبت‌نام در ماهرکار، شما موافقت می‌کنید که اطلاعات شما برای بهبود خدمات، ارتباط با شما و سایر اهداف ذکر شده در سیاست حریم خصوصی ما استفاده شود.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    تعهدات کاربر
                </Typography>
                <Typography paragraph>
                    شما موافقت می‌کنید که از سرویس ماهرکار برای اهداف غیرقانونی استفاده نکنید و محتوایی که قوانین محلی، ملی یا بین‌المللی را نقض می‌کند، ارسال نکنید.
                </Typography>
                <Typography paragraph>
                    همچنین موافقت می‌کنید که از سرویس برای ارسال هرگونه محتوای نامناسب، توهین‌آمیز، تهدیدآمیز یا مستهجن استفاده نکنید.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    قراردادها و پرداخت‌ها
                </Typography>
                <Typography paragraph>
                    ماهرکار صرفاً یک پلتفرم واسط بین کارفرمایان و متخصصان است و مسئولیت محتوا، کیفیت، امنیت یا قانونی بودن خدمات ارائه شده توسط کاربران را بر عهده نمی‌گیرد.
                </Typography>
                <Typography paragraph>
                    هیچ مبلغی از طریق سیستم ماهرکار بین کارفرما و کارجو رد و بدل نمی‌شود؛ ما فقط واسط ارتباط بین آنها هستیم.
                </Typography>
                <Typography paragraph>
                    برای درج آگهی باید هزینه مشخصی پرداخت شود که بر اساس روزهای قرارگیری آگهی و نردبان شدن متفاوت است. جزئیات هزینه‌ها در بخش تعرفه‌های سایت قابل مشاهده است.
                </Typography>
            </Box>

            <Box>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    تغییرات در قوانین
                </Typography>
                <Typography paragraph>
                    ماهرکار حق تغییر این قوانین را در هر زمان حفظ می‌کند. تغییرات اعمال شده از طریق ایمیل یا اعلان در سایت به اطلاع شما خواهد رسید.
                </Typography>
                <Typography paragraph>
                    ادامه استفاده از سرویس پس از اعمال تغییرات، به معنای پذیرش قوانین جدید است.
                </Typography>
            </Box>
        </Paper>
    );
} 