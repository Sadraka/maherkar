from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action

from rest_framework.response import Response

from rest_framework.generics import get_object_or_404

from Profiles.models import JobSeekerProfile

from .models import JobAdvertisement, ResumeAdvertisement, Application

from .serializers import Advertisement, JobAdvertisementSerializer, ResumeAdvertisementSerializer, ApplicationSerializer


class JobAdvertisementViewSet(viewsets.ViewSet):

    def list(self, request):
        # دریافت تمامی نمونه‌های JobAdvertisement (آگهی‌های کارفرما)
        queryset = JobAdvertisement.objects.all()
        # سریالایز کردن لیست آگهی‌های کارفرما
        serializer = JobAdvertisementSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk):
        query = get_object_or_404(JobAdvertisement, id=pk)
        serializer = JobAdvertisementSerializer(query)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request):
        # بررسی می‌شود که کاربر دارای نوع کاربری (user_type) "EM" (کارفرما) است.
        if request.user.user_type == "EM":
            serializer = JobAdvertisementSerializer(
                data=request.data, context={'request': request})
            if serializer.is_valid():
                job_ad = serializer.save()  # ایجاد یک آگهی کارفرما جدید
                return Response({
                    "Message": "Job created.",
                    "id": job_ad.id,
                    "advertisement_id": job_ad.advertisement.id
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            # اگر کاربر کارفرما نباشد، ارسال پیام خطا
            return Response({"Message": "You are not a employer."}, status=status.HTTP_403_FORBIDDEN)

    def update(self, request, pk):
        # واکشی آگهی کارفرما بر اساس شناسه (pk)
        instance = get_object_or_404(JobAdvertisement, id=pk)
        # چک می‌شود که آیا درخواست‌دهنده مالک آگهی است یا یک admin (is_staff)
        if instance.employer == request.user or request.user.is_staff:
            # ایجاد سریالایزر جهت به‌روزرسانی جزئی (partial update)
            serializer = JobAdvertisementSerializer(
                instance,
                data=request.data,
                partial=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()  # ذخیره تغییرات
                return Response(
                    {
                        "Massage": "Job ad updated.",
                        "data": serializer.data
                    }, status=status.HTTP_200_OK
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"Massage": "You dont have the permissions."}, status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, pk):
        query = get_object_or_404(JobAdvertisement, id=pk)
        if query.employer == request.user or request.user.is_staff:
            query.delete()    # حذف آگهی کارفرما
            return Response({"Massage": "The advertisement deleted."}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"Massage": "You dont have the permissions."}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['get'], url_path='my-jobs')
    def my_jobs(self, request):
        """
        دریافت آگهی‌های شغلی مربوط به کارفرما احراز هویت شده
        فقط کارفرماها به این endpoint دسترسی دارند
        """
        # بررسی احراز هویت
        if not request.user.is_authenticated:
            return Response(
                {"error": "برای دسترسی به این بخش باید وارد سیستم شوید."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # بررسی نوع کاربر (فقط کارفرما)
        if request.user.user_type != "EM":
            return Response(
                {"error": "فقط کارفرماها به این بخش دسترسی دارند."},
                status=status.HTTP_403_FORBIDDEN
            )

        # دریافت آگهی‌های مربوط به کارفرما
        queryset = JobAdvertisement.objects.filter(
            employer=request.user).order_by('-created_at')
        serializer = JobAdvertisementSerializer(queryset, many=True)

        return Response({
            "count": queryset.count(),
            "results": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='my-job-detail')
    def my_job_detail(self, request, pk=None):
        """
        دریافت جزئیات یک آگهی شغلی مربوط به کارفرما احراز هویت شده
        فقط کارفرماها به این endpoint دسترسی دارند و فقط آگهی‌های خودشان
        """
        # بررسی احراز هویت
        if not request.user.is_authenticated:
            return Response(
                {"error": "برای دسترسی به این بخش باید وارد سیستم شوید."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # بررسی نوع کاربر (فقط کارفرما)
        if request.user.user_type != "EM":
            return Response(
                {"error": "فقط کارفرماها به این بخش دسترسی دارند."},
                status=status.HTTP_403_FORBIDDEN
            )

        # دریافت آگهی مربوط به کارفرما
        try:
            query = JobAdvertisement.objects.get(id=pk, employer=request.user)
            serializer = JobAdvertisementSerializer(query)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except JobAdvertisement.DoesNotExist:
            return Response(
                {"error": "آگهی مورد نظر یافت نشد یا شما مالک آن نیستید."},
                status=status.HTTP_404_NOT_FOUND
            )


class ResumeAdvertisementViewSet(viewsets.ViewSet):

    def list(self, request):
        # دریافت تمامی نمونه‌های ResumeAdvertisement (آگهی‌های کارفرما)
        queryset = ResumeAdvertisement.objects.all()
        # سریالایز کردن لیست آگهی‌های کارفرما
        serializer = ResumeAdvertisementSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk):
        query = get_object_or_404(ResumeAdvertisement, id=pk)
        serializer = ResumeAdvertisementSerializer(query)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request):
        # بررسی می‌شود که کاربر دارای نوع کاربری (user_type) "JS" (کارجو) است.
        if request.user.user_type == "JS":
            serializer = ResumeAdvertisementSerializer(
                data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()  # ایجاد یک آگهی کارجو جدید
                return Response({"Massage": "Resume ad created."}, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            # اگر کاربر کارجو نباشد، ارسال پیام خطا
            return Response({"Massage": "You are not a job seeker."}, status=status.HTTP_403_FORBIDDEN)

    def update(self, request, pk):
        # واکشی آگهی کارجو بر اساس شناسه (pk)
        instance = get_object_or_404(ResumeAdvertisement, id=pk)
        # چک می‌شود که آیا درخواست‌دهنده مالک آگهی است یا یک admin (is_staff)
        if instance.job_seeker == request.user or request.user.is_staff:
            # ایجاد سریالایزر جهت به‌روزرسانی جزئی (partial update)
            serializer = ResumeAdvertisementSerializer(
                instance,
                data=request.data,
                partial=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()  # ذخیره تغییرات
                return Response(
                    {
                        "Massage": "Resume ad updated.",
                        "data": serializer.data
                    }, status=status.HTTP_200_OK
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"Massage": "You dont have the permissions."}, status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, pk):
        query = get_object_or_404(ResumeAdvertisement, id=pk)
        if query.job_seeker == request.user or request.user.is_staff:
            query.delete()    # حذف آگهی کارجو
            return Response({"Massage": "The advertisement deleted."}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"Massage": "You dont have the permissions."}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=False, methods=['get'], url_path='my-resumes')
    def my_resumes(self, request):
        """
        دریافت آگهی‌های رزومه مربوط به کارجوی احراز هویت شده
        فقط کارجوها به این endpoint دسترسی دارند
        """
        # بررسی احراز هویت
        if not request.user.is_authenticated:
            return Response(
                {"error": "برای دسترسی به این بخش باید وارد سیستم شوید."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # بررسی نوع کاربر (فقط کارجو)
        if request.user.user_type != "JS":
            return Response(
                {"error": "فقط کارجوها به این بخش دسترسی دارند."},
                status=status.HTTP_403_FORBIDDEN
            )

        # دریافت آگهی‌های رزومه مربوط به کارجو
        queryset = ResumeAdvertisement.objects.filter(
            job_seeker=request.user).order_by('-created_at')
        serializer = ResumeAdvertisementSerializer(queryset, many=True)

        return Response({
            "count": queryset.count(),
            "results": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='my-resume-detail')
    def my_resume_detail(self, request, pk=None):
        """
        دریافت جزئیات یک آگهی رزومه مربوط به کارجوی احراز هویت شده
        فقط کارجوها به این endpoint دسترسی دارند و فقط آگهی‌های خودشان
        """
        # بررسی احراز هویت
        if not request.user.is_authenticated:
            return Response(
                {"error": "برای دسترسی به این بخش باید وارد سیستم شوید."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # بررسی نوع کاربر (فقط کارجو)
        if request.user.user_type != "JS":
            return Response(
                {"error": "فقط کارجوها به این بخش دسترسی دارند."},
                status=status.HTTP_403_FORBIDDEN
            )

        # دریافت آگهی رزومه مربوط به کارجو
        try:
            query = ResumeAdvertisement.objects.get(
                id=pk, job_seeker=request.user)
            serializer = ResumeAdvertisementSerializer(query)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ResumeAdvertisement.DoesNotExist:
            return Response(
                {"error": "آگهی رزومه مورد نظر یافت نشد یا شما مالک آن نیستید."},
                status=status.HTTP_404_NOT_FOUND
            )


class ApplicationViewSet(viewsets.ViewSet):
    """
    ViewSet for managing Application model operations.
    """
    permission_classes = [permissions.IsAuthenticated]
    # تنها کاربران احراز هویت‌شده مجاز به دسترسی به این ویوست هستند

    def list(self, request, *args, **kwargs):
        queryset = Application.objects.all()  # دریافت queryset (همه درخواست‌ها)
        serializer = ApplicationSerializer(
            queryset, many=True)  # سریالایز کردن لیست درخواست‌ها
        return Response(serializer.data)

    def retrieve(self, request, pk, *args, **kwargs):
        # واکشی درخواست خاص بر اساس کلید اصلی (pk)؛ در صورت عدم وجود خطای 404 برگردانده می‌شود
        queryset = get_object_or_404(Application, pk=pk)
        # سریالایز کردن درخواست دریافت‌شده
        serializer = ApplicationSerializer(queryset)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # ایجاد سریالایزر با داده‌های ورودی و context شامل request
        serializer = ApplicationSerializer(
            data=request.data, context={'request': request})
        # اعتبارسنجی داده‌ها؛ در صورت عدم اعتبار خطا برمی‌گرداند
        serializer.is_valid(raise_exception=True)
        # ذخیره و ایجاد درخواست جدید؛ متد create سریالایزر خودکار کار را انجام می‌دهد
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, pk, *args, **kwargs):
        # واکشی نمونه درخواست بر اساس pk
        instance = get_object_or_404(Application, pk=pk)
        # ساختن سریالایزر جهت به‌روز رسانی داده‌ها به‌صورت partial (جزئی)
        serializer = ApplicationSerializer(
            instance, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid(raise_exception=True):
            serializer.save()  # ذخیره تغییرات در نمونه درخواست
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None, *args, **kwargs):
        # تنها کاربر ادمین اجازه حذف درخواست‌ها را دارد
        if request.user.is_staff:
            instance = get_object_or_404(
                Application, pk=pk)  # واکشی درخواست موردنظر
            instance.delete()  # حذف درخواست از دیتابیس
            return Response({"detail": "Application deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"Massage": "You dont have the permissions"}, status=status.HTTP_403_FORBIDDEN)
