// تایپ‌های داده
export interface Industry {
  id: number;
  name: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface Province {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
  province?: {
    id: number;
    name: string;
  };
}

export interface InitialData {
  industries: Industry[];
  provinces: Province[];
  cities: City[];
}

// تابع برای دریافت داده‌های اولیه
export async function getInitialData(): Promise<InitialData> {
  try {
    // دریافت داده‌های عمومی (بدون نیاز به authentication)
    const [provincesResponse, citiesResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/provinces/`, { 
        next: { revalidate: 3600 } // کش کردن برای 1 ساعت
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/cities/`, { 
        next: { revalidate: 3600 } // کش کردن برای 1 ساعت
      })
    ]);

    const provinces = await provincesResponse.json();
    const cities = await citiesResponse.json();

    // تلاش برای دریافت صنایع از endpoint اصلی
    let industries: Industry[] = [];
    try {
      const industriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/industries/industries/`, { 
        next: { revalidate: 3600 } // کش کردن برای 1 ساعت
      });
      if (industriesResponse.ok) {
        industries = await industriesResponse.json();
      }
    } catch (error) {
      console.log('API صنایع در دسترس نیست، استفاده از آرایه خالی');
    }

    return {
      industries: industries || [],
      provinces: provinces || [],
      cities: cities || []
    };
  } catch (error) {
    console.error('خطا در دریافت داده‌های اولیه:', error);
    
    return {
      industries: [],
      provinces: [],
      cities: []
    };
  }
} 