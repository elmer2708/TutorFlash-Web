# TutorFlash-Web - Roadmap de mejoras pendientes

TutorFlash-Web dejó de ser solo una maqueta visual y actualmente funciona como un MVP avanzado de plataforma web para tutorías rápidas.

La plataforma ya cuenta con autenticación, roles de usuario, postulación de tutores, aprobación por administrador, perfil editable del tutor, disponibilidad real, reservas, panel del tutor y seguimiento de sesiones del estudiante.

Este documento organiza las etapas pendientes para continuar el desarrollo del proyecto.

---

## Estado actual del proyecto

Actualmente TutorFlash-Web ya permite:

- Registro e inicio de sesión con Firebase.
- Manejo de roles: estudiante, tutor y administrador.
- Postulación de tutores.
- Aprobación o rechazo de tutores por parte del administrador.
- Panel para tutores aprobados.
- Edición del perfil público del tutor.
- Configuración de disponibilidad del tutor.
- Visualización de tutores activos por parte del estudiante.
- Reserva de tutorías.
- Estado inicial de reserva como pendiente.
- Aceptación, rechazo, cancelación o marcado como realizada por parte del tutor.
- Vista de “Mis sesiones” para estudiantes.
- Bloqueo de horarios ocupados.
- Prevención de doble reserva por doble clic.

---

# Etapas pendientes principales

## Etapa 9: Mejorar panel admin

Objetivo: mejorar la administración de tutores y postulaciones.

Pendiente:

- Revisar `pages/admin.html`.
- Revisar `css/admin.css`.
- Revisar `js/admin.js`.
- Mejorar tarjetas de postulaciones.
- Mostrar estado claro de cada tutor.
- Aprobar tutores de forma más segura.
- Rechazar tutores con mensajes claros.
- Evitar errores por doble clic en aprobar o rechazar.
- Mostrar datos importantes del tutor antes de aprobar.
- Mejorar mensajes de carga, éxito y error.

Resultado esperado:

El administrador podrá gestionar mejor las postulaciones y controlar qué tutores aparecen en la plataforma.

---

## Etapa 10: Mejorar página de cuenta, roles y redirecciones

Objetivo: ordenar el flujo después del inicio de sesión.

Pendiente:

- Revisar `pages/cuenta.html`.
- Revisar `css/cuenta.css`.
- Revisar `js/cuenta.js`.
- Validar que cada usuario sea enviado a la página correcta.
- Admin debe ir a `admin.html`.
- Estudiante debe ir a `app.html`.
- Tutor nuevo o pendiente debe ir a `tutor.html`.
- Tutor aprobado debe ir a `panel-tutor.html`.
- Mejorar mensajes de inicio de sesión.
- Mejorar mensajes de registro.
- Evitar que un usuario entre a páginas que no corresponden a su rol.

Resultado esperado:

El usuario tendrá una experiencia más clara al iniciar sesión, registrarse o cerrar sesión.

---

## Etapa 11: Mejorar diseño responsive y detalles visuales finales

Objetivo: hacer que TutorFlash-Web se vea bien en computadora, tablet y celular.

Pendiente:

- Revisar estilos en todas las páginas.
- Mejorar navegación móvil.
- Ajustar tarjetas de tutores.
- Ajustar modales de reserva.
- Mejorar botones.
- Revisar espacios, márgenes y tamaños de letra.
- Revisar colores principales de TutorFlash.
- Validar que no se rompa el diseño en pantallas pequeñas.
- Revisar footer y header.
- Unificar estilo visual entre estudiante, tutor y admin.

Resultado esperado:

La plataforma debe verse profesional, limpia y ordenada en diferentes tamaños de pantalla.

---

## Etapa 12: Revisar Firebase, seguridad básica y errores

Objetivo: mejorar la estabilidad y seguridad básica del sistema.

Pendiente:

- Revisar `js/firebase-service.js`.
- Revisar reglas de seguridad de Firestore.
- Validar que cada usuario solo pueda ver sus propios datos.
- Validar que solo el admin pueda aprobar o rechazar tutores.
- Validar que solo el tutor dueño pueda cambiar el estado de sus reservas.
- Validar que el estudiante solo vea sus propias sesiones.
- Mejorar control de errores.
- Evitar reservas sin usuario.
- Evitar reservas sin tutor.
- Evitar datos incompletos.
- Revisar nombres de colecciones y campos.

Colecciones actuales:

- `usuarios`
- `reservas`
- `postulacionesTutores`
- `tutores`
- `disponibilidadTutores`

Resultado esperado:

