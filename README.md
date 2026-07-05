# TutorFlash-Web

TutorFlash-Web es un MVP web hecho con HTML, CSS y JavaScript puro. Funciona como una plataforma de tutorías rápidas para estudiantes que necesitan reforzar un curso antes de un examen.

## Enlaces

- GitHub Pages: https://elmer2708.github.io/TutorFlash-Web/
- Repositorio: https://github.com/elmer2708/TutorFlash-Web

## Estructura actual

```txt
TUTORFLASH-WEB
├── assets
│   └── img
│       ├── logo-preview.html
│       ├── logo-tutorflash-transparente.png
│       └── referencia-pantalla.png
├── css
│   ├── index.css
│   ├── presentacion.css
│   ├── app.css
│   ├── cuenta.css
│   └── sesiones.css
├── js
│   ├── script.js
│   ├── app.js
│   ├── cuenta.js
│   ├── sesiones.js
│   ├── firebase-config.js
│   └── firebase-service.js
├── index.html
├── presentacion.html
├── app.html
├── cuenta.html
├── sesiones.html
├── README.md
└── README-FUTURO-FIREBASE.md
```

## Páginas principales

- `index.html`: pantalla inicial de TutorFlash con accesos a la plataforma y a la presentación.
- `presentacion.html`: presentación académica del proyecto.
- `app.html`: plataforma principal con buscador, filtros, tutores, modal de reserva, contacto y estado de sesión.
- `cuenta.html`: inicio de sesión, creación de cuenta y cierre de sesión.
- `sesiones.html`: listado de reservas guardadas del usuario autenticado.

## Archivos JavaScript

- `js/app.js`: búsqueda de tutores, filtros, modal de reserva, cálculo de total, validación de fecha y hora, guardado de reservas, estado de sesión y menú móvil.
- `js/cuenta.js`: login, registro, cambio entre formularios, cierre de sesión y redirección a `app.html`.
- `js/sesiones.js`: lectura de reservas del usuario y renderizado de tarjetas de sesiones.
- `js/firebase-service.js`: funciones compartidas de Firebase Authentication y Firestore.
- `js/firebase-config.js`: configuración real de Firebase.

## Funcionalidades terminadas

- Pantalla inicial responsive.
- Página de presentación académica.
- Buscador de tutores.
- Filtro por cursos.
- Tarjetas de tutores.
- Modal de reserva.
- Cálculo de total por duración:
  - 30 minutos = precio base.
  - 45 minutos = precio base x 1.5.
  - 60 minutos = precio base x 2.
- Validación de fecha desde hoy hasta el 31 de diciembre del año actual.
- Bloqueo de horas pasadas.
- Cambio automático a mañana si hoy ya no quedan horarios disponibles.
- Firebase Authentication funcionando.
- Registro de usuarios funcionando.
- Inicio y cierre de sesión funcionando.
- Firestore funcionando.
- Reservas guardadas en Firestore.
- Página `sesiones.html` separada para ver Mis sesiones.
- Pago simulado con Yape, Plin o tarjeta simulada.
- Indicador de sesión en `app.html`.

## Firebase

El proyecto usa Firebase para:

- Authentication: crear cuenta, iniciar sesión y cerrar sesión.
- Firestore: guardar reservas y leer las sesiones del usuario.

Colecciones usadas:

- `usuarios`
- `reservas`

## Pendientes

- Reglas seguras de Firestore.
- Panel de tutor futuro.
- Pago real futuro.
- Chat futuro.
- Videollamada futura.