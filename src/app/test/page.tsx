'use client';

import { useState } from 'react';
import { insertTestMessage } from '@/lib/supabase';
import Link from 'next/link';

export default function TestPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [senderType, setSenderType] = useState<'user' | 'bot' | 'agent'>('user');
  const [status, setStatus] = useState<null | 'success' | 'error'>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !message) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    setLoading(true);
    setStatus(null);
    
    try {
      const result = await insertTestMessage(phoneNumber, message, senderType);
      
      if (result) {
        setStatus('success');
        setMessage(''); // Limpiar el campo de mensaje después de enviar
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Página de Prueba - Insertar Mensajes
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Número de Teléfono
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ej: +123456789"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mensaje
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Escribe tu mensaje aquí..."
              rows={4}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Remitente
            </label>
            <select
              value={senderType}
              onChange={(e) => setSenderType(e.target.value as 'user' | 'bot' | 'agent')}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="user">Usuario</option>
              <option value="bot">Bot</option>
              <option value="agent">Agente</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded-md text-white font-medium ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-whatsapp-teal-green hover:bg-whatsapp-teal-green-dark'
            }`}
          >
            {loading ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>
        
        {status === 'success' && (
          <div className="mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
            Mensaje enviado correctamente
          </div>
        )}
        
        {status === 'error' && (
          <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            Error al enviar el mensaje. Verifica la consola para más detalles.
          </div>
        )}
        
        <div className="mt-6">
          <Link href="/" className="text-whatsapp-teal-green hover:underline">
            Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
} 