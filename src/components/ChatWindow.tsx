'use client';

import { useEffect, useState, useRef } from 'react';
import { Message, supabase, getMessagesByPhone } from '@/lib/supabase';
import { format } from 'date-fns';
import { FiSend, FiPaperclip, FiMoreVertical } from 'react-icons/fi';

interface ChatWindowProps {
  phoneNumber: string;
}

export default function ChatWindow({ phoneNumber }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phoneNumber) {
      fetchMessages();
      
      // Configurar suscripción en tiempo real a nuevos mensajes
      const messagesSubscription = supabase
        .channel(`messages-changes-${phoneNumber}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages', 
            filter: `phone_number=eq.${phoneNumber}` 
          }, 
          (payload) => {
            console.log('Nuevo mensaje recibido:', payload);
            // Añadir el nuevo mensaje directamente al estado
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `phone_number=eq.${phoneNumber}`
          },
          () => {
            // Si hay una actualización, recargamos todos los mensajes
            fetchMessages();
          }
        )
        .subscribe((status) => {
          console.log(`Estado de suscripción para ${phoneNumber}:`, status);
        });
      
      return () => {
        console.log(`Eliminando suscripción para ${phoneNumber}`);
        supabase.removeChannel(messagesSubscription);
      };
    }
  }, [phoneNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessagesByPhone(phoneNumber);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-whatsapp-teal-green dark:bg-whatsapp-teal-green-dark p-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
            {phoneNumber.slice(-2)}
          </div>
          <div>
            <h2 className="text-white font-medium">{phoneNumber}</h2>
            <p className="text-gray-200 text-xs">
              {messages.length} mensajes
            </p>
          </div>
        </div>
        <button className="text-white">
          <FiMoreVertical size={20} />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 chat-background">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-whatsapp-teal-green"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No hay mensajes
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_type === 'user' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[75%] p-2 px-3 rounded-lg ${
                    message.sender_type === 'user'
                      ? 'bg-whatsapp-message-in dark:bg-whatsapp-message-in-dark'
                      : 'bg-whatsapp-message-out dark:bg-whatsapp-message-out-dark'
                  }`}
                >
                  <p className="text-gray-800 dark:text-gray-100">{message.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {message.sender_type === 'user' ? 'Usuario' : 
                       message.sender_type === 'bot' ? 'Bot' : 'Agente'}
                    </span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(message.created_at)}
                      </span>
                      {message.sender_type !== 'user' && (
                        <span className="ml-1 text-xs text-gray-500">
                          {message.status === 'read' ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="bg-gray-100 dark:bg-gray-800 p-3 flex items-center">
        <button className="text-gray-500 mr-2">
          <FiPaperclip size={20} />
        </button>
        <input
          type="text"
          placeholder="Escribe un mensaje"
          className="flex-1 p-2 bg-white dark:bg-gray-700 rounded-md border-none focus:ring-0 text-gray-800 dark:text-gray-200"
          disabled
        />
        <button className="bg-whatsapp-teal-green text-white p-2 rounded-full ml-2">
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
} 