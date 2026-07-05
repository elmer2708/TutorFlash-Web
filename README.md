# TutorFlash-Web

TutorFlash-Web es un MVP web hecho con HTML, CSS y JavaScript puro. Funciona como una plataforma de tutorias rapidas para estudiantes que necesitan reforzar un curso antes de un examen.

## Enlaces

- GitHub Pages: https://elmer2708.github.io/TutorFlash-Web/
- Repositorio: https://github.com/elmer2708/TutorFlash-Web

## Estructura actual

```txt
TutorFlash-Web/
├── index.html
├── assets/
│   └── img/
├── css/
├── js/
├── pages/
├── docs/
├── legacy/
└── README.md
```

## Paginas activas

- `index.html`: entrada principal para GitHub Pages.
- `pages/app.html`: plataforma principal con busqueda de tutores y reservas.
- `pages/cuenta.html`: login, registro y cierre de sesion.
- `pages/sesiones.html`: listado de reservas del usuario.
- `pages/tutor.html`: postulacion para tutores.
- `pages/panel-tutor.html`: panel del tutor.
- `pages/admin.html`: panel interno accesible por enlace directo.

## Archivos principales

- `css/`: estilos activos de cada pagina.
- `js/firebase-config.js`: configuracion de Firebase.
- `js/firebase-service.js`: servicios compartidos de Firebase Authentication y Firestore.
- `js/app.js`: busqueda, tutores y reservas.
- `js/cuenta.js`: autenticacion de usuarios.
- `js/sesiones.js`: lectura de sesiones.
- `js/tutor.js`: postulaciones de tutores.
- `js/panel-tutor.js`: reservas recibidas por el tutor.
- `js/admin.js`: aprobacion y rechazo de postulaciones.

## Carpetas de soporte

- `docs/`: documentacion secundaria del proyecto.
- `legacy/`: archivos antiguos que ya no forman parte de la web activa.

## Firebase

El proyecto usa Firebase para:

- Authentication: crear cuenta, iniciar sesion y cerrar sesion.
- Firestore: guardar reservas, postulaciones y datos de tutores.

Colecciones usadas:

- `usuarios`
- `reservas`
- `postulacionesTutores`
- `tutores`

## Funcionalidades

- Pantalla inicial responsive.
- Buscador de tutores.
- Modal de reserva.
- Firebase Authentication funcionando.
- Firestore funcionando.
- Reservas guardadas en Firestore con tutor asociado.
- Pagina de sesiones del usuario.
- Pagina de postulacion para tutores.
- Panel admin para aprobar o rechazar postulaciones.
- Panel del tutor para ver reservas recibidas.
