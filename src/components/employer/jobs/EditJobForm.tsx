import React from 'react';
import CreateJobForm from './CreateJobForm';
import EditIcon from '@mui/icons-material/Edit';

interface EditJobFormProps {
  initialData?: any;
  onSubmit?: (data: any) => Promise<{ 
    success: boolean; 
    message: string; 
    redirectUrl: string;
  }>;
  pageTitle?: string;
  submitButtonText?: string;
  successMessage?: string;
}

/**
 * کامپوننت ویرایش آگهی شغلی
 * از CreateJobForm استفاده می‌کند با پیکربندی متفاوت
 */
const EditJobForm = ({ 
  initialData,
  onSubmit,
  pageTitle = "ویرایش آگهی شغلی",
  submitButtonText = "بروزرسانی آگهی", 
  successMessage = "آگهی با موفقیت بروزرسانی شد"
}: EditJobFormProps) => {
  return (
    <CreateJobForm
      initialData={initialData}
      isEditMode={true}
      onSubmit={onSubmit}
      pageTitle={pageTitle}
      pageIcon={<EditIcon />}
      submitButtonText={submitButtonText}
      successMessage={successMessage}
    />
  );
};

export default EditJobForm; 