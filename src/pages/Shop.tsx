import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, ProductApi } from '../services/productsService';
import { fetchNewsActive, NewsApi } from '../services/newsService';
import { fetchCategories, CategoryApi } from '../services/categoriesService';
import { useCart } from '../user/CartContext';
import BannerSection from '../components/BannerSection';

const GOLD = '#c8a96e';

export default function Shop(): React.ReactElement {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductApi[]>([]);
  const [newsList, setNewsList] = useState<NewsApi[]>([]);
  const [categories, setCategories] = useState<CategoryApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    
    // Fetch products
    const p1 = fetchProducts()
      .then((list) => {
        const filtered = list.filter((p) => p.status === 'active');
        setProducts(filtered);
      });

    // Fetch news
    const p2 = fetchNewsActive()
      .then((list) => {
        setNewsList(list);
      });

    // Fetch categories
    const p3 = fetchCategories()
      .then((list) => {
        setCategories(list.filter(c => c.status === 'active'));
      });

    Promise.all([p1, p2, p3])
      .catch((err: any) => {
        console.error(err);
        setError('Không tải được dữ liệu');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (p: ProductApi) => {
    addItem({ id: p.id, name: p.name, price: Number(p.sale_price || p.price), image: p.image ?? null }, 1);
    setAddingId(p.id);
    setTimeout(() => setAddingId(null), 1500);
  };

  return (
    <div style={{ backgroundColor: '#f5f0ea', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ===== 1. HERO SLIDER ===== */}
      <BannerSection />

      {/* ===== 2. DANH MỤC (3 ảnh quảng cáo) ===== */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '16px' }}>
          {/* Ảnh lớn bên trái */}
          {categories[0] && (
            <div 
              style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', gridRow: 'span 2', cursor: 'pointer' }}
              onClick={() => navigate('/category/' + categories[0].id)}
            >
              <img
                src={categories[0].image ? (categories[0].image.startsWith('http') ? categories[0].image : `/doan/${categories[0].image}`) : '//bizweb.dktcdn.net/100/351/580/themes/714586/assets/module_banner1.png?1705464185330'}
                alt={categories[0].name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', bottom: '28px', left: '28px', color: '#fff',
              }}>
                <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                  {categories[0].name}
                </h3>
                <span style={{
                  display: 'inline-block', padding: '8px 24px', border: '1px solid #fff',
                  borderRadius: '20px', fontSize: '13px', color: '#fff', cursor: 'pointer',
                  transition: 'all 0.2s', backgroundColor: 'rgba(0,0,0,0.2)',
                }}>
                  Tìm hiểu
                </span>
              </div>
            </div>
          )}
          {/* 2 ảnh nhỏ bên phải */}
          {categories[1] && (
            <div 
              style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate('/category/' + categories[1].id)}
            >
              <img
                src={categories[1].image ? (categories[1].image.startsWith('http') ? categories[1].image : `/doan/${categories[1].image}`) : '//bizweb.dktcdn.net/100/351/580/themes/714586/assets/module_banner2.png?1705464185330'}
                alt={categories[1].name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#fff' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                  {categories[1].name}
                </h3>
                <span style={{
                  display: 'inline-block', padding: '6px 20px', border: '1px solid #fff',
                  borderRadius: '20px', fontSize: '12px', color: '#fff', cursor: 'pointer',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }}>
                  Tìm hiểu
                </span>
              </div>
            </div>
          )}
          {categories[2] && (
            <div 
              style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate('/category/' + categories[2].id)}
            >
              <img
                src={categories[2].image ? (categories[2].image.startsWith('http') ? categories[2].image : `/doan/${categories[2].image}`) : '//bizweb.dktcdn.net/100/351/580/themes/714586/assets/module_banner3.png?1705464185330'}
                alt={categories[2].name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#fff' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
                  {categories[2].name}
                </h3>
                <span style={{
                  display: 'inline-block', padding: '6px 20px', border: '1px solid #fff',
                  borderRadius: '20px', fontSize: '12px', color: '#fff', cursor: 'pointer',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }}>
                  Tìm hiểu
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== 3. KHÁM PHÁ MENU (background hạt cà phê, sản phẩm 2 cột) ===== */}
      <div style={{
        backgroundImage: 'url(//bizweb.dktcdn.net/100/351/580/themes/714586/assets/bg-section.jpg?1705464185330)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '50px 0 60px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{
              color: '#fff', fontSize: '34px', fontWeight: 400, margin: '0 0 8px',
              fontStyle: 'italic', fontFamily: "'Georgia', serif",
            }}>
              Khám phá menu
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
              Có gì đặc biệt ở đây
            </p>
          </div>

          {error && (
            <div style={{ color: '#fca5a5', padding: '12px', backgroundColor: 'rgba(220,38,38,0.2)', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: GOLD }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>☕</div>
              Đang tải menu...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.5)' }}>
              Chưa có sản phẩm nào.
            </div>
          ) : (
            <>
              {/* Products in 2-column layout, each item = image + name + price + desc */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '18px 60px',
              }}>
                {products.slice(0, 7).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate('/product/' + p.id)}
                  >
                    {/* Product image (round) */}
                    <div style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(200,169,110,0.3)' }}>
                      {p.image ? (
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>☕</div>
                      )}
                    </div>
                    {/* Product info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <h3 style={{ color: GOLD, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>
                          {p.name}
                        </h3>
                        <span style={{ color: GOLD, fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                          {new Intl.NumberFormat('vi-VN').format(Number(p.sale_price || p.price))}₫
                        </span>
                      </div>
                      {/* Dashed line */}
                      <div style={{ borderBottom: '1px dashed rgba(200,169,110,0.4)', margin: '6px 0 8px' }} />
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: 1.5, margin: 0 }}>
                        {(p as any).description || 'Thức uống đặc biệt được pha chế từ nguyên liệu tươi ngon nhất.'}
                      </p>
                      {addingId === p.id && (
                        <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 700, marginTop: '4px', display: 'inline-block' }}>
                          ✓ Đã thêm vào giỏ!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* "Xem thêm menu" button */}
              <div style={{ textAlign: 'center', marginTop: '36px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  style={{
                    padding: '10px 32px',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: '4px',
                    background: 'transparent',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.5px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = '#1a0f00'; e.currentTarget.style.borderColor = GOLD; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
                >
                  Xem thêm menu
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== 4. SẢN PHẨM NỔI BẬT (grid cards) ===== */}
      {products.length > 6 && (
        <div style={{ backgroundColor: '#f5f0ea', padding: '50px 0 60px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '28px', color: '#c8a96e', margin: '0 0 6px', fontWeight: 'bold' }}>
                Coffee là hương vị của bạn
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Có gì bất ngờ tại đây</p>
            </div>
            
            {/* Products Card style */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {products.slice(0, 4).map(p => {
                const rpPrice = Number(p.sale_price || p.price);
                const rpOrigPrice = Number(p.price);
                const rDiscount = p.sale_price && Number(p.sale_price) < rpOrigPrice;

                return (
                  <div key={p.id} style={{ minWidth: '220px' }}>
                    <div
                      style={{
                        position: 'relative', backgroundColor: '#fff', border: '1px solid #ebebeb',
                        transition: 'box-shadow 0.3s ease', paddingBottom: '20px',
                        display: 'flex', flexDirection: 'column', cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { 
                        const target = e.currentTarget as HTMLDivElement;
                        target.style.transform = 'translateY(-5px)'; 
                        target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'; 
                        const actions = target.querySelector('.product-actions') as HTMLDivElement;
                        if (actions) {
                          actions.style.opacity = '1';
                          actions.style.visibility = 'visible';
                        }
                      }}
                      onMouseLeave={(e) => { 
                        const target = e.currentTarget as HTMLDivElement;
                        target.style.transform = ''; 
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
                            onClick={(e) => { e.stopPropagation(); navigate('/product/' + p.id); }}
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
                              handleAdd(p);
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
        </div>
      )}
      {/* ===== 6. TIN TỨC ===== */}
      <div style={{ backgroundColor: '#efebe4', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '30px', color: '#e7b557', margin: '0 0 10px', fontWeight: 'bold' }}>
              Tin tức
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Mỗi tuần là mỗi một câu chuyện ấm áp, mỗi tuần là một câu chuyện tình. Nào cùng thưởng thức cà phê và đọc nhé!
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {newsList.length === 0 && !loading && (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#666' }}>Chưa có tin tức nào.</div>
            )}
            {[...newsList]
              .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
              .slice(0, 3)
              .map(news => {
              const imageUrl = news.image 
                ? (news.image.startsWith('http') ? news.image : `/doan/${news.image}`)
                : 'https://via.placeholder.com/400x250?text=No+Image';
                
              const displayDate = news.created_at 
                ? new Date(news.created_at.replace(' ', 'T')).toLocaleDateString('vi-VN') 
                : 'Vừa xong';

              return (
                <div 
                  key={news.id} 
                  style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                  onClick={() => navigate(`/news/${news.id}`)}
                >
                  <div style={{ position: 'relative', height: '220px' }}>
                    <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={news.title} />
                    <div style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#e7b557', color: '#fff', padding: '4px 12px', fontSize: '12px', borderRadius: '4px', fontWeight: 'bold' }}>
                      🕒 {displayDate}
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>{news.title}</h3>
                    <p style={{ 
                      color: '#666', 
                      fontSize: '13px', 
                      lineHeight: 1.6, 
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {news.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== 7. KHÁCH HÀNG NÓI GÌ ===== */}
      <div style={{ 
        position: 'relative', padding: '60px 20px', color: '#fff', textAlign: 'center',
        background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('//bizweb.dktcdn.net/thumb/grande/100/351/580/themes/714586/assets/bg-section-danhgia.jpg?1705464185330') center/cover no-repeat`
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
           <h2 style={{ fontSize: '32px', margin: '0 0 10px', fontWeight: 'normal' }}>Khách hàng nói gì</h2>
           <p style={{ fontSize: '14px', margin: '0 0 40px', opacity: 0.8 }}>1500+ Khách hàng hài lòng</p>
           
           <img src="//bizweb.dktcdn.net/thumb/small/100/351/580/themes/714586/assets/avatar-testimonial1.jpg?1705464185330" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #e7b557', margin: '0 auto 15px' }} alt="Ngô Thanh Vân" />
           <h3 style={{ fontSize: '20px', margin: '0 0 15px', color: '#e7b557' }}>Ngô Thanh Vân</h3>
           <p style={{ fontSize: '15px', lineHeight: 1.8, fontStyle: 'italic', opacity: 0.9 }}>
              Cà phê đúng gu, thức uống ngon và khá đặc biệt hơn nữa dessert ở đây luôn là loại vừa ý với mình nhất. IziCoffee luôn làm cho mọi giác quan của mình kích thích tối đa.
           </p>
           <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' }}>
             <div style={{ width: '30px', height: '6px', backgroundColor: '#e7b557', borderRadius: '3px' }}></div>
             <div style={{ width: '10px', height: '6px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '3px' }}></div>
             <div style={{ width: '10px', height: '6px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '3px' }}></div>
           </div>
        </div>
      </div>

      {/* ===== 8. VÌ SAO CHỌN CHÚNG TÔI ===== */}
      <div style={{ backgroundColor: '#fff', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#e7b557', marginBottom: '8px' }}>
            Vì sao nên chọn HaluCafe
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '50px' }}>
            Không những mang đến sự tuyệt vời thông qua các thức uống bí mật mà hơn thế nữa là<br/>cảm giác bạn tận hưởng được chỉ khi đến với Halu Cafe.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {[
              { icon: '//bizweb.dktcdn.net/100/351/580/themes/714586/assets/image-feature1.png?1705464185330', title: 'COFFEE NGUYÊN CHẤT', desc: 'Hạt cà phê được thu hoạch và rang xay theo quy trình khép kín đúng công thức đặc biệt đảm bảo tính nguyên chất.' },
              { icon: '//bizweb.dktcdn.net/100/351/580/themes/714586/assets/image-feature2.png?1705464185330', title: 'PHA CHẾ ĐỘC ĐÁO', desc: 'Bí kíp tạo nên sự độc là trong từng thức uống đó chính là phương pháp pha chế độc đáo của Thanh Tùng Coffee.' },
              { icon: '//bizweb.dktcdn.net/100/351/580/themes/714586/assets/image-feature3.png?1705464185330', title: 'DESSERT ĐẶC BIỆT', desc: 'Các món bánh tráng miệng và hoa quả tại Thanh Tùng Coffee được chế biến theo phong cách Châu Âu với nhiều hương vị khác.' },
            ].map((item) => (
              <div key={item.title} style={{ padding: '0 24px' }}>
                <img src={item.icon} alt={item.title} style={{ height: '70px', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#002540', marginBottom: '15px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
