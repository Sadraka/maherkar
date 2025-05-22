import requests
import json
import time

def test_simple_api():
    """
    تست ساده API کاربران برای بررسی مسیر users/user/ بر اساس مستندات بک‌اند
    """
    base_url = "http://localhost:8000"
    phone_number = "09141242222"
    
    try:
        print("===== تست API ماهرکار =====")
        
        # مرحله 1: درخواست OTP
        otp_url = f"{base_url}/auth/login-otp/"
        otp_data = {"phone": phone_number}
        
        try:
            response = requests.post(otp_url, data=otp_data, timeout=5)
            print(f"درخواست OTP: {response.status_code}")
            
            if response.status_code != 201:
                print(f"خطا: {response.text}")
                return
            
            # استخراج توکن و کد
            result = response.json()
            token = result.get("Detail", {}).get("token")
            otp_code = result.get("Detail", {}).get("code")
            
            print(f"کد OTP: {otp_code}")
        except requests.exceptions.RequestException as e:
            print(f"خطا در اتصال به سرور (مرحله OTP): {str(e)}")
            return
        
        # مرحله 2: تأیید OTP
        try:
            validate_url = f"{base_url}/auth/login-validate-otp/{token}/"
            validate_data = {"code": otp_code}
            
            resp = requests.post(validate_url, data=validate_data, timeout=5)
            print(f"تأیید OTP: {resp.status_code}")
            
            if resp.status_code != 200:
                print(f"خطا: {resp.text}")
                return
            
            # استخراج توکن دسترسی
            auth_data = resp.json()
            access_token = auth_data.get("access")
        except requests.exceptions.RequestException as e:
            print(f"خطا در اتصال به سرور (مرحله تأیید OTP): {str(e)}")
            return
        
        # تنظیم هدر برای درخواست‌های بعدی
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # مرحله 3: تست دریافت اطلاعات کاربر از مسیر users/user/
        try:
            print("\nتست دریافت اطلاعات کاربر از مسیر users/user/")
            users_url = f"{base_url}/users/user/"
            
            # اضافه کردن تاخیر کوتاه
            time.sleep(1)
            
            users_resp = requests.get(users_url, headers=headers, timeout=5)
            print(f"کد وضعیت: {users_resp.status_code}")
            
            if users_resp.status_code == 200:
                try:
                    data = users_resp.json()
                    print(f"پاسخ دریافت شد: {json.dumps(data, ensure_ascii=False)[:500]}")
                except json.JSONDecodeError:
                    print(f"پاسخ غیر JSON دریافت شد: {users_resp.text[:500]}")
            else:
                print(f"خطا: {users_resp.text[:500]}")
        except requests.exceptions.RequestException as e:
            print(f"خطا در اتصال به سرور (مرحله دریافت اطلاعات کاربر): {str(e)}")
        
        print("\n===== پایان تست =====")
    except Exception as e:
        print(f"خطای کلی: {str(e)}")

if __name__ == "__main__":
    test_simple_api()