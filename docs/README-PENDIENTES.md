# TutorFlash-Web - Pendientes para segunda versión

Este documento reúne las mejoras pendientes para continuar el desarrollo de TutorFlash-Web después de la primera versión funcional del MVP.

## Estado actual

La web ya cuenta con una primera versión funcional del MVP. Actualmente permite:

- Ingresar desde una pantalla principal.
- Acceder a la plataforma web.
- Buscar tutores por curso.
- Ver tutores disponibles.
- Abrir un modal de reserva.
- Elegir fecha, hora, modalidad y duración.
- Calcular el total según duración.
- Confirmar una solicitud de tutoría.
- Usar la web en computadora y celular.
- Navegar con menú hamburguesa en celular.

Según el MVP, las funciones principales priorizadas son buscar tutores por curso y reservar una tutoría rápida, por lo que la base principal ya está implementada.

## Pendientes principales

### 1. Agregar pago simulado

En el prototipo, el flujo termina con “Pagar y aprender”. Actualmente la web confirma la solicitud, pero todavía no muestra una parte de pago.

Pendiente:

- Agregar método de pago simulado.
- Opciones posibles:
  - Yape
  - Plin
  - Tarjeta
  - Pago pendiente
- Mostrar resumen antes de confirmar.
- Cambiar el mensaje final de “Solicitud enviada” a algo más parecido a “Reserva confirmada”.
- Agregar botón final: “Ir a mi sesión”.

### 2. Crear sección “Mis sesiones”

El prototipo muestra una experiencia similar a una app, donde el estudiante puede revisar sus sesiones. La web todavía no tiene una sección para mostrar reservas realizadas.

Pendiente:

- Crear una sección llamada “Mis sesiones”.
- Mostrar la última reserva confirmada.
- Datos a mostrar:
  - Tutor
  - Curso
  - Fecha
  - Hora
  - Modalidad
  - Duración
  - Total
  - Estado: Confirmada
- Agregar botón “Volver a buscar tutor”.

### 3. Mejorar la confirmación final

Actualmente la confirmación funciona, pero puede verse más profesional.

Pendiente:

- Cambiar título a “Reserva confirmada”.
- Agregar mensaje: “Tu tutoría fue registrada correctamente”.
- Mostrar un resumen más ordenado.
- Agregar botones:
  - “Ir a mis sesiones”
  - “Reservar otra tutoría”

### 4. Agregar sección “¿Para quién es TutorFlash?”

En la presentación se indica que TutorFlash está dirigido a estudiantes que necesitan apoyo académico rápido antes de evaluaciones o entregas. También se menciona como usuario objetivo a estudiantes de secundaria, instituto o universidad. :contentReference[oaicite:0]{index=0}

Pendiente:

- Crear una sección explicativa:
  - Estudiantes de secundaria.
  - Estudiantes de instituto.
  - Estudiantes universitarios.
  - Personas que necesitan reforzar antes de exámenes, prácticas o entregas.
- Agregar una frase como:
  - “Ideal para estudiantes que necesitan resolver dudas en poco tiempo.”

### 5. Agregar sección “Quiero ser tutor”

El proyecto también necesita captar tutores. En la presentación se menciona que los tutores pueden ser estudiantes destacados, profesores independientes o universitarios de ciclos avanzados. :contentReference[oaicite:1]{index=1}

Pendiente:

- Crear sección para tutores.
- Texto sugerido:
  - “Gana por cada tutoría realizada, elige tus horarios y ayuda a otros estudiantes.”
- Agregar botón:
  - “Postular como tutor”
- Por ahora puede ser solo maqueta, sin formulario real.

### 6. Mejorar la sección de contacto

La sección contacto todavía puede quedar más completa.

Pendiente:

- Agregar dos llamados a la acción:
  - “Quiero una tutoría”
  - “Quiero ser tutor”
