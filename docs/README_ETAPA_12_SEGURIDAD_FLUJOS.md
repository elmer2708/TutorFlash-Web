# TutorFlash-Web - Actualización de seguridad, roles y flujos principales

## Nombre recomendado del archivo

```text
README_ETAPA_12_SEGURIDAD_FLUJOS.md
```

Ruta sugerida dentro del proyecto:

```text
docs/README_ETAPA_12_SEGURIDAD_FLUJOS.md
```

---

# 1. Resumen general del proyecto

TutorFlash-Web es una plataforma web de tutorías rápidas pensada para estudiantes que necesitan encontrar un tutor disponible antes de una evaluación, examen o actividad académica.

El proyecto empezó como una maqueta funcional, pero actualmente ya se está convirtiendo en un MVP avanzado con autenticación, roles, paneles separados, reservas reales y conexión con Firebase.

Actualmente el sistema trabaja con tres tipos de usuario:

```text
1. Estudiante
2. Tutor
3. Administrador
```

Cada usuario tiene una experiencia distinta dentro de la misma web.

---

# 2. Tecnologías usadas

El proyecto usa tecnologías web simples y directas:

```text
HTML
CSS
JavaScript puro
Firebase Authentication
Firebase Firestore
GitHub Pages
```

No se está usando framework como React, Vue o Angular. Esto ayuda a mantener el proyecto más fácil de entender, editar y presentar.

---

# 3. Estructura general del proyecto

La estructura actual del proyecto se organiza de esta forma:

```text
TutorFlash-Web/
├── index.html
├── cuenta.html
├── README.md
├── docs/
│   ├── ROADMAP.md
│   ├── README_ADMIN.md
│   └── README_ETAPA_12_SEGURIDAD_FLUJOS.md
├── assets/
│   └── img/
├── css/
│   ├── index.css
│   ├── app.css
│   ├── cuenta.css
│   ├── tutor.css
│   ├── admin.css
│   ├── panel-tutor.css
│   ├── perfil-tutor.css
│   ├── disponibilidad-tutor.css
│   └── sesiones.css
├── js/
│   ├── firebase-config.js
│   ├── firebase-service.js
│   ├── app.js
│   ├── cuenta.js
│   ├── tutor.js
│   ├── admin.js
│   ├── panel-tutor.js
│   ├── perfil-tutor.js
│   ├── disponibilidad-tutor.js
│   └── sesiones.js
├── pages/
│   ├── app.html
│   ├── cuenta.html
│   ├── tutor.html
│   ├── admin.html
│   ├── panel-tutor.html
│   ├── perfil-tutor.html
│   ├── disponibilidad-tutor.html
│   └── sesiones.html
└── legacy/
```

---

# 4. Archivos principales

## 4.1 Archivo de configuración Firebase

```text
js/firebase-config.js
```

Este archivo contiene la configuración del proyecto Firebase.

Importante:

```text
No se debe modificar innecesariamente.
No se debe borrar.
No se debe exponer información sensible adicional.
```

---

## 4.2 Archivo central de Firebase

```text
js/firebase-service.js
```

Este archivo concentra las funciones principales que conectan la web con Firebase.

Actualmente maneja:

```text
Autenticación
Registro de usuarios
Inicio y cierre de sesión
Reservas
Postulaciones de tutores
Aprobación y rechazo por admin
Tutores activos
Panel del tutor
Perfil del tutor
Disponibilidad del tutor
Sesiones del estudiante
```

Este archivo se reforzó en la Etapa 12 para mejorar seguridad básica, validaciones y control de permisos desde el frontend.

---

# 5. Colecciones usadas en Firestore

Actualmente el proyecto usa estas colecciones:

```text
usuarios
reservas
postulacionesTutores
tutores
disponibilidadTutores
```

---

## 5.1 Colección `usuarios`

Guarda los usuarios registrados en la plataforma.

Ejemplo de documento:

