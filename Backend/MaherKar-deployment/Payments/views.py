from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.conf import settings

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

import requests
import json

from Orders.models import SubscriptionOrder
from Advertisements.models import Advertisement, JobAdvertisement
from Subscriptions.models import AdvertisementSubscription
from Companies.models import Company
from Industry.models import Industry


# ---------------------------------------------------------------------------
# تنظیمات پرداخت Zarinpal - API v4
# ---------------------------------------------------------------------------
# تعیین آدرس درگاه پرداخت بر اساس حالت SANDBOX
if settings.SANDBOX:
    base_url = 'sandbox.zarinpal.com'
else:
    base_url = 'payment.zarinpal.com'

# URL های جدید زرین‌پال API v4
ZP_API_REQUEST = f"https://{base_url}/pg/v4/payment/request.json"
ZP_API_VERIFY = f"https://{base_url}/pg/v4/payment/verify.json"
ZP_API_STARTPAY = f"https://{base_url}/pg/StartPay/"

# توضیحات تراکنش حالا به صورت dynamic تولید می‌شود

# آدرس بازگشت پس از پرداخت - باید با domain اصلی تطبیق داشته باشد
# در تولید این URL باید به آدرس واقعی سایت تغییر کند
if settings.DEBUG:
    CallbackURL = 'http://localhost:3000/employer/payment/callback/'
else:
    CallbackURL = 'https://yourdomain.com/employer/payment/callback/'


