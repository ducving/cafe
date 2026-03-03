import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Input, Modal, PageHeader } from '../components/ui';
import { fetchBanners, createBanner, deleteBanner, BannerApi } from '../../services/bannersService';
import { useToast } from '../../components/ToastContext';

export default function AdminBanners(): React.ReactElement {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<BannerApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await fetchBanners();
      setBanners(data);
    } catch (error) {
      showToast('Lỗi khi tải danh sách banner', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      showToast('Vui lòng chọn ảnh cho banner', 'warning');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('link', link);
    formData.append('sort_order', sortOrder);
    formData.append('image', imageFile);

    try {
      const result = await createBanner(formData);
      if (result.success) {
        showToast('Thêm banner thành công!', 'success');
        setIsModalOpen(false);
        resetForm();
        loadBanners();
      } else {
        showToast(result.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi kết nối', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa banner này?')) return;
    
    try {
      const result = await deleteBanner(id);
      if (result.success) {
        showToast('Xóa banner thành công!', 'success');
        loadBanners();
      } else {
        showToast(result.message || 'Xóa thất bại', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi xóa', 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setLink('');
    setSortOrder('0');
    setImageFile(null);
    setPreviewUrl(null);
  };

  const getBannerImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Nếu trong DB đã có sẵn đường dẫn 'uploads/banners/'
    if (imagePath.includes('uploads/banners/')) {
       // Làm sạch đường dẫn (bỏ dấu / ở đầu nếu có)
       const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
       return `/doan/${cleanPath}`;
    }
    
    // Nếu trong DB chỉ lưu tên file, tự động thêm thư mục banners
    return `/doan/uploads/banners/${imagePath}`;
  };

  return (
    <div className="adminGrid">
      <div className="adminCol12">
        <PageHeader
          title="Quản lý Banner"
          subtitle="Thêm, sửa hoặc xóa các banner quảng cáo trên trang chủ."
          right={
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              + Thêm Banner
            </Button>
          }
        />
      </div>

      <div className="adminCol12">
        <Card>
          <table className="aTable">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Liên kết</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</td></tr>
              ) : banners.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Chưa có banner nào</td></tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id}>
                    <td>
                      <img 
                        src={getBannerImageUrl(banner.image)} 
                        alt={banner.title} 
                        style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{banner.title}</td>
                    <td>{banner.link || '#'}</td>
                    <td>{banner.sort_order}</td>
                    <td><Badge tone="green">Hiển thị</Badge></td>
                    <td style={{ textAlign: 'right' }}>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(banner.id)}>
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <Modal
        open={isModalOpen}
        title="Thêm Banner Mới"
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Lưu Banner'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Tiêu đề</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề banner..." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Đường dẫn (Link)</label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Nhập URL khi click banner (tùy chọn)..." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Thứ tự hiển thị</label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 600 }}>Ảnh Banner</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '13px' }} />
            {previewUrl && (
              <div style={{ marginTop: '10px' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
