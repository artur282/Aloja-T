# Alojate - Aplicación de Alojamiento Estudiantil

Alojate es una aplicación móvil completa desarrollada con React Native y Expo para facilitar la conexión entre estudiantes que buscan alojamiento y propietarios que ofrecen propiedades para rentar. La aplicación utiliza Supabase como backend para proporcionar una experiencia fluida y segura. 

## 🏠 Características

- **Autenticación**: Registro e inicio de sesión con correo electrónico.
- **Roles de usuario**: Estudiantes, propietarios y administradores.
- **Listado de propiedades**: Exploración de propiedades disponibles.
- **Filtrado y búsqueda**: Búsqueda por ubicación, tipo de propiedad y precio.
- **Gestión de reservas**: Creación, aceptación, rechazo y cancelación de reservas.
- **Sistema de pagos**: Registro de pagos con comprobantes.
- **Gestión de propiedades**: Los propietarios pueden agregar, editar y eliminar propiedades.
- **Notificaciones**: Sistema de notificaciones para eventos importantes.
- **Perfiles de usuario**: Gestión de información personal y fotos de perfil.

## 🚀 Tecnologías

- **Frontend**: React Native, Expo, Expo Router
- **Estado**: Zustand para gestión de estado global
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI/UX**: Diseño minimalista y componentes personalizados

## 📱 Estructura del Proyecto

```
alojate-app/
├── app/               # Rutas de la aplicación (Expo Router)
│   ├── (tabs)/        # Pestañas principales de la app
│   ├── property/      # Vistas de propiedades
│   ├── reservation/   # Pantallas de reservas
│   └── payment/       # Flujo de pagos
├── components/        # Componentes reutilizables
├── services/          # Servicios y clientes API
├── store/             # Almacenamiento global (Zustand)
├── utils/             # Utilidades y constantes
└── assets/            # Recursos estáticos
```

## 🗄️ Estructura de la Base de Datos

- **users**: Perfiles de usuario (estudiantes, propietarios, administradores)
- **properties**: Propiedades disponibles para alquiler
- **reservations**: Reservas de alojamiento
- **payments**: Registro de pagos
- **notifications**: Sistema de notificaciones
- **admin_config**: Configuración global del sistema

## 🔒 Seguridad

La aplicación implementa políticas de Row Level Security (RLS) en Supabase para garantizar que los usuarios solo puedan acceder a los datos permitidos según su rol:

- Los estudiantes pueden ver propiedades disponibles y gestionar sus propias reservas
- Los propietarios pueden gestionar sus propiedades y las reservas relacionadas
- Los administradores tienen acceso a la configuración global

## 🚀 Cómo Iniciar

### Requisitos Previos

- Node.js (v14 o superior)
- Expo CLI
- Cuenta en Supabase

### Instalación

```sh
# Clonar el repositorio
git clone <url-del-repositorio>
cd alojate-app

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crea un archivo .env con las credenciales de Supabase

# Iniciar la aplicación en modo desarrollo
npm start
```

### Configuración de Supabase

1. Crea un proyecto en Supabase
2. Ejecuta las migraciones SQL para crear las tablas y políticas RLS
3. Configura los buckets de Storage para almacenamiento de imágenes
4. Actualiza las credenciales en `utils/constants.js`

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. 
