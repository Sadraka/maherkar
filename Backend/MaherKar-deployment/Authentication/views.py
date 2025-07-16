from django.shortcuts import get_object_or_404  # دریافت شیء از دیتابیس یا پرتاب خطای 404 اگر شیء یافت نشود
from rest_framework.views import APIView, Response  # APIView برای ساخت ویو کلاس‌بیس و Response برای ارسال پاسخ به کلاینت
from rest_framework.permissions import IsAuthenticated  # بررسی احراز هویت کاربران
from rest_framework import status  # استفاده از کدهای وضعیت HTTP (مانند 200, 400, 401, 201 و غیره)

from rest_framework_simplejwt.tokens import RefreshToken  # تولید توکن‌های JWT جهت احراز هویت
from rest_framework.exceptions import ValidationError  # مدیریت و پرتاب خطاهای اعتبارسنجی

from Users.models import User  # ایمپورت مدل کاربر از برنامه Users

from .serializers import (  
    PasswordLoginSerializer,
    UserRegisterOneTimePasswordSerializer,
    UserRegisterValidateOneTimePasswordSerializer,
    UserLoginOneTimePasswordSerializer,
    UserLoginValidateOneTimePasswordSerializer
)  # ایمپورت سریالایزرهای مربوط به ورود و ثبت‌نام

from .models import OneTimePassword, UserRegisterOTP, UserLoginOTP  # ایمپورت مدل‌های OTP و ثبت‌نام کاربر
from kavenegar import KavenegarAPI, APIException, HTTPException  # ایمپورت کتابخانه Kavenegar برای ارسال پیامک (OTP)
from Server.settings import KAVENEGAR_API_KEY  # دریافت کلید API از تنظیمات پروژه



