import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button, Card, EmptyState, Field, Input, Modal, PageHeader, Toolbar } from '../components/ui';
import { CategoryApi, createCategory, deleteCategoryApi, fetchCategories, updateCategory } from '../../services/categoriesService';

type Category = { id: number; name: string; slug: string; image?: string };

const initialCategories: Category[] = [
  { id: 1, name: 'Cà phê', slug: 'ca-phe' },
  { id: 2, name: 'Trà', slug: 'tra' },
  { id: 3, name: 'Bánh', slug: 'banh' },
];

export default function AdminCategories(): React.ReactElement {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [query, setQuery] = useState<string>('');
  const [form, setForm] = useState<{ name: string; slug: string }>({ name: '', slug: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [dragOver, setDragOver] = useState(false);
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
    const name = form.name.trim();
    const slug = form.slug.trim();
    if (!name || !slug) return;

    // Lấy URL đang có: ưu tiên URL từ API (keep), nếu không thì dùng blob preview
    const imageUrl: string | undefined = image.keep || image.preview || undefined;

    if (editingId) {
      try {
        const updated = await updateCategory({
          id: editingId,
          name,
          description: '',
          image: imageUrl ?? null,
          status: 'active',
        });

        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? { ...c, name: updated.name, slug: updated.slug, image: updated.image ?? imageUrl ?? c.image }
              : c
          )
        );
      } catch (err: any) {
        alert(err.message || 'Cập nhật danh mục thất bại');
      }
      resetForm();
      return;
    }

    try {
      const created = await createCategory({
        name,
        description: '',
        image: imageUrl ?? null,
        status: 'active',
        sort_order: 1,
      });

      setCategories((prev) => [
        {
          id: created.id,
          name: created.name,
          slug: created.slug,
          image: created.image ?? imageUrl,
        },
        ...prev,
      ]);
    } catch (err: any) {
      alert(err.message || 'Tạo danh mục thất bại');
    }
    resetForm();
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Danh mục"
          subtitle="Tạo và quản lý danh mục sản phẩm."
          right={
            <>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm danh mục..." style={{ minWidth: 260 }} />
              <Button
                variant="ghost"
                type="button"
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
          <div style={{ fontWeight: 950, color: '#0f172a', marginBottom: 12 }}>{editingId ? 'Sửa danh mục' : 'Tạo danh mục'}</div>

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <Field label="Tên danh mục" hint="VD: Cà phê / Trà / Bánh">
              <Input
                id="catName"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nhập tên danh mục"
              />
            </Field>

            <Field label="Ảnh danh mục" hint="JPG/PNG (demo)">
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
                        <div className="aUploadName">{image.file?.name || 'Ảnh danh mục'}</div>
                        <div className="aUploadHint">Bấm để đổi ảnh hoặc kéo/thả ảnh khác</div>
                      </div>
                    </div>
                  ) : image.keep ? (
                    <div className="aUploadPreview">
                      <img src={image.keep} alt="preview" className="aUploadImg" />
                      <div className="aUploadMeta">
                        <div className="aUploadName">Ảnh danh mục</div>
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

                {(image.preview || image.keep) ? (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setImage({ file: null, preview: '', keep: undefined });
                    }}
                    title="Xóa ảnh"
                  >
                    Xóa ảnh
                  </Button>
                ) : null}
              </div>
            </Field>

            <Field label="Slug" hint="Dùng cho URL">
              <Input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="vd: ca-phe"
              />
            </Field>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button variant="ghost" type="button" onClick={resetForm}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                {editingId ? 'Cập nhật' : 'Tạo mới'}
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
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.image ? <img src={c.image} alt={c.name} className="aThumb" /> : <div className="aThumbPlaceholder" />}
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
                            // load existing image for editing (chỉ lưu URL từ API)
                            setImage({ file: null, preview: '', keep: c.image });
                            (document.getElementById('catName') as HTMLInputElement | null)?.focus?.();
                          }}
                        >
                          ✎
                        </button>
                        <button className="aIconBtn danger" type="button" title="Xóa" onClick={() => setConfirm({ open: true, id: c.id })}>
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
                  })
                  .catch((err: any) => {
                    alert(err.message || 'Xóa danh mục thất bại');
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

