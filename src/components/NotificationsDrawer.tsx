import React from 'react';
import { ActivityItem } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ActivityItem[];
  onClearAll: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#c0c7d6]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005daa]">notifications</span>
              <h3 className="font-headline-sm text-[#191c1e]">Notificações</h3>
            </div>
            <button onClick={onClose} className="text-[#707785] hover:text-[#191c1e] p-1 rounded-md">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#707785]">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#c0c7d6]">notifications_off</span>
              <p className="text-body-sm font-medium">Nenhuma notificação não lida.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 bg-[#f2f4f6] rounded-lg border border-[#c0c7d6]/50 hover:bg-[#eceef0] transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                        n.color === 'primary'
                          ? 'bg-[#005daa]'
                          : n.color === 'warning'
                          ? 'bg-[#f59e0b]'
                          : 'bg-[#10b981]'
                      }`}
                    />
                    <div>
                      <p className="text-body-sm font-bold text-[#191c1e]">{n.title}</p>
                      <p className="text-[10px] text-[#707785] mt-0.5">{n.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#c0c7d6] mt-6 flex gap-2">
          <button
            onClick={onClearAll}
            className="w-full py-2 bg-[#eff6ff] text-[#005daa] rounded-md font-label-bold text-[12px] hover:bg-[#d4e3ff]"
          >
            Marcar Todas como Lidas
          </button>
        </div>
      </div>
    </div>
  );
};
