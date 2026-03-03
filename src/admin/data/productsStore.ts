const STORAGE_KEY = 'admin_products_v1';

export type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  image?: string; // base64 data URL for demo/localStorage
};

const seed: Product[] = [
  { id: 101, name: 'Cà phê sữa', sku: 'CF-SUA', price: 29000, stock: 50, category: 'Cà phê' },
  { id: 102, name: 'Trà đào', sku: 'TRA-DAO', price: 35000, stock: 18, category: 'Trà' },
  { id: 103, name: 'Bánh croissant', sku: 'BANH-CRO', price: 25000, stock: 24, category: 'Bánh' },
];

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getProducts(): Product[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : null;
  if (Array.isArray(parsed)) return parsed as Product[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, 'id'>): Product[] {
  const products = getProducts();
  const next: Product[] = [{ ...product, id: Date.now() }, ...products];
  saveProducts(next);
  return next;
}

export function deleteProduct(id: number): Product[] {
  const products = getProducts();
  const next = products.filter((p) => p.id !== id);
  saveProducts(next);
  return next;
}

