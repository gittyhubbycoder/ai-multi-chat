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
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Chats
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewChat}
              className="glass-button-secondary p-2.5 rounded-lg"
              title="New Chat"
              aria-label="New Chat"
            >
              <PlusIcon />
            </button>
            <button
              onClick={onClose}
              className="glass-button-secondary p-2.5 rounded-lg md:hidden"
              aria-label="Close sidebar"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-3 space-y-1.5 sm:space-y-2">
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => {
                onSelectChat(chat.id);
                onClose?.();
              }}
              className={`
                group flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer
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
                  className="flex-1 bg-transparent border-b border-indigo-400 outline-none px-1 text-sm"
                  autoFocus
                />
              ) : (
                <span className="flex-1 truncate text-base font-medium">{chat.name}</span>
              )}
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => startEditing(chat, e)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Edit chat name"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  aria-label="Delete chat"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 sm:p-5 border-t border-white/10 space-y-3">
          <div className="text-sm text-white/50 truncate px-2 mb-1 font-medium">
            {userEmail}
          </div>
          <button
            onClick={onOpenSettings}
            className="glass-button-secondary w-full py-3 flex items-center justify-center gap-2 rounded-xl text-base font-medium"
          >
            <SettingsIcon />
            <span>Settings</span>
          </button>
          <button
            onClick={onLogout}
            className="glass-button-secondary w-full py-3 flex items-center justify-center gap-2 rounded-xl text-red-400 hover:bg-red-500/20 text-base font-medium transition-colors"
          >
            <LogOutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
