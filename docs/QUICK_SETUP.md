# ⚡ Configuración Rápida - Football-Data.org

## ⏱️ Mientras esperas la aprobación de RapidAPI

Si RapidAPI está en "pending approval", puedes usar **Football-Data.org** de forma inmediata:

### Pasos (5 minutos):

1. **Registrarse** (1 minuto)
   - Ve a: https://www.football-data.org/register
   - Completa el registro
   - Verifica tu email

2. **Obtener API Token** (2 minutos)
   - Inicia sesión: https://www.football-data.org/login
   - Ve a tu **Dashboard**
   - Encontrarás tu **API Token** (algo como: `abc123...`)

3. **Configurar en .env** (1 minuto)
   ```env
   FOOTBALL_DATA_API_KEY=tu_token_aqui
   ```

4. **Sincronizar eventos** (1 minuto)
   ```bash
   npm run sync-events
   ```

   Verás:
   ```
   ✅ Using Football-Data.org API
   ✅ Fetched X upcoming matches from Football-Data.org
   ```

## ✅ Ventajas

- ✅ **Aprobación inmediata** (sin esperas)
- ✅ **Totalmente gratuito**
- ✅ **Datos reales** de La Liga y otras competiciones
- ✅ **Muy confiable**

## 🔄 Después de aprobar RapidAPI

Cuando RapidAPI te apruebe la suscripción:
- El sistema **automáticamente** usará RapidAPI (tiene prioridad)
- Football-Data.org se usará como fallback si RapidAPI falla
- No necesitas cambiar nada en el código

