import requests
import json
import time

def test_otp_validation():
    try:
        # مرحله 1: ارسال اطلاعات کامل برای دریافت کد OTP - کاربر اول
        print("مرحله 1: ارسال اطلاعات کامل برای دریافت کد OTP - کاربر اول")
        timestamp = int(time.time())
        username = 'testuser_' + str(timestamp)
        email = f'test_{timestamp}@example.com'
        
        register_data = {
            'username': username,
            'email': email,
            'phone': '09123456789',
            'password': 'Test1234',
            'password_conf': 'Test1234',
            'full_name': 'Test User',
            'user_type': 'JS',
            'register_stage': 'request_otp'
        }
        
        register_response = requests.post(
            'http://localhost:8000/auth/register-otp/',
            json=register_data
        )
        print(f'Register Status Code: {register_response.status_code}')
        print(f'Register Response: {register_response.text}')
        
        # کد 201 به معنای موفقیت در ایجاد منبع جدید است
        if register_response.status_code in [200, 201]:
            response_data = register_response.json()
            if 'Detail' in response_data and 'token' in response_data['Detail']:
                token1 = response_data['Detail']['token']
                print(f"توکن کاربر اول: {token1}")
                
                # اگر کد OTP در پاسخ ارسال شده باشد
                otp_code1 = response_data['Detail'].get('code', '123456')  # مقدار پیش‌فرض در صورت عدم ارسال کد
                print(f"کد OTP کاربر اول: {otp_code1}")
                
                print("\n------\n")
                
                # مرحله 2: تایید کد OTP با توکن معتبر - کاربر اول
                print("مرحله 2: تایید کد OTP با توکن معتبر - کاربر اول")
                validate_response = requests.post(
                    f'http://localhost:8000/auth/register-otp-validate/{token1}/',
                    json={'code': str(otp_code1)}  # تبدیل به رشته برای اطمینان
                )
                print(f'Validate Status Code: {validate_response.status_code}')
                print(f'Validate Response: {validate_response.text}')
                
                print("\n------\n")
                
                # مرحله 3: ارسال درخواست ثبت‌نام برای کاربر دوم با نام کاربری تکراری
                print("مرحله 3: ارسال درخواست ثبت‌نام برای کاربر دوم با نام کاربری تکراری")
                register_data2 = {
                    'username': username,  # نام کاربری تکراری
                    'email': f'different_{int(time.time())}@example.com',  # ایمیل متفاوت
                    'phone': '09123456780',  # شماره تلفن متفاوت
                    'password': 'Test5678',
                    'password_conf': 'Test5678',
                    'full_name': 'Test User 2',
                    'user_type': 'JS',
                    'register_stage': 'request_otp'
                }
                
                register_response2 = requests.post(
                    'http://localhost:8000/auth/register-otp/',
                    json=register_data2
                )
                print(f'Register Status Code (User 2): {register_response2.status_code}')
                print(f'Register Response (User 2): {register_response2.text}')
                
                if register_response2.status_code in [200, 201]:
                    response_data2 = register_response2.json()
                    if 'Detail' in response_data2 and 'token' in response_data2['Detail']:
                        token2 = response_data2['Detail']['token']
                        print(f"توکن کاربر دوم (نام کاربری تکراری): {token2}")
                        
                        otp_code2 = response_data2['Detail'].get('code', '123456')
                        print(f"کد OTP کاربر دوم: {otp_code2}")
                        
                        print("\n------\n")
                        
                        # تایید کد OTP برای کاربر دوم با نام کاربری تکراری
                        print("تایید کد OTP برای کاربر دوم با نام کاربری تکراری")
                        validate_response2 = requests.post(
                            f'http://localhost:8000/auth/register-otp-validate/{token2}/',
                            json={'code': str(otp_code2)}
                        )
                        print(f'Validate Status Code (User 2): {validate_response2.status_code}')
                        print(f'Validate Response (User 2): {validate_response2.text}')
                
                print("\n------\n")
                
                # مرحله 4: ارسال درخواست ثبت‌نام برای کاربر سوم با ایمیل تکراری
                print("مرحله 4: ارسال درخواست ثبت‌نام برای کاربر سوم با ایمیل تکراری")
                register_data3 = {
                    'username': f'different_user_{int(time.time())}',  # نام کاربری متفاوت
                    'email': email,  # ایمیل تکراری
                    'phone': '09123456781',  # شماره تلفن متفاوت
                    'password': 'Test9012',
                    'password_conf': 'Test9012',
                    'full_name': 'Test User 3',
                    'user_type': 'JS',
                    'register_stage': 'request_otp'
                }
                
                register_response3 = requests.post(
                    'http://localhost:8000/auth/register-otp/',
                    json=register_data3
                )
                print(f'Register Status Code (User 3): {register_response3.status_code}')
                print(f'Register Response (User 3): {register_response3.text}')
                
                if register_response3.status_code in [200, 201]:
                    response_data3 = register_response3.json()
                    if 'Detail' in response_data3 and 'token' in response_data3['Detail']:
                        token3 = response_data3['Detail']['token']
                        print(f"توکن کاربر سوم (ایمیل تکراری): {token3}")
                        
                        otp_code3 = response_data3['Detail'].get('code', '123456')
                        print(f"کد OTP کاربر سوم: {otp_code3}")
                        
                        print("\n------\n")
                        
                        # تایید کد OTP برای کاربر سوم با ایمیل تکراری
                        print("تایید کد OTP برای کاربر سوم با ایمیل تکراری")
                        validate_response3 = requests.post(
                            f'http://localhost:8000/auth/register-otp-validate/{token3}/',
                            json={'code': str(otp_code3)}
                        )
                        print(f'Validate Status Code (User 3): {validate_response3.status_code}')
                        print(f'Validate Response (User 3): {validate_response3.text}')
            else:
                print("توکن در پاسخ یافت نشد")
        else:
            print("خطا در ارسال درخواست ثبت‌نام")
        
    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    test_otp_validation() 