# Membranas Burzaco — API (backend)

API REST en Node + Express + Mongoose para la landing y el panel de administración.
Repo del frontend: `membranas-burzaco`.

## Puesta en marcha

```bash
cp .env.example .env    # completar MONGODB_URI y JWT_SECRET
npm install
npm run seed            # crea admin, categorías y productos demo (una sola vez)
npm run dev             # API en http://localhost:4000
```

Generar el JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## CORS

La whitelist se arma con:
- `http://localhost:5173` y `http://127.0.0.1:5173` (siempre permitidos, para desarrollo)
- Lo que definas en `CLIENT_URL` (varios orígenes separados por coma, sin barra final)

```
CLIENT_URL=https://www.tudominio.com.ar,https://tudominio.com.ar
```

Requests de otros orígenes reciben error de CORS. Las requests sin header
`Origin` (curl, Postman, health checks) pasan, porque CORS protege navegadores,
no reemplaza a la autenticación: las rutas de escritura igualmente exigen JWT.

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | /api/auth/login | — | Login, devuelve JWT (12 h) |
| GET | /api/auth/me | ✅ | Usuario actual |
| GET | /api/products | — | Publicados (?categoria, ?destacado) |
| GET | /api/products/:id | — | Detalle |
| GET | /api/products/admin | ✅ | Todos, paginado (?page, ?q, ?estado) |
| GET | /api/products/stats | ✅ | Métricas del dashboard |
| POST/PUT/DELETE | /api/products[/:id] | ✅ | ABM de productos |
| GET | /api/categories | — | Listado |
| POST/PUT/DELETE | /api/categories[/:id] | ✅ | ABM de categorías |
| GET | /api/settings | — | Configuración pública |
| PUT | /api/settings | ✅ | Editar configuración |
| POST | /api/upload | ✅ | Subir imagen (multipart, campo `imagen`, máx 5 MB) |
| GET | /api/health | — | Health check |

## Deploy (Railway)

1. Subir este repo a GitHub y crear el servicio en Railway desde el repo.
2. Variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (URL del frontend ya deployado), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
3. Start command: `npm start`. Correr `npm run seed` una vez desde la consola del servicio.
4. ⚠️ Imágenes: `/api/upload` guarda en disco y el filesystem de Railway es efímero.
   Opciones: pegar URLs externas en el formulario del admin, agregar un volumen
   persistente, o integrar Cloudinary en `src/routes/upload.routes.js`.
