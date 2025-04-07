import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Message {
  id: string;
  phone_number: string;
  sender_type: 'user' | 'bot' | 'agent';
  message: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
  media_url?: string;
  metadata?: any;
}

export interface PhoneConversation {
  id: string;
  phone_number: string;
  last_message_at: string;
  lastMessage?: string;
}

// Funciones de utilidad para trabajar con mensajes
export async function getUniquePhoneNumbers() {
  const { data, error } = await supabase
    .from('messages')
    .select('phone_number')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching phone numbers:', error);
    return [];
  }
  
  // Extraer números de teléfono únicos
  const uniquePhones = Array.from(new Set(data.map(item => item.phone_number)));
  return uniquePhones;
}

export async function getMessagesByPhone(phoneNumber: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('phone_number', phoneNumber)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return data as Message[];
}

export async function getLatestMessagesByPhone(): Promise<PhoneConversation[]> {
  // Obtener todos los números de teléfono únicos
  const phones = await getUniquePhoneNumbers();
  
  if (phones.length === 0) {
    return [];
  }
  
  // Para cada número, obtener el último mensaje
  const latestMessagesPromises = phones.map(async (phone) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) {
      return null;
    }
    
    return {
      phone_number: phone,
      lastMessage: data[0].message,
      last_message_at: data[0].created_at,
      id: phone // Usamos el teléfono como identificador único
    } as PhoneConversation;
  });
  
  const latestMessages = await Promise.all(latestMessagesPromises);
  
  // Filtrar valores nulos y ordenar por fecha del último mensaje
  return latestMessages
    .filter((item): item is PhoneConversation => item !== null)
    .sort((a, b) => 
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );
}

// Función para insertar mensajes de prueba
export async function insertTestMessage(phoneNumber: string, message: string, senderType: 'user' | 'bot' | 'agent' = 'user') {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      phone_number: phoneNumber,
      sender_type: senderType,
      message: message,
      status: 'sent'
    })
    .select();
  
  if (error) {
    console.error('Error insertando mensaje:', error);
    return null;
  }
  
  return data[0];
} 