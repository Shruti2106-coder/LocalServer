import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, CheckCheck, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export const ChatDrawer = ({ booking, isOpen, onClose }) => {
  const { user } = useAuth();
  const { socket, joinBookingRoom, sendChatMessage, emitTyping } = useSocket();
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen || !booking) return;

    setLoading(true);
    joinBookingRoom(booking._id);

    // Fetch message history
    api.get(`/messages/${booking._id}`)
      .then(res => {
        if (res.success) {
          setMessages(res.data);
          setTimeout(scrollToBottom, 100);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Listen for new messages
    if (socket) {
      const handleNewMsg = (newMsg) => {
        if (newMsg.bookingId === booking._id) {
          setMessages(prev => [...prev, newMsg]);
          setTimeout(scrollToBottom, 100);
        }
      };

      const handleTyping = (data) => {
        if (data.bookingId === booking._id && data.userId !== user?._id) {
          setPartnerTyping(data.isTyping);
        }
      };

      socket.on('new_message', handleNewMsg);
      socket.on('user_typing', handleTyping);

      return () => {
        socket.off('new_message', handleNewMsg);
        socket.off('user_typing', handleTyping);
      };
    }
  }, [isOpen, booking, socket]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user || !booking) return;

    const messageText = text.trim();
    setText('');

    const receiverId = user._id === booking.customerId ? booking.providerId : booking.customerId;

    sendChatMessage({
      bookingId: booking._id,
      senderId: user._id,
      senderName: user.name,
      senderRole: user.role,
      receiverId,
      text: messageText
    });

    emitTyping({ bookingId: booking._id, userId: user._id, isTyping: false });
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      emitTyping({ bookingId: booking._id, userId: user?._id, isTyping: true });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTyping({ bookingId: booking._id, userId: user?._id, isTyping: false });
    }, 1500);
  };

  if (!isOpen || !booking) return null;

  const partnerName = user?._id === booking.customerId ? booking.providerName : booking.customerName;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, padding: 0 }}>
        {/* Header */}
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: 'var(--color-dark-olive)'
            }}>
              {partnerName ? partnerName.charAt(0) : 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#26352A' }}>
                {partnerName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#5C6B5E' }}>
                {t('booking_hash')}{booking._id.substring(3)} &bull; {booking.serviceName}
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#26352A' }}>
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ height: 380 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#5C6B5E' }}>
              <Loader2 size={24} className="pulse" />
              <p style={{ fontSize: '0.85rem', marginTop: 8 }}>{t('loading_messages')}</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7E8D80', fontSize: '0.88rem' }}>
              {t('no_messages_yet')}
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === user?._id;
              return (
                <div
                  key={msg._id}
                  className={`chat-bubble ${isMe ? 'chat-bubble-me' : 'chat-bubble-them'}`}
                >
                  <div>{msg.text}</div>
                  <div className="chat-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}

          {partnerTyping && (
            <div style={{ fontStyle: 'italic', fontSize: '0.78rem', color: '#5C6B5E', padding: '4px 8px' }}>
              {partnerName} {t('chat_partner_typing')}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="chat-input-bar">
          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder={`${t('type_message_placeholder')} ${partnerName}...`}
            className="form-input"
            style={{ borderRadius: 'var(--radius-full)' }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="btn btn-primary btn-icon"
            style={{ borderRadius: 'var(--radius-full)', width: 44, height: 44 }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
