# Sistema de Entradas (Tickets) - Documentación

## 📋 Resumen del Sistema

Sistema completo de compra y validación de entradas con:
- ✅ Integración con Stripe para pagos
- ✅ Generación de QR codes únicos
- ✅ Validación de entradas en tiempo real
- ✅ Dashboard de organizadores

## 🗄️ Base de Datos

### Modelos Creados

#### TicketType
Tipos de entrada para cada evento (General, VIP, Palco, etc.)
- `name`: Nombre del tipo
- `price`: Precio
- `quantity`: Cantidad disponible
- `sold`: Cantidad vendida

#### Ticket
Entradas individuales generadas tras el pago
- `ticketNumber`: Número único (TKT-YYYYMMDD-HHMMSS-XXXXX)
- `qrCode`: Código QR único encriptado
- `qrCodeImage`: Imagen del QR (base64)
- `paymentStatus`: pending, paid, failed, refunded
- `isUsed`: Si la entrada ya fue usada
- `usedAt`: Fecha/hora de uso
- `validatedBy`: ID del organizador que validó

## 🔌 APIs Implementadas

### POST /api/payments/create
Crea un payment intent de Stripe

**Request:**
```json
{
  "eventId": "evt123",
  "ticketTypeId": "tt456",
  "quantity": 2
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 50.00,
  "currency": "eur"
}
```

### POST /api/payments/webhook
Webhook de Stripe (configurar en Stripe Dashboard)

### GET /api/tickets
Obtiene todas las entradas del usuario autenticado

**Response:**
```json
[
  {
    "id": "ticket123",
    "ticketNumber": "TKT-20241102-120000-ABC12",
    "qrCode": "...",
    "qrCodeImage": "data:image/png;base64,...",
    "event": { ... },
    "ticketType": { ... },
    "paymentStatus": "paid",
    "isUsed": false
  }
]
```

### POST /api/tickets/validate
Valida un QR code

**Request:**
```json
{
  "qrCode": "base64_encoded_qr_string"
}
```

**Response (válido):**
```json
{
  "valid": true,
  "ticket": {
    "id": "...",
    "ticketNumber": "...",
    "event": { ... },
    "user": { ... }
  }
}
```

**Response (inválido):**
```json
{
  "valid": false,
  "error": "Ticket already used"
}
```

### PUT /api/tickets/validate
Marca una entrada como usada

**Request:**
```json
{
  "ticketId": "ticket123",
  "validatedBy": "organizer_id"
}
```

## 🔑 Variables de Entorno Necesarias

Añade a tu `.env`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Para producción:
# STRIPE_SECRET_KEY=sk_live_xxx
# STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

## 🚀 Próximos Pasos

1. **Actualizar base de datos:**
   ```bash
   npx prisma db push
   ```

2. **Configurar Stripe:**
   - Crear cuenta en https://stripe.com
   - Obtener API keys (test keys para desarrollo)
   - Configurar webhook en Stripe Dashboard:
     - URL: `https://yourdomain.com/api/payments/webhook`
     - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

3. **Crear tipos de entrada para eventos:**
   - Necesitas crear `TicketType` para cada evento antes de que los usuarios puedan comprar

4. **Implementar UI:**
   - Página de selección de entradas
   - Checkout con Stripe
   - Sección "Mis Entradas" en perfil
   - Dashboard de validación para organizadores

## 📱 UI Pendiente

- [ ] Página de compra de entradas (`/event/[eventId]/buy`)
- [ ] Checkout con Stripe Elements
- [ ] Página "Mis Entradas" (`/my-tickets`)
- [ ] Dashboard de validación (`/organizer/validate`)
- [ ] Componente para mostrar QR codes

