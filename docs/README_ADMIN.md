# TutorFlash-Web - Roadmap del Panel Administrador

Este documento organiza las mejoras que se pueden implementar en el panel administrador de TutorFlash-Web para que la plataforma se vea y funcione de manera más profesional.

Actualmente, el panel admin ya permite revisar postulaciones de tutores, aprobarlas, rechazarlas y filtrar por estado. Sin embargo, para que TutorFlash se sienta más como una plataforma real, el administrador debería poder controlar más partes importantes del sistema.

---

## Objetivo del panel administrador

El panel administrador tendrá como objetivo centralizar el control de la plataforma TutorFlash.

Desde este panel, el administrador podrá:

- Revisar el estado general de la plataforma.
- Controlar postulaciones de tutores.
- Gestionar tutores activos.
- Supervisar reservas o sesiones.
- Revisar usuarios registrados y sus roles.
- Detectar actividad importante dentro del sistema.

La idea es que el admin no solo apruebe tutores, sino que tenga una vista completa del funcionamiento de TutorFlash.

---

## Estructura recomendada del panel admin

El panel administrador se puede organizar en cinco secciones principales:

```text
1. Dashboard
2. Postulaciones
3. Tutores
4. Reservas / sesiones
5. Usuarios y roles
```

Además, más adelante se puede agregar una sección de actividad reciente dentro del dashboard.

---

# 1. Dashboard general

## Objetivo

Mostrar un resumen rápido del estado de TutorFlash.

Esta sería la primera vista que verá el administrador al entrar al panel.

## Qué puede mostrar

- Total de postulaciones.
- Postulaciones pendientes.
- Postulaciones aprobadas.
- Postulaciones rechazadas.
- Total de tutores activos.
- Total de reservas registradas.
- Reservas pendientes.
- Sesiones realizadas.

## Ejemplo visual

```text
Panel administrador

Postulaciones pendientes: 3
Tutores activos: 8
Reservas pendientes: 5
Sesiones realizadas: 12
```

## Por qué mejora la plataforma

Esta sección hace que el panel se sienta como un sistema real, porque el administrador puede entender rápidamente qué está pasando dentro de TutorFlash.

---

# 2. Postulaciones de tutores

## Estado actual

Esta sección ya está implementada en la Etapa 9.

Actualmente permite:

- Ver postulaciones de tutores.
- Filtrar por estado:
  - Todas.
  - Pendientes.
  - Aprobadas.
  - Rechazadas.
- Aprobar tutores.
- Rechazar tutores.
- Evitar doble clic en acciones.
- Mostrar mensajes vacíos personalizados.
- Validar acceso por correo administrador.

## Mejoras futuras

Se puede mejorar agregando:

- Buscador por nombre o correo.
- Vista detallada de la postulación.
- Botón para ver más información del tutor.
- Motivo de rechazo.
- Fecha de revisión.
- Nombre del admin que revisó.
- Confirmación visual más elegante en vez de `confirm()` del navegador.

## Datos importantes que debería mostrar

- Nombre del tutor.
- Correo.
- Teléfono.
- Cursos que enseña.
- Nivel educativo.
- Disponibilidad.
- Experiencia.
- Estado de la postulación.
- Fecha de postulación.
- Fecha de revisión.

---

# 3. Gestión de tutores activos

## Objetivo

Permitir que el administrador controle a los tutores que ya fueron aprobados.

Esta sección sería muy importante porque, después de aprobar a un tutor, el admin debería poder seguir gestionándolo.

## Qué puede mostrar

- Lista de tutores activos.
- Nombre del tutor.
- Correo.
- Cursos.
- Precio por sesión.
- Estado público.
- Perfil completo o incompleto.
- Fecha de aprobación.
- Cantidad de reservas recibidas.

## Acciones posibles

El administrador podría:

- Activar tutor.
- Desactivar tutor.
- Ver perfil del tutor.
- Revisar si completó su perfil.
- Revisar disponibilidad registrada.
- Ocultar tutor de la plataforma sin eliminarlo.
- Restaurar tutor oculto.

## Estados recomendados

```text
activo
inactivo
oculto
pendiente_perfil
```

## Ejemplo de flujo

