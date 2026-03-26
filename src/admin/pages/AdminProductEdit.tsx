import React, { useEffect, useId, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Field, Input, PageHeader, Select } from '../components/ui';
import { updateProductApi, fetchProductDetail } from '../../services/productsService';
import { CategoryApi, fetchCategories } from '../../services/categoriesService';
import { useToast } from '../../components/ToastContext';
import {
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
  Edit,
  Star
} from 'lucide-react';

type ProductForm = { name: string; sku: string; price: string; stock: string; category: string };

export default function AdminProductEdit(): React.ReactElement {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { id } = useParams<{ id: string }>();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);
  
  const [form, setForm] = useState<ProductForm>({ name: '', sku: '', price: '', stock: '', category: '' });
  const [featured, setFeatured] = useState<0 | 1>(0);
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
        setFeatured(product.featured ? 1 : 0);
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
        featured,
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
        <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form id="editProductForm" onSubmit={onSubmit} style={{ display: 'grid', gap: 24 }}>
            
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
                <Field label="Mã SKU">
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
                <p className="formSectionSub">Chọn danh mục và cập nhật ảnh sản phẩm.</p>
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
                            <div className="aUploadName" style={{ fontSize: 13 }}>{image.file?.name || 'Ảnh đang sử dụng'}</div>
                            <div className="aUploadHint" style={{ fontSize: 11 }}>Bấm hoặc kéo thả để đổi</div>
                          </div>
                          <Button variant="ghost" size="sm" type="button" onClick={(e) => { e.stopPropagation(); setImageFromFile(null); }} icon={<Trash2 size={14} />} />
                        </div>
                      ) : (
                        <div className="aUploadEmpty" style={{ padding: '10px 0' }}>
                          <Upload size={24} style={{ color: '#94a3b8', marginBottom: 4 }} />
                          <div className="aUploadTitle" style={{ fontSize: 14 }}>Tải ảnh mới</div>
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
                <p className="formSectionSub">Cập nhật số liệu kinh doanh hiện tại.</p>
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
                {saving ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
