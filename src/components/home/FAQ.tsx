'use client'

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Paper,
  Grid,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EMPLOYER_THEME } from '@/constants/colors';

type FAQItemType = {
  id: number;
  question: string;
  answer: string;
};

export default function FAQ() {
  const [expanded, setExpanded] = useState<number | false>(0);
  const employerColors = EMPLOYER_THEME;

  const handleChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqItems: FAQItemType[] = [
    {
      id: 1,
      question: 'نحوه ثبت آگهی استخدام چگونه است؟',
      answer: 'پس از ورود به حساب کاربری، به بخش "ثبت آگهی جدید" رفته و فرم مربوطه را تکمیل کنید. عنوان شغلی، شرح وظایف و شرایط همکاری را وارد کرده، مدت نمایش را انتخاب کنید و پس از پرداخت، آگهی شما منتشر می‌شود.'
    },
    {
      id: 2,
      question: 'هزینه ثبت آگهی چقدر است؟',
      answer: 'هزینه بر اساس مدت نمایش (۷، ۱۰، ۳۰ روز یا سفارشی) متغیر است. هر چه مدت بیشتر باشد، هزینه مقرون به صرفه‌تر خواهد بود. برای جزئیات بیشتر به صفحه "تعرفه‌ها" مراجعه کنید.'
    },
    {
      id: 3,
      question: 'آگهی ویژه چه مزایایی دارد؟',
      answer: 'آگهی ویژه در بالای لیست‌های جستجو با رنگ متمایز نمایش داده می‌شود، در صفحه اصلی سایت به صورت چرخشی ظاهر می‌شود و در خبرنامه‌های ایمیلی معرفی می‌شود. این ویژگی‌ها شانس دیده شدن آگهی را تا ۳ برابر افزایش می‌دهد.'
    },
    {
      id: 4,
      question: 'نحوه ارتباط با متقاضیان چگونه است؟',
      answer: 'درخواست‌های متقاضیان در بخش "درخواست‌های دریافتی" پنل کاربری شما قابل مشاهده است. می‌توانید رزومه‌ها را بررسی کرده و از طریق سیستم پیام‌رسان داخلی یا اطلاعات تماس ارائه شده با آنها ارتباط برقرار کنید.'
    },
    {
      id: 5,
      question: 'امکان ویرایش آگهی پس از انتشار وجود دارد؟',
      answer: 'بله، از بخش "آگهی‌های من" می‌توانید آگهی را ویرایش کنید. تغییرات پس از بررسی اعمال می‌شود. تغییرات اساسی نیازمند بررسی مجدد است. امکان تمدید مدت نمایش نیز وجود دارد.'
    },
    {
      id: 6,
      question: 'مدیریت آگهی‌ها چگونه است؟',
      answer: 'در بخش "آگهی‌های من" می‌توانید آگهی‌های فعال، منقضی شده و در انتظار تأیید را مشاهده کنید. امکاناتی نظیر مشاهده آمار، ویرایش، تمدید، غیرفعال‌سازی و حذف در اختیار شماست.'
    },
  ];

  return (
    <Box sx={{ py: 6, backgroundColor: '#fff' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 1.5,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              color: 'primary.main'
            }}
          >
            سوالات متداول
          </Typography>
          <Typography 
            variant="h5" 
            component="h3"
            sx={{ 
              fontWeight: 500,
              mb: 2,
              color: 'text.secondary',
              maxWidth: 650, 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}
          >
            پاسخ به پرسش‌های رایج شما در مورد ثبت و مدیریت آگهی‌های استخدام
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }} sx={{ mx: 'auto' }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 3px 15px rgba(0,0,0,0.06)',
              }}
            >
              {faqItems.map((item) => (
                <Accordion
                  key={item.id}
                  expanded={expanded === item.id}
                  onChange={handleChange(item.id)}
                  disableGutters
                  elevation={0}
                  sx={{
                    '&:not(:last-child)': {
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    },
                    '&:before': {
                      display: 'none',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
                    sx={{
                      backgroundColor: expanded === item.id ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      },
                      minHeight: 56,
                      px: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: expanded === item.id ? 'bold' : 'medium' }}>
                        {item.question}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, py: 2, backgroundColor: 'rgba(0, 0, 0, 0.01)' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            پاسخ سوال خود را پیدا نکردید؟
          </Typography>
          <Button 
            variant="contained"
            sx={{ 
              backgroundColor: employerColors.primary,
              background: `linear-gradient(135deg, ${employerColors.light} 0%, ${employerColors.primary} 100%)`,
              '&:hover': { 
                background: `linear-gradient(135deg, ${employerColors.primary} 0%, ${employerColors.dark} 100%)` 
              },
              borderRadius: 2,
              px: 4,
              py: 1,
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: `0 4px 14px ${employerColors.bgLight}`,
              transition: 'all 0.3s ease',
              '&:active': { transform: 'translateY(1px)' }
            }}
          >
            تماس با پشتیبانی
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 