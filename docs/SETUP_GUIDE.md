# 🚀 Guía de Configuración - Sistema de Entradas

## 📋 Requisitos Previos

- ✅ Node.js instalado
- ✅ MongoDB configurado
- ✅ Proyecto Next.js funcionando
- ✅ Variables de entorno configuradas (`.env`)

---

## 🔧 Paso 1: Instalar Dependencias

Las dependencias ya están instaladas, pero si necesitas reinstalar:

```bash
npm install --legacy-peer-deps stripe qrcode @types/qrcode uuid @types/uuid
```

**Verificar instalación:**
```bash
npm list stripe qrcode uuid
```

---

## 🗄️ Paso 2: Actualizar Base de Datos

### 2.1 Generar Prisma Client

```bash
npx prisma generate
```

**Salida esperada:**
```
✔ Generated Prisma Client (v6.6.0)
```

### 2.2 Aplicar Schema a Base de Datos

```bash
npx prisma db push
```

**⚠️ IMPORTANTE:** Esto modificará tu base de datos. Asegúrate de tener backup si es necesario.

**Salida esperada:**
```
✔ The following models have been created:
  - TicketType
  - Ticket

✔ Indexes have been created:
  - Ticket.eventId
  - Ticket.userId
```

### 2.3 Verificar Schema

```bash
npx prisma studio
```

Abre http://localhost:5555 y verifica que las tablas se crearon correctamente.

---

## 💳 Paso 3: Configurar Stripe

### 3.1 Crear Cuenta en Stripe

1. Ve a: https://stripe.com
2. Crea una cuenta (o inicia sesión si ya tienes)
3. Completa la verificación de identidad si es necesario

### 3.2 Obtener API Keys de Test

1. En el Dashboard de Stripe, ve a **Developers** > **API keys**
2. Copia tu **Secret key** (empieza con `sk_test_`)
3. Copia tu **Publishable key** (empieza con `pk_test_`)

### 3.3 Configurar Webhook

1. En Stripe Dashboard, ve a **Developers** > **Webhooks**
2. Haz clic en **Add endpoint**
3. Para desarrollo local, usa Stripe CLI (ver sección 3.4)
4. Para producción, configura:
   - **Endpoint URL:** `https://yourdomain.com/api/payments/webhook`
   - **Description:** "SportEv Tickets Webhook"
   - **Events to send:**
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
5. Guarda el **Signing secret** (empieza con `whsec_`)

### 3.4 Usar Stripe CLI para Desarrollo Local (Opcional)

Para probar webhooks localmente:

```bash
# Instalar Stripe CLI
# macOS:
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3005/api/payments/webhook
```

Esto te dará un `whsec_` temporal para usar en desarrollo.

### 3.5 Añadir Variables a .env

Añade estas líneas a tu archivo `.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**⚠️ IMPORTANTE:**
- No commitees el archivo `.env` a git
- Usa variables de test para desarrollo
- Cambia a variables de producción solo cuando estés listo para deploy

---

## 🎫 Paso 4: Crear Tipos de Entrada (TicketTypes)

Para que los usuarios puedan comprar entradas, necesitas crear `TicketType` para cada evento.

### Opción 1: Usar API (Recomendado)

Crea un endpoint o script para crear TicketTypes:

**Ejemplo de script:** `scripts/create-ticket-types.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Obtener un evento existente
  const event = await prisma.event.findFirst();
  
  if (!event) {
    console.log('No events found. Create events first.');
    return;
  }

  // Crear tipos de entrada
  await prisma.ticketType.createMany({
    data: [
      {
        eventId: event.id,
        name: 'General',
        price: 25.00,
        quantity: 100,
        description: 'Entrada general'
      },
      {
        eventId: event.id,
        name: 'VIP',
        price: 50.00,
        quantity: 20,
        description: 'Entrada VIP con asientos preferenciales'
      }
    ]
  });

  console.log('Ticket types created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Ejecutar:
```bash
npx tsx scripts/create-ticket-types.ts
```

### Opción 2: Usar Prisma Studio

1. Ejecuta `npx prisma studio`
2. Ve a la tabla `TicketType`
3. Crea registros manualmente

---

## ✅ Paso 5: Verificar Configuración

### 5.1 Verificar Conexión con Stripe

Crea un script de prueba:

**Archivo:** `scripts/test-stripe.ts`

```typescript
import { stripe } from '../lib/stripe';

async function test() {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // 10.00 EUR
      currency: 'eur',
    });
    console.log('✅ Stripe connection successful!');
    console.log('Payment Intent ID:', paymentIntent.id);
  } catch (error) {
    console.error('❌ Stripe connection failed:', error);
  }
}

test();
```

Ejecutar:
```bash
npx tsx scripts/test-stripe.ts
```

### 5.2 Verificar Generación de QR

Crea un script de prueba:

**Archivo:** `scripts/test-qr.ts`

```typescript
import { generateTicketQR, generateTicketNumber } from '../lib/qrGenerator';

async function test() {
  const ticketNumber = generateTicketNumber();
  console.log('Ticket Number:', ticketNumber);

  const qr = await generateTicketQR(
    ticketNumber,
    'event123',
    'user456'
  );
  
  console.log('✅ QR generated successfully!');
  console.log('QR Code:', qr.qrCode.substring(0, 50) + '...');
  console.log('QR Image length:', qr.qrCodeImage.length);
}

test();
```

Ejecutar:
```bash
npx tsx scripts/test-qr.ts
```

---

## 🧪 Paso 6: Testing del Flujo Completo

### 6.1 Test Manual del Flujo

1. **Crear Payment Intent:**
   ```bash
   curl -X POST http://localhost:3005/api/payments/create \
     -H "Content-Type: application/json" \
     -d '{
       "eventId": "event_id_aqui",
       "ticketTypeId": "ticket_type_id_aqui",
       "quantity": 1
     }'
   ```

2. **Simular Pago Exitoso (usando Stripe CLI):**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

3. **Verificar que se crearon tickets:**
   ```bash
   curl http://localhost:3005/api/tickets
   ```

4. **Validar QR:**
   ```bash
   curl -X POST http://localhost:3005/api/tickets/validate \
     -H "Content-Type: application/json" \
     -d '{"qrCode": "qr_code_aqui"}'
   ```

---

## 🐛 Troubleshooting

### Error: "STRIPE_SECRET_KEY not found"

- Verifica que `.env` tiene la variable `STRIPE_SECRET_KEY`
- Reinicia el servidor después de cambiar `.env`

### Error: "Invalid webhook signature"

- Verifica que `STRIPE_WEBHOOK_SECRET` es correcto
- Si usas Stripe CLI local, usa el `whsec_` que te muestra

### Error: "Ticket type not found"

- Asegúrate de crear TicketTypes para los eventos
- Verifica que el `ticketTypeId` existe en la BD

### Error: "Only X tickets available"

- El tipo de entrada está agotado
- Reduce la cantidad o crea más entradas disponibles

---

## 📚 Recursos Adicionales

- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de QRCode](https://www.npmjs.com/package/qrcode)

---

**Última actualización:** 2025-11-02

