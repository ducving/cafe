import React, { useEffect, useId, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Field, Input, PageHeader, Select } from '../components/ui';
import { updateProductApi, fetchProductDetail } from '../../services/productsService';
import { CategoryApi, fetchCategories } from '../../services/categoriesService';
import { useToast } from '../../components/ToastContext';

type ProductForm = { name: string; sku: string; price: string; stock: string; category: string };

export default function AdminProductEdit(): React.ReactElement {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);
  
  const [form, setForm] = useState<ProductForm>({ name: '', sku: '', price: '', stock: '', category: '' });
  const [image, setImage] = useState<{ file: File | null; preview: string; keepOld: boolean }>({ file: null, preview: '', keepOld: true });
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      id ? fetchProductDetail(Number(id)) : Promise.reject('No ID provided')
    ])
      .then(([cats, product]) => {
        setCategories(cats);
        setForm({
          name: product.name,
          sku: product.sku || '',
          price: product.price?.toString() || '0',
          stock: product.stock_quantity?.toString() || '0',
          category: product.category_id?.toString() || (cats.length > 0 ? cats[0].id.toString() : ''),
        });
        if (product.image) {
          setImage({ file: null, preview: product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/doan/${product.image}`, keepOld: true });
        }
      })
      .catch((err) => {
        console.error('Failed to load edit data:', err);
        showToast('Không thể tải dữ liệu sản phẩm!', 'error');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // cleanup object URL when replaced/unmount 
  // (only revoke if it's a blob url from File, not a server URL)
  useEffect(() => {
    return () => {
      if (image.preview && image.preview.startsWith('blob:')) {
        URL.revokeObjectURL(image.preview);
      }
    };
  }, [image.preview]);

  const setImageFromFile = (file: File | null) => {
    if (image.preview && image.preview.startsWith('blob:')) {
      URL.revokeObjectURL(image.preview);
    }
    if (!file) {
      setImage({ file: null, preview: '', keepOld: false });
      return;
    }
    const preview = URL.createObjectURL(file);
    setImage({ file, preview, keepOld: false });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    const name = form.name.trim();
    const sku = form.sku.trim();
    const category = form.category.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!name || !category || !Number.isFinite(price) || !Number.isFinite(stock)) {
      setSaving(false);
      return;
    }

    let finalImageUrl: string | null | undefined = undefined; // undefined means don't update
    
    if (!image.keepOld) {
      if (!image.file) {
        finalImageUrl = null; // deleted image
      } else {
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
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
              } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = reject;
          });
        } catch (err) {
          console.error('Lỗi chuyển đổi/nén ảnh:', err);
        }
      }
    }

    try {
      await updateProductApi(Number(id), {
        category_id: Number(form.category) || 1,
        name,
        price,
        sku,
        stock_quantity: stock,
        ...(finalImageUrl !== undefined ? { image: finalImageUrl } : {}),
      });
      showToast('Cập nhật sản phẩm thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Sửa sản phẩm thất bại!', 'error');
      setSaving(false);
      return;
    }
    navigate('/admin/products');
  };

  if (loading) return <div style={{ padding: '40px' }}>Đang tải...</div>;

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Sửa sản phẩm"
          subtitle="Cập nhật thông tin sản phẩm và quay lại danh sách."
          right={
            <>
              <Button variant="ghost" type="button" onClick={() => navigate('/admin/products')}>
                Quay lại
              </Button>
              <Button variant="primary" type="submit" form="editProductForm" disabled={saving}>
                Cập nhật
              </Button>
            </>
          }
        />
      </div>

      <div className="adminCol12">
        <Card>
          <form id="editProductForm" onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
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

            <Field label="Ảnh sản phẩm" hint="JPG/PNG. Bỏ trống nếu không muốn đổi ảnh.">
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
                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
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
                      <img src={image.preview} alt="preview" className="aUploadImg" style={{ objectFit: 'contain' }} />
                      <div className="aUploadMeta">
                        <div className="aUploadName">{image.file?.name || 'Ảnh hiện tại'}</div>
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
                    Xóa
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
                {saving ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