```js
{
  usuarioId: "uid_del_usuario",
  nombre: "Nombre del usuario",
  correo: "correo@ejemplo.com",
  rol: "estudiante",
  fechaRegistro: serverTimestamp()
}
```

Roles permitidos desde registro normal:

```text
estudiante
tutor
```

El rol `admin` no debe ser creado desde el formulario normal de registro.

---

## 5.2 Colección `postulacionesTutores`

Guarda las solicitudes de usuarios que desean convertirse en tutores.

Ejemplo:

```js
{
  uid: "uid_del_usuario",
  correoUsuario: "correo@ejemplo.com",
  nombre: "Nombre del postulante",
  correo: "correo@ejemplo.com",
  telefono: "999999999",
  cursos: "Matemática, Física",
  nivel: "Secundaria",
  disponibilidad: "Tardes",
  experiencia: "Tengo experiencia enseñando...",
  estado: "pendiente",
  fechaPostulacion: serverTimestamp()
}
```

Estados posibles:

```text
pendiente
aprobado
rechazado
```

---

## 5.3 Colección `tutores`

Guarda los tutores aprobados por el administrador.

Ejemplo:

```js
{
  uid: "uid_del_tutor",
  nombre: "Nombre del tutor",
  correo: "correo@ejemplo.com",
  telefono: "999999999",
  cursos: "Matemática, Física",
  nivel: "Secundaria",
  disponibilidad: "Tardes",
  descripcion: "Experiencia del tutor",
  presentacion: "Texto público del tutor",
  experiencia: "Experiencia detallada",
  modalidad: "Virtual",
  precio: 25,
  precioHora: 25,
  distrito: "San Juan de Lurigancho",
  zona: "San Juan de Lurigancho",
  estado: "activo",
  estadoPublico: "activo",
  perfilCompleto: true,
  rating: "4.8",
  fechaAprobacion: serverTimestamp(),
  actualizadoEn: serverTimestamp()
}
```

Campos importantes:

```text
estado: controla si el tutor existe como tutor aprobado.
estadoPublico: controla si aparece o no públicamente.
perfilCompleto: controla si ya puede mostrarse en la plataforma del estudiante.
```

---

## 5.4 Colección `reservas`

Guarda las tutorías reservadas por estudiantes.

Ejemplo:

```js
{
  usuarioId: "uid_del_estudiante",
  correoUsuario: "estudiante@ejemplo.com",
  tutorId: "uid_del_tutor",
  tutor: "Nombre del tutor",
  curso: "Matemática",
  fecha: "2026-07-05",
  hora: "4:00 p.m.",
  modalidad: "Virtual",
  duracion: "30 min",
  total: 12.5,
  metodoPago: "Pago simulado",
  estado: "pendiente",
  creadoEn: serverTimestamp()
}
```

Estados posibles:

```text
pendiente
aceptada
rechazada
realizada
cancelada
confirmada
```

Estados que ocupan horario:

```text
pendiente
aceptada
confirmada
```

Estados que ya no ocupan horario:

```text
rechazada
cancelada
realizada
```

---

## 5.5 Colección `disponibilidadTutores`

Guarda los bloques de horario que configura cada tutor.

Ejemplo:

```js
{
  uid: "uid_del_tutor",
  tutorId: "id_documento_tutor",
  tutorNombre: "Nombre del tutor",
  bloques: [
    {
      dia: "lunes",
      horaInicio: "16:00",
      horaFin: "20:00",
      activo: true
    }
  ],
  creadoEn: serverTimestamp(),
  actualizadoEn: serverTimestamp()
}
```

---

# 6. Flujo general de usuarios

## 6.1 Flujo de inicio de sesión

```text
Usuario abre TutorFlash-Web
        ↓
Entra a Mi cuenta
        ↓
Inicia sesión con Firebase Authentication
        ↓
El sistema revisa su correo, rol y estado
        ↓
Redirección según tipo de usuario
```

---

## 6.2 Redirección por rol

