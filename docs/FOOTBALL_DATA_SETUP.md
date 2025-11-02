# Configuración de Football-Data.org API

## Pasos rápidos

### 1. Registrarse y obtener API Key

1. Ve a: https://www.football-data.org/
2. Haz clic en **"Register"** o **"Sign Up"**
3. Completa el registro (es gratuito)
4. Verifica tu email
5. Inicia sesión y ve a tu **Dashboard**
6. Copia tu **API Token**

### 2. Configurar en .env

Añade esta línea a tu `.env`:

```env
FOOTBALL_DATA_API_KEY=tu_token_aqui
```

### 3. Verificar que funciona

Ejecuta:

```bash
npm run sync-events
```

Deberías ver:

```
✅ Using Football-Data.org API
✅ Fetched X upcoming matches from Football-Data.org
```

## Ventajas de Football-Data.org

- ✅ **Totalmente gratuito** (con límites razonables)
- ✅ **Sin suscripciones** complicadas
- ✅ **Datos oficiales** de competiciones europeas
- ✅ **Muy confiable** y usado por miles de aplicaciones

## Límites del plan gratuito

- 10 solicitudes por minuto
- Perfecto para sincronización diaria o semanal

