import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader, Card, Toolbar, Input, Button, EmptyState, Modal } from '../components/ui';
import { 
  fetchNewsAll, 
  createNewsApi, 
  updateNewsApi, 
  deleteNewsApi, 
  NewsApi 
} from '../../services/newsService';

export default function AdminNews(): React.ReactElement {
  const [news, setNews] = useState<NewsApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState<{ open: boolean; news: NewsApi | null }>({ open: false, news: null });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchNewsAll();
      setNews(data);
    } catch (e: any) {
      alert(e.message || 'Lỗi tải danh sách tin tức');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return news;
    return news.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }, [news, query]);

  // Handle Add
  const handleAddNew = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    setSubmitting(true);
    try {
      await createNewsApi({ title, content, status, image: imageFile });
      alert('Thêm mới thành công');
      setAddModalOpen(false);
      resetForm();
      loadData();
    } catch (e: any) {
      alert(e.message || 'Lỗi thêm tin tức');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit
  const openEditModal = (item: NewsApi) => {
    setEditModalOpen({ open: true, news: item });
    setTitle(item.title);
    setContent(item.content);
    setStatus(item.status);
    setImageFile(null); // Ghi chú: PUT API updateNewsApi theo document hiện đang nhận JSON không kèm file, có thể mở rộng sau.
  };

  const handleUpdate = async () => {
    if (!isEditModalOpen.news?.id) return;
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    setSubmitting(true);
    try {
      await updateNewsApi({ id: isEditModalOpen.news.id, title, content, status });
      alert('Cập nhật thành công');
      setEditModalOpen({ open: false, news: null });
      resetForm();
      loadData();
    } catch (e: any) {
      alert(e.message || 'Lỗi cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    setSubmitting(true);
    try {
      await deleteNewsApi(confirmDelete.id);
      alert('Đã xóa thành công');
      setConfirmDelete({ open: false, id: null });
      loadData();
    } catch (e: any) {
      alert(e.message || 'Lỗi xóa tin tức');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setStatus('active');
    setImageFile(null);
  };

  const closeModals = () => {
    setAddModalOpen(false);
    setEditModalOpen({ open: false, news: null });
    resetForm();
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Tin tức"
          subtitle="Quản lý bài viết blog chia sẻ đến khách hàng."
          right={
            <>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm tiêu đề / nội dung..." style={{ minWidth: 250 }} />
              <Button variant="primary" onClick={() => { resetForm(); setAddModalOpen(true); }}>
                Thêm tin tức
              </Button>
            </>
          }
        />
      </div>

      <div className="adminCol12">
        <Card>
          <Toolbar left={<div style={{ fontWeight: 'bold' }}>Tất cả tin tức</div>} right={<div>{filtered.length} bài</div>} />

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Đang tải dữ liệu...</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Chưa có tin tức nào"
              subtitle="Tạo bài viết đầu tiên để chia sẻ."
              action={<Button variant="primary" onClick={() => { resetForm(); setAddModalOpen(true); }}>Tạo ngay</Button>}
            />
          ) : (
            <table className="aTable">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td>
                      {item.image ? (
                        <img src={`/doan/${item.image}`} alt={item.title} className="aThumb" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div className="aThumbPlaceholder" />
                      )}
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{item.title}</td>
                    <td>
                      <span className={`aBadge ${item.status === 'active' ? 'success' : 'default'}`}>
                        {item.status === 'active' ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </td>
                    <td>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : ''}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="aRowActions">
                        <button className="aIconBtn" title="Sửa" onClick={() => openEditModal(item)}>✎</button>
                        <button className="aIconBtn danger" title="Xóa" onClick={() => setConfirmDelete({ open: true, id: item.id })}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Modal Add News */}
      <Modal 
        open={isAddModalOpen} 
        title="Thêm Bài Viết Mới" 
        onClose={closeModals}
        footer={
          <>
            <Button variant="ghost" onClick={closeModals}>Hủy</Button>
            <Button variant="primary" onClick={handleAddNew} disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu tin tức'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Tiêu đề</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Khai trương chi nhánh mới..." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Nội dung</label>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Nội dung chi tiết..."
              style={{ width: '100%', minHeight: '120px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Trạng thái</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
            >
              <option value="active">Hiển thị</option>
              <option value="inactive">Đang ẩn</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Ảnh (chỉ dùng cho thêm mới)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  setImageFile(e.target.files[0]);
                }
              }}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
            />
          </div>
        </div>
      </Modal>

      {/* Modal Edit News */}
      <Modal 
        open={isEditModalOpen.open} 
        title="Sửa Bài Viết" 
        onClose={closeModals}
        footer={
          <>
            <Button variant="ghost" onClick={closeModals}>Hủy</Button>
            <Button variant="primary" onClick={handleUpdate} disabled={submitting}>
              {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Tiêu đề</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Nội dung</label>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Nội dung chi tiết..."
              style={{ width: '100%', minHeight: '120px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>Trạng thái</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
            >
              <option value="active">Hiển thị</option>
              <option value="inactive">Đang ẩn</option>
            </select>
            <p style={{ marginTop: '5px', fontSize: '12px', color: '#64748b' }}>
              Cập nhật hiện không hỗ trợ đổi ảnh (vì Backend sử dụng raw JSON cho thao tác PUT theo luồng hoạt động chuẩn).
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Delete Confirm */}
      <Modal 
        open={confirmDelete.open} 
        title="Xóa bài viết?" 
        onClose={() => setConfirmDelete({ open: false, id: null })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete({ open: false, id: null })}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete} disabled={submitting}>Xóa</Button>
          </>
        }
      >
        Hành động này không thể hoàn tác. Bạn có chắc muốn xóa tin tức này không?
      </Modal>

    </div>
  );
}