Desde `pages/cuenta.html`, el sistema redirige así:

```text
Si el correo es admin:
  → pages/admin.html

Si el usuario es tutor aprobado:
  → pages/panel-tutor.html

Si el usuario tiene postulación como tutor:
  → pages/tutor.html

Si el usuario tiene rol tutor, pero aún no está activo:
  → pages/tutor.html

Si el usuario es estudiante:
  → pages/app.html
```

Correo admin usado actualmente:

```text
admin@gmail.com
```

---

# 7. Flujo del estudiante

## 7.1 Entrada del estudiante

```text
Estudiante inicia sesión
        ↓
Sistema lo redirige a app.html
        ↓
Puede buscar tutores activos
        ↓
Puede elegir un tutor
        ↓
Puede abrir el modal de reserva
```

---

## 7.2 Búsqueda de tutor

El estudiante puede buscar por:

```text
Curso
Nombre del tutor
Texto de la tarjeta del tutor
Botones de cursos rápidos
```

Solo aparecen tutores que cumplen:

```text
estado == activo
estadoPublico == activo
perfilCompleto == true
```

---

## 7.3 Flujo de reserva

```text
Estudiante selecciona tutor
        ↓
Se abre modal de reserva
        ↓
Sistema carga disponibilidad real del tutor
        ↓
Sistema revisa reservas ocupadas para esa fecha
        ↓
Muestra solo horas disponibles
        ↓
Estudiante elige fecha, hora, modalidad y duración
        ↓
Sistema calcula total
        ↓
Estudiante confirma reserva
        ↓
Se guarda en Firestore con estado pendiente
```

---

## 7.4 Validaciones actuales de reserva

El sistema valida:

```text
Que el estudiante haya iniciado sesión.
Que exista tutorId.
Que exista nombre del tutor.
Que exista curso.
Que exista fecha.
Que exista hora.
Que exista modalidad.
Que exista duración.
Que exista total calculado.
Que la fecha no sea pasada.
Que la fecha pertenezca al año actual.
Que la hora no haya pasado si la fecha es hoy.
Que la hora esté dentro de la disponibilidad del tutor.
Que la hora no choque con otra reserva pendiente, aceptada o confirmada.
Que el botón no permita doble clic mientras guarda.
```

---

## 7.5 Resultado de reserva

Cuando se guarda correctamente:

```text
La reserva queda con estado: pendiente
El estudiante ve confirmación en pantalla
El tutor ve la reserva en su panel
El estudiante puede verla en Mis sesiones
```

---

# 8. Flujo de Mis sesiones del estudiante

Archivo principal:

```text
js/sesiones.js
```

Página:

```text
pages/sesiones.html
```

Flujo:

```text
Estudiante entra a Mis sesiones
        ↓
Sistema valida sesión
        ↓
Busca reservas donde usuarioId == uid del estudiante
        ↓
Ordena sesiones por fecha y hora
        ↓
Muestra las sesiones con su estado actual
```

Estados visibles:

```text
Pendiente
Aceptada
Rechazada
Realizada
Cancelada
```

Mensajes por estado:

```text
Pendiente: solicitud enviada, espera respuesta del tutor.
Aceptada: el tutor aceptó la reserva.
Rechazada: el tutor rechazó la solicitud.
Realizada: la sesión ya fue marcada como realizada.
Cancelada: la sesión fue cancelada.
```

---

# 9. Flujo del tutor

## 9.1 Postulación como tutor

```text
Usuario inicia sesión
        ↓
Entra a Quiero ser tutor
        ↓
Completa formulario de postulación
        ↓
Sistema valida campos obligatorios
        ↓
Se guarda postulación en Firestore
        ↓
Estado inicial: pendiente
```

Campos validados:

```text
nombre
correo
teléfono
cursos
nivel
disponibilidad
experiencia
```

Reglas aplicadas:

```text
Un usuario no puede postular dos veces.
Un tutor ya aprobado no necesita volver a postular.
La postulación siempre inicia como pendiente.
```

