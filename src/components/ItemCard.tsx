import React, { useState, memo } from 'react';
import type { Item } from '../utils/types';
import { Link } from 'react-router-dom';
import { S } from '../styles/theme';

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = memo(({ item }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/item/${item.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          ...S.card,
          borderColor: hovered ? '#333' : '#1e1e1e',
          transform: hovered ? 'translateY(-2px)' : 'none',
        } as React.CSSProperties}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={S.cardTop as React.CSSProperties}>
          <span style={S.badge(item.type as 'found' | 'lost')}>{item.type}</span>
          <span style={{ fontSize: 11, color: '#444' }}>{item.location}</span>
        </div>
        <p style={S.cardTitle as React.CSSProperties}>{item.title}</p>
        <p
          style={{
            ...S.cardDesc,
            WebkitLineClamp: 2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}
        >
          {item.description}
        </p>
        <div style={S.cardMeta as React.CSSProperties}>
          <span style={S.metaChip}>{item.date.slice(0, 10)}</span>
          {item.keywords.slice(0, 2).map((kw, i) => (
            <span key={i} style={S.metaChip}>#{kw}</span>
          ))}
        </div>
      </div>
    </Link>
  );
});

export default ItemCard;