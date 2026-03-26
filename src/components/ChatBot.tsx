import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Trash2 } from 'lucide-react';
import { getGeminiResponse } from '../services/chatService';
import { getImageUrl } from '../services/config';
import { fetchProducts, ProductApi } from '../services/productsService';
import { useCart } from '../user/CartContext';
import './ChatBot.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
  productImages?: string[];
  products?: ProductApi[];
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const DEFAULT_OPTIONS = ["Menu", "Địa chỉ", "Giờ mở cửa", "Khuyến mãi"];

export default function ChatBot() {
  const { addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Xin chào! Mình là Cafe Assistant thông minh. Bạn có thể hỏi bất cứ điều gì về quán hoặc chỉ đơn giản là trò chuyện nhé! ☕✨",
      sender: 'bot',
      timestamp: new Date(),
      options: DEFAULT_OPTIONS
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Call Gemini API
    const botReplyText = await getGeminiResponse(text, chatHistory);

    // Parse images if present in the response (e.g., [IMAGE: url])
    const imageMatches = Array.from(botReplyText.matchAll(/\[IMAGE:\s*(.*?)\]/g));
    const productImages = imageMatches.map(match => match[1]);
    let cleanText = botReplyText.replace(/\[IMAGE:.*?\]/g, '').trim();

    let productsList: ProductApi[] | undefined;
    if (cleanText.includes('[SHOW_PRODUCTS]')) {
      cleanText = cleanText.replace(/\[SHOW_PRODUCTS\]/g, '').trim();
      try {
        productsList = await fetchProducts();
      } catch (err) {
        console.error('Lỗi khi tải menu', err);
      }
    }

    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: cleanText,
      sender: 'bot',
      timestamp: new Date(),
      options: DEFAULT_OPTIONS,
      productImages,
      products: productsList
    };

    setMessages(prev => [...prev, botResponse]);
    setChatHistory(prev => [
      ...prev,
      { role: 'user', parts: [{ text: text }] },
      { role: 'model', parts: [{ text: botReplyText }] }
    ]);
    setIsTyping(false);
  };

  const clearChat = () => {
    if (window.confirm("Bạn có muốn xóa lịch sử trò chuyện?")) {
      setMessages([
        {
          id: Date.now().toString(),
          text: "Lịch sử đã được xóa. Mình có thể giúp gì thêm cho bạn không? 😊",
          sender: 'bot',
          timestamp: new Date(),
          options: DEFAULT_OPTIONS
        }
      ]);
      setChatHistory([]);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={24} />
              </div>
              <div className="chatbot-title">
                <h3>Cafe AI Assistant</h3>
                <p>Luôn sẵn sàng hỗ trợ bạn ⚡</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="chatbot-close" onClick={clearChat} title="Xóa lịch sử">
                <Trash2 size={18} />
              </button>
              <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                <div className={`message ${msg.sender}`}>
                  {msg.productImages && msg.productImages.length > 0 && (
                    <div className={`message-images-grid ${msg.productImages.length > 1 ? 'multi' : 'single'}`}>
                      {msg.productImages.map((imgUrl, idx) => (
                        <div key={idx} className="message-image">
                          <img src={getImageUrl(imgUrl)} alt={`Product ${idx}`} />
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.products && msg.products.length > 0 && (
                    <div className="message-products-list">
                      {msg.products.map(product => (
                        <div key={product.id} className="chatbot-product-card">
                          <img src={getImageUrl(product.image || '')} alt={product.name} className="chatbot-product-img" />
                          <div className="chatbot-product-info">
                            <h4>{product.name}</h4>
                            <p>{Number(product.price).toLocaleString()}đ</p>
                            <button className="chatbot-order-btn" onClick={() => addItem({ ...product, price: Number(product.price) })}>Đặt hàng</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.text && <div className="message-text">{msg.text}</div>}
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.sender === 'bot' && msg.options && (
                  <div className="chatbot-options">
                    {msg.options.map(option => (
                      <button 
                        key={option} 
                        className="option-button"
                        onClick={() => handleSend(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
            {isTyping && (
              <div className="message bot" style={{ width: 'fit-content' }}>
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form 
            className="chatbot-input-area" 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
          >
            <input 
              type="text" 
              className="chatbot-input" 
              placeholder="Hỏi AI bất cứ điều gì..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />
            <button className="chatbot-send" type="submit" disabled={!inputValue.trim() || isTyping}>
              <Send size={20} />
            </button>
          </form>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <MessageCircle size={32} />
        </button>
      )}
    </div>
  );
}

