'use client';

import React from 'react';
import { Typography, Box, Paper, Divider } from '@mui/material';
import { EMPLOYER_THEME } from '@/constants/colors';

export default function PrivacyContent() {
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
                بیانیه حریم خصوصی ماهرکار
            </Typography>

            <Divider sx={{ mb: 4 }} />
            
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    مقدمه
                </Typography>
                <Typography paragraph>
                    ما در ماهرکار متعهد به حفاظت از حریم خصوصی شما هستیم. این بیانیه توضیح می‌دهد که ما چگونه اطلاعات شما را جمع‌آوری، استفاده و حفاظت می‌کنیم.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    اطلاعات جمع‌آوری شده
                </Typography>
                <Typography paragraph>
                    ما اطلاعات زیر را از شما جمع‌آوری می‌کنیم:
                </Typography>
                <Typography component="ul" sx={{ pl: 2 }}>
                    <li>اطلاعات هویتی اولیه: شامل نام و نام خانوادگی شما</li>
                    <li>اطلاعات تماس: شامل شماره تلفن همراه که برای احراز هویت شما استفاده می‌شود</li>
                    <li>در صورت نیاز به احراز هویت بیشتر: اطلاعات کارت ملی و تصویر آن (اختیاری)</li>
                    <li>اطلاعات حرفه‌ای مانند مهارت‌ها، تجربیات کاری و تحصیلات</li>
                    <li>اطلاعات مربوط به استفاده از سرویس ما</li>
                    <li>رفتار کاربری و تعاملات در پلتفرم</li>
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    استفاده از اطلاعات
                </Typography>
                <Typography paragraph>
                    ما از اطلاعات شما برای موارد زیر استفاده می‌کنیم:
                </Typography>
                <Typography component="ul" sx={{ pl: 2 }}>
                    <li>ارائه، بهبود و شخصی‌سازی خدمات ما</li>
                    <li>تسهیل ارتباط بین کارفرمایان و متخصصان</li>
                    <li>ارسال اطلاعیه‌های مهم مربوط به حساب کاربری</li>
                    <li>ارسال پیشنهادات و فرصت‌های شغلی متناسب</li>
                    <li>تحلیل و بهبود عملکرد پلتفرم</li>
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    اشتراک‌گذاری اطلاعات
                </Typography>
                <Typography paragraph>
                    ما ممکن است اطلاعات شما را در موارد زیر به اشتراک بگذاریم:
                </Typography>
                <Typography component="ul" sx={{ pl: 2 }}>
                    <li>با کارفرمایان یا متخصصانی که با آن‌ها تعامل می‌کنید</li>
                    <li>با ارائه‌دهندگان خدمات که به ما در ارائه خدمات کمک می‌کنند</li>
                    <li>در صورت الزام قانونی یا درخواست مراجع قضایی</li>
                </Typography>
                <Typography paragraph>
                    ما هرگز اطلاعات شما را بدون اجازه‌ی شما به شرکت‌های تبلیغاتی یا بازاریابی نمی‌فروشیم.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    امنیت اطلاعات
                </Typography>
                <Typography paragraph>
                    ما اقدامات امنیتی مناسب را برای محافظت از اطلاعات شما در برابر دسترسی غیرمجاز، تغییر، افشا یا تخریب اتخاذ می‌کنیم.
                </Typography>
                <Typography paragraph>
                    با این حال، هیچ روش انتقال اینترنتی یا ذخیره‌سازی الکترونیکی 100٪ ایمن نیست و ما نمی‌توانیم امنیت مطلق را تضمین کنیم.
                </Typography>
            </Box>

            <Box>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                    تغییرات در بیانیه حریم خصوصی
                </Typography>
                <Typography paragraph>
                    ما ممکن است این بیانیه حریم خصوصی را به‌روزرسانی کنیم. تغییرات از طریق اعلان در وب‌سایت یا ایمیل به اطلاع شما خواهد رسید.
                </Typography>
                <Typography paragraph>
                    استفاده مداوم از خدمات ما پس از این تغییرات به معنای پذیرش بیانیه حریم خصوصی به‌روزشده است.
                </Typography>
            </Box>
        </Paper>
    );
} 