# =============================================================================
# کلاس SendPaymentRequest: مدیریت ارسال درخواست پرداخت
# =============================================================================
class SendPaymentRequest(APIView):
    """
    ویو برای ارسال درخواست پرداخت به درگاه Zarinpal.
    """

    permission_classes = [permissions.IsAuthenticated]
    # تنها کاربران احراز هویت‌شده می‌توانند به این ویو دسترسی داشته باشند

    def get(self, request, order_id):
        """
        ارسال درخواست پرداخت برای یک سفارش خاص.
        """
        # واکشی سفارش بر اساس order_id؛ بازگرداندن خطای 404 در صورت عدم وجود سفارش
        order = get_object_or_404(SubscriptionOrder, id=order_id)

        # ذخیره شناسه سفارش در session کاربر
        request.session['order_id'] = str(order_id)

        # بررسی مالکیت سفارش؛ فقط مالک سفارش می‌تواند پرداخت کند
        if order.owner == request.user:
            # داده‌های مورد نیاز برای ارسال درخواست به درگاه Zarinpal - API v4
            data = {
                "merchant_id": settings.MERCHANT,  # شناسه پذیرنده
                # مبلغ پرداخت (تبدیل تومان به ریال - ضرب در 10)
                "amount": int(order.total_price * 10),
                # توضیحات تراکنش
                "description": f"پرداخت اشتراک آگهی - سفارش {order.id}",
                # آدرس بازگشت پس از پرداخت همراه با order_id
                "callback_url": f"{CallbackURL}?order_id={order_id}",
                "metadata": {
                    "mobile": request.user.phone,  # شماره تلفن کاربر
                    "order_id": str(order_id)  # شناسه سفارش
                },
            }

            data = json.dumps(data)  # تبدیل داده‌ها به فرمت JSON

            # تنظیم هدر درخواست HTTP
            headers = {'content-type': 'application/json',
                       'content-length': str(len(data))}

            try:
                # ارسال درخواست پرداخت به Zarinpal
                response = requests.post(
                    ZP_API_REQUEST, data=data, headers=headers, timeout=10)

                if response.status_code == 200:  # بررسی وضعیت موفقیت‌آمیز بودن پاسخ
                    response_data = response.json()

                    # بررسی ساختار جدید API v4
                    # وضعیت موفقیت درخواست
                    if 'data' in response_data and response_data['data']['code'] == 100:
                        # بازگرداندن آدرس شروع پرداخت و کد Authority
                        authority = response_data['data']['authority']
                        return Response({
                            'status': True,
                            'url': ZP_API_STARTPAY + str(authority),
                            'authority': authority,
                            'message': response_data['data']['message']
                        }, status=status.HTTP_200_OK)
                    else:
                        # بازگرداندن کد وضعیت خطای Zarinpal
                        error_code = response_data.get(
                            'data', {}).get('code', 'unknown')
                        error_message = response_data.get(
                            'data', {}).get('message', 'خطای نامشخص')
                        errors = response_data.get('errors', [])

                        return Response({
                            'status': False,
                            'code': str(error_code),
                            'message': error_message,
                            'errors': errors
                        }, status=status.HTTP_400_BAD_REQUEST)

                # در صورت عدم موفقیت درخواست HTTP
                return Response({'status': False, 'code': 'http_error', 'detail': 'خطا در ارتباط با درگاه پرداخت'}, status=status.HTTP_502_BAD_GATEWAY)

            except requests.exceptions.Timeout:
                # مدیریت خطای تایم‌اوت
                return Response({'status': False, 'code': 'timeout', 'detail': 'زمان درخواست به پایان رسید'}, status=status.HTTP_408_REQUEST_TIMEOUT)
            except requests.exceptions.ConnectionError:
                # مدیریت خطای اتصال
                return Response({'status': False, 'code': 'connection_error', 'detail': 'خطا در اتصال به درگاه پرداخت'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        else:
            # در صورت نداشتن مجوز پرداخت، بازگرداندن خطای دسترسی
            return Response({"Massage": "شما برای پرداخت این سفارش مجوز ندارین"}, status=status.HTTP_403_FORBIDDEN)


# =============================================================================
# کلاس VerifyPaymentRequest: مدیریت تایید تراکنش پرداخت
# =============================================================================
class VerifyPaymentRequest(APIView):
    """
    کلاس تایید پرداخت با زرین‌پال - API v4
    """

    def create_advertisement_from_order(self, order):
        """
        ایجاد آگهی از روی اطلاعات موقت ذخیره شده در سفارش
        """
        import uuid

        # دریافت اطلاعات موقت آگهی
        job_data = order.get_pending_job_data()

        if not job_data:
            raise ValueError("اطلاعات آگهی موقت یافت نشد")

        # یافتن شرکت
        try:
            company = Company.objects.get(id=job_data['company_id'])
        except Company.DoesNotExist:
            raise ValueError("شرکت مورد نظر یافت نشد")

        # یافتن صنعت
        try:
            industry = Industry.objects.get(id=job_data['industry_id'])
        except Industry.DoesNotExist:
            raise ValueError("صنعت مورد نظر یافت نشد")

        # بررسی مالکیت شرکت
        if company.employer != order.owner and not order.owner.is_staff:
            raise ValueError("شما مالک این شرکت نیستید")

        # ایجاد اشتراک جدید
        subscription = AdvertisementSubscription.objects.create()

        # ایجاد Advertisement
        ad_generated_id = uuid.uuid4()
        advertisement = Advertisement.objects.create(
            id=ad_generated_id,
            subscription=subscription,
            ad_type="J"
        )

        # ایجاد JobAdvertisement
        job_generated_id = uuid.uuid4()
        job_advertisement = JobAdvertisement.objects.create(
            id=job_generated_id,
            advertisement=advertisement,
            company=company,
            industry=industry,
            location=company.location,
            employer=order.owner,
            title=job_data.get('job_title', ''),
            description=job_data.get('job_description', ''),
            status='P',  # P برای در حال بررسی
            gender=job_data.get('gender') if job_data.get('gender') else None,
            soldier_status=job_data.get('soldier_status') if job_data.get(
                'soldier_status') else None,
            degree=job_data.get('degree') if job_data.get('degree') else None,
            salary=job_data.get('salary') if job_data.get('salary') else None,
            job_type=job_data.get('job_type') if job_data.get(
                'job_type') else None
        )

        return advertisement, subscription

    def get(self, request):
        """
        تایید پرداخت
        """
        # دریافت Authority از query parameters
        authority = request.GET.get('Authority')
        if not authority:
            return Response({
                "status": "error",
                "message": "Authority parameter یافت نشد"
            }, status=status.HTTP_400_BAD_REQUEST)

        # دریافت order_id از query parameters
        order_id = request.GET.get('order_id')

        if not order_id:
            return Response({
                "status": "error",
                "message": "شناسه سفارش در URL یافت نشد"
            }, status=status.HTTP_400_BAD_REQUEST)

        # واکشی سفارش بر اساس order_id؛ بازگرداندن خطای 404 در صورت عدم وجود
        try:
            order = SubscriptionOrder.objects.get(id=order_id)
            # اگر سفارش قبلاً پرداخت شده، مستقیماً success برگردان
            if order.payment_status == 'paid':
                return Response({
                    "status": "success",
                    "message": "پرداخت قبلاً انجام شده است",
                    "order_id": str(order.id),
                    "advertisement_id": str(order.advertisement.id) if order.advertisement else None
                }, status=status.HTTP_200_OK)
        except SubscriptionOrder.DoesNotExist:
            return Response({
                "status": "error",
                "message": "سفارش یافت نشد"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"خطا در یافتن سفارش: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        # داده‌های مورد نیاز برای تایید پرداخت - API v4
        data = {
            "merchant_id": settings.MERCHANT,  # شناسه پذیرنده
            # مبلغ تراکنش (تبدیل تومان به ریال)
            "amount": int(order.total_price * 10),
            "authority": authority,  # کد Authority برای تایید تراکنش
        }

        # ارسال درخواست تایید به زرین‌پال
        response = requests.post(ZP_API_VERIFY, data=json.dumps(
            data), headers={'Content-Type': 'application/json'})

        if response.status_code == 200:  # بررسی موفقیت‌آمیز بودن پاسخ
            response_data = response.json()

            # بررسی ساختار جدید API v4
            # تایید موفقیت‌آمیز تراکنش
            if 'data' in response_data and response_data['data']['code'] == 100:
                try:
                    # واکشی طرح اشتراک و اشتراک آگهی مرتبط با سفارش
                    plan = order.plan

                    # اگر آگهی وجود ندارد، ابتدا آن را ایجاد کن (فرآیند جدید)
                    if order.advertisement is None:
                        # ایجاد آگهی از روی اطلاعات موقت
                        advertisement, subscription = self.create_advertisement_from_order(
                            order)
                        order.advertisement = advertisement
                        order.subscription = subscription
                        order.save()
                    else:
                        # فرآیند قدیمی - آگهی از قبل موجود است
                        subscription = order.subscription

                    # به‌روزرسانی اشتراک
                    now = timezone.now()
                    end_date = now + timezone.timedelta(days=order.durations)

                    subscription.subscription_status = 'special'
                    subscription.plan = plan
                    subscription.duration = order.durations
                    subscription.start_date = now
                    subscription.end_date = end_date
                    subscription.save()

                    # به‌روزرسانی وضعیت پرداخت سفارش به 'paid'
                    order.payment_status = 'paid'
                    order.save()

                    # پاک کردن اطلاعات موقت آگهی
                    if order.pending_job_data:
                        order.pending_job_data = None
                        order.save()

                    # بازگرداندن پاسخ موفقیت - API v4
                    return Response({
                        "status": "success",
                        "message": "پرداخت با موفقیت تایید شد",
                        "order_id": str(order.id),
                        "advertisement_id": str(order.advertisement.id) if order.advertisement else None,
                        "ref_id": response_data['data'].get('ref_id', ''),
                        "card_pan": response_data['data'].get('card_pan', ''),
                        "card_hash": response_data['data'].get('card_hash', ''),
                        "fee_type": response_data['data'].get('fee_type', ''),
                        "fee": response_data['data'].get('fee', '')
                    }, status=status.HTTP_200_OK)

                except Exception as e:
                    order.payment_status = 'failed'
                    order.save()
                    return Response({
                        "status": "error",
                        "message": f"خطا در پردازش پرداخت: {str(e)}"
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            else:
                # در صورت ناموفق بودن تایید تراکنش، به‌روزرسانی وضعیت پرداخت به 'failed'
                error_code = response_data.get(
                    'data', {}).get('code', 'unknown')
                error_message = response_data.get(
                    'data', {}).get('message', 'خطای نامشخص')
                errors = response_data.get('errors', [])

                order.payment_status = 'failed'
                order.save()
                return Response({
                    "status": "failed",
                    "message": "پرداخت با شکست مواجه شد",
                    "error_code": error_code,
                    "error_message": error_message,
                    "errors": errors
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # در صورت عدم موفقیت در ارتباط با درگاه زرین‌پال
            order.payment_status = 'failed'
            order.save()
            return Response({
                "status": "failed",
                "message": "خطا در ارتباط با درگاه پرداخت",
                "status_code": response.status_code
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