---

## 9.2 Aprobación del tutor

```text
Admin entra al panel admin
        ↓
Ve postulaciones pendientes
        ↓
Aprueba una postulación
        ↓
Sistema usa transacción
        ↓
Crea o actualiza documento en tutores
        ↓
Cambia postulación a aprobado
        ↓
Cambia rol del usuario a tutor
```

Al aprobar, el tutor queda con:

```text
estado: activo
estadoPublico: activo
perfilCompleto: false
```

Esto significa que el tutor ya está aprobado, pero todavía debe completar su perfil público.

---

## 9.3 Rechazo del tutor

```text
Admin entra al panel admin
        ↓
Ve postulación pendiente
        ↓
Rechaza la postulación
        ↓
Sistema usa transacción
        ↓
Cambia estado a rechazado
```

Una postulación ya revisada no puede aprobarse o rechazarse nuevamente desde el flujo normal.

---

# 10. Flujo del panel del tutor

Archivo principal:

```text
js/panel-tutor.js
```

Página:

```text
pages/panel-tutor.html
```

Flujo:

```text
Tutor inicia sesión
        ↓
Sistema valida que sea tutor activo
        ↓
Carga su perfil
        ↓
Carga sus reservas
        ↓
Muestra resumen, próxima sesión, reservas e historial
```

---

## 10.1 Acciones del tutor sobre reservas

Estados y acciones:

```text
Pendiente:
  → Aceptar
  → Rechazar

Aceptada:
  → Marcar realizada
  → Cancelar

Rechazada:
  → Sin acciones pendientes

Realizada:
  → Sin acciones pendientes

Cancelada:
  → Sin acciones pendientes
```

---

## 10.2 Seguridad aplicada en cambios de estado

El sistema ahora valida:

```text
Que el tutor haya iniciado sesión.
Que la reserva exista.
Que la reserva pertenezca al tutor actual.
Que el nuevo estado sea válido.
Que la reserva no esté en estado final.
Que la transición de estado sea permitida.
```

Transiciones permitidas:

```text
pendiente → aceptada
pendiente → rechazada
pendiente → cancelada

aceptada → realizada
aceptada → cancelada

confirmada → realizada
confirmada → cancelada
```

Estados finales:

```text
rechazada
realizada
cancelada
```

Una reserva en estado final ya no debe modificarse desde el panel.

---

# 11. Flujo de perfil del tutor

Archivo principal:

```text
js/perfil-tutor.js
```

Página:

```text
pages/perfil-tutor.html
```

Flujo:

```text
Tutor entra a editar perfil
        ↓
Sistema valida que sea tutor activo
        ↓
Carga datos actuales
        ↓
Tutor edita información pública
        ↓
Sistema valida campos
        ↓
Guarda cambios permitidos
        ↓
Marca perfilCompleto como true
```

Campos que el tutor puede actualizar:

```text
nombre
correo
teléfono
cursos
nivel
disponibilidad
descripcion
presentacion
experiencia
precio
precioHora
modalidad
distrito
zona
fotoUrl
estadoPublico
perfilCompleto
```

Campos que no debe modificar directamente:

```text
uid
estado
rating
fechaAprobacion
```

---

# 12. Flujo de disponibilidad del tutor

Archivo principal:

```text
js/disponibilidad-tutor.js
```

Página:

```text
pages/disponibilidad-tutor.html
```

Flujo:

```text
Tutor entra a disponibilidad
        ↓
Sistema valida que sea tutor activo
        ↓
Carga bloques existentes
        ↓
Tutor agrega o elimina bloques
        ↓
Sistema valida día y horas
        ↓
Guarda disponibilidad en Firestore
```

Formato del bloque:

```js
{
  dia: "lunes",
  horaInicio: "16:00",
  horaFin: "20:00",
  activo: true
}
```

Validaciones actuales:

