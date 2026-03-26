import React, { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Field, Input, PageHeader, Select } from '../components/ui';
import { createProduct } from '../../services/productsService';
import { CategoryApi, fetchCategories } from '../../services/categoriesService';
import { useToast } from '../../components/ToastContext';
import {
  Plus,
  ArrowLeft,
  Save,
  Package,
  Tag,
  DollarSign,
  Layers,
  Upload,
  Trash2,
  AlertCircle,
  FileText,
  Star
} from 'lucide-react';

type ProductForm = { name: string; sku: string; price: string; stock: string; category: string };

export default function AdminProductCreate(): React.ReactElement {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<ProductForm>({ name: '', sku: '', price: '', stock: '', category: '' });
  const [featured, setFeatured] = useState<0 | 1>(0);
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

    if (!name) {
      showToast('Vui lòng nhập tên sản phẩm!', 'warning');
      setSaving(false);
      return;
    }
    if (!category) {
      showToast('Vui lòng chọn danh mục!', 'warning');
      setSaving(false);
      return;
    }
    if (isNaN(price) || price < 0) {
      showToast('Vui lòng nhập giá bán hợp lệ!', 'warning');
      setSaving(false);
      return;
    }
    if (isNaN(stock) || stock < 0) {
      showToast('Vui lòng nhập số lượng tồn kho hợp lệ!', 'warning');
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
        featured,
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
        <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form id="createProductForm" onSubmit={onSubmit} style={{ display: 'grid', gap: 24 }}>
            
            {/* Section 1: Thông tin cơ bản */}
            <div>
              <div className="formSection">
                <div className="formSectionTitle">
                  <FileText size={20} className="text-primary" />
                  Thông tin cơ bản
                </div>
                <p className="formSectionSub">Tên sản phẩm và mã SKU định danh.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Tên sản phẩm">
                  <div style={{ position: 'relative' }}>
                    <Package size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                    <Input
                      autoFocus
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="VD: Cà phê sữa đá"
                      style={{ paddingLeft: 38 }}
                    />
                  </div>
                </Field>
                <Field label="Mã SKU (Tùy chọn)">
                  <div style={{ position: 'relative' }}>
                    <Tag size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                    <Input
                      value={form.sku}
                      onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                      placeholder="VD: CF-SUA-DA"
                      style={{ paddingLeft: 38 }}
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Section 2: Phân loại & Hình ảnh */}
            <div>
              <div className="formSection">
                <div className="formSectionTitle">
                  <Layers size={20} className="text-primary" />
                  Phân loại & Hình ảnh
                </div>
                <p className="formSectionSub">Chọn danh mục và tải ảnh đại diện sản phẩm.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Danh mục">
                  <div style={{ position: 'relative' }}>
                    <Layers size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                    <Select
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      style={{ paddingLeft: 38 }}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </Field>
                
                <Field label="Ảnh sản phẩm">
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
                      onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files?.[0] || null;
                        if (file) setImageFromFile(file);
                      }}
                      style={{ padding: '20px' }}
                    >
                      {image.preview ? (
                        <div className="aUploadPreview">
                          <img src={image.preview} alt="preview" className="aUploadImg" style={{ width: 60, height: 60 }} />
                          <div className="aUploadMeta">
                            <div className="aUploadName" style={{ fontSize: 13 }}>{image.file?.name}</div>
                            <div className="aUploadHint" style={{ fontSize: 11 }}>Bấm để đổi ảnh</div>
                          </div>
                          <Button variant="ghost" size="sm" type="button" onClick={(e) => { e.stopPropagation(); setImageFromFile(null); }} icon={<Trash2 size={14} />} />
                        </div>
                      ) : (
                        <div className="aUploadEmpty" style={{ padding: '10px 0' }}>
                          <Upload size={24} style={{ color: '#94a3b8', marginBottom: 4 }} />
                          <div className="aUploadTitle" style={{ fontSize: 14 }}>Tải ảnh sản phẩm</div>
                          <div className="aUploadHint" style={{ fontSize: 12 }}>Bấm hoặc kéo thả</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Field>
              </div>
            </div>

            {/* Section 3: Giá & Tồn kho */}
            <div>
              <div className="formSection">
                <div className="formSectionTitle">
                  <DollarSign size={20} className="text-primary" />
                  Giá & Tồn kho
                </div>
                <p className="formSectionSub">Thiết lập giá bán và số lượng trong kho.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Giá bán (đ)">
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                    <Input 
                      type="number" 
                      value={form.price} 
                      onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} 
                      placeholder="VD: 29000"
                      style={{ paddingLeft: 38 }}
                    />
                  </div>
                </Field>
                <Field label="Số lượng tồn kho">
                  <div style={{ position: 'relative' }}>
                    <AlertCircle size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                    <Input 
                      type="number" 
                      value={form.stock} 
                      onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} 
                      placeholder="VD: 50"
                      style={{ paddingLeft: 38 }}
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Section 4: Nổi bật */}
            <div>
              <div className="formSection">
                <div className="formSectionTitle">
                  <Star size={20} className="text-primary" />
                  Sản phẩm nổi bật
                </div>
                <p className="formSectionSub">Sản phẩm nổi bật sẽ được hiển thị ở trang chủ và khu vực đề xuất.</p>
              </div>

              <div
                onClick={() => setFeatured((f) => (f === 1 ? 0 : 1))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px', borderRadius: '12px', cursor: 'pointer',
                  border: `2px solid ${featured === 1 ? '#c8a96e' : '#e2e8f0'}`,
                  backgroundColor: featured === 1 ? '#fffbf0' : '#f8fafc',
                  transition: 'all 0.2s', userSelect: 'none',
                }}
              >
                <div style={{
                  width: '44px', height: '26px', borderRadius: '13px',
                  backgroundColor: featured === 1 ? '#c8a96e' : '#cbd5e1',
                  position: 'relative', transition: 'background-color 0.25s', flexShrink: 0
                }}>
                  <div style={{
                    position: 'absolute', top: '3px',
                    left: featured === 1 ? '21px' : '3px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    backgroundColor: '#fff', transition: 'left 0.25s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: featured === 1 ? '#92680a' : '#334155' }}>
                    {featured === 1 ? '⭐ Sản phẩm nổi bật' : 'Sản phẩm thường'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    {featured === 1
                      ? 'Hiển thị ở trang chủ, khu vực đề xuất'
                      : 'Chỉ hiện trong danh sách sản phẩm'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <Button variant="ghost" type="button" onClick={() => navigate('/admin/products')} icon={<ArrowLeft size={18} />}>
                Hủy bỏ
              </Button>
              <Button variant="primary" type="submit" disabled={saving} icon={<Save size={18} />}>
                {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

