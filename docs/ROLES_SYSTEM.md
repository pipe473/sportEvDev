# 🔐 Sistema de Roles y Permisos

## 📋 Resumen

El sistema implementa dos roles principales:
- **User (Usuario)**: Rol por defecto, puede comprar entradas y ver sus tickets
- **Organizer (Organizador)**: Puede crear eventos, gestionar tipos de entrada y validar tickets

---

## 👥 Roles Disponibles

### 1. User (Usuario) - Rol por defecto

**Permisos:**
- ✅ Ver eventos públicos
- ✅ Comprar entradas
- ✅ Ver sus propias entradas (`/api/tickets`)
- ✅ Ver QR codes de sus tickets
- ✅ Validar sus propios tickets (verificar estado)
- ❌ Crear eventos
- ❌ Gestionar tipos de entrada
- ❌ Marcar tickets como usados
- ❌ Cambiar roles de usuarios

### 2. Organizer (Organizador)

**Permisos:**
- ✅ Todas las funcionalidades de User
- ✅ Crear eventos (`POST /api/organizer/events`)
- ✅ Ver todos los eventos (con estadísticas)
- ✅ Crear tipos de entrada (`POST /api/organizer/events/[eventId]/ticket-types`)
- ✅ Gestionar tipos de entrada
- ✅ Validar tickets y marcarlos como usados (`POST /api/organizer/validate`)
- ✅ Ver estadísticas de validación (`GET /api/organizer/validate/stats`)
- ✅ Cambiar roles de usuarios (`PUT /api/admin/users/[userId]/role`)

---

## 🗄️ Base de Datos

### Modelo User - Campo role

```prisma
model User {
  ...
  role String @default("user") // "user" or "organizer"
  ...
}
```

**Valores posibles:**
- `"user"` - Usuario normal (por defecto)
- `"organizer"` - Organizador de eventos

**Nota:** Todos los usuarios nuevos tienen el rol `"user"` por defecto.

---

## 🔧 Utilidades de Autenticación

**Archivo:** `lib/auth.ts`

### Funciones Disponibles:

#### `getAuthenticatedUser()`
Obtiene el usuario autenticado con su rol.

```typescript
const user = await getAuthenticatedUser();
// user: { id, email, name, role } | null
```

#### `requireAuth()`
Verifica que el usuario esté autenticado.

```typescript
const user = await requireAuth();
// Lanza error si no está autenticado
```

#### `requireOrganizer()`
Verifica que el usuario sea organizador.

```typescript
const organizer = await requireOrganizer();
// Lanza error si no es organizador
```

#### `requireRole(role)`
Verifica que el usuario tenga un rol específico.

```typescript
const user = await requireRole('organizer');
```

#### `requireAnyRole(roles)`
Verifica que el usuario tenga uno de los roles especificados.

```typescript
const user = await requireAnyRole(['user', 'organizer']);
```

#### `canAccessResource(resourceUserId)`
Verifica si el usuario puede acceder a un recurso.

```typescript
const canAccess = await canAccessResource(ticket.userId);
// Organizers pueden acceder a cualquier recurso
// Users solo pueden acceder a sus propios recursos
```

---

## 🔌 APIs por Rol

### APIs Públicas (Sin autenticación)
- `GET /api/events` - Ver eventos
- `GET /api/events/[eventId]` - Ver detalle de evento
- `GET /api/events/[eventId]/ticket-types` - Ver tipos de entrada disponibles

### APIs para Users
- `GET /api/tickets` - Ver mis entradas
- `POST /api/payments/create` - Crear payment intent
- `POST /api/tickets/validate` - Validar QR (solo verificar, no marcar como usado)

### APIs para Organizers

#### Gestión de Eventos
- `POST /api/organizer/events` - Crear evento
- `GET /api/organizer/events` - Ver todos los eventos (con estadísticas)

#### Gestión de Tipos de Entrada
- `POST /api/organizer/events/[eventId]/ticket-types` - Crear tipo de entrada
- `GET /api/organizer/events/[eventId]/ticket-types` - Ver tipos de entrada (con estadísticas)

