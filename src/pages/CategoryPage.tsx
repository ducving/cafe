import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCategories, CategoryApi } from '../services/categoriesService';
import { fetchProducts, ProductApi } from '../services/productsService';
import { useCart } from '../user/CartContext';
import CategoriesSection from '../components/CategoriesSection';

export default function CategoryPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [addingId, setAddingId] = useState<number | null>(null);

  const categoryId = id ? parseInt(id) : null;

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => {
        console.error(err);
        setError('Không tải được danh mục');
      });
  }, []);

  useEffect(() => {
    if (categoryId === null) return;

    setLoading(true);
    setError('');
    fetchProducts()
      .then((list) => {
        const filtered = list.filter(
          (p) => p.status === 'active' && p.category_id === categoryId
        );
        setProducts(filtered);
      })
      .catch((err) => {
        console.error(err);
        setError('Không tải được sản phẩm');
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.id === categoryId)?.name || 'Danh mục',
    [categories, categoryId]
  );

  const handleCategoryClick = (catId: number) => {
    navigate(`/category/${catId}`);
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    paddingBottom: '40px',
  };

  const productsSection: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 900,
    marginBottom: '20px',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const grid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px',
  };

  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  };

  const imageContainer: React.CSSProperties = {
    width: '100%',
    height: '200px',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  };

  const nameStyle: React.CSSProperties = {
    fontWeight: 700,
    color: '#111827',
    fontSize: '17px',
    lineHeight: 1.4,
    height: '2.8em',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  };

  const priceContainer: React.CSSProperties = {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const priceStyle: React.CSSProperties = {
    fontWeight: 900,
    color: '#dc2626',
    fontSize: '20px',
  };

  const btnStyle: React.CSSProperties = {
    marginTop: '12px',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: '#dc2626',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const backBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  };

  return (
    <div style={containerStyle}>
      <CategoriesSection categories={categories} onCategoryClick={handleCategoryClick} />

      <div style={productsSection}>
        <div style={sectionTitle}>
          <button onClick={() => navigate(-1)} style={backBtn}>
            ←
          </button>
          <span>{selectedCategoryName}</span>
        </div>

        {error && (
          <div style={{ color: '#b91c1c', marginBottom: '20px', padding: '16px', backgroundColor: '#fee2e2', borderRadius: '12px', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>☕</div>
            Đang tải sản phẩm...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6b7280', backgroundColor: '#fff', borderRadius: '16px', border: '1px dashed #d1d5db' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
            Chưa có sản phẩm trong danh mục này.
          </div>
        ) : (
          <div style={grid}>
            {products.map((p) => (
              <div
                key={p.id}
                style={card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <div style={imageContainer}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} style={imageStyle} />
                  ) : (
                    <div style={{ ...imageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '40px' }}>
                      📦
                    </div>
                  )}
                </div>
                <div style={nameStyle}>{p.name}</div>
                <div style={priceContainer}>
                  <div style={priceStyle}>
                    {new Intl.NumberFormat('vi-VN').format(Number(p.sale_price || p.price))}đ
                  </div>
                  {p.sale_price && Number(p.sale_price) < Number(p.price) && (
                    <div style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>
                      {new Intl.NumberFormat('vi-VN').format(Number(p.price))}đ
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  style={{
                    ...btnStyle,
                    backgroundColor: addingId === p.id ? '#10b981' : '#111827',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(
                      { id: p.id, name: p.name, price: Number(p.sale_price || p.price), image: p.image ?? null },
                      1
                    );
                    setAddingId(p.id);
                    setTimeout(() => setAddingId(null), 1500);
                  }}
                >
                  {addingId === p.id ? '✓ Đã thêm' : 'Thêm vào giỏ'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
