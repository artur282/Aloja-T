Aquí tienes una explicación concisa pero detallada del flujo y las características clave de Aloja-T, optimizada para la implementación por un desarrollador.

---

# Aloja-T: Flujo de la Aplicación y Características Clave (Guía Rápida para Desarrolladores)

Aloja-T es una plataforma móvil/web que conecta estudiantes con alojamientos universitarios para arrendamiento mensual. Construida con `React Native` (Expo, Expo router) y `Zustand` para el frontend, y `Supabase` (PostgreSQL, Auth, Storage) como backend, sigue una arquitectura `MVVM`. Se utilizan UUIDs para identificadores y se prioriza la seguridad mediante `Row Level Security (RLS)` en Supabase.

## 1. Autenticación y Gestión de Perfiles

* **Roles:** Estudiante, Propietario, Administrador.
* **Flujo:**
    * **Registro/Login:** El usuario ingresa credenciales. El frontend (`LoginScreen`, `SignUpScreen`) usa `supabase.auth.signUp`/`signInWithPassword`. Supabase Auth maneja la creación/validación del usuario.
    * **Creación/Edición de Perfil:** Tras el registro o en `ProfileScreen`, el usuario completa/actualiza datos como nombre, teléfono, foto y documento de identidad. El frontend sube imágenes a `ImagePicker` (actualizado para usar la API recomendada `MediaType` en lugar de `MediaTypeOptions`) a `Supabase Storage` y guarda las URLs junto con otros datos en la tabla `public.users` via `supabase.from('users').insert/update()`.
    * **Asignación de Rol:** El campo `rol` en `public.users` se asigna. Los roles de Propietario/Administrador pueden requerir verificación o asignación manual por parte de un administrador.
    * **Verificación de Email:** Un trigger PostgreSQL (`sync_email_verification`) actualiza automáticamente el campo `estado_verificacion` en `public.users` cuando el email es verificado en Supabase Auth.
* **Entidad Clave:** `public.users` (incluye `uuid`, `rol`, `url_foto_perfil`, `numero_telefono`, `estado_verificacion`).

## 2. Gestión de Propiedades

* **Roles:** Propietario, Administrador.
* **Flujo:**
    * **Creación de Propiedad (`AddPropertyScreen`):** Propietarios/Administradores ingresan detalles de la propiedad (título, descripción, dirección, servicios, precios mensuales, disponibilidad). Las imágenes se seleccionan con `ImagePicker` (Expo), suben a `Supabase Storage`, y sus URLs se almacenan en `public.properties`.
    * **Edición/Visualización (`PropertyDetailScreen`, `EditPropertyScreen`):** Los usuarios pueden ver y editar sus propias propiedades. El frontend consulta/actualiza `public.properties` via `supabase.from('properties').select/update()`.
    * **Estado de Propiedad:** El campo `estado` (`disponible`/`reservado`) se actualiza automáticamente con reservas o manualmente.
    * **Políticas RLS:** Se han optimizado las políticas RLS para evitar recursión infinita, separando claramente las políticas de lectura para propietarios, estudiantes y administradores.
* **Entidad Clave:** `public.properties` (incluye `uuid`, `id_propietario`, `direccion`, `galeria_fotos` (array de URLs), `estado`). El campo `precio_noche` ahora representa el precio mensual, aunque mantiene su nombre original para evitar migraciones complejas.

## 3. Búsqueda y Visualización de Propiedades

* **Roles:** Estudiante.
* **Flujo:**
    * **Búsqueda y Filtrado (`SearchScreen`):** Estudiantes buscan propiedades usando filtros (ubicación, precio mensual, tipo, etc.). El frontend consulta `public.properties` aplicando filtros (`supabase.from('properties').select().filter(...)`).
    * **Detalle de Propiedad (`PropertyDetailScreen`):** Al seleccionar una propiedad, se muestran todos los detalles, incluyendo galería de fotos, el precio mensual (mostrado como "/mes" en lugar de "/noche") y el número de contacto del propietario.
    * **Interacción:** La vista de detalle ofrece botones para `llamar` o iniciar un `chat de WhatsApp` con el propietario (ver sección 6).

