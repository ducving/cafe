import React, { useState, useEffect } from 'react';
import './MemoryGame.css';

const ICONS = ['☕', '🍰', '🍩', '🍮', '🍵', '🥐'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame(): React.ReactElement {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [win, setWin] = useState(false);

  // Initialize Game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Duplicate icons to create pairs
    const pairedIcons = [...ICONS, ...ICONS];
    // Shuffle
    const shuffledIcons = pairedIcons.sort(() => Math.random() - 0.5);
    
    const initialCards: Card[] = shuffledIcons.map((icon, index) => ({
      id: index,
      icon,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(initialCards);
    setFlippedIndexes([]);
    setMoves(0);
    setWin(false);
  };

  const handleCardClick = (index: number) => {
    // Prevent clicking if 2 cards are already flipped, or card is already matched/flipped
    if (
      flippedIndexes.length === 2 || 
      cards[index].isFlipped || 
      cards[index].isMatched
    ) {
      return;
    }

    const newFlipped = [...flippedIndexes, index];
    setFlippedIndexes(newFlipped);

    // Update Flipped State for clicked card
    setCards(prev => {
      const newCards = [...prev];
      newCards[index].isFlipped = true;
      return newCards;
    });

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      
      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].icon === cards[secondIndex].icon) {
        // Match found
        setTimeout(() => {
          setCards(prev => {
            const newCards = [...prev];
            newCards[firstIndex].isMatched = true;
            newCards[secondIndex].isMatched = true;
            return newCards;
          });
          setFlippedIndexes([]);
        }, 500);
      } else {
        // No match, turn back
        setTimeout(() => {
          setCards(prev => {
            const newCards = [...prev];
            newCards[firstIndex].isFlipped = false;
            newCards[secondIndex].isFlipped = false;
            return newCards;
          });
          setFlippedIndexes([]);
        }, 1000);
      }
    }
  };

  // Check Game Over
  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
      setWin(true);
    }
  }, [cards]);

  return (
    <div className="memory-game-container">
      <h1 className="memory-title">Lật Hình Nhận Thưởng 🎁</h1>
      <p className="memory-subtitle">Tìm tất cả các cặp hình giống nhau để nhận điểm thưởng Cafe!</p>
      
      <div className="game-stats">
        <span>Lượt lật: {moves}</span>
        {win && <span style={{ color: '#16a34a' }}>🎉 Bạn đã chiến thắng!</span>}
      </div>

      <div className="game-board">
        {cards.map((card, index) => (
          <div 
            key={card.id} 
            className={`game-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-front">
              {/* Mặt lưng của thẻ */}
              <span>❓</span>
            </div>
            <div className="card-back">
              {/* Mặt có hình icon */}
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {win && (
        <div className="win-message">
          <h2>Chúc mừng! 🏆</h2>
          <p>Bạn đã hoàn thành trò chơi sau {moves} lượt lật.</p>
          <p style={{ fontWeight: 800, marginTop: '10px' }}>+1.000 Điểm thưởng đã được cộng vào tài khoản của bạn! (Demo)</p>
          <button className="btn-restart" onClick={initializeGame}>
            Chơi Lại
          </button>
        </div>
      )}
    </div>
  );
}