```text
La disponibilidad debe ser una lista.
Cada bloque debe ser un objeto válido.
El día debe ser permitido.
La hora de inicio debe tener formato HH:mm.
La hora de fin debe tener formato HH:mm.
La hora de inicio debe ser menor que la hora de fin.
El campo activo se conserva para no romper bloques antiguos.
```

---

# 13. Flujo del administrador

Archivo principal:

```text
js/admin.js
```

Página:

```text
pages/admin.html
```

Flujo:

```text
Admin inicia sesión
        ↓
Sistema valida correo admin
        ↓
Carga panel administrador
        ↓
Muestra postulaciones de tutores
        ↓
Permite aprobar o rechazar
```

Correo admin configurado:

```text
admin@gmail.com
```

---

## 13.1 Panel admin actual

El panel admin ya cuenta con:

```text
Dashboard visual
Sidebar
Resumen de postulaciones
Filtros por estado
Listado de postulaciones
Botones para aprobar/rechazar
Mensajes de estado
Validación de admin
Bloqueo de botones mientras se procesa una acción
```

Filtros:

```text
Todos
Pendientes
Aprobadas
Rechazadas
```

---

## 13.2 Seguridad del admin

Las funciones del admin ahora usan:

```js
asegurarAdmin()
```

Esto evita que un usuario normal ejecute acciones administrativas desde el frontend.

Funciones protegidas:

```text
obtenerPostulacionesTutores()
aprobarPostulacionTutor()
rechazarPostulacionTutor()
```

---

# 14. Etapas trabajadas hasta ahora

## Etapa 6 - Mis sesiones del estudiante

Se creó y mejoró la sección donde el estudiante puede ver sus reservas.

Resultado:

```text
El estudiante puede ver sus sesiones reservadas.
Puede ver el estado actual de cada tutoría.
Puede diferenciar pendiente, aceptada, rechazada, realizada y cancelada.
```

---

## Etapa 7 - Disponibilidad real y bloqueo de horarios

Se conectó la reserva con la disponibilidad real del tutor.

Resultado:

```text
La reserva ya no depende solo de horarios fijos.
El sistema revisa los bloques configurados por el tutor.
El sistema bloquea horarios ya ocupados.
Se evita doble reserva sobre la misma hora.
```

---

## Etapa 8 - Panel del tutor

Se mejoró el panel del tutor.

Resultado:

```text
El tutor puede ver reservas recibidas.
Puede aceptar o rechazar reservas pendientes.
Puede marcar como realizada una reserva aceptada.
Puede cancelar una reserva aceptada.
Puede ver resumen e historial.
```

---

## Etapa 9 - Panel administrador

Se mejoró el panel admin.

Resultado:

```text
El admin puede ver postulaciones.
Puede aprobar tutores.
Puede rechazar tutores.
Puede filtrar postulaciones por estado.
El diseño quedó como dashboard profesional.
```

---

## Etapa 10 - Página de cuenta, roles y redirecciones

Se mejoró la página de cuenta.

Resultado:

```text
Login y registro más ordenados.
Redirección según rol.
Admin va a admin.html.
Tutor aprobado va a panel-tutor.html.
Tutor pendiente va a tutor.html.
Estudiante va a app.html.
```

---

## Etapa 11 - Responsive y detalles visuales

Se revisaron estilos para mejorar la web en computadora, tablet y celular.

Resultado:

```text
Menús más adaptados a móvil.
Tarjetas más ordenadas.
Formularios más legibles.
Paneles más responsivos.
Menos riesgo de scroll horizontal.
Botones y mensajes más consistentes.
```

---

## Etapa 12 - Seguridad básica, Firebase y errores

Esta es la etapa actual.

Se reforzaron:

```text
firebase-service.js
app.js
panel-tutor.js
perfil-tutor.js
disponibilidad-tutor.js
sesiones.js
```

Resultado principal:

