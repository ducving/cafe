const CATEGORIES_API_URL = '/doan/api/categories.php';

type CategoryStatus = 'active' | 'inactive';

export type CategoryApi = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  status: CategoryStatus;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

type ApiListResponse<T> = {
  success: boolean;
  data: T[];
  count?: number;
  message?: string;
};

type ApiItemResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type ApiCreateCategoryResponse = {
  success: boolean;
  message: string;
  category_id: number;
  category: CategoryApi;
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

export async function fetchCategories(): Promise<CategoryApi[]> {
  const res = await requestJson<ApiListResponse<CategoryApi>>(CATEGORIES_API_URL);
  return res.data || [];
}

export type CreateCategoryPayload = {
  name: string;
  description?: string;
  image?: string | null;
  status?: CategoryStatus;
  sort_order?: number;
};

export async function createCategory(payload: CreateCategoryPayload): Promise<CategoryApi> {
  const body = JSON.stringify({
    name: payload.name,
    description: payload.description ?? '',
    image: payload.image ?? null,
    status: payload.status ?? 'active',
    sort_order: payload.sort_order ?? 1,
  });

  const res = await requestJson<ApiCreateCategoryResponse>(CATEGORIES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body,
  });

  return res.category;
}

export type UpdateCategoryPayload = {
  id: number;
  name?: string;
  description?: string;
  image?: string | null;
  status?: CategoryStatus;
  sort_order?: number;
};

export async function updateCategory(payload: UpdateCategoryPayload): Promise<CategoryApi> {
  const res = await requestJson<ApiItemResponse<CategoryApi>>(CATEGORIES_API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteCategoryApi(id: number): Promise<void> {
  await requestJson<{ success: boolean; message?: string }>(`${CATEGORIES_API_URL}?id=${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });
}

