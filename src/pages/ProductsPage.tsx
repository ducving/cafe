import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchCategories, CategoryApi } from '../services/categoriesService';
import { fetchProducts, ProductApi } from '../services/productsService';
import { useCart } from '../user/CartContext';
import { ProductCard } from '../components/ProductCard';

const GOLD = '#c8a96e';
const BG = '#3a2415';

type SortType = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function ProductsPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | null>(id ? Number(id) : null);
  const [priceFilters, setPriceFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortType>('default');
  const [expandedCats, setExpandedCats] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    if (id) {
      setSelectedCategory(Number(id));
    } else {
      setSelectedCategory(null);
    }
    setCurrentPage(1);
  }, [id]);

  useEffect(() => {
    fetchCategories()
      .then((list) => setCategories(list))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((list) => setProducts(list.filter((p) => p.status === 'active')))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (p: ProductApi) => {
    addItem({ id: p.id, name: p.name, price: Number(p.sale_price || p.price), image: p.image ?? null }, 1);
    setAddingId(p.id);
    setTimeout(() => setAddingId(null), 1500);
  };

  // Filter & Sort
  let filtered = selectedCategory
    ? products.filter((p) => (p as any).category_id === selectedCategory)
    : products;

  if (priceFilters.length > 0) {
    filtered = filtered.filter((p) => {
      const price = Number(p.sale_price || p.price);
      return priceFilters.some((val) => {
        const [min, max] = val.split('-').map(Number);
        return price >= min && price <= max;
      });
    });
  }

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => Number(a.sale_price || a.price) - Number(b.sale_price || b.price));
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => Number(b.sale_price || b.price) - Number(a.sale_price || a.price));
  if (sortBy === 'name-asc') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === 'name-desc') filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filtered.slice(startIndex, startIndex + pageSize);

  const toggleCat = (id: number) => setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ backgroundColor: '#f5f0ea', minHeight: '100vh' }}>

      {/* ===== BREADCRUMB ===== */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', fontSize: '13px', color: '#6b7280' }}>
          <Link to="/" style={{ color: GOLD, textDecoration: 'none' }}>Trang chủ</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#1a0f00' }}>Sản phẩm nổi bật</span>
        </div>
      </div>

      {/* ===== TITLE ===== */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1a0f00', margin: '0 0 20px', letterSpacing: '1px' }}>
          SẢN PHẨM NỔI BẬT
        </h1>
      </div>

      {/* ===== MAIN CONTENT: SIDEBAR + PRODUCTS ===== */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>

        {/* ===== LEFT SIDEBAR ===== */}
        <aside>
          {/* DANH MỤC */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1a0f00', margin: '0 0 16px', letterSpacing: '0.5px' }}>DANH MỤC</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {/* "Tất cả" */}
              <button
                type="button"
                onClick={() => navigate('/products')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6',
                  color: selectedCategory === null ? GOLD : '#374151', fontSize: '14px',
                  fontWeight: selectedCategory === null ? 700 : 400, cursor: 'pointer', textAlign: 'left',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = GOLD; }}
                onMouseLeave={(e) => { if (selectedCategory !== null) e.currentTarget.style.color = '#374151'; }}
              >
                Tất cả sản phẩm
              </button>
              {categories.map((cat) => (
                <div key={cat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedCategory === cat.id) {
                        navigate('/products');
                      } else {
                        navigate(`/category/${cat.id}`);
                      }
                      toggleCat(cat.id);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '10px 0', background: 'none', border: 'none',
                      borderBottom: '1px solid #f3f4f6',
                      color: selectedCategory === cat.id ? GOLD : '#374151', fontSize: '14px',
                      fontWeight: selectedCategory === cat.id ? 700 : 400, cursor: 'pointer', textAlign: 'left',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = GOLD; }}
                    onMouseLeave={(e) => { if (selectedCategory !== cat.id) e.currentTarget.style.color = '#374151'; }}
                  >
                    <span>{cat.name}</span>
                    <span style={{ fontSize: '10px', transition: 'transform 0.2s', display: 'inline-block', transform: expandedCats[cat.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BỘ LỌC */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1a0f00', margin: '0 0 16px' }}>BỘ LỌC</h3>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: '0 0 10px' }}>Giá sản phẩm</h4>
            {[
              { label: 'Giá dưới 100.000đ', value: '0-100000' },
              { label: '100.000đ - 200.000đ', value: '100000-200000' },
              { label: '200.000đ - 300.000đ', value: '200000-300000' },
              { label: '300.000đ - 500.000đ', value: '300000-500000' },
            ].map((item) => (
              <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', fontSize: '13px', color: '#6b7280', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  style={{ accentColor: GOLD }}
                  checked={priceFilters.includes(item.value)}
                  onChange={(e) => {
                    if (e.target.checked) setPriceFilters((prev) => [...prev, item.value]);
                    else setPriceFilters((prev) => prev.filter((v) => v !== item.value));
                    setCurrentPage(1);
                  }}
                />
                {item.label}
              </label>
            ))}
          </div>

          {/* SẢN PHẨM HOT */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1a0f00', margin: '0 0 16px' }}>SẢN PHẨM HOT</h3>
            {products.slice(0, 3).map((p) => (
              <div key={p.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f9f6f1' }}>
                  {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☕</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a0f00', lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#c0392b', marginTop: '2px' }}>
                    {new Intl.NumberFormat('vi-VN').format(Number(p.sale_price || p.price))}₫
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ===== RIGHT: PRODUCTS GRID ===== */}
        <div>
          {/* Sort bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '16px', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortType);
                setCurrentPage(1);
              }}
              style={{
                padding: '7px 12px', borderRadius: '4px', border: '1px solid #d1d5db',
                fontSize: '13px', color: '#374151', backgroundColor: '#fff', cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="default">Thứ tự</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="name-asc">Tên A → Z</option>
              <option value="name-desc">Tên Z → A</option>
            </select>
          </div>

          {/* Products */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: GOLD }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>☕</div>
              Đang tải sản phẩm...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', backgroundColor: '#fff', borderRadius: '8px' }}>
              Không tìm thấy sản phẩm nào trong danh mục này.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {paginatedProducts.map((p) => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onAdd={() => handleAdd(p)} 
                  isAdding={addingId === p.id} 
                />
              ))}
            </div>
          )}

          {/* Pagination UI */}
          {!loading && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db',
                  backgroundColor: '#fff', color: currentPage === 1 ? '#9ca3af' : '#374151',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                ‹
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '4px', border: '1px solid',
                    borderColor: currentPage === i + 1 ? GOLD : '#d1d5db',
                    backgroundColor: currentPage === i + 1 ? GOLD : '#fff',
                    color: currentPage === i + 1 ? '#fff' : '#374151',
                    fontWeight: currentPage === i + 1 ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px',
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db',
                  backgroundColor: '#fff', color: currentPage === totalPages ? '#9ca3af' : '#374151',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '14px',
                  transition: 'all 0.2s',
                }}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
