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
import LiveHelpOutlinedIcon from '@mui/icons-material/LiveHelpOutlined';

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
      question: 'ماهرکار چگونه کار می‌کند؟',
      answer: 'ماهرکار یک پلتفرم آنلاین است که کارفرمایان را به متخصصان و فریلنسرها متصل می‌کند. کارفرمایان می‌توانند پروژه‌های خود را ثبت کنند و متخصصان می‌توانند برای آن‌ها پیشنهاد ارسال کنند. همچنین، کارفرمایان می‌توانند متخصصان مناسب را جستجو کرده و مستقیماً با آن‌ها تماس بگیرند.'
    },
    {
      id: 2,
      question: 'هزینه استفاده از ماهرکار چقدر است؟',
      answer: 'ثبت‌نام و جستجو در ماهرکار کاملاً رایگان است. کارمزد ماهرکار تنها زمانی از متخصصان دریافت می‌شود که پروژه‌ای را با موفقیت به پایان برسانند. این کارمزد بسته به نوع پروژه و مبلغ آن متغیر است اما معمولاً بین ۱۰ تا ۱۵ درصد از مبلغ پروژه است.'
    },
    {
      id: 3,
      question: 'چگونه می‌توانم متخصص مناسب برای پروژه‌ام پیدا کنم؟',
      answer: 'شما می‌توانید از طریق جستجو در دسته‌بندی‌های مختلف، فیلتر کردن بر اساس مهارت‌ها، امتیازها و محل کار متخصصان، گزینه‌های مناسب را پیدا کنید. همچنین می‌توانید پروژه خود را ثبت کنید تا متخصصان واجد شرایط برای آن پیشنهاد ارسال کنند.'
    },
    {
      id: 4,
      question: 'پرداخت در ماهرکار چگونه انجام می‌شود؟',
      answer: 'ماهرکار از یک سیستم امن پرداخت استفاده می‌کند. کارفرما مبلغ پروژه را به حساب امانی ماهرکار واریز می‌کند و پس از تأیید انجام کار، مبلغ به حساب متخصص منتقل می‌شود. این روش باعث ایجاد اطمینان برای هر دو طرف می‌شود.'
    },
    {
      id: 5,
      question: 'آیا ماهرکار ضمانت کیفیت کار را ارائه می‌دهد؟',
      answer: 'بله، ماهرکار یک دوره ضمانت ۷ روزه برای اکثر پروژه‌ها ارائه می‌دهد. اگر کار انجام شده مطابق با توافق اولیه نباشد، کارفرما می‌تواند درخواست اصلاح یا بازپرداخت کند. همچنین، سیستم امتیازدهی و نظرات کاربران به شما کمک می‌کند تا متخصصان با کیفیت بالا را شناسایی کنید.'
    },
    {
      id: 6,
      question: 'چگونه می‌توانم به عنوان متخصص در ماهرکار ثبت‌نام کنم؟',
      answer: 'برای ثبت‌نام به عنوان متخصص، ابتدا در سایت ثبت‌نام کنید و سپس پروفایل خود را تکمیل نمایید. اطلاعات مربوط به مهارت‌ها، سوابق کاری، تحصیلات و نمونه کارهای خود را اضافه کنید. پس از تأیید حساب کاربری، می‌توانید برای پروژه‌ها پیشنهاد ارسال کنید یا پروفایل خود را در معرض دید کارفرمایان قرار دهید.'
    },
  ];

  return (
    <Box sx={{ py: 6, backgroundColor: '#fff' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ fontWeight: 'bold', mb: 1.5 }}
          >
            سوالات متداول
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ maxWidth: 650, mx: 'auto' }}
          >
            پاسخ سوالات شما درباره نحوه استفاده از ماهرکار و فرآیندهای آن
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
                      {item.id === 1 && (
                        <LiveHelpOutlinedIcon 
                          color="primary" 
                          fontSize="small" 
                          sx={{ mr: 1, opacity: 0.7 }} 
                        />
                      )}
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
              backgroundColor: 'var(--primary-color)',
              '&:hover': { backgroundColor: '#1565c0' },
              borderRadius: 2,
              px: 4
            }}
          >
            تماس با پشتیبانی
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 