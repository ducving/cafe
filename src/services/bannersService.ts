const BANNERS_API_URL = '/doan/api/banners.php';

export type BannerApi = {
  id: number;
  title: string;
  image: string;
  link: string;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
};

type ApiListResponse = {
  success: boolean;
  banners: BannerApi[];
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: any;
};

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const message = (data as any)?.message || res.statusText || 'Yêu cầu thất bại';
    throw new Error(message);
  }
  return data as T;
}

export async function fetchBanners(): Promise<BannerApi[]> {
  try {
    const res = await requestJson<any>(BANNERS_API_URL, {
      headers: getAuthHeaders(),
    });
    return res.banners || res.data || [];
  } catch (error) {
    console.error('Fetch banners error:', error);
    return [];
  }
}

export async function createBanner(formData: FormData): Promise<ApiResponse> {
  const token = localStorage.getItem('token');
  const res = await fetch(BANNERS_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error((data as any)?.message || 'Thêm banner thất bại');
  }
  return data as ApiResponse;
}

export async function deleteBanner(id: number): Promise<ApiResponse> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BANNERS_API_URL}?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error((data as any)?.message || 'Xóa banner thất bại');
  }
  return data as ApiResponse;
}
