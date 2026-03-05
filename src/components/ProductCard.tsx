import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductApi } from '../services/productsService';
import { getImageUrl } from '../services/config';

interface ProductCardProps {
  product: ProductApi;
  onAdd: (product: ProductApi) => void;
  isAdding?: boolean;
}

const GOLD = '#c8a96e';
const DEEP_BROWN = '#3a2415';

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, isAdding }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const price = Number(product.sale_price || product.price);
  const originalPrice = Number(product.price);
  const hasDiscount = product.sale_price && Number(product.sale_price) < originalPrice;
  const discountPct = hasDiscount ? Math.round((1 - Number(product.sale_price) / originalPrice) * 100) : 0;

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: isHovered 
          ? '0 20px 40px rgba(0,0,0,0.12)' 
          : '0 10px 20px rgba(0,0,0,0.05)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        height: '100%',
        border: '1px solid #f0f0f0',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#ff4d4d',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: '100px',
          fontSize: '13px',
          fontWeight: 800,
          zIndex: 10,
          boxShadow: '0 4px 10px rgba(255, 77, 77, 0.3)',
          letterSpacing: '0.5px'
        }}>
          -{discountPct}%
        </div>
      )}

      {/* Image Area */}
      <div style={{ 
        position: 'relative', 
        padding: '24px', 
        backgroundColor: '#fdfbf9',
        overflow: 'hidden',
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Decorative Background Blur */}
        <div style={{
          position: 'absolute',
          width: '120px',
          height: '120px',
          background: `radial-gradient(circle, ${GOLD}22 0%, transparent 70%)`,
          filter: 'blur(20px)',
          zIndex: 0
        }} />

        {product.image ? (
          <img 
            src={getImageUrl(product.image)} 
            alt={product.name} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isHovered ? 'scale(1.15) rotate(5deg)' : 'scale(1)'
            }} 
          />
        ) : (
          <div style={{ fontSize: '80px', position: 'relative', zIndex: 1 }}>☕</div>
        )}

        {/* Hover Overlay Actions */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '0',
          right: '0',
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 5
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`);
            }}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
            }}
            title="Xem chi tiết"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = 'inherit'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            style={{
              padding: '0 20px',
              height: '46px',
              borderRadius: '100px',
              backgroundColor: DEEP_BROWN,
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(58, 36, 21, 0.3)',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = DEEP_BROWN; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {isAdding ? 'Đã thêm' : 'Giỏ hàng'}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div style={{ 
        padding: '24px', 
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{ 
            margin: '0 0 8px', 
            fontSize: '17px', 
            fontWeight: 700, 
            color: DEEP_BROWN,
            letterSpacing: '-0.3px',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {product.name}
          </h3>
          <p style={{ 
            fontSize: '13px', 
            color: '#8c8c8c', 
            margin: '0 0 16px',
            fontStyle: 'italic'
          }}>
            Premium Roasted Coffee
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: 900, 
            color: GOLD,
            letterSpacing: '0.5px'
          }}>
            {new Intl.NumberFormat('vi-VN').format(price)}₫
          </div>
          {hasDiscount && (
            <div style={{ 
              fontSize: '14px', 
              color: '#bbb', 
              textDecoration: 'line-through' 
            }}>
              {new Intl.NumberFormat('vi-VN').format(originalPrice)}₫
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
