'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FiSearch } from 'react-icons/fi';

interface PhoneConversation {
  id: string;
  phone_number: string;
  last_message_at: string;
  lastMessage?: string;
}

interface ChatListProps {
  conversations: PhoneConversation[];
  selectedPhone: string | null;
  onSelectPhone: (phone: string) => void;
  loading: boolean;
}

export default function ChatList({
  conversations,
  selectedPhone,
  onSelectPhone,
  loading
}: ChatListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<PhoneConversation[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(
        (conversation) => 
          conversation.phone_number.includes(searchTerm) ||
          (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredConversations(filtered);
    }
  }, [conversations, searchTerm]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return format(date, 'HH:mm');
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-2 bg-gray-100 dark:bg-gray-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar o iniciar nuevo chat"
            className="w-full p-2 pl-10 bg-white dark:bg-gray-700 rounded-md border-none focus:ring-0 text-gray-800 dark:text-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiSearch className="absolute left-3 top-3 text-gray-500" />
        </div>
      </div>
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-whatsapp-teal-green"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex justify-center items-center h-24 text-gray-500">
            No se encontraron conversaciones
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-center p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                selectedPhone === conversation.phone_number
                  ? 'bg-gray-200 dark:bg-gray-800'
                  : ''
              }`}
              onClick={() => onSelectPhone(conversation.phone_number)}
            >
              <div className="w-12 h-12 bg-whatsapp-teal-green rounded-full flex items-center justify-center text-white font-bold mr-3">
                {conversation.phone_number.slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="text-gray-900 dark:text-gray-100 font-medium truncate">
                    {conversation.phone_number}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatDate(conversation.last_message_at)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm truncate">
                  {conversation.lastMessage || 'No hay mensajes'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 