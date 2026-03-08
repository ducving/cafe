import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, Card, EmptyState, Field, Input, Modal, PageHeader, Toolbar } from '../components/ui';
import { CategoryApi, createCategory, deleteCategoryApi, fetchCategories, updateCategory } from '../../services/categoriesService';
import { getImageUrl } from '../../services/config';
import { useToast } from '../../components/ToastContext';
import { exportToExcel, importFromExcel } from '../utils/ExcelUtils';
import { Download, Upload, Plus, Edit, Trash2, Search, RefreshCw, Layers, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

type Category = { id: number; name: string; slug: string; image?: string };

const initialCategories: Category[] = [
  { id: 1, name: 'Cà phê', slug: 'ca-phe' },
  { id: 2, name: 'Trà', slug: 'tra' },
  { id: 3, name: 'Bánh', slug: 'banh' },
];

export default function AdminCategories(): React.ReactElement {
  const { showToast } = useToast();
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [query, setQuery] = useState<string>('');
  const [form, setForm] = useState<{ name: string; slug: string }>({ name: '', slug: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pagination
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);
  const [image, setImage] = useState<{ file: File | null; preview: string; keep?: string }>({
    file: null,
    preview: '',
    keep: undefined,
  });

  const setImageFromFile = (file: File | null) => {
    if (!file) {
      setImage({ file: null, preview: '', keep: undefined });
      return;
    }
    const preview = URL.createObjectURL(file);
    setImage({ file, preview, keep: undefined });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filter changes
  const prevQuery = React.useRef(query);
  if (prevQuery.current !== query) {
    prevQuery.current = query;
    if (page !== 1) setPage(1);
  }

  const resetForm = () => {
    setForm({ name: '', slug: '' });
    setEditingId(null);
    setDragOver(false);
    setImage({ file: null, preview: '', keep: undefined });
  };

  useEffect(() => {
    fetchCategories()
      .then((list) => {
        const mapped: Category[] = list.map((c: CategoryApi) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image ?? undefined,
        }));
        setCategories(mapped);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    const slug = form.slug.trim();
    if (!name || !slug) return;

    setSaving(true);

    // 1. CHUYỂN ẢNH SANG BASE64 GIỐNG TRANG SẢN PHẨM
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
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = reject;
        });
      } catch (err) {
        console.error('Lỗi chuyển đổi ảnh:', err);
      }
    } else if (image.keep) {
      finalImageUrl = image.keep;
    }

    try {
      if (editingId) {
        // CẬP NHẬT (PUT)
        const updated = await updateCategory({
          id: editingId,
          name,
          slug,
          image: finalImageUrl,
          status: 'active',
        });

        if (!updated) throw new Error('Không nhận được phản hồi từ máy chủ');

        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? { ...c, name: updated.name, slug: updated.slug, image: updated.image ?? (finalImageUrl || undefined) }
              : c
          )
        );
      } else {
        // THÊM MỚI (POST)
        const created = await createCategory({
          name,
          slug,
          image: finalImageUrl,
          status: 'active',
          sort_order: 1,
        });

        setCategories((prev) => [
          {
            id: created.id,
            name: created.name,
            slug: created.slug,
            image: created.image ?? (finalImageUrl || undefined),
          },
          ...prev,
        ]);
      }
      showToast(editingId ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công', 'success');
      resetForm();
    } catch (err: any) {
      showToast(err.message || 'Thao tác thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const dataToExport = categories.map(c => ({
      'ID': c.id,
      'Tên danh mục': c.name,
      'Slug': c.slug
    }));
    exportToExcel(dataToExport, 'Danh_muc_HaluCafe', 'Categories');
    showToast('Xuất Excel thành công', 'success');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromExcel(file);
      if (!Array.isArray(data) || data.length === 0) {
        showToast('File Excel không có dữ liệu hoặc không đúng định dạng', 'error');
        return;
      }

      setSaving(true);
      let successCount = 0;
      let failCount = 0;

      for (const row of data) {
        const name = row['Tên danh mục'] || row['name'] || row['Name'];
        const slug = row['Slug'] || row['slug'] || (name ? name.toLowerCase().replace(/ /g, '-') : null);

        if (name && slug) {
          try {
            const created = await createCategory({
              name,
              slug,
              status: 'active',
              sort_order: 1
            });
            if (created) successCount++;
          } catch (err) {
            failCount++;
          }
        }
      }

      // Refresh list
      const updatedList = await fetchCategories();
      setCategories(updatedList.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image
      })));

      showToast(`Nhập dữ liệu thành công: ${successCount} mục. Thất bại: ${failCount} mục.`, successCount > 0 ? 'success' : 'error');
    } catch (err) {
      showToast('Lỗi khi đọc file Excel', 'error');
    } finally {
      setSaving(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Danh mục"
          subtitle="Tạo và quản lý danh mục sản phẩm."
          right={
            <>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} style={{ position: 'absolute', left: 12, color: '#94a3b8' }} />
                <Input 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Tìm danh mục..." 
                  style={{ minWidth: 260, paddingLeft: 38 }} 
                />
              </div>
              <Button variant="ghost" type="button" onClick={handleExport} icon={<Download size={18} />}>
                Xuất Excel
              </Button>
              <Button 
                variant="ghost" 
                type="button" 
                onClick={() => document.getElementById('excel-import-cat')?.click()} 
                icon={<Upload size={18} />}
                disabled={saving}
              >
                Nhập Excel
                <input id="excel-import-cat" type="file" accept=".xlsx, .xls" hidden onChange={handleImport} />
              </Button>
              <Button
                variant="primary"
                type="button"
                icon={<Plus size={18} />}
                onClick={() => {
                  resetForm();
                  (document.getElementById('catName') as HTMLInputElement | null)?.focus?.();
                }}
              >
                Thêm mới
              </Button>
            </>
          }
        />
      </div>

      <div className="adminCol4">
        <Card>
          <div className="formSection">
            <div className="formSectionTitle">
              {editingId ? <Edit size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
              {editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </div>
            <p className="formSectionSub">Thông tin cơ bản về nhóm sản phẩm.</p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
            <Field label="Tên danh mục">
              <div style={{ position: 'relative' }}>
                <Layers size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <Input
                  id="catName"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="VD: Cà phê / Trà / Bánh"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </Field>

            <Field label="Ảnh đại diện">
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
                    setDragOver(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0] || null;
                    if (file) setImageFromFile(file);
                  }}
                >
                  {image.preview ? (
                    <div className="aUploadPreview">
                      <img src={image.preview} alt="preview" className="aUploadImg" />
                      <div className="aUploadMeta">
                        <div className="aUploadName">{image.file?.name || 'Ảnh đã chọn'}</div>
                        <div className="aUploadHint">Bấm để thay đổi</div>
                      </div>
                    </div>
                  ) : image.keep ? (
                    <div className="aUploadPreview">
                      <img src={getImageUrl(image.keep)} alt="preview" className="aUploadImg" />
                      <div className="aUploadMeta">
                        <div className="aUploadName">Ảnh hiện tại</div>
                        <div className="aUploadHint">Duy trì hoặc bấm để đổi</div>
                      </div>
                    </div>
                  ) : (
                    <div className="aUploadEmpty">
                      <div className="aUploadIcon"><Upload size={32} /></div>
                      <div className="aUploadTitle">Tải lên hình ảnh</div>
                      <div className="aUploadHint">Kéo thả hoặc bấm để chọn</div>
                    </div>
                  )}
                </div>

                {(image.preview || image.keep) ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setImage({ file: null, preview: '', keep: undefined })}
                    icon={<Trash2 size={14} />}
                    style={{ color: '#ef4444' }}
                  >
                    Gỡ bỏ ảnh
                  </Button>
                ) : null}
              </div>
            </Field>

            <Field label="Đường dẫn tĩnh (Slug)">
              <div style={{ position: 'relative' }}>
                <LinkIcon size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="vd: ca-phe"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </Field>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button variant="ghost" type="button" onClick={resetForm}>
                Hủy
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo mới')}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="adminCol8">
        <Card>
          <Toolbar
            left={<div style={{ fontWeight: 950, color: '#0f172a' }}>Danh sách</div>}
            right={<div style={{ color: '#64748b', fontWeight: 800 }}>{filtered.length} mục</div>}
          />

          {filtered.length === 0 ? (
            <EmptyState
              title="Chưa có danh mục"
              subtitle="Tạo danh mục đầu tiên để bắt đầu quản lý sản phẩm."
              action={
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => (document.getElementById('catName') as HTMLInputElement | null)?.focus?.()}
                >
                  Tạo danh mục
                </Button>
              }
            />
          ) : (
            <table className="aTable">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Ảnh</th>
                  <th>Tên</th>
                  <th>Slug</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.image ? <img src={getImageUrl(c.image)} alt={c.name} className="aThumb" /> : <div className="aThumbPlaceholder" />}
                    </td>
                    <td style={{ fontWeight: 950 }}>{c.name}</td>
                    <td style={{ color: '#64748b' }}>{c.slug}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="aRowActions">
                        <button
                          className="aIconBtn"
                          type="button"
                          title="Sửa"
                          onClick={() => {
                            setEditingId(c.id);
                            setForm({ name: c.name, slug: c.slug });
                            setImage({ file: null, preview: '', keep: c.image });
                            (document.getElementById('catName') as HTMLInputElement | null)?.focus?.();
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button className="aIconBtn danger" type="button" title="Xóa" onClick={() => setConfirm({ open: true, id: c.id })}>
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
        title="Xóa danh mục?"
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
                deleteCategoryApi(id)
                  .then(() => {
                    setCategories((prev) => prev.filter((x) => x.id !== id));
                    if (editingId === id) resetForm();
                    setConfirm({ open: false, id: null });
                    showToast('Xóa danh mục thành công', 'success');
                  })
                  .catch((err: any) => {
                    showToast(err.message || 'Xóa danh mục thất bại', 'error');
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