```text
El sistema valida mejor los datos.
El admin tiene funciones protegidas.
El tutor solo puede modificar sus propias reservas.
El estudiante solo puede crear reservas válidas.
El perfil del tutor solo acepta campos permitidos.
La disponibilidad del tutor se guarda con validación.
Los errores se muestran de forma más clara.
```

---

# 15. Cambios principales hechos en `firebase-service.js`

Se agregaron helpers de seguridad:

```js
const ADMIN_EMAILS = ["admin@gmail.com"].map((correo) =>
  correo.toLowerCase().trim(),
);

const ESTADOS_RESERVA_VALIDOS = [
  "pendiente",
  "aceptada",
  "rechazada",
  "realizada",
  "cancelada",
  "confirmada",
];

function normalizarCorreo(correo) {}
function normalizarEstado(estado) {}
function obtenerUsuarioAutenticado(mensajeError) {}
function asegurarAdmin() {}
function validarCampoObligatorio(valor, mensajeError) {}
```

---

## 15.1 Registro protegido

Antes el registro podía guardar el rol recibido directamente.

Ahora se recomienda permitir solo:

```text
estudiante
tutor
```

Si llega otro rol, se fuerza a:

```text
estudiante
```

---

## 15.2 Reserva protegida

`guardarReserva()` ahora valida campos obligatorios antes de guardar.

Campos validados:

```text
tutorId
tutor
curso
fecha
hora
modalidad
duracion
total
```

---

## 15.3 Postulación protegida

`guardarPostulacionTutor()` ahora valida:

```text
Que el usuario esté logueado.
Que no sea tutor activo.
Que no tenga una postulación existente.
Que complete los campos obligatorios.
```

---

## 15.4 Admin protegido

Estas funciones ahora usan `asegurarAdmin()`:

```text
obtenerPostulacionesTutores()
aprobarPostulacionTutor()
rechazarPostulacionTutor()
```

---

## 15.5 Reservas del tutor protegidas

`obtenerReservasDelTutor()` ahora valida:

```text
Que el usuario esté logueado.
Que sea tutor activo.
```

---

## 15.6 Cambio de estado con transacción

`actualizarEstadoReserva()` ahora usa `runTransaction()`.

Valida:

```text
Reserva existente.
Reserva perteneciente al tutor actual.
Estado nuevo válido.
Estado actual no finalizado.
Transición permitida.
```

---

## 15.7 Perfil del tutor protegido

`actualizarPerfilTutorActual()` ahora acepta solo campos permitidos.

Evita modificar campos delicados como:

```text
uid
estado
rating
fechaAprobacion
```

---

## 15.8 Disponibilidad protegida

`guardarDisponibilidadTutorActual()` ahora valida cada bloque.

Valida:

```text
Día válido.
Hora de inicio válida.
Hora de fin válida.
Inicio menor que fin.
Campo activo conservado.
```

---

# 16. Reglas básicas de Firestore propuestas

En esta actualización también se prepararon reglas básicas para Firestore.

Ruta en Firebase:

```text
Firebase Console
Firestore Database
Rules
```

Objetivo de las reglas:

```text
Evitar que usuarios no autorizados lean o modifiquen datos ajenos.
Permitir que estudiantes creen sus propias reservas.
Permitir que tutores gestionen solo sus reservas.
Permitir que el admin gestione postulaciones.
Evitar borrados desde la web.
```

---

# 17. Pruebas recomendadas después de la Etapa 12

## 17.1 Prueba como estudiante

```text
1. Iniciar sesión como estudiante.
2. Entrar a app.html.
3. Buscar un tutor activo.
4. Abrir modal de reserva.
5. Elegir fecha válida.
6. Elegir hora disponible.
7. Confirmar reserva.
8. Ver confirmación.
9. Entrar a Mis sesiones.
10. Confirmar que aparece la reserva pendiente.
```

---

## 17.2 Prueba como tutor