```text
Admin aprueba a Alex
↓
Alex aparece en Tutores activos
↓
Admin revisa si Alex completó su perfil
↓
Si el perfil está incompleto, aparece como "Pendiente de completar"
↓
Si todo está correcto, queda visible en la plataforma
```

## Por qué mejora la plataforma

Hace que el admin tenga control real sobre los tutores, no solo sobre las postulaciones.

---

# 4. Reservas y sesiones

## Objetivo

Permitir que el administrador supervise las reservas realizadas dentro de TutorFlash.

No necesariamente debe editar todo al inicio, pero sí debería poder ver qué ocurre en la plataforma.

## Qué puede mostrar

- Estudiante que reservó.
- Tutor asignado.
- Curso.
- Fecha.
- Hora.
- Modalidad.
- Duración.
- Total.
- Estado de la reserva.

## Estados de reserva

```text
pendiente
aceptada
rechazada
realizada
cancelada
```

## Acciones posibles

En una versión inicial, el admin solo podría ver la información.

En una versión más avanzada, podría:

- Filtrar reservas por estado.
- Buscar por tutor o estudiante.
- Ver reservas de un tutor específico.
- Ver reservas pendientes.
- Ver sesiones realizadas.
- Cancelar una reserva en caso necesario.
- Marcar una reserva como revisada.

## Ejemplo visual

```text
Reservas recientes

Estudiante: María
Tutor: Alex
Curso: Matemática
Fecha: 10/07/2026
Hora: 5:00 p.m.
Estado: Aceptada
```

## Por qué mejora la plataforma

El administrador tendría una vista general de las sesiones y podría detectar problemas, reservas acumuladas o sesiones pendientes.

---

# 5. Usuarios y roles

## Objetivo

Permitir que el administrador revise los usuarios registrados en TutorFlash y sus roles.

Esta sección ayuda a controlar el acceso y corregir errores de roles.

## Qué puede mostrar

- Nombre del usuario.
- Correo.
- Rol actual.
- Fecha de registro.
- Estado del usuario.
- Si tiene postulación como tutor.
- Si es tutor aprobado.
- Si tiene reservas registradas.

## Roles principales

```text
admin
estudiante
tutor
```

## Acciones posibles

En una versión inicial:

- Ver usuarios registrados.
- Filtrar por rol.
- Buscar por correo.
- Ver detalle del usuario.

En una versión más avanzada:

- Cambiar rol manualmente.
- Desactivar usuario.
- Restaurar usuario.
- Ver historial de actividad.
- Ver reservas del usuario.

## Por qué mejora la plataforma

Hace que TutorFlash tenga una administración más completa y evita depender solo de Firebase manualmente.

---

# 6. Actividad reciente

## Objetivo

Mostrar los últimos movimientos importantes dentro de la plataforma.

Esta sección puede estar dentro del Dashboard.

## Qué podría mostrar

- Nuevo usuario registrado.
- Nueva postulación enviada.
- Tutor aprobado.
- Tutor rechazado.
- Nueva reserva creada.
- Reserva aceptada.
- Reserva cancelada.
- Sesión realizada.

## Ejemplo

```text
Actividad reciente

Alex fue aprobado como tutor.
María reservó una tutoría de Matemática.
Carlos envió una postulación.
Ana canceló una reserva.
```

## Por qué mejora la plataforma

Da la sensación de que el sistema está vivo y permite al admin ver rápidamente lo más reciente.

---

# 7. Mejoras visuales recomendadas

Para que el panel admin se vea más profesional, se recomienda usar:

- Sidebar fijo.
- Tarjetas resumen.
- Filtros por estado.
- Buscador.
- Tablas o tarjetas limpias.
- Estados con colores.
- Mensajes vacíos personalizados.
- Botones claros.
- Diseño responsive.
- Confirmaciones visuales elegantes.
- Separación por secciones.

## Diseño recomendado del sidebar

```text
TutorFlash

Dashboard
Postulaciones
Tutores
Reservas
Usuarios

Cerrar sesión
```

No se recomienda llenar el sidebar con información decorativa que no tenga función real. Es mejor mantenerlo limpio y útil.

---

