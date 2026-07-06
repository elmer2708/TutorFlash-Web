## Actualización del MVP con Firebase

TutorFlash-Web ya cuenta con una versión funcional del MVP conectada a Firebase.

### Funcionalidades implementadas

- Pantalla inicial responsive.
- Página principal `app.html`.
- Buscador de tutores.
- Filtro por cursos.
- Tarjetas de tutores.
- Modal de reserva.
- Cálculo automático del total según duración.
- Validación de fecha desde hoy hasta el 31/12 del año actual.
- Bloqueo de horas pasadas.
- Cambio automático a mañana si ya no hay horarios disponibles hoy.
- Registro de usuarios con Firebase Authentication.
- Inicio de sesión con correo y contraseña.
- Cierre de sesión.
- Indicador de sesión en `app.html`.
- Guardado de reservas en Firebase Firestore.
- Página independiente `sesiones.html`.
- Visualización de reservas guardadas.
- Pago simulado.

### Páginas actuales

- `index.html`: pantalla inicial.
- `app.html`: plataforma principal para buscar tutores y reservar.
- `cuenta.html`: registro, inicio de sesión y cierre de sesión.
- `sesiones.html`: reservas guardadas del usuario.
- `presentacion.html`: presentación académica.

### Archivos principales

- `js/app.js`: buscador, filtros, modal, validaciones y reservas.
- `js/cuenta.js`: registro, inicio de sesión y cierre de sesión.
- `js/sesiones.js`: lectura de reservas desde Firestore.
- `js/firebase-service.js`: funciones compartidas de Firebase.
- `js/firebase-config.js`: configuración de Firebase.

### Firebase

El proyecto usa:

- Firebase Authentication.
- Firebase Firestore.

Colecciones usadas:

#### usuarios

- usuarioId
- nombre
- correo
- rol
- fechaRegistro

#### reservas

- usuarioId
- correoUsuario
- tutor
- curso
- fecha
- hora
- modalidad
- duracion
- total
- metodoPago
- estado
- creadoEn

### Flujo actual

```txt
Entrar a TutorFlash
↓
Ir a Mi cuenta
↓
Crear cuenta o iniciar sesión
↓
Volver automáticamente a app.html
↓
Buscar tutor
↓
Reservar tutoría
↓
Elegir pago simulado
↓
Guardar reserva en Firestore
↓
Ir a Mis sesiones
↓
Ver reserva guardada
```

# TutorFlash-Web

TutorFlash-Web es una plataforma web de tutorías rápidas pensada para conectar estudiantes con tutores disponibles antes de exámenes, tareas o reforzamientos académicos.

El proyecto inició como un MVP visual, pero actualmente funciona como una plataforma más avanzada con inicio de sesión, roles de usuario, reservas guardadas en Firebase y paneles diferenciados para estudiante, tutor y administrador.

## Enlaces del proyecto

Repositorio:

https://github.com/elmer2708/TutorFlash-Web

Página publicada en GitHub Pages:

https://elmer2708.github.io/TutorFlash-Web/

## Objetivo del proyecto

El objetivo de TutorFlash-Web es permitir que un estudiante pueda buscar un tutor por curso, revisar su información básica, elegir una fecha y hora disponible, seleccionar modalidad, duración, método de pago simulado y registrar una solicitud de tutoría.

Además, el sistema permite que el tutor revise las reservas recibidas, acepte solicitudes y marque sesiones como realizadas.

## Estado actual

El proyecto se encuentra en una versión funcional avanzada.

Actualmente permite:

- Registro e inicio de sesión de usuarios.
- Redirección según rol.
- Plataforma para estudiantes.
- Panel para tutores aprobados.
- Panel básico para administrador.
- Búsqueda de tutores por curso.
- Visualización de tutores activos.
- Reserva de tutorías.
- Selección de fecha, hora, modalidad, duración y método de pago.
- Cálculo automático del total según duración y precio por hora.
- Guardado de reservas en Firebase Firestore.
- Vista de sesiones del estudiante.
- Vista de reservas recibidas por el tutor.
- Cambio de estado de reservas.
- Validación de fechas.
- Validación de horarios disponibles según disponibilidad real del tutor.
- Bloqueo de horarios ocupados.
- Publicación mediante GitHub Pages.

## Roles del sistema

TutorFlash-Web trabaja con tres tipos principales de usuario:

### 1. Estudiante

El estudiante puede:

- Iniciar sesión.
- Buscar tutores por curso.
- Ver tutores activos.
- Abrir el modal de reserva.
- Elegir fecha, hora, modalidad y duración.
- Ver el total estimado.
- Registrar una solicitud de tutoría.
- Revisar sus sesiones en la página de sesiones.
- Ver el estado de sus reservas.

### 2. Tutor

El tutor puede:

- Iniciar sesión.
- Acceder a su panel si fue aprobado.
- Ver reservas recibidas.
- Aceptar solicitudes de tutoría.
- Marcar reservas como realizadas.
- Configurar su disponibilidad.
- Mostrar horarios reales para los estudiantes.

### 3. Administrador

El administrador puede:

- Revisar usuarios.
- Aprobar tutores.
- Gestionar el estado de los tutores.
- Ver información general del sistema.

## Flujo principal del estudiante

```text
Estudiante inicia sesión
        ↓
Entra a app.html
        ↓
Busca un tutor por curso
        ↓
Selecciona un tutor
        ↓
Elige fecha, hora, modalidad y duración
        ↓
Confirma la reserva
        ↓
La reserva se guarda en Firestore
        ↓
La reserva aparece en pages/sesiones.html

Tutor inicia sesión
        ↓
El sistema valida si está aprobado
        ↓
Entra al panel del tutor
        ↓
Ve reservas recibidas
        ↓
Acepta una reserva
        ↓
El estudiante ve la reserva como aceptada
        ↓
El tutor marca la sesión como realizada
        ↓
La reserva queda finalizada

TutorFlash-Web/
│
├── index.html
├── app.html
├── cuenta.html
├── README.md
│
├── css/
│   ├── style.css
│   ├── index.css
│   └── ...
│
├── js/
│   ├── app.js
│   ├── firebase-service.js
│   ├── cuenta.js
│   ├── panel-tutor.js
│   └── ...
│
├── pages/
│   ├── sesiones.html
│   ├── panel-tutor.html
│   ├── admin.html
│   └── ...
│
└── assets/
    └── img/

    Este proyecto sigue en etapa académica/MVP.
Para una versión real en producción, se recomienda reforzar las reglas de seguridad de Firebase.
```
