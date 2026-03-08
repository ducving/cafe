import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, Input, Modal, PageHeader, Toolbar } from '../components/ui';
import { deleteProductApi, fetchProducts, ProductApi } from '../../services/productsService';
import { useToast } from '../../components/ToastContext';
import { exportToExcel, importFromExcel, exportProductsWithDropdown } from '../utils/ExcelUtils';
import { createProduct } from '../../services/productsService';
import { Download, Upload, Plus, Edit, Trash2, Search } from 'lucide-react';
import { fetchCategories } from '../../services/categoriesService';

function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

export default function AdminProductsList(): React.ReactElement {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [products, setProducts] = useState<ProductApi[]>([]);
  const [query, setQuery] = useState<string>('');
  const [confirm, setConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Pagination
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.sku, (p as any).category ?? (p as any).category_name]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q))
    );
  }, [products, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filter changes
  const prevQuery = React.useRef(query);
  if (prevQuery.current !== query) {
    prevQuery.current = query;
    if (page !== 1) setPage(1);
  }

  React.useEffect(() => {
    fetchProducts()
      .then((list) => setProducts(list))
      .catch((err: any) => {
        console.error(err);
      });
  }, []);

  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      const categories = await fetchCategories();
      const catNames = categories.map((c: any) => c.name);

      const dataToExport = products.map(p => ({
        'ID': p.id,
        'Tên sản phẩm': p.name,
        'SKU': p.sku,
        'Danh mục': p.category_name,
        'Giá': p.price,
        'Giá khuyến mãi': (p as any).sale_price || '',
        'Số lượng tồn': p.stock_quantity,
        'Mô tả': (p as any).description || ''
      }));

      await exportProductsWithDropdown(dataToExport, catNames, 'Danh_sach_San_pham');
      showToast('Xuất Excel thành công (có hỗ trợ chọn danh mục)', 'success');
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi xuất file', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);
      if (!Array.isArray(data) || data.length === 0) {
        showToast('File Excel không có dữ liệu', 'error');
        return;
      }

      setLoading(true);
      
      // Lấy danh sách danh mục hiện có để map ID
      const categories = await fetchCategories();
      const firstCatId = categories.length > 0 ? categories[0].id : null;

      if (!firstCatId) {
        showToast('Bạn cần tạo ít nhất một danh mục trước khi nhập sản phẩm', 'error');
        setLoading(false);
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const row of data) {
        const name = row['Tên sản phẩm'] || row['name'] || row['Name'];
        const price = row['Giá'] || row['price'] || row['Price'] || 0;
        const sku = row['SKU'] || row['sku'];
        
        // Tìm category_id: ưu tiên cột ID, sau đó tới map tên danh mục
        let category_id = Number(row['category_id'] || row['Category ID']);
        if (isNaN(category_id) || category_id <= 0) {
          const catName = row['Danh mục'] || row['category_name'] || row['Category'];
          if (catName) {
            const found = categories.find((c: any) => 
              c.name.toLowerCase() === String(catName).toLowerCase()
            );
            category_id = found ? found.id : firstCatId;
          } else {
            category_id = firstCatId;
          }
        }

        if (name) {
          try {
            await createProduct({
              name,
              price: Number(price),
              sku: sku || '',
              category_id: category_id,
              status: 'active',
              stock_quantity: Number(row['Số lượng tồn'] || row['stock'] || 0)
            } as any);
            successCount++;
          } catch (err) {
            failCount++;
          }
        }
      }

      // Refresh
      const updatedList = await fetchProducts();
      setProducts(updatedList);
      showToast(`Nhập thành công: ${successCount}. Thất bại: ${failCount}`, 'success');
    } catch (err) {
      showToast('Lỗi khi xử lý file', 'error');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Sản phẩm"
          subtitle="Danh sách sản phẩm và tồn kho."
          right={
            <>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} style={{ position: 'absolute', left: 12, color: '#94a3b8' }} />
                <Input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Tìm theo tên / SKU / danh mục..." 
                  style={{ minWidth: 280, paddingLeft: 38 }} 
                />
              </div>
              <Button variant="ghost" type="button" onClick={handleExport} icon={<Download size={18} />}>
                Xuất Excel
              </Button>
              <Button 
                variant="ghost" 
                type="button" 
                onClick={() => document.getElementById('excel-import-prod')?.click()} 
                icon={<Upload size={18} />}
                disabled={loading}
              >
                Nhập Excel
                <input id="excel-import-prod" type="file" accept=".xlsx, .xls" hidden onChange={handleImport} />
              </Button>
              <Button variant="primary" type="button" onClick={() => navigate('/admin/products/new')} icon={<Plus size={18} />}>
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
                {pagedItems.map((p) => (
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
                          <Edit size={16} />
                        </button>
                        <button className="aIconBtn danger" type="button" title="Xóa" onClick={() => setConfirm({ open: true, id: p.id })}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
            }}>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Trước
              </Button>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                Trang <span style={{ color: '#c8a96e' }}>{page}</span> / {totalPages}
              </div>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
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
                    showToast('Xóa sản phẩm thành công', 'success');
                  })
                  .catch((err: any) => {
                    showToast(err.message || 'Xóa sản phẩm thất bại', 'error');
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

