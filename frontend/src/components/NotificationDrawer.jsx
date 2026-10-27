import React, { useEffect, useState } from 'react';
import { notificationApi } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotificationDrawer({ isOpen, onClose, onNotificationClick }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    notificationApi
      .getNotifications()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) setNotifications(res.data.notifications || []);
        else setError('Could not load notifications.');
      })
      .catch(() => !cancelled && setError('Could not load notifications.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isOpen, isAuthenticated]);

  async function handleMarkAsRead(id, e) {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden flex justify-end" role="dialog" aria-modal="true" aria-label="Notifications">
      <div className="fixed inset-0 bg-surface-dim/70" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface-container-low border-l border-surface-container-high h-full flex flex-col z-10">
        <div className="p-5 border-b border-surface-container-high flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Notifications</h2>
          <button onClick={onClose} className="p-1.5 rounded-md bg-surface-variant hover:bg-surface-container-highest text-on-surface-variant" aria-label="Close notifications">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <p className="py-12 text-center text-sm text-on-surface-variant" role="status">Loading</p>
          ) : error ? (
            <p role="alert" className="py-12 text-center text-sm text-error">{error}</p>
          ) : notifications.length === 0 ? (
            <p className="py-12 text-center text-sm text-on-surface-variant">You have no notifications.</p>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => onNotificationClick?.(item)}
                className={`p-4 rounded-md border cursor-pointer flex flex-col gap-1.5 ${
                  item.isRead
                    ? 'bg-surface-container/40 border-surface-container-high text-on-surface-variant'
                    : 'bg-surface-container-high/60 border-primary/40 text-on-surface'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold">{item.title}</h3>
                  {!item.isRead && (
                    <button onClick={(e) => handleMarkAsRead(item._id, e)} className="text-xs text-primary font-semibold shrink-0">
                      Mark read
                    </button>
                  )}
                </div>
                <p className="text-sm">{item.message}</p>
                {item.createdAt && (
                  <p className="text-xs text-on-surface-variant">
                    {new Date(item.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
