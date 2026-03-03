import API_BASE_URL from './config';
export const NEWS_API_URL = `${API_BASE_URL}/news.php`;

export type NewsStatus = 'active' | 'inactive';

export type NewsApi = {
  id: number;
  title: string;
  content: string;
  image?: string | null;
  status: NewsStatus;
  created_at?: string;
  updated_at?: string;
};

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Bạn chưa đăng nhập hoặc token đã hết hạn');
  return {
    Authorization: `Bearer ${token}`,
  };
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

// 1. Lấy danh sách tin tức (all=1 để lấy cả inactive nếu là admin)
export async function fetchNewsAll(): Promise<NewsApi[]> {
  const res = await requestJson<{ success: boolean; news: NewsApi[] }>(
    `${NEWS_API_URL}?all=1`,
    {
      headers: getAuthHeaders(), // requires admin token to get all
    }
  );
  return res.news || [];
}

// Lấy danh sách tin tức cho public (chỉ active)
export async function fetchNewsActive(): Promise<NewsApi[]> {
  const res = await requestJson<{ success: boolean; news: NewsApi[] }>(
    `${NEWS_API_URL}?status=active`
  );
  return res.news || [];
}

// 2. Lấy chi tiết một tin tức cụ thể
export async function fetchNewsDetail(id: number): Promise<NewsApi> {
  const res = await requestJson<{ success: boolean; data: NewsApi }>(
    `${NEWS_API_URL}?id=${id}`
  );
  return res.data;
}

// 3. Thêm mới tin tức (yêu cầu Admin, truyền bằng FormData để upload ảnh)
export async function createNewsApi(payload: { title: string; content: string; status: NewsStatus; image?: File | null }): Promise<NewsApi> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('content', payload.content);
  formData.append('status', payload.status);
  if (payload.image) {
    formData.append('image', payload.image);
  }

  const res = await requestJson<{ success: boolean; message: string; news_id: number; news: NewsApi }>(
    NEWS_API_URL,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData, // fetch tự set Content-Type: multipart/form-data
    }
  );
  return res.news;
}

// 4. Cập nhật tin tức (yêu cầu Admin, gửi bằng JSON như demo Postman)
export async function updateNewsApi(payload: { id: number; title: string; content: string; status: NewsStatus }): Promise<NewsApi> {
  const body = JSON.stringify(payload);

  const res = await requestJson<{ success: boolean; message: string; news: NewsApi }>(
    NEWS_API_URL,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body,
    }
  );
  return res.news;
}

// 5. Xóa tin tức (yêu cầu Admin)
export async function deleteNewsApi(id: number): Promise<void> {
  await requestJson<{ success: boolean; message: string }>(
    `${NEWS_API_URL}?id=${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );
}