# 8. Orden recomendado de implementación

Para no complicar demasiado el proyecto, se recomienda avanzar por etapas.

---

## Etapa Admin 1: Panel actual mejorado

Ya realizado:

- Diseño tipo dashboard.
- Sidebar.
- Tarjetas resumen.
- Filtros de postulaciones.
- Aprobar tutor.
- Rechazar tutor.
- Mensajes vacíos personalizados.

---

## Etapa Admin 2: Buscador de postulaciones

Agregar:

- Buscador por nombre.
- Buscador por correo.
- Filtro combinado con estado.

Ejemplo:

```text
Buscar: alex
Filtro: Aprobadas
Resultado: Alex aprobado
```

---

## Etapa Admin 3: Tutores activos

Agregar una sección para ver tutores aprobados.

Funciones iniciales:

- Listar tutores activos.
- Ver estado del perfil.
- Ver cursos.
- Ver correo.
- Ver estado público.

Funciones futuras:

- Activar tutor.
- Desactivar tutor.
- Ocultar tutor.
- Ver disponibilidad.

---

## Etapa Admin 4: Reservas

Agregar una sección para supervisar reservas.

Funciones iniciales:

- Listar reservas.
- Filtrar por estado.
- Ver tutor, estudiante, curso, fecha y hora.

Funciones futuras:

- Cancelar reserva.
- Marcar reserva como revisada.
- Ver historial por tutor.

---

## Etapa Admin 5: Usuarios y roles

Agregar una sección para revisar usuarios registrados.

Funciones iniciales:

- Listar usuarios.
- Filtrar por rol.
- Buscar por correo.

Funciones futuras:

- Cambiar rol.
- Desactivar usuario.
- Ver actividad del usuario.

---

## Etapa Admin 6: Actividad reciente

Agregar un bloque de actividad dentro del Dashboard.

Puede mostrar:

- Últimas postulaciones.
- Últimas reservas.
- Últimos cambios de estado.

---

# 9. Colecciones de Firebase relacionadas

El panel admin puede usar estas colecciones actuales:

```text
usuarios
postulacionesTutores
tutores
reservas
disponibilidadTutores
```

## Uso recomendado

### usuarios

Para revisar:

- Nombre.
- Correo.
- Rol.
- Fecha de registro.

### postulacionesTutores

Para revisar:

- Solicitudes de tutores.
- Estado de aprobación.
- Datos enviados por el postulante.

### tutores

Para revisar:

- Tutores aprobados.
- Perfil del tutor.
- Estado público.
- Cursos.
- Precio.
- Perfil completo.

### reservas

Para revisar:

- Sesiones solicitadas.
- Estado de reservas.
- Tutor.
- Estudiante.
- Fecha y hora.

### disponibilidadTutores

Para revisar:

- Horarios configurados por cada tutor.

---

# 10. Prioridad recomendada

La prioridad recomendada para seguir sería:

```text
1. Terminar bien Postulaciones
2. Agregar buscador
3. Agregar sección Tutores activos
4. Agregar sección Reservas
5. Agregar sección Usuarios
6. Agregar actividad reciente
```

---

# 11. Resultado esperado

Al terminar estas mejoras, el panel admin de TutorFlash permitirá controlar mejor la plataforma y se verá más profesional.

El administrador podrá ver:

- Quién quiere ser tutor.
- Qué tutores están activos.
- Qué reservas se están creando.
- Qué usuarios existen.
- Qué actividad ocurre en la plataforma.

Esto hará que TutorFlash-Web se sienta más como una plataforma completa y no solo como una maqueta o prototipo visual.

---

# Nota final

No es necesario implementar todo de golpe.

Lo recomendable es avanzar poco a poco, manteniendo el proyecto estable:

```text
Primero funcionalidad
Después diseño
Luego seguridad
Finalmente pruebas
```

Así TutorFlash podrá seguir creciendo como un MVP avanzado sin romper lo que ya funciona.

---

# Resumen final

Este README sirve como guía para convertir el panel admin en una sección más profesional.

Después de la Etapa 9, el admin puede crecer en este orden:

```text
Postulaciones → Tutores → Reservas → Usuarios → Actividad reciente
```
