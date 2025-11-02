# Configuración de RapidAPI api-football-v1

## Pasos para configurar RapidAPI

Si tienes credenciales de RapidAPI pero obtienes error "You are not subscribed to this API", sigue estos pasos:

### 1. Verificar tu suscripción en RapidAPI

1. Ve a: https://rapidapi.com/hub
2. Inicia sesión en tu cuenta
3. Busca: **api-football** o **API-Sports**
4. Verifica que tengas una suscripción activa (puede ser gratuita)

### 2. Configurar en .env

Asegúrate de tener estas variables en tu `.env`:

```env
RAPIDAPI_KEY=tu_api_key_aqui
RAPIDAPI_HOST=api-football-v1.p.rapidapi.com
```

### 3. Obtener tu API Key

1. Ve a: https://rapidapi.com/hub
2. Haz clic en tu perfil (arriba derecha)
3. Selecciona **My Apps** o **Dashboard**
4. Copia tu **X-RapidAPI-Key** (empieza con algo como `abc123...`)
5. Pégalo en `.env` como `RAPIDAPI_KEY`

### 4. Verificar la suscripción al endpoint

Si obtienes error 403:

1. Ve a: https://rapidapi.com/api-sports/api/api-football
2. Haz clic en **Subscribe to Test**
3. Selecciona el plan (puede ser **Basic** que es gratuito)
4. Confirma la suscripción

### 5. Verificar que funciona

Ejecuta:

```bash
npm run sync-events
```

Deberías ver:

```
✅ Using RapidAPI api-football-v1 (real-time data)
✅ Fetched X matches from RapidAPI
```

## Alternativas si RapidAPI no está disponible

### Opción 1: Football-Data.org

1. Regístrate en: https://www.football-data.org/
2. Obtén tu API key (gratuita)
3. Añade a `.env`:

```env
FOOTBALL_DATA_API_KEY=tu_key_aqui
```

### Opción 2: Usar Mock Matches

Si no tienes acceso a ninguna API, el sistema usará automáticamente eventos mock generados:

```bash
npm run sync-events
```

Esto generará eventos con fechas futuras automáticamente.

## Troubleshooting

### Error: "You are not subscribed to this API"

- ✅ Verifica que tengas suscripción activa en RapidAPI
- ✅ Verifica que tu API key sea correcta
- ✅ Intenta suscribirte nuevamente al endpoint

### Error: "Authentication failed"

- ✅ Verifica que `RAPIDAPI_KEY` esté en `.env`
- ✅ Verifica que no tenga espacios o caracteres extra
- ✅ Reinicia el servidor después de cambiar `.env`

### Error: "Rate limit exceeded"

- ✅ Espera unos minutos antes de reintentar
- ✅ Considera actualizar tu plan en RapidAPI