Firebase debe quedar más ordenado, seguro y preparado para una presentación funcional.

---

## Etapa 13: Pruebas finales, GitHub Pages y README

Objetivo: dejar el proyecto listo para presentar.

Pendiente:

- Probar flujo completo como estudiante.
- Probar flujo completo como tutor.
- Probar flujo completo como admin.
- Probar registro de usuario nuevo.
- Probar postulación de tutor.
- Probar aprobación del tutor.
- Probar edición de perfil tutor.
- Probar configuración de disponibilidad.
- Probar reserva de tutoría.
- Probar bloqueo de horarios ocupados.
- Probar cambio de estados de reservas.
- Probar “Mis sesiones”.
- Probar panel tutor.
- Probar panel admin.
- Subir cambios finales a GitHub.
- Revisar GitHub Pages.
- Actualizar README principal.
- Agregar capturas del proyecto.
- Agregar explicación del flujo general.

Resultado esperado:

TutorFlash-Web quedará como un MVP avanzado funcional, publicado en GitHub Pages y listo para exposición o presentación académica.

---

# Etapas opcionales para versión más profesional

## Etapa 14: Notificaciones visuales

Objetivo: reemplazar alertas simples por mensajes visuales más modernos.

Pendiente:

- Crear componente de notificación tipo toast.
- Mostrar mensajes de éxito.
- Mostrar mensajes de error.
- Mostrar mensajes de advertencia.
- Usar notificaciones en reservas, login, tutor y admin.
- Evitar exceso de `alert()`.

Resultado esperado:

La plataforma se sentirá más profesional y moderna.

---

## Etapa 15: Simulación de pagos más ordenada

Objetivo: mejorar el flujo de pago simulado.

Pendiente:

- Crear una sección de resumen antes de confirmar reserva.
- Mostrar tutor, curso, fecha, hora, duración y total.
- Mostrar método de pago simulado.
- Registrar mejor el estado de pago.
- Agregar campo `estadoPago`.
- Agregar campo `metodoPago`.
- Mostrar pago pendiente o simulado.

Resultado esperado:

La reserva tendrá un flujo más parecido a una plataforma real.

---

## Etapa 16: Calificación del tutor después de sesión realizada

Objetivo: permitir que el estudiante califique al tutor.

Pendiente:

- Mostrar botón para calificar solo cuando la sesión esté realizada.
- Crear formulario de calificación.
- Guardar estrellas y comentario.
- Asociar calificación al tutor.
- Calcular promedio de rating.
- Mostrar rating real en tarjetas de tutores.

Resultado esperado:

Los tutores podrán tener reputación dentro de la plataforma.

---

## Etapa 17: Mejorar landing principal de TutorFlash

Objetivo: mejorar la página inicial para que parezca una web más comercial y profesional.

Pendiente:

- Mejorar `index.html`.
- Mejorar diseño principal.
- Explicar qué es TutorFlash.
- Mostrar beneficios para estudiantes.
- Mostrar beneficios para tutores.
- Agregar llamada a la acción.
- Agregar sección de cómo funciona.
- Agregar sección de cursos disponibles.
- Agregar sección de confianza o presentación.
- Mejorar botones hacia login, registro y búsqueda de tutores.

Resultado esperado:

La página principal debe explicar mejor el proyecto y atraer al usuario desde el primer ingreso.

---

# Resumen de avance

Etapas completadas:

- Mis sesiones del estudiante.
- Reserva con disponibilidad real del tutor.
- Bloqueo de horarios ocupados.
- Prevención de doble reserva.
- Mejora del panel del tutor.

Etapas principales pendientes:

- Etapa 9: Panel admin.
- Etapa 10: Cuenta, roles y redirecciones.
- Etapa 11: Diseño responsive.
- Etapa 12: Firebase y seguridad.
- Etapa 13: Pruebas finales y publicación.

Etapas opcionales:

- Etapa 14: Notificaciones visuales.
- Etapa 15: Simulación de pagos.
- Etapa 16: Calificación del tutor.
- Etapa 17: Landing principal.

---

# Estado esperado al finalizar

Al terminar estas etapas, TutorFlash-Web podrá presentarse como una plataforma web funcional tipo MVP avanzado, con flujo completo para estudiantes, tutores y administrador.

El proyecto podrá demostrar:

- Gestión de usuarios.
- Gestión de roles.
- Gestión de tutores.
- Gestión de disponibilidad.
- Sistema de reservas.
- Estados de sesiones.
- Paneles diferenciados.
- Base de datos en Firebase.
- Publicación en GitHub Pages.
