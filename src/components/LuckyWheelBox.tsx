import React, { useState, useRef, useEffect } from 'react';
import { Gift, X } from 'lucide-react';
import './LuckyWheelBox.css';
import API_BASE_URL from '../services/config';

interface Sector {
  id: string;
  label: string;
  type: string;
  value: any;
  color: string;
}

export default function LuckyWheelBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<string | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSectors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && canvasRef.current && sectors.length > 0) {
      drawWheel();
    }
  }, [isOpen, sectors]);

  const fetchSectors = async () => {
    const token = localStorage.getItem('token');
    if (!token) return; // Must login

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/lucky_wheel.php?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSectors(data.data);
      }
    } catch (err) {
      console.error('Error fetching lucky wheel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || sectors.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const arc = (2 * Math.PI) / sectors.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    sectors.forEach((sector, i) => {
      const angle = i * arc;
      
      // Draw slice
      ctx.beginPath();
      ctx.fillStyle = sector.color || '#fff';
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.fill();
      
      // Draw border
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(
        centerX + Math.cos(angle + arc / 2) * (radius * 0.7),
        centerY + Math.sin(angle + arc / 2) * (radius * 0.7)
      );
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      
      if (sector.label.length > 8) {
        ctx.fillText(sector.label.substring(0, 8) + '...', 0, 0);
      } else {
        ctx.fillText(sector.label, 0, 0);
      }
      ctx.restore();
    });
  };

  const submitSpinResult = async (wonSector: Sector) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/lucky_wheel.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sector: wonSector })
      });
      const data = await res.json();
      if (data.success) {
        setPrize(data.message);
        // Trigger global event to refresh user data (points, etc.) in other components
        window.dispatchEvent(new CustomEvent('userDataUpdated'));
      } else {
        setPrize('Lỗi: ' + data.message);
      }
    } catch (err) {
      setPrize('Lỗi kết nối máy chủ.');
    }
  };

  const handleSpin = () => {
    if (isSpinning || sectors.length === 0) return;
    setPrize(null);
    setIsSpinning(true);

    // 1. Pick the winner BEFORE spinning
    const winIndex = Math.floor(Math.random() * sectors.length);
    const wonSector = sectors[winIndex];

    // 2. Calculate degrees
    const arcDeg = 360 / sectors.length;
    // The top pointer is at 270 degrees relative to canvas 0 (3 o'clock)
    // To land center of winIndex on top: kim (12h) = 270 deg
    const rotationNeeded = (270 - (winIndex + 0.5) * arcDeg + 360) % 360;

    // 3. Number of spins
    const extraSpins = 8;
    
    // Calculate final rotation
    const currentRotation = rotation % 360;
    const amountToRotate = (rotationNeeded - currentRotation + 360) % 360 + (extraSpins * 360);
    const nextRotation = rotation + amountToRotate;

    // UPDATE STATE
    setRotation(nextRotation);

    // SIDE EFFECT
    setTimeout(() => {
      setIsSpinning(false);
      submitSpinResult(wonSector);
    }, 3050); // Small buffer for animation end
  };

  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="luckywheel-container">
      {isOpen ? (
        <div className="luckywheel-window">
          <div className="luckywheel-header">
            <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Gift size={20}/> Vòng Quay May Mắn
            </h3>
            <button className="luckywheel-close" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {!isLoggedIn ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#555' }}>
              <Gift size={40} style={{ margin: '0 0 15px', color: '#f59e0b', opacity: 0.5 }} />
              <p>Vui lòng đăng nhập để tham gia quay thưởng nhé!</p>
            </div>
          ) : loading ? (
            <div style={{ padding: '30px', textAlign: 'center' }}>Đang tải...</div>
          ) : sectors.length > 0 ? (
            <>
              <div className="wheel-canvas-container">
                <div className="wheel-pointer"></div>
                <canvas 
                  ref={canvasRef} 
                  width={250} 
                  height={250}
                  className={`wheel-canvas ${isSpinning ? 'spinning' : ''}`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </div>

              <div>
                <button 
                  className="spin-btn" 
                  onClick={handleSpin}
                  disabled={isSpinning}
                >
                  {isSpinning ? 'Đang quay...' : 'QUAY NGAY'}
                </button>
              </div>

              {prize && !isSpinning && (
                <div style={{ padding: '0 15px', marginTop: '15px', color: '#b45309', fontWeight: 'bold' }}>
                  {prize}
                </div>
              )}
            </>
          ) : (
             <div style={{ padding: '30px', textAlign: 'center' }}>Vòng quay đang bảo trì!</div>
          )}
        </div>
      ) : (
        <button className="luckywheel-toggle" onClick={() => setIsOpen(true)} title="Vòng quay may mắn!" style={{ animationPlayState: isSpinning ? 'paused' : 'running' }}>
          <Gift size={28} />
        </button>
      )}
    </div>
  );
}
