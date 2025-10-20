# Proyecto Colegio - Frontend React

Esta es una conversión del frontend JavaFX a React (Vite + React). Mantiene la navegación y diseño similar al proyecto original.

## Estructura
- `src/` - código fuente React
  - `pages/` - vistas principales (Login, Dashboard, Purchases, Profile, Admin)
  - `components/` - Navbar, ProtectedRoute
  - `utils/auth.js` - helpers de autenticación y `apiFetch`
  - `styles/global.css` - estilos (diseño tipo JavaFX)
- `public/` - index.html
- `package.json`, `vite.config.js`

## Configuración
1. Copia `.env.example` a `.env` y ajusta `VITE_API_URL` a la URL base de tu backend Java (por ejemplo `http://localhost:8080`).
2. Instala dependencias:
```bash
npm install
```
3. Ejecuta en modo desarrollo:
```bash
npm run dev
```

## Notas importantes
- Este frontend **no** se conecta directamente a Firebase. He asumido que mantienes el backend Java (que ya se conecta a Firebase) y que el frontend consumirá endpoints REST.
- Endpoints asumidos (ajusta en el backend o cambia las rutas en `src/utils/auth.js` / llamadas `apiFetch`):
  - `POST /api/login` -> `{ documento }` -> retorna `{ token, user }`
  - `GET /api/items` -> lista de artículos
  - `POST /api/purchase` -> `{ itemId, cartCode }`
  - `GET /api/users/:id` -> perfil de usuario
  - `GET /api/admin/users` -> lista de usuarios (admin)
- Si prefieres que React se conecte directamente a Firebase (sin backend), puedo generar otra versión que use Firebase Web SDK, pero eso implica mover credenciales/seguridad.

Si quieres, ajusto rutas, textos, o diseño según tu FXML concreto.