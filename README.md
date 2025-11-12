# Sistema de Gestión de Almuerzos Escolares

## Descripción general

El sistema **AlmuerzosColegio** es una aplicación web desarrollada para la gestión de almuerzos escolares, permitiendo a estudiantes, padres y administradores realizar acciones como:
- Registro e inicio de sesión con autenticación JWT.
- Compra y administración de almuerzos.
- Recarga de saldo por parte de los padres.
- Gestión de usuarios y control de historial de compras desde el rol administrador.

El proyecto cuenta con un **frontend** (React + Vite) y un **backend** (Node.js + Express + MongoDB Atlas), con integración mediante API REST protegida con autenticación JWT.

---

## Estructura del proyecto

├── back/ # Backend (Node.js + Express)
│ ├── controllers/ # Lógica de negocio (auth, users, purchases, admin)
│ ├── middleware/ # Autenticación JWT y manejo de errores
│ ├── models/ # Modelos de Mongoose (User, Purchase, Lunch)
│ ├── routes/ # Rutas de la API REST
│ ├── server.js # Punto de entrada principal del backend
│ ├── .env.example # Variables de entorno de ejemplo
│ └── package.json
│
├── front/ # Frontend (React + Vite)
│ ├── src/
│ │ ├── pages/ # Páginas (Login, Dashboard, Compras, etc.)
│ │ ├── services/ # Configuración de API y funciones fetch
│ │ ├── utils/ # Autenticación, helpers y token JWT
│ │ ├── components/ # Componentes visuales reutilizables
│ │ └── main.jsx
│ └── package.json
│
├── README.md # Este archivo
└── .gitignore # Incluye node_modules y .env


---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/devilcsy/AlmuerzosColegio.git
cd AlmuerzosColegio

cd back
npm install
npm run dev
## por defecto corre en el puerto 5000
cd front
npm install
npm run dev
## por defecto puede correr en el puerto 3000 pero si ya esta ocupado en 3001

## Toca poner los puertos en publico para que haya conexion entre el front y el end

El sistema está basado en una arquitectura cliente-servidor RESTful:

Frontend: React + Vite

Backend: Node.js + Express

Base de datos: MongoDB Atlas

Autenticación: JSON Web Token (JWT)

ORM: Mongoose

El cliente se comunica con el servidor mediante peticiones HTTP hacia /api/..., y el servidor gestiona la lógica de negocio y persistencia.