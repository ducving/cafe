import React from 'react';

export default function Home(): React.ReactElement {
  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    color: '#2c3e50',
    marginBottom: '20px',
    fontSize: '2.5em',
  };

  const textStyle: React.CSSProperties = {
    color: '#555',
    fontSize: '1.2em',
    lineHeight: '1.6',
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Trang Chủ</h1>
      <p style={textStyle}>Chào mừng đến với ứng dụng Cafe!</p>
    </div>
  );
}