```text
1. Iniciar sesión como tutor aprobado.
2. Entrar a panel-tutor.html.
3. Confirmar que aparece la reserva del estudiante.
4. Aceptar la reserva.
5. Confirmar que cambia a aceptada.
6. Marcar como realizada.
7. Confirmar que pasa al historial.
```

---

## 17.3 Prueba como admin

```text
1. Iniciar sesión como admin@gmail.com.
2. Entrar a admin.html.
3. Ver postulaciones.
4. Aprobar una postulación pendiente.
5. Revisar que se cree el tutor.
6. Rechazar una postulación pendiente.
7. Confirmar que no se pueda revisar dos veces la misma postulación.
```

---

## 17.4 Prueba de disponibilidad

```text
1. Iniciar sesión como tutor aprobado.
2. Entrar a disponibilidad-tutor.html.
3. Agregar bloque válido.
4. Guardar disponibilidad.
5. Entrar como estudiante.
6. Intentar reservar con ese tutor.
7. Confirmar que solo aparezcan horas dentro del bloque.
8. Reservar una hora.
9. Intentar reservar otra vez en la misma hora.
10. Confirmar que el horario ya no aparezca disponible.
```

---

## 17.5 Prueba de perfil tutor

```text
1. Iniciar sesión como tutor aprobado.
2. Entrar a perfil-tutor.html.
3. Completar todos los campos.
4. Guardar perfil.
5. Revisar Firestore.
6. Confirmar que perfilCompleto sea true.
7. Entrar como estudiante.
8. Confirmar que el tutor aparece en la lista pública.
```

---

# 18. Estado actual del MVP

TutorFlash-Web ya puede considerarse un MVP avanzado porque tiene:

```text
Autenticación real.
Roles diferenciados.
Panel de estudiante.
Panel de tutor.
Panel administrador.
Postulación de tutores.
Aprobación y rechazo de tutores.
Perfil público de tutor.
Disponibilidad real.
Reserva de tutorías.
Estados de reserva.
Mis sesiones del estudiante.
Historial del tutor.
Bloqueo de horarios ocupados.
Validaciones básicas.
Diseño responsive.
Publicación en GitHub Pages.
```

---

# 19. Pendientes después de la Etapa 12

Después de cerrar esta etapa, las siguientes partes serían:

```text
Etapa 13 - Pruebas finales, GitHub Pages y README principal
Etapa 14 - Notificaciones visuales
Etapa 15 - Simulación de pagos más ordenada
Etapa 16 - Calificación del tutor después de sesión realizada
Etapa 17 - Mejorar landing principal de TutorFlash
```

---

# 20. Pendientes técnicos recomendados

Además de las etapas funcionales, se recomienda revisar:

```text
Reglas Firestore publicadas y probadas.
Mensajes de error visibles para usuario.
Datos antiguos compatibles con campos nuevos.
Validación de fechas en todos los formularios.
Nombres de roles consistentes.
Redirección correcta desde cuenta.html raíz a pages/cuenta.html.
Revisión final de consola del navegador.
Revisión final en celular.
Revisión final en GitHub Pages.
```

---

# 21. Resultado esperado de esta actualización

Al finalizar esta actualización, TutorFlash-Web debe quedar más estable y seguro.

El objetivo no es convertirlo todavía en una plataforma comercial completa, sino en un MVP avanzado y presentable, con flujos reales y mejor control de errores.

Resultado esperado:

```text
El estudiante puede reservar sin romper horarios.
El tutor puede gestionar solo sus reservas.
El admin puede aprobar o rechazar tutores.
La web valida mejor los datos antes de guardarlos.
Firestore tiene reglas básicas de protección.
El proyecto queda documentado para continuar con pruebas finales.
```

---

# 22. Resumen final corto

```text
TutorFlash-Web pasó de maqueta a MVP avanzado.
Ahora tiene login, roles, reservas, tutores, admin, disponibilidad real y seguridad básica.
La Etapa 12 refuerza Firebase, validaciones, permisos y errores.
El siguiente paso será probar todo el flujo completo y preparar la Etapa 13.
```
