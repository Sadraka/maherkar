import requests
import json
import time

def test_user_type_registration():
    try:
        # تنظیم اطلاعات کاربر با نوع کارفرما
        timestamp = int(time.time())
        username = f'employer_{timestamp}'
        email = f'employer_{timestamp}@example.com'
        phone = f'09123456{timestamp % 1000:03d}'
        
        print(f"=== تست ثبت‌نام کاربر با نوع کارفرما ===")
        print(f"زمان تست: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"نام کاربری: {username}")
        print(f"ایمیل: {email}")
        print(f"شماره تلفن: {phone}\n")
        
        # مرحله 1: ارسال درخواست کد OTP با اطلاعات کامل و نوع کاربر کارفرما
        register_data = {
            'username': username,
            'email': email,
            'phone': phone,
            'password': 'Test1234',
            'password_conf': 'Test1234',
            'full_name': 'Employer Test',
            'user_type': 'EM',  # کارفرما
            'register_stage': 'request_otp'
        }
        
        print("1. ارسال درخواست OTP با اطلاعات کامل و نوع کاربر کارفرما:")
        print(f"داده ارسالی: {json.dumps(register_data, indent=2, ensure_ascii=False)}\n")
        
        register_response = requests.post(
            'http://localhost:8000/auth/register-otp/',
            json=register_data
        )
        
        print(f"کد وضعیت پاسخ: {register_response.status_code}")
        print(f"پاسخ: {json.dumps(register_response.json() if register_response.status_code < 400 else register_response.text, indent=2, ensure_ascii=False)}\n")
        
        if register_response.status_code in [200, 201]:
            response_data = register_response.json()
            if 'Detail' in response_data and 'token' in response_data['Detail']:
                token = response_data['Detail']['token']
                print(f"توکن دریافت شده: {token}")
                
                # اگر کد OTP در پاسخ موجود باشد
                otp_code = response_data['Detail'].get('code', '123456')
                print(f"کد OTP دریافت شده: {otp_code}\n")
                
                # مرحله 2: تایید کد OTP
                print("2. ارسال درخواست تایید کد OTP:")
                
                validate_data = {'code': str(otp_code)}
                print(f"داده ارسالی: {json.dumps(validate_data, indent=2, ensure_ascii=False)}")
                
                validate_response = requests.post(
                    f'http://localhost:8000/auth/register-otp-validate/{token}/',
                    json=validate_data
                )
                
                print(f"کد وضعیت پاسخ: {validate_response.status_code}")
                
                if validate_response.status_code < 400:
                    validate_json = validate_response.json()
                    print(f"پاسخ: {json.dumps(validate_json, indent=2, ensure_ascii=False)}\n")
                    
                    # بررسی نوع کاربر در پاسخ
                    if 'Detail' in validate_json and 'User' in validate_json['Detail']:
                        user_data = validate_json['Detail']['User']
                        print("3. بررسی اطلاعات کاربر ثبت شده:")
                        print(f"نام کاربری: {user_data.get('username')}")
                        print(f"ایمیل: {user_data.get('email')}")
                        print(f"شماره تلفن: {user_data.get('phone')}")
                        print(f"نوع کاربر: {user_data.get('user_type')} (انتظار: EM)")
                        
                        # تأیید نوع کاربر
                        if user_data.get('user_type') == 'EM':
                            print("\n✅ تست موفق: کاربر با نوع 'کارفرما' (EM) ثبت شده است.")
                        else:
                            print(f"\n❌ تست ناموفق: کاربر با نوع '{user_data.get('user_type')}' ثبت شده است، اما انتظار 'EM' (کارفرما) بود.")
                    else:
                        print("\n❌ خطا: اطلاعات کاربر در پاسخ وجود ندارد.")
                else:
                    print(f"پاسخ خطا: {validate_response.text}\n")
                    print("\n❌ خطا: تایید کد OTP با مشکل مواجه شد.")
            else:
                print("\n❌ خطا: توکن در پاسخ درخواست OTP یافت نشد.")
        else:
            print("\n❌ خطا: درخواست OTP با مشکل مواجه شد.")
    
    except Exception as e:
        print(f"\n❌ خطای پیش‌بینی نشده: {str(e)}")

if __name__ == "__main__":
    test_user_type_registration() 