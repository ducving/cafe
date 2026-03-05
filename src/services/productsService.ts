import API_BASE_URL from './config';
const PRODUCTS_API_URL = `${API_BASE_URL}/products.php`;

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export type ProductApi = {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  price: number | string;
  sale_price?: number | string | null;
  sku?: string | null;
  stock_quantity?: number;
  image?: string | null;
  images?: string[] | null;
  status: ProductStatus;
  featured?: number | boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  // optional denormalized fields from joined queries
  category_name?: string;
  category_slug?: string;
};

type ApiListResponse<T> = {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

type ApiCreateProductResponse = {
  success: boolean;
  message: string;
  product_id: number;
  product: ProductApi;
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

export async function fetchProducts(): Promise<ProductApi[]> {
  const res = await requestJson<ApiListResponse<ProductApi>>(PRODUCTS_API_URL);
  const rawList = res.data || (res as any).products || [];
  return rawList.map((p: any) => ({
    ...p,
    name: p.name || p.tieu_de || 'Sản phẩm',
    image: p.image || p.minh_hoa || null,
    price: p.price || p.gia_moi || 0,
    sale_price: p.sale_price || p.gia_cu || null,
  }));
}

export type CreateProductPayload = {
  category_id: number;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number | null;
  sku?: string;
  stock_quantity?: number;
  image?: string | null;
  images?: string[] | null;
  status?: ProductStatus;
  featured?: 0 | 1 | boolean;
  sort_order?: number;
};

export async function createProduct(payload: CreateProductPayload): Promise<ProductApi> {
  const body = JSON.stringify({
    ...payload,
    status: payload.status ?? 'active',
    featured: payload.featured ?? 1,
    images: payload.images ?? [],
  });

  const res = await requestJson<ApiCreateProductResponse>(PRODUCTS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body,
  });

  return res.product;
}

export async function deleteProductApi(id: number): Promise<void> {
  await requestJson<{ success: boolean; message?: string }>(`${PRODUCTS_API_URL}?id=${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });
}

export async function fetchProductDetail(id: number): Promise<ProductApi> {
  // Try fetching single product. If backend doesn't support ?id=X, this might fail or return list.
  // Assuming standard RESTful:
  const res = await requestJson<{ success: boolean; data: ProductApi } | { success: boolean; product: ProductApi }>(`${PRODUCTS_API_URL}?id=${id}`);
  const data = 'product' in res ? res.product : res.data;
  return {
    ...data,
    name: data.name || (data as any).tieu_de || 'Sản phẩm',
    image: data.image || (data as any).minh_hoa || null,
    price: data.price || (data as any).gia_moi || 0,
    sale_price: data.sale_price || (data as any).gia_cu || null,
  };
}

export async function updateProductApi(id: number, payload: Partial<CreateProductPayload>): Promise<ProductApi> {
  const body = JSON.stringify({
    id,
    ...payload,
    status: payload.status ?? 'active',
  });

  const res = await requestJson<{ success: boolean; message: string; product: ProductApi }>(`${PRODUCTS_API_URL}?id=${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body,
  });

  return res.product;
}

