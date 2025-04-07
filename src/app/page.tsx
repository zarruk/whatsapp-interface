'use client';

import { useEffect, useState } from 'react';
import { supabase, getLatestMessagesByPhone } from '@/lib/supabase';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';

// Tipo para representar una conversación (agrupación de mensajes por teléfono)
interface PhoneConversation {
  id: string;
  phone_number: string;
  last_message_at: string;
  lastMessage?: string;
}

export default function Home() {
  const [conversations, setConversations] = useState<PhoneConversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar conversaciones inicialmente
    fetchConversations();
    
    // Configurar suscripción en tiempo real a cambios en messages
    const messagesSubscription = supabase
      .channel('table-db-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        (payload) => {
          console.log('Cambio detectado en messages:', payload);
          fetchConversations();
        }
      )
      .subscribe((status) => {
        console.log('Estado de la suscripción:', status);
      });
    
    return () => {
      // Limpiar suscripción al desmontar
      supabase.removeChannel(messagesSubscription);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Obtener la lista de conversaciones (agrupadas por número de teléfono)
      const phoneConversations = await getLatestMessagesByPhone();
      setConversations(phoneConversations);
      
      // Si no hay teléfono seleccionado y tenemos conversaciones, seleccionamos la primera
      if (!selectedPhone && phoneConversations.length > 0) {
        setSelectedPhone(phoneConversations[0].phone_number);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Encontrar la conversación seleccionada
  const selectedConversation = conversations.find(
    conv => conv.phone_number === selectedPhone
  ) || null;

  return (
    <main className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left sidebar - Conversation list */}
      <div className="w-1/3 border-r border-gray-300 dark:border-gray-700 flex flex-col">
        <div className="bg-whatsapp-teal-green dark:bg-whatsapp-teal-green-dark p-3 flex justify-between items-center">
          <h1 className="text-white font-semibold text-xl">WhatsApp Interface</h1>
          <div className="flex items-center">
            <Link 
              href="/test" 
              className="text-white mr-3 text-sm bg-whatsapp-teal-green-dark px-2 py-1 rounded-md hover:bg-opacity-80"
            >
              Modo Prueba
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <ChatList 
          conversations={conversations} 
          selectedPhone={selectedPhone} 
          onSelectPhone={setSelectedPhone} 
          loading={loading}
        />
      </div>
      
      {/* Right side - Chat window */}
      <div className="w-2/3 flex flex-col">
        {selectedPhone ? (
          <ChatWindow phoneNumber={selectedPhone} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">Selecciona una conversación para ver los mensajes</p>
          </div>
        )}
      </div>
    </main>
  );
} 