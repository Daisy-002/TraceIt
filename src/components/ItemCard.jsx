import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { S } from '../styles/theme';

const ItemCard = memo(({ item }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/item/${item.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          ...S.card,
          borderColor: hovered ? '#333' : '#1e1e1e',
          transform: hovered ? 'translateY(-2px)' : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={S.cardTop}>
          <span style={S.badge(item.type)}>{item.type}</span>
          <span style={{ fontSize: 11, color: '#444' }}>{item.location}</span>
        </div>

        <p style={S.cardTitle}>{item.title}</p>

        <p style={{
          ...S.cardDesc,
          WebkitLineClamp: 2,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {item.description}
        </p>

        <div style={S.cardMeta}>
          <span style={S.metaChip}>{item.date ? item.date.slice(0, 10) : ''}</span>
          {item.keywords && item.keywords.slice(0, 2).map((keyword, i) => (
            <span key={i} style={S.metaChip}>#{keyword}</span>
          ))}
        </div>
      </div>
    </Link>
  );
});

export default ItemCard;