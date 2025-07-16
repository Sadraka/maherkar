from django.shortcuts import get_object_or_404
from rest_framework.views import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Company
from .serializers import CompanySerializer
from .permissions import IsAdminOrOwnerForUpdateAndEmployerForCreate


class CompanyViewSet(ModelViewSet):

    permission_classes = [IsAuthenticated,
                          IsAdminOrOwnerForUpdateAndEmployerForCreate]
    lookup_field = 'pk'

    def list(self, request, *args, **kwargs):
        """List companies based on user role.
           دریافت لیست شرکت‌ها بر اساس نقش کاربر.
        """
        # اگر کاربر مدیر باشد، همه شرکت‌ها را نمایش بده
        if request.user.is_staff:
            queryset = Company.objects.all()
        # اگر کاربر کارفرما باشد، فقط شرکت‌های خودش را نمایش بده
        elif request.user.user_type == 'EM':
            queryset = Company.objects.filter(employer=request.user)
        # برای سایر نوع کاربران، هیچ شرکتی نمایش داده نشود
        else:
            queryset = Company.objects.none()

        serializer = CompanySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk, *args, **kwargs):
        """Retrieve a specific company based on user role.
           دریافت جزئیات یک شرکت بر اساس نقش کاربر.
        """
        # اگر کاربر مدیر باشد، هر شرکتی را می‌تواند ببیند
        if request.user.is_staff:
            instance = get_object_or_404(Company, id=pk)
        # اگر کاربر کارفرما باشد، فقط شرکت‌های خودش را می‌تواند ببیند
        elif request.user.user_type == 'EM':
            instance = get_object_or_404(Company, id=pk, employer=request.user)
        # برای سایر نوع کاربران، دسترسی مجاز نیست
        else:
            return Response(
                {'error': 'شما مجاز به مشاهده اطلاعات شرکت‌ها نیستید.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CompanySerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = CompanySerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'Message': 'Company created successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk, *args, **kwargs):
        """Update an existing company.
           به‌روزرسانی اطلاعات یک شرکت موجود بر اساس اسلاگ.
        """
        instance = get_object_or_404(Company, id=pk)
        serializer = CompanySerializer(
            instance=instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
