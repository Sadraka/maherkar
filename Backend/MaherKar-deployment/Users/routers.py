# ایمپورت ماژول‌های مورد نیاز برای تعریف روترها
from rest_framework import routers  # وارد کردن ماژول روترها از Django REST Framework
from django.urls import path, include  # وارد کردن توابع path و include جهت تعریف الگوی URL‌ها

from .views import UserViewSet




# تعریف یک کلاس روتر سفارشی برای مدیریت کاربران
class UserRouter(routers.DefaultRouter):
    # مقداردهی اولیه روتر سفارشی برای کاربران
    def __init__(self):
        super().__init__()  # فراخوانی سازنده کلاس والد
        # ثبت ویوست UserViewSet در این روتر؛ در اینجا نیز الگوی پایه (prefix) خالی است.
        self.register(r'', UserViewSet, basename='users')

    # تعریف متدی برای دریافت URLهای سفارشی مربوط به کاربران
    def get_urls(self):
        # دریافت URLهای پیش‌فرض از کلاس والد
        urls = super().get_urls()
        # تعریف URLهای سفارشی جهت عملیات‌های خاص برای کاربران
        custom_urls = [
            # تعریف الگوی URL اصلی برای این روتر
            path('', include([
                # تعریف URL خالی جهت فراخوانی متد list در UserViewSet (برای دریافت لیست کاربران)
                path('', UserViewSet.as_view({'get': 'list'})),
                # تعریف URL شامل پارامتر pk (عددی) برای دریافت اطلاعات یک کاربر خاص
                path('<int:pk>/', include([
                    # فراخوانی متد GET برای دریافت اطلاعات جزئیات کاربر
                    path('', UserViewSet.as_view({'get': 'retrieve'})),
                ])),
            ])),
        ]
        # ترکیب URLهای پیش‌فرض با سفارشی و بازگشت آن‌ها
        return urls + custom_urls
