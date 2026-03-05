import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCategories, CategoryApi } from '../services/categoriesService';
import { fetchProducts, ProductApi } from '../services/productsService';
import { useCart } from '../user/CartContext';
import CategoriesSection from '../components/CategoriesSection';
import { ProductCard } from '../components/ProductCard';

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
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '30px',
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
              <ProductCard
                key={p.id}
                product={p}
                onAdd={(prod) => {
                  addItem(
                    { id: prod.id, name: prod.name, price: Number(prod.sale_price || prod.price), image: prod.image ?? null },
                    1
                  );
                  setAddingId(prod.id);
                  setTimeout(() => setAddingId(null), 1500);
                }}
                isAdding={addingId === p.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
