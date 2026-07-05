# TutorFlash-Web - Plataformas y roles

Este documento resume cómo se organizará TutorFlash-Web por tipo de usuario.

La idea principal es que exista un solo sistema de inicio de sesión, pero que después el sistema redirija al usuario según su rol o estado dentro de Firebase.

---

## Idea principal

TutorFlash-Web tendrá una sola entrada de acceso mediante `cuenta.html`.

Después de iniciar sesión, el sistema revisará si el usuario actual es tutor activo.

- Si el usuario es tutor aprobado, será redirigido a `panel-tutor.html`.
- Si el usuario no es tutor aprobado, será redirigido a `app.html`.

Flujo esperado:

- Usuario inicia sesión.
- Firebase verifica el usuario actual.
- El sistema revisa si existe como tutor activo.
- Si es tutor activo, entra al panel del tutor.
- Si no es tutor activo, entra a la plataforma del estudiante.

---

## Roles principales

El proyecto se organizará en tres tipos de usuario:

- Estudiante.
- Tutor.
- Administrador.

Cada rol tendrá una experiencia diferente dentro de la misma web.

---

## Plataforma del estudiante

La plataforma del estudiante será el espacio donde los usuarios podrán buscar tutores, reservar sesiones y revisar sus tutorías.

### Página principal del estudiante

Archivo actual:

- `pages/app.html`

Esta página funcionará como la plataforma principal del estudiante.

### Funciones del estudiante

- Buscar tutores por curso.
- Ver tutores disponibles.
- Filtrar por cursos.
- Abrir modal de reserva.
- Elegir fecha, hora, modalidad y duración.
- Ver total calculado.
- Confirmar una reserva.
- Guardar la reserva en Firestore.
- Ver sus sesiones reservadas.
- Postular como tutor si desea enseñar.

### Menú recomendado del estudiante

- Buscar.
- Tutores.
- Mis sesiones.
- Mi perfil.
- Quiero ser tutor.
- Salir.

### Página futura de perfil del estudiante

Archivos sugeridos:

- `pages/perfil-estudiante.html`
- `css/perfil-estudiante.css`
- `js/perfil-estudiante.js`

### Información del perfil del estudiante

El perfil del estudiante podría mostrar:

- Nombre del estudiante.
- Correo electrónico.
- Rol: estudiante.
- Cantidad de reservas realizadas.
- Historial resumido de sesiones.
- Estado de cuenta.

---

## Plataforma del tutor

La plataforma del tutor será el espacio para los usuarios que ya fueron aprobados como tutores.

### Página principal del tutor

Archivo actual:

- `pages/panel-tutor.html`

Esta página funcionará como el panel del tutor aprobado.

### Funciones actuales del tutor

- Ver reservas recibidas.
- Ver estudiante que reservó.
- Ver curso reservado.
- Ver fecha.
- Ver hora.
- Ver modalidad.
- Ver duración.
- Ver total.
- Ver método de pago simulado.

### Menú recomendado del tutor

- Mis reservas.
- Mi perfil tutor.
- Ver plataforma.
- Salir.

### Página futura de perfil del tutor

Archivos sugeridos:

- `pages/perfil-tutor.html`
- `css/perfil-tutor.css`
- `js/perfil-tutor.js`

### Información del perfil del tutor

El perfil del tutor podría mostrar:

- Nombre del tutor.
- Correo electrónico.
- Teléfono o WhatsApp.
- Cursos que enseña.
- Nivel que puede enseñar.
- Disponibilidad.
- Estado: activo.
- Fecha de aprobación.

### Mejoras futuras para el tutor

- Editar cursos que enseña.
- Editar disponibilidad.
- Ver historial de reservas.
- Marcar sesiones como realizadas.
- Marcar sesiones como canceladas.
- Ver ingresos acumulados.

---

## Panel de administración

El panel de administración será solo para revisar postulaciones y gestionar tutores.

### Página actual

- `pages/admin.html`

### Importante

Esta página no debe aparecer en el menú público.

El acceso será mediante link directo y más adelante deberá protegerse con reglas seguras en Firestore.

### Funciones actuales del administrador

- Ver postulaciones de tutores.
- Aprobar postulaciones.
- Rechazar postulaciones.
- Cambiar el estado de una postulación a aprobado o rechazado.
- Crear un tutor real en la colección `tutores` cuando se aprueba una postulación.

### Colecciones relacionadas

- `postulacionesTutores`
- `tutores`

---

## Flujo completo actual del sistema

Actualmente el sistema funciona de esta manera:

1. El usuario crea cuenta o inicia sesión.
2. El usuario puede entrar como estudiante.
3. El usuario reserva tutorías.
4. El usuario puede postular como tutor.
5. La postulación se guarda en Firestore.
6. El administrador revisa la postulación.
7. El administrador aprueba o rechaza la postulación.
8. Si la postulación se aprueba:
   - La postulación cambia a estado aprobado.
   - Se crea un tutor en la colección `tutores`.
