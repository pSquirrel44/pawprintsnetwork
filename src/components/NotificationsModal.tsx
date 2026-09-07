import React from 'react';
import { X, Bell, CheckCheck, Fish, MessageCircle, UserPlus } from 'lucide-react';
import { NotificationItem } from '../types';
import { playMeowSound, playWoofSound } from '../utils/audio';

interface NotificationsModalProps {
  isDog?: boolean;
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isDog = false,
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const playSound = isDog ? playWoofSound : playMeowSound;

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'treat':
        return <span className="text-sm">🐟</span>;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 brand-color" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 brand-color" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {isDog ? 'Woof Activity' : 'Meow Activity'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSound(1.0);
                onMarkAllAsRead();
              }}
              className="flex items-center gap-1 text-[11px] font-semibold brand-color hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark Read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <p className="text-3xl mb-1">🐾</p>
              <p className="text-xs font-bold">No new activity yet.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                  item.isRead
                    ? 'bg-zinc-50/60 dark:bg-zinc-800/40'
                    : 'brand-muted-bg 50/70 dark:brand-muted-bg 950/30 border border-rose-200/60 dark:border-rose-800/40'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={item.actorAvatar}
                    alt={item.actorName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 p-0.5 rounded-full shadow-xs">
                    {getNotificationIcon(item.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-xs">
                  <p className="text-zinc-800 dark:text-zinc-200 leading-tight">
                    <strong className="text-zinc-900 dark:text-zinc-100 mr-1">
                      @{item.actorHandle}
                    </strong>
                    {item.text}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">{item.timestamp}</span>
                </div>

                {item.postImage && (
                  <img
                    src={item.postImage}
                    alt="Post snippet"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-xl object-cover shrink-0"
                  />
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
