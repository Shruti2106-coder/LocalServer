import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock, ExternalLink } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!socket || !user) return;
    const channel = `notification_${user._id}`;
    socket.on(channel, () => {
      fetchNotifs();
    });
    return () => {
      socket.off(channel);
    };
  }, [socket, user]);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleClickItem = (notif) => {
    if (notif.link) {
      navigate(notif.link);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(38,53,42,0.08)' }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#26352A' }}>Notifications</span>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: '#26352A', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '24px 8px', textAlign: 'center', color: '#7E8D80', fontSize: '0.88rem' }}>
            No notifications right now
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif._id}
              className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
              onClick={() => handleClickItem(notif)}
              style={{ cursor: notif.link ? 'pointer' : 'default' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: notif.isRead ? 600 : 700, fontSize: '0.88rem', color: '#26352A' }}>
                  {notif.title}
                </span>
                {!notif.isRead && (
                  <button
                    onClick={(e) => handleMarkRead(notif._id, e)}
                    title="Mark as read"
                    style={{ background: 'none', border: 'none', color: '#5C6B5E', cursor: 'pointer' }}
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#5C6B5E', margin: '2px 0 0 0' }}>
                {notif.message}
              </p>
              <span style={{ fontSize: '0.72rem', color: '#7E8D80' }}>
                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