#### Validación de Tickets
- `POST /api/organizer/validate` - Validar y marcar ticket como usado
- `GET /api/organizer/validate/stats` - Estadísticas de validación

#### Gestión de Usuarios
- `PUT /api/admin/users/[userId]/role` - Cambiar rol de usuario

---

## 📝 Ejemplos de Uso

### Crear un Evento (Organizer)

```typescript
// POST /api/organizer/events
{
  "name": "Real Madrid vs Barcelona",
  "date": "2025-12-15",
  "time": "20:00",
  "location": "Santiago Bernabéu, Madrid",
  "category": "Fútbol",
  "imageUrl": "/images/event-banners/event01.jpg",
  "alt": "Partido Real Madrid vs Barcelona",
  "purchase_link": "#"
}
```

### Crear Tipo de Entrada (Organizer)

```typescript
// POST /api/organizer/events/[eventId]/ticket-types
{
  "name": "General",
  "price": 25.00,
  "quantity": 100,
  "description": "Entrada general"
}
```

### Validar Ticket (Organizer)

```typescript
// POST /api/organizer/validate
{
  "qrCode": "base64_encoded_qr_string"
}

// Response:
{
  "valid": true,
  "message": "Ticket validated successfully",
  "ticket": {
    "id": "...",
    "ticketNumber": "...",
    "event": { ... },
    "user": { ... },
    "validatedAt": "..."
  }
}
```

### Cambiar Rol de Usuario (Organizer)

```typescript
// PUT /api/admin/users/[userId]/role
{
  "role": "organizer"
}
```

---

## 🔄 Flujo de Trabajo

### Para Organizadores:

1. **Crear Evento**
   - `POST /api/organizer/events` → Crea el evento

2. **Añadir Tipos de Entrada**
   - `POST /api/organizer/events/[eventId]/ticket-types` → Crea tipos de entrada con precios

3. **Usuarios Compran Entradas**
   - Los usuarios ven los tipos disponibles
   - Completan el pago
   - Reciben tickets con QR codes

4. **Validar Entradas en el Evento**
   - `POST /api/organizer/validate` → Escanea QR y valida
   - El sistema marca el ticket como usado

5. **Ver Estadísticas**
   - `GET /api/organizer/validate/stats` → Ver entradas validadas

### Para Usuarios:

1. **Ver Eventos**
   - `GET /api/events` → Ver eventos disponibles

2. **Ver Tipos de Entrada**
   - `GET /api/events/[eventId]/ticket-types` → Ver precios y disponibilidad

3. **Comprar Entrada**
   - `POST /api/payments/create` → Iniciar pago
   - Completar pago con Stripe
   - Recibir ticket con QR code

4. **Ver Mis Entradas**
   - `GET /api/tickets` → Ver todas mis entradas con QR codes

5. **Descargar/Ver QR**
   - El QR code está disponible en cada ticket

---

## 🔐 Seguridad

### Verificaciones Implementadas:

1. **Autenticación**: Todos los endpoints (excepto públicos) requieren autenticación
2. **Autorización**: Se verifica el rol antes de permitir acciones
3. **Validación**: Se valida que los recursos pertenezcan al usuario (excepto organizadores)
4. **Rate Limiting**: (Pendiente de implementar)

### Mejores Prácticas:

- ✅ Usar `requireOrganizer()` para endpoints de organizador
- ✅ Usar `requireAnyRole()` para endpoints accesibles por múltiples roles
- ✅ Validar siempre la propiedad de recursos para usuarios normales
- ✅ Los organizadores tienen acceso completo (usar con precaución)

---

## 🚀 Próximos Pasos

### Pendiente:
- [ ] UI para organizadores (dashboard)
- [ ] UI para que usuarios vean sus tickets
- [ ] Sistema de promoción de usuarios a organizador
- [ ] Logging de acciones de organizadores
- [ ] Permisos más granulares (por ejemplo, organizador solo para ciertos eventos)

---

**Última actualización:** 2025-11-02  
**Versión:** 1.0.0