## 4. Gestión de Reservas

* **Roles:** Estudiante, Propietario.
* **Flujo:**
    * **Realizar Solicitud (`PropertyDetailScreen`):** Estudiantes seleccionan la fecha de llegada y la duración en meses de la estadía. El frontend calcula automáticamente la fecha de salida y el costo total (precio mensual × duración). Si la fecha de llegada está en el pasado, se establece automáticamente a la fecha actual. Los datos se insertan en `public.reservations` (`supabase.from('reservations').insert()`).
    * **Recepción y Gestión (Propietario):** Propietarios reciben notificaciones de nuevas solicitudes. En su panel (`OwnerDashboard`), pueden `aceptar` o `rechazar` actualizando el `estado_reserva` en `public.reservations`.
    * **Monitoreo (Ambos):** Ambos roles pueden ver el estado de sus reservas en sus respectivos listados.
* **Entidad Clave:** `public.reservations` (incluye `uuid`, `id_usuario`, `id_propiedad`, `fechas_llegada/salida`, `duration_months`, `costo_total`, `estado_reserva`, `estado_pago`).

## 5. Gestión de Pagos

* **Roles:** Estudiante, Propietario, Administrador.
* **Flujo:**
    * **Registro de Pago (`PaymentScreen`):** Estudiantes registran un pago asociado a una reserva confirmada, especificando el método y adjuntando un comprobante (imagen). El comprobante se sube a `Supabase Storage` y los datos se guardan en `public.payments`.
    * **Verificación (Propietario/Administrador):** Propietarios/Administradores verifican los comprobantes en sus paneles. Una vez verificado, actualizan el `estado_pago` de la reserva y del registro de pago.
* **Entidad Clave:** `public.payments` (incluye `uuid`, `id_reserva`, `metodo_pago`, `monto_pagado`, `url_comprobante_pago`, `estado_pago`).

## 6. Comunicación con el Propietario

* **Roles:** Estudiante.
* **Flujo:**
    * **Llamada Directa:** Desde `PropertyDetailScreen`, el estudiante toca un botón. El frontend usa `Linking` de React Native (`Linking.openURL('tel:...')`) para iniciar una llamada con el número del propietario.
    * **WhatsApp Chat:** Desde `PropertyDetailScreen`, el estudiante toca un botón. El frontend usa `Linking` (`Linking.openURL('whatsapp://send?phone=...')`) para abrir WhatsApp e iniciar un chat con el propietario.
* **Consideración:** Requiere que el número de teléfono del propietario esté correctamente registrado y expuesto en el detalle de la propiedad.

## 7. Gestión de Notificaciones

* **Roles:** Todos los usuarios.
* **Flujo:**
    * **Generación Automática:** El sistema genera notificaciones para eventos clave (nuevas reservas, cambios de estado de pago, etc.). Estas se insertan en `public.notifications`.
    * **Visualización:** Los usuarios acceden a una sección (`NotificationsScreen`) para ver sus notificaciones. El frontend consulta `public.notifications` para el `id_usuario_destinatario`.
    * **Estado de Lectura:** Los usuarios pueden marcar notificaciones como leídas, actualizando el campo `estado_lectura` en `public.notifications`.
* **Entidad Clave:** `public.notifications` (incluye `uuid`, `id_usuario_destinatario`, `tipo_notificacion`, `mensaje`, `estado_lectura`).

## 8. Configuración Administrativa

* **Rol:** Administrador.
* **Flujo:**
    * **Gestión de Parámetros:** Los administradores tienen acceso a un panel donde pueden configurar parámetros globales de la aplicación (tasa de comisión, moneda predeterminada, etc.). Esto implica actualizar una tabla de configuración única (`public.admin_config`) o variables de entorno.
* **Entidad Clave:** `public.admin_config` (ej. `tasa_comision`, `moneda_predeterminada`, `email_contacto`).

---