# Integración de API de Fútbol

Este proyecto incluye integración con APIs gratuitas de fútbol para obtener eventos actualizados automáticamente.

## APIs Utilizadas

### Prioridad de APIs

El sistema usa las siguientes APIs en orden de prioridad:

1. **RapidAPI api-football-v1** (Recomendado) ⭐
2. **Football-Data.org**
3. **Mock matches** (fallback)

### RapidAPI api-football-v1

**RapidAPI api-football-v1** es la API principal (cuando hay credenciales disponibles):

- ✅ **Datos en tiempo real** actualizados constantemente
- ✅ **Plan gratuito disponible** con límites razonables
- ✅ **Múltiples ligas** y competiciones
- ✅ **Fixtures, resultados, estadísticas**

#### Configuración

Añade tus credenciales al `.env`:

```env
RAPIDAPI_KEY=tu_rapidapi_key_aqui
RAPIDAPI_HOST=api-football-v1.p.rapidapi.com
```

Obtén tu API key gratuita en: https://rapidapi.com/api-sports/api/api-football

### Football-Data.org

**Football-Data.org** es una alternativa confiable:

- **Plan gratuito**: 10 solicitudes por minuto
- **Sin API key requerida** para acceso básico
- **Datos actualizados** de competiciones oficiales
- **Soporte para múltiples ligas**: La Liga, Premier League, Champions League, etc.

#### Obtener API Key (Opcional)

Para aumentar el límite de solicitudes:

1. Visita: https://www.football-data.org/
2. Regístrate gratuitamente
3. Obtén tu API key
4. Añádela al archivo `.env`:

```env
FOOTBALL_DATA_API_KEY=tu_api_key_aqui
```

## Uso

### Opción 1: Sincronización Manual con Script

Ejecuta el script de sincronización:

```bash
npm run sync-events
```

Este script:
- ✅ Obtiene partidos de los próximos 30 días
- ✅ Los añade automáticamente a la base de datos
- ✅ Evita duplicados (verifica nombre, fecha y hora)
- ✅ Muestra un resumen de eventos sincronizados

### Opción 2: Endpoint API

#### Previsualizar eventos (GET)

```bash
curl http://localhost:3005/api/sync-events
```

Retorna una vista previa de los eventos que se sincronizarían.

#### Sincronizar eventos (POST)

```bash
curl -X POST http://localhost:3005/api/sync-events
```

Respuesta de ejemplo:
```json
{
  "success": true,
  "message": "Synced 15 new events, skipped 5 existing events",
  "synced": 15,
  "skipped": 5,
  "total": 20
}
```

### Opción 3: Programación Automática (Recomendado)

Puedes configurar un cron job o usar un servicio como Vercel Cron para sincronizar automáticamente:

**Vercel Cron (vercel.json):**

```json
{
  "crons": [
    {
      "path": "/api/sync-events",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Esto sincronizaría eventos diariamente a medianoche.

## Competiciones Disponibles

Por defecto se sincronizan partidos de **La Liga** (PD = Primera División).

Puedes modificar la competición en `lib/footballApi.ts`:

```typescript
// Códigos de competición comunes:
// PD = La Liga (España)
// PL = Premier League (Inglaterra)
// CL = Champions League
// BL1 = Bundesliga (Alemania)
// SA = Serie A (Italia)
// FL1 = Ligue 1 (Francia)

fetchFootballDataOrgMatches('PD', 30); // La Liga, próximos 30 días
```

## Estructura de Datos

Los eventos se transforman automáticamente al formato del proyecto:

```typescript
{
  name: "Real Madrid vs Barcelona",
  date: "2024-04-21",
  time: "20:00",
  location: "Estadio Santiago Bernabéu, Madrid",
  purchase_link: "https://...",
  category: "Fútbol",
  imageUrl: "/images/event-banners/default-event.jpg",
  alt: "Partido Real Madrid vs Barcelona en Estadio Santiago Bernabéu, Madrid"
}
```

## Límites y Consideraciones

- **Rate Limits**: Sin API key = 10 requests/minuto. Con API key = límite aumentado
- **Caché**: Los datos se cachean por 1 hora para evitar solicitudes excesivas
- **Filtrado**: Solo se sincronizan partidos futuros (no pasados ni finalizados)
- **Deduplicación**: Se evitan duplicados verificando nombre, fecha y hora

## Troubleshooting

### No se sincronizan eventos

1. Verifica la conexión a internet
2. Revisa los logs del servidor
3. Verifica que la API de Football-Data.org esté disponible
4. Si tienes rate limits, añade tu API key al `.env`

### Eventos duplicados

El sistema automáticamente evita duplicados, pero si aparecen:
- Verifica que los datos de nombre, fecha y hora sean consistentes
- Puedes ejecutar un cleanup manual si es necesario

### Errores de conexión

```bash
# Verifica que el endpoint funcione
curl https://api.football-data.org/v4/competitions/PD/matches?status=SCHEDULED
```

## Extender a Otras APIs

El código está diseñado para ser extensible. Puedes añadir soporte para otras APIs:

1. Crea una función similar a `fetchFootballDataOrgMatches()` en `lib/footballApi.ts`
2. Añádela a `fetchUpcomingFootballMatches()` como fallback
3. Actualiza las variables de entorno si es necesario

### APIs Alternativas Disponibles:

- **BeSoccer API**: https://api.besoccer.com/
- **Todo por el Fútbol API**: https://api.todoporelfutbol.com/
- **BDFutbol API**: https://www.api-bdfutbol.com/

