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