- Agregar texto breve:
  - “TutorFlash está en etapa de prototipo. Pronto habilitaremos contacto directo por WhatsApp.”
- Más adelante conectar WhatsApp real.

### 7. Agregar simulación de disponibilidad más clara

La web ya maneja disponibilidad según fecha y hora, pero se puede mejorar visualmente.

Pendiente:

- Mostrar etiquetas como:
  - Disponible ahora
  - Disponible hoy
  - Disponible mañana
- Ocultar o bloquear horas que ya pasaron.
- Mostrar mensaje si ya no quedan horarios disponibles hoy.

### 8. Mejorar tarjetas de tutores

Las tarjetas ya funcionan, pero podrían verse más completas.

Pendiente:

- Agregar nivel:
  - Escolar
  - Instituto
  - Universidad
- Agregar modalidad:
  - Virtual
  - Presencial futuro
- Agregar tiempo de respuesta:
  - Responde en 5 min
  - Responde en 10 min
- Agregar especialidad:
  - Álgebra
  - Cálculo
  - Inglés básico
  - Programación inicial

### 9. Agregar más cursos

Actualmente hay cursos básicos. Se pueden ampliar según el público objetivo.

Pendiente:

- Comunicación
- Economía
- Administración
- Excel
- Redacción
- Biología
- Historia
- Razonamiento matemático
- Razonamiento verbal

### 10. Mejorar el diseño de la versión móvil

La web ya es responsive, pero todavía puede pulirse.

Pendiente:

- Revisar espacios en la pantalla inicial.
- Revisar tamaño de tarjetas.
- Revisar modal de reserva en celulares pequeños.
- Revisar que ningún elemento se salga del ancho.
- Probar en Brave, Chrome y navegador del celular.

### 11. Agregar validación visual del formulario

La validación de fecha ya existe, pero se puede mejorar la experiencia.

Pendiente:

- Mensajes más claros debajo del campo.
- Evitar que el usuario confirme si falta fecha u hora.
- Mostrar aviso si selecciona una fecha no permitida.
- Confirmar que solo permita fechas del año actual.

### 12. Agregar navegación inferior simulada

En el prototipo visual aparece una navegación tipo app móvil con opciones como inicio, sesiones, mensajes y perfil. :contentReference[oaicite:2]{index=2}

Pendiente opcional:

- Agregar barra inferior solo en celular.
- Opciones:
  - Inicio
  - Buscar
  - Sesiones
  - Perfil
- Por ahora solo como maqueta visual.

### 13. No incluir todavía funciones avanzadas

Según el MVP, la primera versión no debe incluir chat completo, videollamada, membresías, historial detallado, certificación avanzada de tutores ni recomendaciones con IA. :contentReference[oaicite:3]{index=3}

No desarrollar todavía:

- Chat interno completo.
- Videollamada dentro de la web.
- Sistema de membresías.
- Login avanzado.
- Perfil completo de usuario.
- Recomendaciones con IA.
- Certificación avanzada de tutores.

## Orden recomendado de desarrollo

1. Agregar pago simulado.
2. Mejorar confirmación final.
3. Crear sección “Mis sesiones”.
4. Agregar sección “¿Para quién es TutorFlash?”.
5. Agregar sección “Quiero ser tutor”.
6. Mejorar contacto.
7. Mejorar tarjetas de tutores.
8. Agregar más cursos.
9. Probar responsive en celular.
10. Actualizar README principal.
11. Subir cambios a GitHub Pages.

## Objetivo de la segunda versión

La segunda versión debe acercar más la web al flujo completo del prototipo:

1. Buscar curso.
2. Elegir tutor.
3. Reservar sesión.
4. Pagar de forma simulada.
5. Confirmar reserva.
6. Ver la sesión reservada.

Con estas mejoras, TutorFlash-Web quedará más alineado con el MVP presentado y con la idea de una plataforma rápida, accesible y fácil de usar.
