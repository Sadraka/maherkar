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

type FAQItemType = {
  id: number;
  question: string;
  answer: string;
};

export default function FAQ() {
  const [expanded, setExpanded] = useState<number | false>(0);

  const handleChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqItems: FAQItemType[] = [
    {
      id: 1,
      question: 'چگونه می‌توانم آگهی استخدام خود را در سایت قرار دهم؟',
      answer: 'پس از ثبت‌نام و ورود به حساب کاربری خود، به بخش "ثبت آگهی جدید" مراجعه کنید. فرم مربوطه را با دقت تکمیل کنید و اطلاعات مورد نیاز شامل عنوان شغلی، شرح وظایف، مهارت‌های مورد نیاز و شرایط همکاری را وارد نمایید. سپس مدت زمان نمایش آگهی را انتخاب کرده و پس از پرداخت هزینه، آگهی شما در سایت منتشر خواهد شد.'
    },
    {
      id: 2,
      question: 'هزینه ثبت آگهی استخدام چقدر است؟',
      answer: 'هزینه ثبت آگهی بر اساس مدت زمان نمایش آن در سایت متغیر است. شما می‌توانید آگهی خود را برای مدت‌های ۷ روز، ۱۰ روز، ۳۰ روز یا هر تعداد روز دلخواه ثبت کنید. هر چه مدت زمان نمایش آگهی بیشتر باشد، هزینه مقرون به صرفه‌تری پرداخت خواهید کرد. برای مشاهده جزئیات قیمت‌گذاری به صفحه "تعرفه‌ها" مراجعه کنید.'
    },
    {
      id: 3,
      question: 'آگهی ویژه چیست و چه مزایایی دارد؟',
      answer: 'آگهی ویژه با پرداخت هزینه بیشتر نسبت به آگهی معمولی، امکاناتی اضافی برای بهتر دیده شدن در اختیار شما قرار می‌دهد. آگهی‌های ویژه در بالای لیست‌های جستجو و با رنگ متمایز نمایش داده می‌شوند، در صفحه اصلی سایت به صورت چرخشی نمایش داده می‌شوند و در خبرنامه‌های ایمیلی ما به متخصصان معرفی می‌شوند. این ویژگی‌ها شانس دیده شدن آگهی شما توسط متخصصان مناسب را تا ۳ برابر افزایش می‌دهد.'
    },
    {
      id: 4,
      question: 'پس از انتشار آگهی، چگونه می‌توانم با متقاضیان ارتباط برقرار کنم؟',
      answer: 'زمانی که متخصصان برای آگهی شما درخواست ارسال می‌کنند، اطلاعات آن‌ها در پنل کاربری شما در بخش "درخواست‌های دریافتی" قابل مشاهده خواهد بود. شما می‌توانید رزومه‌ها را بررسی کرده و از طریق سیستم پیام‌رسان داخلی سایت یا اطلاعات تماسی که متقاضی در اختیار شما قرار داده است، ارتباط برقرار کنید. همچنین امکان مدیریت و دسته‌بندی درخواست‌ها بر اساس وضعیت پیگیری نیز وجود دارد.'
    },
    {
      id: 5,
      question: 'آیا می‌توانم آگهی خود را پس از انتشار ویرایش کنم؟',
      answer: 'بله، شما می‌توانید در هر زمان به پنل کاربری خود مراجعه کرده و از بخش "آگهی‌های من" آگهی مورد نظر را انتخاب و ویرایش کنید. تغییرات پس از بررسی توسط تیم ما اعمال خواهد شد. توجه داشته باشید که تغییرات اساسی در محتوای آگهی ممکن است نیازمند بررسی مجدد باشد. همچنین امکان تمدید مدت زمان نمایش آگهی نیز وجود دارد.'
    },
    {
      id: 6,
      question: 'چگونه می‌توانم آگهی‌های خود را مدیریت کنم؟',
      answer: 'در پنل کاربری خود به بخش "آگهی‌های من" مراجعه کنید. در این بخش می‌توانید تمامی آگهی‌های فعال، منقضی شده و در انتظار تأیید خود را مشاهده کنید. برای هر آگهی امکاناتی مانند مشاهده آمار بازدید، ویرایش، تمدید، غیرفعال کردن موقت و حذف کامل وجود دارد. همچنین می‌توانید گزارش‌های آماری از عملکرد آگهی‌های خود دریافت کنید تا بتوانید در آگهی‌های بعدی عملکرد بهتری داشته باشید.'
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
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark' },
              borderRadius: 2,
              px: 4,
              py: 1,
              fontSize: '0.9rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(0, 118, 255, 0.25)',
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