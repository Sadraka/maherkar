"use client"
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Paper
} from '@mui/material';
import { Close as CloseIcon, RotateLeft as RotateLeftIcon, RotateRight as RotateRightIcon } from '@mui/icons-material';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  open: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedImage: File) => void;
  aspectRatio?: number;
  title?: string;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  open,
  onClose,
  imageFile,
  onCropComplete,
  aspectRatio = 1,
  title = 'ویرایش تصویر'
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotate, setRotate] = useState(0);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  const updateCompletedFromPercent = React.useCallback(() => {
    if (!imgRef.current || !crop) return;
    const img = imgRef.current;
    const isPercent = (crop as any).unit === '%';
    const toPx = (val?: number) => {
      if (!val) return 0;
      return isPercent ? (val / 100) * img.width : val;
    };
    const next: PixelCrop = {
      x: toPx(crop.x),
      y: toPx(crop.y),
      width: toPx(crop.width),
      height: toPx(crop.height),
      unit: 'px' as any
    } as PixelCrop;
    setCompletedCrop(next);
  }, [crop]);

  // بارگذاری تصویر
  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        // تنظیم crop اولیه
        const img = new Image();
        img.onload = () => {
          const crop = centerCrop(
            makeAspectCrop(
              {
                unit: '%',
                width: 60,
              },
              aspectRatio, // استفاده از aspect ratio پاس شده
              img.width,
              img.height,
            ),
            img.width,
            img.height,
          );
          setCrop(crop);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  // وقتی تصویر نمایش داده شد، completedCrop را از crop اولیه محاسبه کن
  React.useEffect(() => {
    if (!imageSrc) return;
    // کمی تاخیر تا <img> رندر شود
    const id = setTimeout(() => updateCompletedFromPercent(), 0);
    return () => clearTimeout(id);
  }, [imageSrc, updateCompletedFromPercent]);

  // تابع بهینه‌سازی اندازه تصویر
  const optimizeImageSize = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        // محاسبه اندازه بهینه
        const maxWidth = 800;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const quality = 0.85;
        const tryWebP = () => {
          const webpName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], webpName, { type: 'image/webp', lastModified: Date.now() }));
            } else {
              tryJPEG();
            }
          }, 'image/webp', quality);
        };

        const tryJPEG = () => {
          const jpgName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], jpgName, { type: 'image/jpeg', lastModified: Date.now() }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };

        tryWebP();
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // تابع کراپ تصویر
  const getCroppedImg = (): Promise<File> => {
    return new Promise((resolve) => {
      if (!imgRef.current || !completedCrop) {
        resolve(imageFile!);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(imageFile!);
        return;
      }

      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      // تنظیم اندازه canvas با توجه به aspect ratio
      const maxSize = 800; // حداکثر اندازه
      let canvasWidth = completedCrop.width * scaleX;
      let canvasHeight = completedCrop.height * scaleY;

      // محدود کردن اندازه
      if (canvasWidth > maxSize || canvasHeight > maxSize) {
        const scale = Math.min(maxSize / canvasWidth, maxSize / canvasHeight);
        canvasWidth *= scale;
        canvasHeight *= scale;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // اگر aspect ratio 1 باشد (مربع)، دایره بکش
      if (aspectRatio === 1) {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, 2 * Math.PI);
        ctx.clip();
      }

      // رسم تصویر کراپ شده
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const quality = 0.85;

      const tryWebP = () => {
        const name = (imageFile?.name || 'cropped-image').replace(/\.[^/.]+$/, '') + '.webp';
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], name, { type: 'image/webp', lastModified: Date.now() }));
          } else {
            tryJPEG();
          }
        }, 'image/webp', quality);
      };

      const tryJPEG = () => {
        const name = (imageFile?.name || 'cropped-image').replace(/\.[^/.]+$/, '') + '.jpg';
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            resolve(imageFile!);
          }
        }, 'image/jpeg', quality);
      };

      tryWebP();
    });
  };

  // تابع ذخیره
  const handleSave = async () => {
    const croppedImage = await getCroppedImg();
    const optimizedImage = await optimizeImageSize(croppedImage);
    onCropComplete(optimizedImage);
    onClose();
  };

  // تابع ریست
  const handleReset = () => {
    setRotate(0);
    if (imageFile) {
      const img = new Image();
      img.onload = () => {
        const crop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 60,
            },
            aspectRatio, // استفاده از aspect ratio پاس شده
            img.width,
            img.height,
          ),
          img.width,
          img.height,
        );
        setCrop(crop);
        // پس از ریست، completedCrop را هم از crop درصدی محاسبه کن
        setTimeout(() => updateCompletedFromPercent(), 0);
      };
      img.src = imageSrc;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          direction: 'rtl',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #e0e0e0',
          width: '400px',
          maxWidth: '90vw'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        pb: 1
      }}>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ mb: 3 }}>
          {/* کنترل‌های ساده */}
          <Box sx={{
            display: 'flex',
            gap: 1,
            mb: 2,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* چرخش چپ */}
            <Button
              onClick={() => setRotate(rotate - 90)}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 2,
                minWidth: 0,
                width: 36,
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 0.5
              }}
              aria-label="چرخش به چپ"
            >
              <RotateLeftIcon fontSize="small" />
            </Button>

            {/* ریست در مرکز */}
            <Button
              variant="outlined"
              size="small"
              onClick={handleReset}
              sx={{ borderRadius: 2, fontSize: '0.8rem', px: 1.75 }}
            >
              ریست
            </Button>

            {/* چرخش راست */}
            <Button
              onClick={() => setRotate(rotate + 90)}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 2,
                minWidth: 0,
                width: 36,
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 0.5
              }}
              aria-label="چرخش به راست"
            >
              <RotateRightIcon fontSize="small" />
            </Button>
          </Box>

          {/* نمایش تصویر */}
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 300,
              width: 300,
              mx: 'auto',
              bgcolor: 'grey.50',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid #e0e0e0'
            }}
          >
            {imageSrc && (
              <Box sx={{
                '& .ReactCrop__crop-selection': {
                  borderRadius: aspectRatio === 1 ? '50%' : '8px',
                  border: '2px solid #1976d2',
                  boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.5)'
                },
                '& .ReactCrop__drag-handle': {
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#1976d2',
                  border: '2px solid white',
                  borderRadius: aspectRatio === 1 ? '50%' : '4px'
                }
              }}>
                <ReactCrop
                  crop={crop}
                  onChange={(_: any, percentCrop: Crop) => setCrop(percentCrop)}
                  onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  circularCrop={aspectRatio === 1}
                  minWidth={80}
                  minHeight={80}
                  keepSelection
                  disabled={false}
                >
                  <img
                    ref={imgRef}
                    alt="تصویر برای ویرایش"
                    src={imageSrc}
                    style={{
                      transform: `rotate(${rotate}deg)`,
                      maxWidth: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                    onLoad={updateCompletedFromPercent}
                  />
                </ReactCrop>
              </Box>
            )}
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}
        >
          انصراف
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}
        >
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropper; 