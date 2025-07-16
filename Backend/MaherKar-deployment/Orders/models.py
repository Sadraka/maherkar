from django.db import models

from Advertisements.models import Advertisement

from Subscriptions.models import AdvertisementSubscription, SubscriptionPlan

from Users.models import User

import uuid
import json


class SubscriptionOrder(models.Model):
    """
    مدل سفارش اشتراک، شامل اطلاعات مربوط به سفارش طرح‌های اشتراک،
    آگهی‌های مربوطه و وضعیت پرداخت.
    """

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', "در انتظار"
        PAID = 'paid', "پرداخت شده"
        CANCELED = 'canceled', "لغو شده"
        FAILED = 'failed', "ناموفق"

    class TypeChoices(models.TextChoices):
        JOB = 'J', 'شغل'
        RESUME = 'R', 'رزومه'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        verbose_name="مالک",
        related_name="user_subscription_orders"
    )

    # آگهی اختیاری - در فرآیند جدید ابتدا null است و بعد از پرداخت پر می‌شود
    advertisement = models.ForeignKey(
        Advertisement,
        on_delete=models.CASCADE,
        related_name="advertisement_orders",
        null=True,
        blank=True
    )

    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.CASCADE,
        verbose_name="پلن",
        related_name="plan_orders"
    )

    # اشتراک اختیاری - در فرآیند جدید ابتدا null است و بعد از پرداخت ایجاد می‌شود
    subscription = models.ForeignKey(
        AdvertisementSubscription,
        on_delete=models.CASCADE,
        verbose_name="اشتراک آگهی ها",
        related_name="subscription_orders",
        null=True,
        blank=True
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        verbose_name="وضعیت پرداخت"
    )

    ad_type = models.CharField(
        max_length=1,
        verbose_name="نوع آگهی",
        choices=TypeChoices.choices,
    )

    durations = models.IntegerField(verbose_name="مدت زمان اشتراک", default=1)

    price = models.IntegerField(verbose_name="قیمت", default=0)

    total_price = models.IntegerField(verbose_name="قیمت نهایی")

    # ذخیره موقت اطلاعات آگهی قبل از پرداخت
    pending_job_data = models.JSONField(
        verbose_name="اطلاعات موقت آگهی",
        null=True,
        blank=True,
        help_text="اطلاعات آگهی که قبل از پرداخت ذخیره می‌شود"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # تعیین نام نمایشی مفرد و جمع برای مدل در پنل ادمین
        verbose_name = "سفارش آگهی"
        verbose_name_plural = "سفارشات آگهی ها"

    def __str__(self):
        """
        متد __str__: نمایش نمایشی از سفارش.
        """
        return f"سفارش {self.id} - وضعیت: {self.payment_status}"

    def get_pending_job_data(self):
        """
        دریافت اطلاعات موقت آگهی به صورت dictionary
        """
        if self.pending_job_data:
            return self.pending_job_data
        return {}

    def set_pending_job_data(self, job_data):
        """
        تنظیم اطلاعات موقت آگهی
        """
        self.pending_job_data = job_data
        self.save()
