# ⚽ Integración de API de Fútbol - Guía Rápida

## 🚀 Inicio Rápido

### 1. Sincronizar Eventos Manualmente

```bash
npm run sync-events
```

Esto obtendrá los próximos partidos de La Liga y los añadirá a tu base de datos.

### 2. Usar el Endpoint API

**Previsualizar eventos:**
```bash
curl http://localhost:3005/api/sync-events
```

**Sincronizar eventos:**
```bash
curl -X POST http://localhost:3005/api/sync-events
```

## 📋 Características

✅ **API Gratuita** - Usa Football-Data.org sin necesidad de API key (con límites)  
✅ **Automático** - Evita duplicados automáticamente  
✅ **Actualizado** - Obtiene partidos reales y actualizados  
✅ **Flexible** - Fácil de extender a otras APIs o competiciones  

## 🔑 Obtener API Key (Opcional)

Para aumentar el límite de solicitudes:

1. Visita: https://www.football-data.org/
2. Regístrate gratuitamente
3. Obtén tu API key
4. Añádela a tu `.env`:

```env
FOOTBALL_DATA_API_KEY=tu_api_key_aqui
```

## 📊 Ejemplo de Uso

```bash
# Ejecutar sincronización
npm run sync-events

# Verás algo como:
# 🚀 Starting event synchronization...
# 📊 Found 25 upcoming matches
# ✅ Added: Real Madrid vs Barcelona - 2024-04-21 20:00
# ✅ Added: Atlético Madrid vs Sevilla - 2024-04-22 18:30
# ...
# 📈 Synchronization Summary:
#    ✅ Synced: 25
#    ⏭️  Skipped: 0
#    ❌ Errors: 0
```

## 🎯 Resultado

Los eventos se añaden automáticamente a tu base de datos con el formato correcto:

- ✅ Nombre del partido (ej: "Real Madrid vs Barcelona")
- ✅ Fecha y hora
- ✅ Ubicación del estadio
- ✅ Categoría "Fútbol"
- ✅ Enlace de compra (búsqueda de Google)

## 📚 Documentación Completa

Para más detalles, consulta: `docs/FOOTBALL_API.md`

