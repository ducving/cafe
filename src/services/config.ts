const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  // Loại bỏ phần '/api' ở cuối để lấy thư mục gốc của dự án trên server
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
};

export default API_BASE_URL;
