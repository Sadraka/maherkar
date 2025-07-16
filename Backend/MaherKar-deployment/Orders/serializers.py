from rest_framework import serializers

from Advertisements.models import Advertisement
from Subscriptions.models import SubscriptionPlan
from .models import SubscriptionOrder
import uuid


class SubscriptionOrderSerializer(serializers.ModelSerializer):
    """
    سریالایزر مربوط به ایجاد سفارش‌های اشتراک.
    این سریالایزر فیلدهای مورد نیاز جهت ثبت سفارش اشتراک (SubscriptionOrder)
    را مدیریت می‌کند و عملیات محاسبه قیمت و تعیین مالک آگهی را انجام می‌دهد.
    """
    plan_id = serializers.CharField(write_only=True, required=False)
    advertisement_id = serializers.CharField(write_only=True, required=False)
    duration = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = SubscriptionOrder
        fields = "__all__"
        read_only_fields = ['owner', 'total_price',
                            'advertisement', 'plan', 'subscription', 'ad_type']

    def create(self, validated_data):
        # گرفتن درخواست و کاربر از context
        request = self.context.get('request')
        user = request.user

        # دریافت شناسه طرح اشتراک از داده‌های ورودی
        plan_id = validated_data.pop('plan_id', None)
        if plan_id:
            try:
                plan = SubscriptionPlan.objects.get(id=plan_id)
            except SubscriptionPlan.DoesNotExist:
                # در صورتی که طرح با شناسه داده شده وجود نداشته باشد خطا صادر می‌شود
                raise serializers.ValidationError(
                    {'plan': 'The plan does not exist.'})
        else:
            # اگر شناسه طرح ارسال نشده باشد، پیام خطا برگردانده می‌شود
            raise serializers.ValidationError(
                {'plan_id': 'This field is required.'})

        # دریافت شناسه آگهی از داده‌های ورودی
        advertisement_id = validated_data.pop('advertisement_id', None)
        if advertisement_id is not None:
            try:
                advertisement = Advertisement.objects.get(id=advertisement_id)
            except Advertisement.DoesNotExist:
                # در صورتی که آگهی با شناسه داده شده وجود نداشته باشد، خطای مناسب صادر می‌شود
                raise serializers.ValidationError(
                    {'advertisement': 'The advertisement does not exist.'})
        else:
            # اگر شناسه آگهی ارسال نشده باشد، خطا ارسال می‌شود
            raise serializers.ValidationError(
                {'advertisement_id': 'This field is required.'})

        # بررسی نوع آگهی و تعیین نوع آگهی (J یا R) و همچنین مالک آگهی بر اساس نوع
        if advertisement.ad_type == 'J':
            # در صورت آگهی شغلی: بررسی می‌شود که کاربر مربوط به آگهی (کارفرما) یا مدیر است
            if advertisement.job_advertisement.employer == user or user.is_staff:
                ad_type = "J"
                owner = advertisement.job_advertisement.employer
            else:
                raise serializers.ValidationError(
                    {'error': 'Uncommon security error for job advertisement.'})

        if advertisement.ad_type == 'R':
            # در صورت آگهی رزومه: بررسی می‌شود که کاربر مربوط به آگهی (جویای شغل) یا مدیر است
            if advertisement.resume_advertisement.job_seeker == user or user.is_staff:
                ad_type = "R"
                owner = advertisement.resume_advertisement.job_seeker
            else:
                raise serializers.ValidationError(
                    {'error': 'Uncommon security error for resume advertisement.'})

        # بازیابی اطلاعات اشتراک مرتبط با آگهی
        subscription = advertisement.subscription

        # محاسبه قیمت کل سفارش بر اساس مدت زمان و قیمت روزانه طرح اشتراک
        price_per_day = plan.price_per_day
        duration = validated_data.get('duration')
        # محاسبه قیمت براساس تعداد روزها
        duration_price = int(duration) * price_per_day
        # محاسبه هزینه تاکس (10 درصد از قیمت کل)
        taks_price = duration_price * 10 // 100
        # مجموع قیمت شامل تاکس و قیمت پایه
        total_price = duration_price + taks_price

        # تولید شناسه یکتا برای سفارش
        order_id = uuid.uuid4()

        # ایجاد سفارش جدید با استفاده از اطلاعات بدست آمده
        order = SubscriptionOrder.objects.create(
            plan=plan,
            owner=owner,
            durations=duration,
            id=order_id,
            total_price=total_price,
            advertisement=advertisement,
            subscription=subscription,
            ad_type=ad_type
        )

        order.save()  # ذخیره سفارش در پایگاه داده
        return order  # بازگرداندن سفارش ایجاد شده


class NewJobAdvertisementOrderSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای ایجاد سفارش آگهی جدید.
    این سریالایزر برای زمانی استفاده می‌شود که کارفرما می‌خواهد آگهی جدید ایجاد کند
    و ابتدا باید پرداخت انجام دهد.
    """
    plan_id = serializers.CharField(write_only=True, required=True)
    duration = serializers.CharField(write_only=True, required=True)

    # فیلدهای آگهی که موقتاً ذخیره می‌شوند
    job_title = serializers.CharField(write_only=True, required=True)
    job_description = serializers.CharField(
        write_only=True, required=False, allow_blank=True)
    company_id = serializers.CharField(write_only=True, required=True)
    industry_id = serializers.CharField(write_only=True, required=True)

    # فیلدهای اختیاری آگهی
    gender = serializers.CharField(
        write_only=True, required=False, allow_blank=True)
    soldier_status = serializers.CharField(
        write_only=True, required=False, allow_blank=True)
    degree = serializers.CharField(
        write_only=True, required=False, allow_blank=True)
    salary = serializers.CharField(
        write_only=True, required=False, allow_blank=True)
    job_type = serializers.CharField(
        write_only=True, required=False, allow_blank=True)

    class Meta:
        model = SubscriptionOrder
        fields = "__all__"
        read_only_fields = ['owner', 'total_price',
                            'advertisement', 'plan', 'subscription', 'ad_type']

    def create(self, validated_data):
        # گرفتن درخواست و کاربر از context
        request = self.context.get('request')
        user = request.user

        # استخراج داده‌های طرح و مدت زمان
        plan_id = validated_data.pop('plan_id')
        duration = validated_data.pop('duration')

        # استخراج اطلاعات آگهی برای ذخیره موقت
        job_data = {
            'job_title': validated_data.pop('job_title'),
            'job_description': validated_data.pop('job_description', ''),
            'company_id': validated_data.pop('company_id'),
            'industry_id': validated_data.pop('industry_id'),
            'gender': validated_data.pop('gender', ''),
            'soldier_status': validated_data.pop('soldier_status', ''),
            'degree': validated_data.pop('degree', ''),
            'salary': validated_data.pop('salary', ''),
            'job_type': validated_data.pop('job_type', ''),
        }

        # یافتن طرح اشتراک
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id)
        except SubscriptionPlan.DoesNotExist:
            raise serializers.ValidationError(
                {'plan_id': 'طرح اشتراک یافت نشد.'})

        # محاسبه قیمت کل (مشابه serializer اول)
        price_per_day = plan.price_per_day
        duration_price = int(duration) * price_per_day
        # محاسبه هزینه تاکس (10 درصد از قیمت کل)
        taks_price = duration_price * 10 // 100
        # مجموع قیمت شامل تاکس و قیمت پایه
        total_price = duration_price + taks_price

        # ایجاد سفارش بدون آگهی
        order = SubscriptionOrder.objects.create(
            owner=user,
            plan=plan,
            total_price=total_price,
            durations=int(duration),
            ad_type='J',  # J برای Job
            payment_status='pending'
        )

        # ذخیره اطلاعات آگهی به صورت JSON
        order.set_pending_job_data(job_data)

        return order
