# 👤 Guía de Usuario - Sistema de Entradas

## 📋 Índice

- [Para Usuarios](#para-usuarios)
- [Para Organizadores](#para-organizadores)

---

## 👥 Para Usuarios

### Ver Mis Entradas

1. Inicia sesión en la aplicación
2. En el menú superior, haz clic en **"Mis Entradas"** o ve a `/my-tickets`
3. Verás todas tus entradas con:
   - Imagen del evento
   - Información del evento (fecha, hora, ubicación)
   - Tipo de entrada y precio
   - Número de entrada
   - Estado (Activa o Usada)

### Ver y Descargar QR Code

1. En la página "Mis Entradas", haz clic en cualquier entrada
2. Se abrirá un modal con:
   - Detalles completos del evento
   - QR code completo
   - Número de entrada
3. Haz clic en **"Descargar QR"** para guardar la imagen
4. Guarda el QR en tu teléfono para mostrarlo en el evento

### Comprar Entradas

**⚠️ Funcionalidad pendiente de implementar**

---

## 🎫 Para Organizadores

### Convertirse en Organizador

**Opción 1: Usando el script**

```bash
npm run promote-user tu-email@example.com
```

**Opción 2: Usando la API**

Un organizador existente puede promoverte usando:
```
PUT /api/admin/users/[userId]/role
{
  "role": "organizer"
}
```

### Crear Eventos

1. Ve a **"Gestionar"** en el menú o `/organizer/events`
2. Haz clic en **"Crear Evento"**
3. Completa el formulario:
   - Nombre del evento
   - Fecha y hora
   - Ubicación
   - Categoría
   - URL de imagen (opcional)
4. Haz clic en **"Crear"**

### Añadir Tipos de Entrada

1. En la página de gestión de eventos, encuentra el evento
2. Haz clic en **"Añadir"** en la sección "Tipos de Entrada"
3. Completa:
   - Nombre (ej: "General", "VIP")
   - Precio (en euros)
   - Cantidad disponible
   - Descripción (opcional)
4. Haz clic en **"Crear"**

**💡 Puedes crear múltiples tipos de entrada para un mismo evento** (ej: General €25, VIP €50, Palco €100)

### Validar Entradas en el Evento

1. Ve a **"Validar"** en el menú o `/organizer/dashboard`
2. Pega el código QR del usuario en el campo de texto
   - Puedes escanear con una app de QR
   - O pedirle al usuario que te muestre su QR code
3. Haz clic en **"Validar Entrada"** o presiona Enter
4. Verás el resultado:
   - ✅ **Verde**: Entrada válida y marcada como usada
   - ❌ **Rojo**: Entrada inválida (ya usada, no pagada, etc.)

### Ver Estadísticas

En la página de gestión de eventos (`/organizer/events`), puedes ver:
- Cantidad de entradas vendidas por tipo
- Total de entradas vendidas por evento
- Estado de disponibilidad

---

## 🔐 Seguridad

### Para Usuarios:
- ✅ Solo puedes ver tus propias entradas
- ✅ Los QR codes son únicos y no transferibles
- ✅ Una vez usada, la entrada no se puede usar de nuevo

### Para Organizadores:
- ✅ Solo puedes gestionar eventos si eres organizador
- ✅ Solo puedes validar entradas si eres organizador
- ✅ Puedes promover otros usuarios a organizador

---

## ❓ Preguntas Frecuentes

### ¿Cómo sé si soy organizador?
Si ves los enlaces "Validar" y "Gestionar" en el menú superior, eres organizador.

### ¿Puedo transferir mi entrada a otra persona?
No. Las entradas están vinculadas a tu cuenta y no son transferibles.

### ¿Qué pasa si pierdo mi QR code?
Puedes ver y descargar tus QR codes en cualquier momento desde "Mis Entradas".

### ¿Puedo usar mi entrada varias veces?
No. Una vez validada por el organizador, la entrada se marca como usada y no puede usarse de nuevo.

### ¿Cómo promuevo a alguien a organizador?
Necesitas ser organizador primero. Luego usa la API o contacta al administrador del sistema.

---

**Última actualización:** 2025-11-02

