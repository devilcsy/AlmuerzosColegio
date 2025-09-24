 # Nombre del proyecto: Aplicación para la gestión de pagos y control de almuerzos en la cafetería escolar

# Gestor de Cafetería Escolar - Documentación

## DESCRIPCIÓN
Aplicación web para administrar pagos y almuerzos en cafeterías escolares con estas funciones principales:
- Registro digital de estudiantes con saldo virtual
- Recarga electrónica de fondos
- Panel de control para administradores

## TECNOLOGÍAS UTILIZADAS

FRONTEND:
- HTML5
- CSS3
- JavaScript

BACKEND:
- Node.js
- Express.js

BASE DE DATOS:
- PostgreSQL

APIS INTEGRADAS:
- TheMealDB (para ejemplos de menús)

## CÓMO INSTALAR

1. Clonar repositorio:
git clone https://github.com/turepositorio/cafeteria-escolar.git

2. Instalar dependencias:
npm install

3. Configurar variables de entorno:
Crear archivo .env con:
DB_HOST=tu_host
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_bd
API_KEY=tu_api_key

4. Iniciar aplicación:
npm start

## ESTRUCTURA DE ARCHIVOS

/controllers
/models
/routes
/public
  /css
    styles.css
  /js
    app.js
  /views
    acerca.html
    anadir-estudiante.html
    api.html
    buscar-estudiante.html
    comprar-almuerzo.html
    configurar-almuerzo.html
    contacto.html
    filtros.html
    index.html
    listado-estudiantes.html

## API UTILIZADA (TheMealDB)

- Uso: Consulta de menús de ejemplo
- Acceso: No requiere API key
- Limitaciones: 
  * Máximo 30 peticiones/minuto
  * Contenido solo en inglés
  * Para producción usar base de datos local

## ACCESIBILIDAD

- Contraste AA (4.5:1)
- Navegación con teclado
- Textos alternativos en imágenes
- Semántica HTML correcta
- Diseño responsive

## LICENCIA
MIT License - Uso libre con atribución

## CONTACTO
Para soporte técnico o colaboraciones:
jcardozohuertas@gmail.com.com
### Instalación
