import { useState } from 'react';
import { PlusIcon, MessageIcon, TrashIcon, EditIcon, SettingsIcon, LogOutIcon, CloseIcon } from './Icons';

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onOpenSettings,
  onLogout,
  isOpen,
  onClose,
  userEmail
}) {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const startEditing = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingName(chat.name);
  };

  const saveEdit = () => {
    if (editingName.trim()) {
      onRenameChat(editingChatId, editingName.trim());
    }
    setEditingChatId(null);
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed md:relative z-50 h-full w-72 
        glass-dark flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Chats
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="glass-button-secondary p-2 rounded-lg"
              title="New Chat"
            >
              <PlusIcon />
            </button>
            <button
              onClick={onClose}
              className="glass-button-secondary p-2 rounded-lg md:hidden"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => {
                onSelectChat(chat.id);
                onClose?.();
              }}
              className={`
                group flex items-center gap-3 p-3 rounded-xl cursor-pointer
                transition-all duration-200
                ${currentChatId === chat.id 
                  ? 'bg-indigo-500/20 border border-indigo-500/30' 
                  : 'hover:bg-white/5'}
              `}
            >
              <MessageIcon />
              {editingChatId === chat.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-transparent border-b border-indigo-400 outline-none px-1"
                  autoFocus
                />
              ) : (
                <span className="flex-1 truncate text-sm">{chat.name}</span>
              )}
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => startEditing(chat, e)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="text-xs text-white/40 truncate px-2 mb-2">
            {userEmail}
          </div>
          <button
            onClick={onOpenSettings}
            className="glass-button-secondary w-full py-2.5 flex items-center justify-center gap-2 rounded-xl"
          >
            <SettingsIcon />
            <span>Settings</span>
          </button>
          <button
            onClick={onLogout}
            className="glass-button-secondary w-full py-2.5 flex items-center justify-center gap-2 rounded-xl text-red-400 hover:bg-red-500/10"
          >
            <LogOutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
