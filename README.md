# WhatsApp Interface

Una interfaz web para visualizar las conversaciones de tu chatbot de WhatsApp.

## Requisitos previos

- Node.js v16 o superior
- npm o yarn
- Una cuenta de Supabase con la tabla ya configurada

## Configuración

1. Clona este repositorio
2. Instala las dependencias:

```bash
npm install
# o
yarn install
```

3. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
```

## Estructura de la base de datos

El proyecto requiere que tengas la siguiente tabla en Supabase:

### Tabla `messages`

```sql
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
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Producción

Para construir la aplicación para producción:

```bash
npm run build
npm start
# o
yarn build
yarn start
```

## Características

- Visualización de conversaciones en tiempo real agrupadas por número de teléfono
- Interfaz similar a WhatsApp
- Modo oscuro
- Búsqueda de conversaciones
- Visualización de mensajes en tiempo real
- Diseño responsive para móviles
- Etiquetado de mensajes por tipo de remitente (usuario, bot, agente)

## Integración con n8n

En tu flujo de n8n, deberás almacenar cada mensaje en la tabla `messages` con los campos adecuados:

Ejemplo de código para n8n (JavaScript):

```javascript
// Cuando recibas un mensaje de WhatsApp
const phone = $node["WhatsApp"].json.from;

// Almacenar el mensaje del usuario
await $supabase
  .from('messages')
  .insert({
    phone_number: phone,
    sender_type: 'user',
    message: $node["WhatsApp"].json.body
  });

// Después de que el bot responda
await $supabase
  .from('messages')
  .insert({
    phone_number: phone,
    sender_type: 'bot',
    message: $node["AI Response"].json.message
  });
``` 