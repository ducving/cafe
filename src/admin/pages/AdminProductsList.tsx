import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, Input, Modal, PageHeader, Toolbar } from '../components/ui';
import { deleteProductApi, fetchProducts, ProductApi } from '../../services/productsService';

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

export default function AdminProductsList(): React.ReactElement {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [query, setQuery] = useState<string>('');
  const [confirm, setConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.sku, (p as any).category ?? (p as any).category_name]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    );
  }, [products, query]);

  React.useEffect(() => {
    fetchProducts()
      .then((list) => setProducts(list))
      .catch((err: any) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Sản phẩm"
          subtitle="Danh sách sản phẩm và tồn kho."
          right={
            <>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên / SKU / danh mục..." style={{ minWidth: 320 }} />
              <Button variant="primary" type="button" onClick={() => navigate('/admin/products/new')}>
                Thêm sản phẩm
              </Button>
            </>
          }
        />
      </div>

      <div className="adminCol12">
        <Card>
          <Toolbar left={<div style={{ fontWeight: 950, color: '#0f172a' }}>Danh sách</div>} right={<div style={{ color: '#64748b', fontWeight: 800 }}>{filtered.length} mục</div>} />

          {filtered.length === 0 ? (
            <EmptyState
              title="Chưa có sản phẩm"
              subtitle="Tạo sản phẩm đầu tiên để bắt đầu bán hàng."
              action={
                <Button variant="primary" type="button" onClick={() => navigate('/admin/products/new')}>
                  Tạo sản phẩm
                </Button>
              }
            />
          ) : (
            <table className="aTable">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Ảnh</th>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="aThumb" />
                      ) : (
                        <div className="aThumbPlaceholder" />
                      )}
                    </td>
                    <td style={{ fontWeight: 950 }}>{p.name}</td>
                    <td style={{ color: '#64748b' }}>{p.sku || ''}</td>
                    <td style={{ color: '#64748b' }}>{p.category_name || ''}</td>
                    <td style={{ fontWeight: 950 }}>{formatVnd(Number(p.price))}</td>
                    <td style={{ color: '#64748b' }}>{p.stock_quantity ?? ''}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="aRowActions">
                        <button className="aIconBtn" type="button" title="Sửa" onClick={() => navigate(`/admin/products/edit/${p.id}`)}>
                          ✎
                        </button>
                        <button className="aIconBtn danger" type="button" title="Xóa" onClick={() => setConfirm({ open: true, id: p.id })}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Modal
        open={confirm.open}
        title="Xóa sản phẩm?"
        onClose={() => setConfirm({ open: false, id: null })}
        footer={
          <>
            <Button variant="ghost" type="button" onClick={() => setConfirm({ open: false, id: null })}>
              Hủy
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={() => {
                const id = confirm.id;
                if (id == null) return;
                deleteProductApi(id)
                  .then(() => {
                    setProducts((prev) => prev.filter((p) => p.id !== id));
                    setConfirm({ open: false, id: null });
                  })
                  .catch((err: any) => {
                    alert(err.message || 'Xóa sản phẩm thất bại');
                  });
              }}
            >
              Xóa
            </Button>
          </>
        }
      >
        Hành động này không thể hoàn tác.
      </Modal>
    </div>
  );
}