# ----------------------------------------------------------------
# ویو ورود کاربران (LoginAPIView)
# ----------------------------------------------------------------
class LoginAPIView(APIView):
    """
    ویو ورود برای احراز هویت کاربران و بازگرداندن توکن JWT.
    اگر کاربر قبلاً وارد شده باشد، خطای مناسب برگردانده می‌شود.
    """

    def post(self, request):
        """
        متد POST برای مدیریت ورود:
          - ابتدا داده‌های ورودی از طریق PasswordLoginSerializer اعتبارسنجی می‌شوند.
          - اگر کاربر قبلاً احراز هویت شده باشد، پیام خطایی داده می‌شود.
          - در صورت اعتبارسنجی موفق، کاربر بر اساس شماره تلفن واکشی شده و وضعیت active بودن بررسی می‌شود.
          - در نهایت توکن‌های refresh و access تولید شده و به کاربر بازگردانده می‌شود.
        """
        serializer = PasswordLoginSerializer(data=request.data)  # ایجاد نمونه‌ای از سریالایزر ورود با داده‌های درخواست

        if request.user.is_authenticated:  
            # اگر کاربر قبلاً وارد شده باشد، پاسخ خطای مناسبی ارسال می‌شود
            return Response({"message": "شما قبلاً وارد شده‌اید"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if serializer.is_valid():  # اعتبارسنجی داده‌ها توسط سریالایزر
                phone = serializer.validated_data['phone']  # استخراج شماره تلفن
                user = User.objects.get(phone=phone)  # واکشی کاربر بر اساس شماره تلفن

                if not user.is_active:  # بررسی وضعیت فعال بودن کاربر
                    return Response({'error': 'کاربر فعال نیست'}, status=status.HTTP_401_UNAUTHORIZED)
                
                refresh = RefreshToken.for_user(user)  # تولید توکن refresh به کمک کتابخانه simplejwt
                
                # ارسال پاسخ موفقیت‌آمیز به همراه توکن‌های JWT به کاربر
                return Response(
                    {
                        'refresh': str(refresh), 
                        'access': str(refresh.access_token)
                    },
                    status=status.HTTP_200_OK
                )
            else:
                # در صورت بروز خطا در اعتبارسنجی، خطاهای سریالایزر ارسال می‌شوند
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def handle_exception(self, exc):
        """
        متد handle_exception جهت مدیریت استثناهایی که در طول اجرای ویو رخ می‌دهند.
          - در صورت رخداد ValidationError، پیام خطای اختصاصی برگردانده می‌شود.
          - سایر استثناها توسط متد والد مدیریت می‌شوند.
        """
        if isinstance(exc, ValidationError):
            return Response({'error': 'خطای اعتبارسنجی'}, status=status.HTTP_400_BAD_REQUEST)
        return super().handle_exception(exc)


# ----------------------------------------------------------------
# ویو تولید رمز یکبار مصرف ثبت‌نام (UserRegisterOtpAPIView)
# ----------------------------------------------------------------
class UserRegisterOneTimePasswordAPIView(APIView):
    """
    ویو برای تولید رمز یکبار مصرف جهت ثبت‌نام.
    این ویو برای کاربران غیر احراز هویت شده در دسترس است.
    """

    def post(self, request):
        """
        متد POST برای ایجاد OTP:
          - اگر کاربر وارد نشده باشد، سریالایزر مربوط به UserRegisterOneTimePasswordSerializer ایجاد می‌شود.
          - در صورت اعتبارسنجی موفق، متد create سریالایزر برای تولید OTP فراخوانی می‌شود.
          - پس از ایجاد OTP، تلاش می‌شود تا با استفاده از کتابخانه Kavenegar پیامکی حاوی کد ارسال شود.
          - پاسخ موفق با جزئیات OTP (توکن و کد) ارسال می‌شود.
        """
        if not request.user.is_authenticated:  
            serializer = UserRegisterOneTimePasswordSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                otp_data = serializer.create(validated_data=serializer.validated_data)  # تولید OTP

                try:
                    # در اینجا ارسال پیامک OTP به کمک KavenegarAPI انجام می‌شود
                    api = KavenegarAPI(str(KAVENEGAR_API_KEY))
                    params = {
                        'sender': '2000660110',
                        'receptor': str(otp_data['phone']),
                        'message': f'به ماهر کار خوش آمدید لطفا کد ارسال شده را وارد کنید. {otp_data["code"]}'
                    }
                    response = api.sms_send(params)
                    print(response)
                except APIException as e: 
                    print(e)
                except HTTPException as e: 
                    print(e)

                return Response(
                    {
                        'Detail': {
                            'Message': 'Otp created successfully',
                            'token': otp_data['token'], 
                            'code': otp_data['code']
                        }
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response({'Detail': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # اگر کاربر وارد شده باشد، نمی‌توان OTP جدید تولید کرد.
            return Response({'Detail': 'You are already logged in'}, status=status.HTTP_400_BAD_REQUEST)


# ----------------------------------------------------------------
# ویو تایید ثبت‌نام کاربران با OTP (UserRegisterOtpValidateAPIView)
# ----------------------------------------------------------------
class UserRegisterValidateOneTimePasswordAPIView(APIView):
    """
    ویو جهت ثبت‌نام نهایی کاربر با استفاده از تایید OTP.
    کاربر با ارسال کد OTP و همراه با توکن OTP، ثبت‌نام نهایی انجام می‌دهد.
    """

    def post(self, request, token):
        """
        متد POST برای تایید ثبت‌نام:
          - ابتدا بررسی می‌شود که کاربر وارد نشده باشد.
          - OTP مرتبط با توکن دریافتی از URL واکشی می‌شود.
          - در صورتی که رکورد ثبت‌نام مرتبط (via related name registration_otps) وجود داشته باشد،
            سریالایزر UserRegisterSerializer با context شامل otp_token ایجاد می‌شود.
          - در صورت اعتبارسنجی موفق، متد create سریالایزر جهت ایجاد کاربر نهایی فراخوانی شده
            و اطلاعات کاربر به همراه توکن‌های JWT بازگردانده می‌شوند.
        """
        if not request.user.is_authenticated:
            otp = get_object_or_404(OneTimePassword, token=token)
            if otp:
                if otp.registration_otps:  # بررسی وجود ثبت‌نام مرتبط با OTP
                    serializer = UserRegisterValidateOneTimePasswordSerializer(data=request.data, context={'otp_token': otp.token})
                    if serializer.is_valid(raise_exception=True):
                        user_data = serializer.create(
                            validated_data=serializer.validated_data, 
                            token=token
                        )
                        return Response(
                            {
                                'Detail': {
                                    'Message': 'User created successfully',
                                    'User': user_data['user'],
                                    'Token': user_data['tokens'],
                                }
                            },
                            status=status.HTTP_201_CREATED
                        )
                    else:
                        return Response({'Detail': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'Detail': 'Otp register does not exist.'}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({'Detail': 'OTP does not exist'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'Detail': 'You are already authenticated'}, status=status.HTTP_400_BAD_REQUEST)

# ----------------------------------------------------------------
# ویو ورود با OTP برای ارسال پیامک و تولید OTP (UserLoginOneTimePasswordAPIView)
# ----------------------------------------------------------------
class UserLoginOneTimePasswordAPIView(APIView):

    def post(self, request):
        # بررسی می‌کنیم که کاربر قبلاً وارد نشده باشد؛ اگر ورود کرده باشد امکان تولید OTP فراهم نیست.
        if not request.user.is_authenticated:
            # مقداردهی داده‌های ورودی به سریالایزر جهت اعتبارسنجی داده‌های ورودی
            serializer = UserLoginOneTimePasswordSerializer(data=request.data)
            # در صورتی که داده‌ها معتبر باشند، ادامه فرایند تولید OTP انجام می‌شود
            if serializer.is_valid(raise_exception=True):
                # ایجاد و تولید OTP با استفاده از متد create سریالایزر
                otp_data = serializer.create(validated_data=serializer.validated_data)  # تولید OTP

                try:
                    # در اینجا پیامک OTP به کمک KavenegarAPI ارسال می‌شود
                    api = KavenegarAPI(str(KAVENEGAR_API_KEY))
                    params = {
                        'sender': '2000660110',  # شماره فرستنده پیامک
                        'receptor': str(otp_data['phone']),  # شماره گیرنده پیامک که از داده‌های OTP استخراج می‌شود
                        'message': f'به ماهر کار خوش آمدید لطفا کد ارسال شده را وارد کنید. {otp_data["code"]}'  # متن پیامک حاوی کد OTP
                    }
                    # ارسال پیامک و چاپ پاسخ دریافتی جهت دیباگ
                    response = api.sms_send(params)
                    print(response)
                except APIException as e:
                    # در صورت بروز خطای مربوط به KavenegarAPI، خطا چاپ می‌شود
                    print(e)
                except HTTPException as e:
                    # در صورت بروز خطای مربوط به HTTP، خطا چاپ می‌شود
                    print(e)

                # در صورت موفقیت در تولید OTP و ارسال پیامک، پاسخ همراه با توکن و کد OTP برای کاربر ارسال می‌شود
                return Response(
                    {
                        'Detail': {
                            'Message': 'Otp created successfully',
                            'token': otp_data['token'], 
                            'code': otp_data['code']
                        }
                    },
                    status=status.HTTP_201_CREATED  # وضعیت 201 نشان‌دهنده ایجاد موفقیت‌آمیز OTP است
                )
            else:
                # در صورت عدم اعتبارسنجی موفق داده‌های ورودی، خطاهای مربوطه ارسال می‌شود
                return Response({'Detail': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # اگر کاربر از قبل وارد شده باشد، امکان تولید OTP جدید وجود ندارد
            return Response({'Detail': 'You are already logged in'}, status=status.HTTP_400_BAD_REQUEST)



# ----------------------------------------------------------------
# ویو تایید ورود با OTP (UserLoginValidateOneTimePasswordAPIView)
# ----------------------------------------------------------------
class UserLoginValidateOneTimePasswordAPIView(APIView):
    def post(self, request, token):
        # واکشی شیء OTP مرتبط با توکن دریافتی؛ در صورت عدم یافتن، 404 برگردانده می‌شود
        otp = get_object_or_404(OneTimePassword, token=token)

        # دریافت شیء ورود مرتبط (login_otp) از رابطه معکوس OTP؛ فرض شده است تنها یک شیء مرتبط وجود داشته باشد
        login_otp = otp.login_otps.get()
        
        # مقداردهی داده‌های ورودی به سریالایزر جهت اعتبارسنجی کد OTP و ارسال توکن OTP به کانتکست
        serializer = UserLoginValidateOneTimePasswordSerializer(data=request.data, context={'otp_token': token})

        # بررسی می‌کنیم که در حال حاضر کاربر وارد سیستم نشده باشد؛ اگر وارد شده باشد خطا برگردانده می‌شود
        if request.user.is_authenticated:
            # پاسخ مناسب در صورت ورود قبلی کاربر
            return Response({"message": "شما قبلاً وارد شده‌اید"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # در صورت معتبر بودن داده‌های ورودی از طریق سریالایزر، ادامه فرایند تایید انجام می‌شود
            if serializer.is_valid():
                # دریافت کاربر مرتبط از شیء login_otp که در فرایند OTP ذخیره شده است
                user = login_otp.user

                # بررسی فعال بودن حساب کاربری؛ در غیر این صورت پیام خطای مربوطه ارسال می‌شود
                if not user.is_active:
                    return Response({'error': 'کاربر فعال نیست'}, status=status.HTTP_401_UNAUTHORIZED)
                
                # تولید توکن refresh به کمک کتابخانه simplejwt جهت احراز هویت کاربر
                refresh = RefreshToken.for_user(user)
                
                # ارسال پاسخ موفقیت‌آمیز به همراه توکن‌های JWT جهت ورود کاربر
                return Response(
                    {
                        'refresh': str(refresh), 
                        'access': str(refresh.access_token)
                    },
                    status=status.HTTP_200_OK
                )
            else:
                # در صورت بروز خطا در اعتبارسنجی داده‌های ورودی، خطاهای سریالایزر برگردانده می‌شوند
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def handle_exception(self, exc):
        """
        متد handle_exception جهت مدیریت استثناهایی که در طول اجرای ویو رخ می‌دهند.
          - در صورت رخداد ValidationError، پیام خطای اختصاصی ارسال می‌شود.
          - سایر استثناها توسط متد والد مدیریت می‌شوند.
        """
        # اگر استثنای رخ داده از نوع ValidationError باشد، پیام خطای مشخص شده ارسال می‌شود
        if isinstance(exc, ValidationError):
            return Response({'error': 'خطای اعتبارسنجی'}, status=status.HTTP_400_BAD_REQUEST)
        # بقیه خطاها به صورت پیش‌فرض توسط کلاس والد مدیریت می‌شوند
        return super().handle_exception(exc)
