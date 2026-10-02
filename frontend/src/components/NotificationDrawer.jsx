import React, { useEffect, useState } from 'react';
import { notificationApi } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotificationDrawer({ isOpen, onClose, onNotificationClick }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadNotifications();
    }
  }, [isOpen, isAuthenticated]);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id, e) {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-dim/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-surface-container-low shadow-2xl border-l border-surface-container-high/60 h-full flex flex-col z-10">
        {/* Header */}
        <div className="p-5 border-b border-surface-container-high/60 flex items-center justify-between bg-surface-container/60">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[22px]">
              notifications_active
            </span>
            <h3 className="font-headline-sm text-[18px] font-bold text-on-surface">
              Voyage Dispatch Center
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-variant/60 hover:bg-surface-variant text-on-surface-variant flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant gap-2">
              <span className="material-symbols-outlined text-[28px] animate-spin text-primary">
                sync
              </span>
              <span className="font-body-sm text-sm">Syncing dispatch feeds...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-[40px] text-outline-variant mb-2">
                check_circle
              </span>
              <p className="font-body-md font-medium">All caught up!</p>
              <p className="font-body-sm text-xs mt-1">No active travel alerts right now.</p>
            </div>
          ) : (
            notifications.map(item => {
              const isConfirmed = item.type === 'BOOKING_CONFIRMED';
              const isAi = item.type === 'AI_SUGGESTION';
              return (
                <div
                  key={item._id}
                  onClick={() => onNotificationClick?.(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                    item.isRead
                      ? 'bg-surface-container/40 border-surface-container-high/30 text-on-surface-variant'
                      : 'bg-surface-container-high/60 border-primary/30 text-on-surface shadow-md'
                  }`}
                >
                  {!item.isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary-container" />
                  )}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isConfirmed
                          ? 'bg-secondary-container text-secondary'
                          : isAi
                          ? 'bg-primary-container/20 text-primary'
                          : 'bg-surface-variant text-tertiary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isConfirmed
                          ? 'verified'
                          : isAi
                          ? 'auto_awesome'
                          : 'confirmation_number'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-title-md text-[14px] font-bold text-on-surface truncate">
                        {item.title}
                      </h4>
                      <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-container-highest/30">
                        <span className="font-label-sm text-[10px] text-outline">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {!item.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(item._id, e)}
                            className="font-label-sm text-[11px] text-secondary hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-container-high/60 bg-surface-container/40 text-center font-label-sm text-[11px] text-on-surface-variant">
          End-to-End Encrypted Voyage Dispatch • Active
        </div>
      </div>
    </div>
  );
}
