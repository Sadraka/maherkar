from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrOwnerForUpdateAndEmployerForCreate(BasePermission):

    def has_permission(self, request, view):
        # برای متدهای GET (خواندن)، فقط کارفرما و مدیر مجاز هستند
        if request.method in SAFE_METHODS:
            return request.user.is_staff or request.user.user_type == 'EM'

        # برای ایجاد شرکت جدید، فقط کارفرما و مدیر مجاز هستند
        if request.method == 'POST':
            return request.user.is_staff or request.user.user_type == 'EM'

        return True

    def has_object_permission(self, request, view, obj):
        # برای متدهای خواندن، مدیر همه چیز می‌تواند ببیند و کارفرما فقط شرکت‌های خودش
        if request.method in SAFE_METHODS:
            return request.user.is_staff or obj.employer == request.user

        # برای ویرایش و حذف، فقط مدیر یا صاحب شرکت مجاز است
        return request.user.is_staff or obj.employer == request.user