9. `app.html` muestra solo tutores activos.
10. El estudiante reserva con un tutor activo.
11. La reserva guarda `tutorId`.
12. El tutor aprobado entra a `panel-tutor.html`.
13. El tutor ve las reservas que le hicieron.

---

## Estructura recomendada de páginas

Las páginas activas deberían quedar organizadas así:

- `pages/app.html`
- `pages/cuenta.html`
- `pages/sesiones.html`
- `pages/tutor.html`
- `pages/panel-tutor.html`
- `pages/perfil-estudiante.html`
- `pages/perfil-tutor.html`
- `pages/admin.html`

---

## Estructura recomendada de CSS

Los estilos activos deberían quedar así:

- `css/app.css`
- `css/cuenta.css`
- `css/sesiones.css`
- `css/tutor.css`
- `css/panel-tutor.css`
- `css/perfil-estudiante.css`
- `css/perfil-tutor.css`
- `css/admin.css`

---

## Estructura recomendada de JavaScript

Los scripts activos deberían quedar así:

- `js/firebase-config.js`
- `js/firebase-service.js`
- `js/app.js`
- `js/cuenta.js`
- `js/sesiones.js`
- `js/tutor.js`
- `js/panel-tutor.js`
- `js/perfil-estudiante.js`
- `js/perfil-tutor.js`
- `js/admin.js`

---

## Redirección automática pendiente

Esta es una mejora importante pendiente.

Cuando el usuario inicie sesión desde:

- `pages/cuenta.html`

el sistema deberá revisar si el usuario actual es tutor activo.

### Si es tutor activo

Redirigir a:

- `pages/panel-tutor.html`

### Si no es tutor activo

Redirigir a:

- `pages/app.html`

Esta lógica se trabajará en:

- `js/cuenta.js`

usando la función:

- `obtenerTutorActivoActual()`

---

## Menús finales recomendados

### Menú del estudiante en app.html

El menú del estudiante debe mostrar:

- Buscar.
- Tutores.
- Mis sesiones.
- Mi perfil.
- Quiero ser tutor.
- Salir.

No debe mostrar:

- Admin.
- Presentación.
- Panel tutor.

### Menú del tutor en panel-tutor.html

El menú del tutor debe mostrar:

- Mis reservas.
- Mi perfil tutor.
- Ver plataforma.
- Salir.

### Menú del administrador

El panel administrador no debe aparecer en el menú público.

Acceso directo:

- `pages/admin.html`

---

## Próximas etapas recomendadas

### Etapa 1: Redirección por rol

- Revisar `js/cuenta.js`.
- Detectar si el usuario es tutor activo.
- Redirigir tutor aprobado a `panel-tutor.html`.
- Redirigir estudiante a `app.html`.

### Etapa 2: Perfil del estudiante

- Crear `pages/perfil-estudiante.html`.
- Crear `css/perfil-estudiante.css`.
- Crear `js/perfil-estudiante.js`.
- Mostrar datos del usuario.
- Mostrar cantidad de reservas realizadas.

### Etapa 3: Perfil del tutor

- Crear `pages/perfil-tutor.html`.
- Crear `css/perfil-tutor.css`.
- Crear `js/perfil-tutor.js`.
- Mostrar datos del tutor aprobado.
- Mostrar cursos, nivel y disponibilidad.

### Etapa 4: Estado de reservas para tutores

- Permitir que el tutor marque una reserva como realizada.
- Permitir que el tutor marque una reserva como cancelada.
- Actualizar estado en Firestore.

### Etapa 5: Reglas seguras de Firestore

- Proteger colección `usuarios`.
- Proteger colección `reservas`.
- Proteger colección `postulacionesTutores`.
- Proteger colección `tutores`.
- Permitir que cada estudiante vea solo sus reservas.
- Permitir que cada tutor vea solo sus reservas recibidas.
- Permitir que solo admin apruebe o rechace postulaciones.

---

## Estado actual resumido

Actualmente TutorFlash-Web ya tiene:

- Login con Firebase Authentication.
- Crear cuenta.
- Cerrar sesión.
- Firestore funcionando.
- Reservas guardadas en Firestore.
- Página Mis sesiones.
- Página Quiero ser tutor.
- Postulación real de tutores.
- Admin para aprobar o rechazar tutores.
- Colección `tutores`.
- Tutores activos visibles en `app.html`.
- Reservas con `tutorId`.
- Panel del tutor con reservas recibidas.
- Proyecto organizado con `docs` y `legacy`.

---

## Siguiente paso recomendado

El siguiente paso será trabajar en:

- `js/cuenta.js`

para hacer la redirección automática según el tipo de usuario:

- Tutor aprobado → `panel-tutor.html`
- Estudiante → `app.html`
