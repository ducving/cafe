import React, { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Field, Input, PageHeader, Select } from '../components/ui';
import { createProduct } from '../../services/productsService';
import { CategoryApi, fetchCategories } from '../../services/categoriesService';
import { useToast } from '../../components/ToastContext';

type ProductForm = { name: string; sku: string; price: string; stock: string; category: string };

export default function AdminProductCreate(): React.ReactElement {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<ProductForm>({ name: '', sku: '', price: '', stock: '', category: '' });
  const [image, setImage] = useState<{ file: File | null; preview: string }>({ file: null, preview: '' });
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState<CategoryApi[]>([]);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0 && !form.category) {
          setForm((p) => ({ ...p, category: data[0].id.toString() }));
        }
      })
      .catch((err) => console.error('Failed to fetch categories:', err));
  }, []);

  // cleanup object URL when replaced/unmount
  useEffect(() => {
    return () => {
      if (image.preview) URL.revokeObjectURL(image.preview);
    };
  }, [image.preview]);

  const setImageFromFile = (file: File | null) => {
    // revoke previous preview URL
    if (image.preview) URL.revokeObjectURL(image.preview);

    if (!file) {
      setImage({ file: null, preview: '' });
      return;
    }

    const preview = URL.createObjectURL(file);
    setImage({ file, preview });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const name = form.name.trim();
    const sku = form.sku.trim();
    const category = form.category.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!name || !sku || !category || !Number.isFinite(price) || !Number.isFinite(stock)) {
      setSaving(false);
      return;
    }

    // Chuyển ảnh sang chuỗi Base64 để lưu vào database
    // Thêm nén ảnh để tránh lỗi "Data too long" nếu cột database bị giới hạn dung lượng
    let finalImageUrl: string | null = null;
    if (image.file) {
      try {
        finalImageUrl = await new Promise((resolve, reject) => {
          const img = new Image();
          img.src = image.preview;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            // Nén xuống thành JPEG với chất lượng 0.7 để giảm dung lượng Base64
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = reject;
        });
      } catch (err) {
        console.error('Lỗi chuyển đổi/nén ảnh:', err);
      }
    }

    try {
      await createProduct({
        category_id: Number(form.category) || 1,
        name,
        description: '',
        short_description: '',
        price,
        sale_price: null,
        sku,
        stock_quantity: stock,
        image: finalImageUrl,
        images: [],
        status: 'active',
        featured: 1,
        sort_order: 1,
      });
      showToast('Thêm sản phẩm thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Tạo sản phẩm thất bại', 'error');
      setSaving(false);
      return;
    }
    navigate('/admin/products');
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Thêm sản phẩm"
          subtitle="Tạo sản phẩm mới và quay lại danh sách."
          right={
            <>
              <Button variant="ghost" type="button" onClick={() => navigate('/admin/products')}>
                Quay lại
              </Button>
              <Button variant="primary" type="submit" form="createProductForm">
                Lưu
              </Button>
            </>
          }
        />
      </div>

      <div className="adminCol12">
        <Card>
          <form id="createProductForm" onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Tên sản phẩm">
                <Input
                  autoFocus
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="VD: Cà phê sữa"
                />
              </Field>
              <Field label="SKU">
                <Input
                  value={form.sku}
                  onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                  placeholder="VD: CF-SUA"
                />
              </Field>
            </div>

            <Field label="Ảnh sản phẩm" hint="JPG/PNG, dùng để hiển thị trong danh sách (demo)">
              <div className="aUploadRow">
                <input
                  ref={fileRef}
                  id={inputId}
                  className="aFileInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFromFile(e.target.files?.[0] || null)}
                />

                <div
                  className={`aUploadBox ${dragOver ? 'isDragOver' : ''}`.trim()}
                  role="button"
                  tabIndex={0}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click();
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0] || null;
                    if (file) setImageFromFile(file);
                  }}
                >
                  {image.preview ? (
                    <div className="aUploadPreview">
                      <img src={image.preview} alt="preview" className="aUploadImg" />
                      <div className="aUploadMeta">
                        <div className="aUploadName">{image.file?.name}</div>
                        <div className="aUploadHint">Bấm để đổi ảnh hoặc kéo/thả ảnh khác</div>
                      </div>
                    </div>
                  ) : (
                    <div className="aUploadEmpty">
                      <div className="aUploadIcon">⬆</div>
                      <div className="aUploadTitle">Kéo & thả ảnh vào đây</div>
                      <div className="aUploadHint">hoặc bấm để tải ảnh lên</div>
                    </div>
                  )}
                </div>

                {image.preview ? (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setImageFromFile(null)}
                    title="Xóa ảnh"
                  >
                    Xóa ảnh
                  </Button>
                ) : null}
              </div>
            </Field>

            <Field label="Danh mục">
              <Select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Giá (đ)">
                <Input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="29000" />
              </Field>
              <Field label="Tồn kho">
                <Input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} placeholder="50" />
              </Field>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
              <Button variant="ghost" type="button" onClick={() => navigate('/admin/products')}>
                Hủy
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

