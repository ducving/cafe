import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProducts, ProductApi } from '../services/productsService';
import { useCart } from '../user/CartContext';

const GOLD = '#e7b557';
const ACTIVE_TAB = '#b58849';
const BG = '#3a2415';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<ProductApi | null>(null);
  const [related, setRelated] = useState<ProductApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  const [adding, setAdding] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        const found = data.find(p => p.id.toString() === id);
        if (found) {
          setProduct(found);
          const others = data.filter(p => p.id.toString() !== id);
          // simple shuffle / pick for related
          setRelated(others.sort(() => 0.5 - Math.random()).slice(0, 4));
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAdd = () => {
    if (product) {
      setAdding(true);
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.sale_price || product.price),
        image: product.image ?? null,
      }, 1);
      setTimeout(() => setAdding(false), 800);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px' }}>Đang tải dữ liệu...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px' }}>Không tìm thấy sản phẩm!</div>;

  const price = Number(product.sale_price || product.price);
  const originalPrice = Number(product.price);
  const hasDiscount = product.sale_price && Number(product.sale_price) < originalPrice;

  return (
    <div style={{ backgroundColor: '#fff', paddingBottom: '60px' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px' }}>
          <div style={{ color: GOLD, fontSize: '14px' }}>
            <Link to="/" style={{ color: GOLD, textDecoration: 'none' }}>Trang chủ</Link>
            <span style={{ margin: '0 8px', color: '#666' }}>›</span>
            <Link to="/products" style={{ color: GOLD, textDecoration: 'none' }}>Sản phẩm</Link>
            <span style={{ margin: '0 8px', color: '#666' }}>›</span>
            <span style={{ color: '#666' }}>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 15px' }}>
        {/* Main Product Info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
          {/* Left Column: Image */}
          <div style={{ flex: '1 1 400px', minWidth: '300px' }}>
            <div style={{ 
              backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', 
              border: '1px solid #ebebeb', display: 'flex', justifyContent: 'center', alignItems: 'center',
              height: '400px'
            }}>
              {product.image ? (
                <img src={product.image} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: '100px' }}>☕</div>
              )}
            </div>
            {/* Thumbnails placeholder */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <div style={{ width: '80px', height: '80px', border: `2px solid ${GOLD}`, padding: '5px', borderRadius: '4px', cursor: 'pointer' }}>
                <img src={product.image} alt="thu" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#002540', textTransform: 'uppercase', fontWeight: 800 }}>
              {product.name}
            </h1>
            
            <div style={{ fontSize: '14px', color: '#666' }}>
               Thương hiệu: <span style={{ color: GOLD, fontWeight: 'bold' }}>Trang Vàng</span>
               <span style={{ margin: '0 10px' }}>|</span>
               Tình trạng: <span style={{ color: GOLD, fontWeight: 'bold' }}>{product.status === 'inactive' ? 'Hết hàng' : 'Còn hàng'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '10px 0' }}>
              <span style={{ fontSize: '30px', color: GOLD, fontWeight: 'bold' }}>
                {new Intl.NumberFormat('vi-VN').format(price)}₫
              </span>
              {hasDiscount && (
                <span style={{ fontSize: '18px', color: '#999', textDecoration: 'line-through' }}>
                  {new Intl.NumberFormat('vi-VN').format(originalPrice)}₫
                </span>
              )}
            </div>

            <button 
              onClick={handleAdd}
              disabled={product.status === 'inactive'}
              style={{
                backgroundColor: product.status === 'inactive' ? '#ccc' : GOLD,
                color: '#fff', border: 'none', borderRadius: '30px', padding: '12px 30px',
                fontSize: '16px', fontWeight: 'bold', cursor: product.status === 'inactive' ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s', alignSelf: 'flex-start',
                marginBottom: '10px', width: '250px'
              }}
              onMouseEnter={(e) => {
                if (product.status !== 'inactive') e.currentTarget.style.backgroundColor = ACTIVE_TAB;
              }}
              onMouseLeave={(e) => {
                if (product.status !== 'inactive') e.currentTarget.style.backgroundColor = GOLD;
              }}
            >
              {product.status === 'inactive' ? 'HẾT HÀNG' : (adding ? 'ĐÃ THÊM VÀO GIỎ' : 'THÊM VÀO GIỎ')}
            </button>

            <div style={{ fontSize: '14px', color: '#444', lineHeight: '1.6', marginTop: '10px' }}>
              {product.description || 'Theo lời khuyên của các chuyên gia y tế cho rằng: mùa hè, bạn nên uống ít nhất 2 ly cà phê hoặc nước ép mỗi ngày. Bởi vì nó sẽ tự động làm giảm lượng calo bên cạnh việc duy trì sức khỏe, giúp cho cơ thể bạn luôn trong trạng thái rạng rỡ và khỏe mạnh.'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
              <strong style={{ fontSize: '14px', color: '#333' }}>Chia sẻ:</strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['#3b5998', '#1da1f2', '#bd081c', '#dd4b39'].map((c, i) => (
                  <div key={i} style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: c, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer'
                  }}>
                    {i === 0 ? 'f' : i === 1 ? 't' : i === 2 ? 'p' : 'g+'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div style={{ marginTop: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '-1px' }}>
            <button 
              onClick={() => setActiveTab('info')}
              style={{
                backgroundColor: activeTab === 'info' ? ACTIVE_TAB : GOLD,
                color: '#fff', padding: '12px 25px', border: 'none', borderRadius: '4px 4px 0 0',
                fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s'
              }}>
              THÔNG TIN SẢN PHẨM
            </button>
            <button 
              onClick={() => setActiveTab('policy')}
              style={{
                backgroundColor: activeTab === 'policy' ? ACTIVE_TAB : GOLD,
                color: '#fff', padding: '12px 25px', border: 'none', borderRadius: '4px 4px 0 0',
                fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s'
              }}>
              CHÍNH SÁCH
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              style={{
                backgroundColor: activeTab === 'reviews' ? ACTIVE_TAB : GOLD,
                color: '#fff', padding: '12px 25px', border: 'none', borderRadius: '4px 4px 0 0',
                fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s'
              }}>
              ĐÁNH GIÁ SẢN PHẨM
            </button>
          </div>
          <div style={{ 
            backgroundColor: '#f8f5ee', padding: '30px', borderRadius: '8px', 
            fontSize: '14px', color: '#444', lineHeight: '1.8' 
          }}>
            {activeTab === 'info' && (
              <div>
                <p>Nguồn gốc chi tiết nhập khẩu và cung cấp từ khắp nơi trên thế giới. Đảm bảo vệ sinh an toàn thực phẩm, công nghệ xử lý tiên tiến theo dây chuyền từ khâu chọn lọc đến khi tới tay khách hàng.</p>
                <p>Sản phẩm mang giá trị dinh dưỡng cao, với mức độ kiểm định an toàn nghiêm ngặt. Khi sử dụng có thể yên tâm bảo quản môi trường trong và ngoài ngăn mát 24/24h.</p>
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === 'policy' && (
              <div>
                Dưới đây là chính sách đổi trả hàng hóa, hoàn tiền và bảo lưu thông tin mua sắm của shop. Chúng tôi cam kết bảo vệ quyền lợi trọn vẹn của người mua.
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div style={{ marginTop: '80px' }}>
            <h2 style={{ textAlign: 'center', color: GOLD, fontSize: '32px', marginBottom: '5px' }}>
              Sản phẩm liên quan
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '40px' }}>
              Bạn có thể tham khảo thêm 1 số sản phẩm tương tự ở bên dưới
            </p>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {related.map(p => {
                const rpPrice = Number(p.sale_price || p.price);
                const rpOrigPrice = Number(p.price);
                const rDiscount = p.sale_price && Number(p.sale_price) < rpOrigPrice;
                const pct = rDiscount ? Math.round((1 - Number(p.sale_price) / rpOrigPrice) * 100) : 0;
                
                return (
                  <div key={p.id} style={{ flex: '1 1 calc(25% - 20px)', minWidth: '220px' }}>
                    <div
                      style={{
                        position: 'relative', backgroundColor: '#fff', border: '1px solid #ebebeb',
                        transition: 'box-shadow 0.3s ease', paddingBottom: '20px',
                        display: 'flex', flexDirection: 'column', cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { 
                        const target = e.currentTarget as HTMLDivElement;
                        target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; 
                        const actions = target.querySelector('.product-actions') as HTMLDivElement;
                        if (actions) {
                          actions.style.opacity = '1';
                          actions.style.visibility = 'visible';
                        }
                      }}
                      onMouseLeave={(e) => { 
                        const target = e.currentTarget as HTMLDivElement;
                        target.style.boxShadow = 'none'; 
                        const actions = target.querySelector('.product-actions') as HTMLDivElement;
                        if (actions) {
                          actions.style.opacity = '0';
                          actions.style.visibility = 'hidden';
                        }
                      }}
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      {/* Price Bar Container */}
                      <div style={{
                        position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)',
                        backgroundColor: '#e7b557', padding: '6px 20px', zIndex: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        whiteSpace: 'nowrap', minWidth: '150px'
                      }}>
                        <span style={{ color: '#fff', fontSize: '15px', fontWeight: 800 }}>
                          {new Intl.NumberFormat('vi-VN').format(rpPrice)}₫
                        </span>
                      </div>

                      {/* Discount Badge */}
                      {rDiscount && (
                        <div style={{
                          position: 'absolute', top: '10px', right: '10px', zIndex: 2,
                          backgroundColor: '#c0392b', color: '#fff', padding: '4px 8px',
                          fontSize: '11px', fontWeight: 800, borderRadius: '3px'
                        }}>
                          -{pct}%
                        </div>
                      )}

                      {/* Image Area */}
                      <div style={{ padding: '30px 10px 10px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {p.image ? (
                            <img src={p.image} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          ) : (
                            <div style={{ fontSize: '50px' }}>☕</div>
                          )}
                        </div>

                        {/* Hover Actions - Sticky Left Tabs */}
                        <div 
                          className="product-actions"
                          style={{
                            position: 'absolute', top: '50%', left: '0', transform: 'translateY(-50%)',
                            display: 'flex', flexDirection: 'column', gap: '5px',
                            opacity: 0, visibility: 'hidden', transition: 'all 0.3s ease',
                            zIndex: 3
                          }}
                        >
                          <button type="button" 
                            style={{
                              width: '45px', height: '40px', backgroundColor: '#e7b557', color: '#fff',
                              border: 'none', borderRadius: '0 20px 20px 0', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                            }}
                            title="Xem nhanh"
                          >
                            👁
                          </button>
                          <button type="button" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              addItem({id: p.id, name: p.name, price: Number(p.sale_price || p.price), image: p.image ?? null}, 1);
                              alert("Đã thêm vào giỏ hàng");
                            }}
                            style={{
                              width: '45px', height: '40px', backgroundColor: '#e7b557', color: '#fff',
                              border: 'none', borderRadius: '0 20px 20px 0', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                            }}
                            title="Thêm vào giỏ"
                          >
                            🛒
                          </button>
                        </div>
                      </div>

                      {/* Product Name */}
                      <div style={{ textAlign: 'center', marginTop: '10px', padding: '0 10px' }}>
                        <h3 style={{ 
                          margin: 0, fontSize: '15px', fontWeight: 700, 
                          color: '#004c8c', textTransform: 'uppercase', letterSpacing: '0.3px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {p.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
