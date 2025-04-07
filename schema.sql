-- Eliminamos la tabla existente si existe
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;

-- Creamos una única tabla para todos los mensajes
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'bot', 'agent')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    media_url TEXT,
    metadata JSONB
);

-- Creamos un índice para búsquedas rápidas por número de teléfono
CREATE INDEX idx_phone_number ON messages(phone_number);

-- Creamos un índice para ordenar por fecha
CREATE INDEX idx_created_at ON messages(created_at); 