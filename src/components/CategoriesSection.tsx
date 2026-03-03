import React from 'react';
import { CategoryApi } from '../services/categoriesService';

type CategoriesSectionProps = {
  categories: CategoryApi[];
  onCategoryClick?: (categoryId: number) => void;
};

const getCategoryIcon = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('cafe') || n.includes('cà phê') || n.includes('coffee')) return '☕';
  if (n.includes('trà') || n.includes('tea')) return '🍵';
  if (n.includes('nước ép') || n.includes('juice')) return '🥤';
  if (n.includes('cocktail') || n.includes('sinh tố')) return '🍹';
  if (n.includes('sữa') || n.includes('milk')) return '🥛';
  if (n.includes('bánh') || n.includes('cake')) return '🍰';
  if (n.includes('bia') || n.includes('beer')) return '🍺';
  if (n.includes('rượu') || n.includes('wine')) return '🍷';
  if (n.includes('combo')) return '🎁';
  if (n.includes('đồ ăn') || n.includes('food')) return '🍽️';
  return '🥂';
};

export default function CategoriesSection({
  categories,
  onCategoryClick,
}: CategoriesSectionProps): React.ReactElement {
  if (categories.length === 0) return <></>;

  return (
    <div style={{ backgroundColor: '#1e1008', borderBottom: '1px solid #3d2b10', padding: '0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {categories.slice(0, 10).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick && onCategoryClick(cat.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '14px 24px',
                background: 'none',
                border: 'none',
                borderBottom: '3px solid transparent',
                color: '#d4a96a',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                minWidth: '90px',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f5c97a';
                e.currentTarget.style.borderBottomColor = '#c8a96e';
                e.currentTarget.style.backgroundColor = 'rgba(200,169,110,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#d4a96a';
                e.currentTarget.style.borderBottomColor = 'transparent';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '24px' }}>{getCategoryIcon(cat.name)}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
