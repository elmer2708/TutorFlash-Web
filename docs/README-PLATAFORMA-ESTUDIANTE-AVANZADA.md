# TutorFlash-Web - Plan para plataforma estudiante avanzada

Este documento resume las mejoras futuras para convertir la plataforma del estudiante en una experiencia más completa, profesional y conectada con Firebase.

La idea es que `app.html` deje de verse como una maqueta simple y se convierta en un verdadero panel para estudiantes.

## Objetivo

El objetivo será mejorar la plataforma del estudiante para que tenga:

```text id="is30qd"
- Dashboard principal.
- Resumen de sesiones.
- Próxima tutoría.
- Buscador avanzado de tutores.
- Tarjetas profesionales de tutores.
- Reservas con estados reales.
- Historial de sesiones.
- Perfil del estudiante.
```

Esta mejora se hará después de terminar primero la plataforma del tutor.

---

# Flujo general del estudiante

```text id="6syhjx"
Estudiante inicia sesión
        ↓
cuenta.js lo redirige a app.html
        ↓
Ve su dashboard de estudiante
        ↓
Busca tutores por curso
        ↓
Filtra por nivel, modalidad o precio
        ↓
Elige un tutor activo
        ↓
Reserva una sesión
        ↓
La reserva queda como pendiente
        ↓
El tutor acepta o rechaza desde panel-tutor.html
        ↓
El estudiante ve el estado en sesiones.html
```

---

# Estructura recomendada

Archivos principales:

```text id="40mepn"
pages/app.html
css/app.css
js/app.js
```

Archivos futuros:

```text id="dr956q"
pages/perfil-estudiante.html
css/perfil-estudiante.css
js/perfil-estudiante.js

pages/detalle-tutor.html
css/detalle-tutor.css
js/detalle-tutor.js
```

---

# Etapa 1: Mejorar app.html como dashboard del estudiante

Actualmente `app.html` funciona como plataforma principal del estudiante.
Más adelante debe convertirse en un dashboard real.

Debe mostrar:

```text id="6x27a5"
- Bienvenida personalizada.
- Nombre o correo del estudiante.
- Sesiones pendientes.
- Sesiones aceptadas.
- Tutorías realizadas.
- Gasto estimado.
- Próxima tutoría.
- Buscador de tutores.
- Tutores activos recomendados.
```

Ejemplo visual de información:

```text id="77hv9z"
Hola, Patricia

Sesiones pendientes: 2
Sesiones aceptadas: 1
Tutorías realizadas: 5
Gasto estimado: S/ 120
```

Esta información debe salir de Firestore, usando la colección:

```text id="6bivjv"
reservas
```

---

# Etapa 2: Agregar una próxima tutoría

El dashboard debe mostrar la próxima sesión del estudiante.

Ejemplo:

```text id="o3qjgi"
Próxima tutoría

Curso: Matemática
Tutor: Ana Torres
Fecha: 12/07/2026
Hora: 5:00 p. m.
Modalidad: Virtual
Estado: Aceptada
```

La próxima tutoría debe salir de las reservas del estudiante, ordenadas por fecha y hora.

Estados que puede considerar:

```text id="ry9hfi"
pendiente
aceptada
```

---

# Etapa 3: Mejorar el buscador de tutores

El buscador no debe limitarse solo a escribir un curso.
Debe tener filtros más completos.

Filtros recomendados:

```text id="reampm"
- Curso.
- Nivel.
- Modalidad.
- Precio.
- Disponibilidad.
- Estado del tutor.
```

Ejemplo:

```text id="af8cj7"
¿Qué curso necesitas reforzar?

Curso: Matemática
Nivel: Escolar
Modalidad: Virtual
Precio: S/ 20 a S/ 40
```

Esto hará que el estudiante sienta que está usando una plataforma real y no solo una lista simple.

---

# Etapa 4: Mejorar tarjetas de tutores activos

Cada tutor activo debe verse como un perfil profesional.

Cada tarjeta debe mostrar:

```text id="3ne3cz"
- Nombre del tutor.
- Cursos que enseña.
- Nivel que enseña.
- Modalidad.
- Precio por hora.
- Disponibilidad.
- Estado activo.
- Experiencia breve.
- Botón Ver perfil.
- Botón Reservar.
```

Ejemplo:

```text id="go4p05"
Ana Torres
Tutora de Matemática y Física

Cursos:
Matemática, Física, Álgebra

Nivel:
Secundaria y preuniversitario

Modalidad:
Virtual y presencial

Precio:
S/ 25 por hora

Disponibilidad:
Tardes y fines de semana

Botones:
Ver perfil
Reservar
```

Estos datos deben salir de la colección:

```text id="83s1kw"
tutores
```

---

# Etapa 5: Crear detalle-tutor.html

Archivo futuro:

```text id="4tcoqo"
pages/detalle-tutor.html
css/detalle-tutor.css
js/detalle-tutor.js
```

Objetivo:

Permitir que el estudiante vea el perfil completo de un tutor antes de reservar.

Debe mostrar:

```text id="e8v24l"
- Nombre completo.
- Cursos.
- Nivel.
- Modalidad.
- Precio.
- Experiencia.
- Disponibilidad.
- Sesiones realizadas.
- Calificación futura.
- Botón para reservar.
```

Flujo recomendado:

```text id="fbey74"
Estudiante ve tutor en app.html
        ↓
Presiona Ver perfil
        ↓
Entra a detalle-tutor.html
        ↓
Revisa información completa
        ↓
Presiona Reservar
```

---

# Etapa 6: Mejorar el sistema de reservas

Las reservas nuevas no deben nacer directamente como confirmadas.
Para que el flujo sea más real, deben iniciar como pendientes.

Estados recomendados:

```text id="1fbbmv"
pendiente
aceptada
rechazada
realizada
cancelada
```

Flujo correcto:

```text id="swagpy"
Estudiante reserva
        ↓
Estado: pendiente
        ↓
Tutor revisa en panel-tutor.html
        ↓
Tutor acepta o rechaza
        ↓
Estudiante ve el nuevo estado en sesiones.html
```

Esto conectará mejor la plataforma del estudiante con la plataforma del tutor.

---

# Etapa 7: Mejorar sesiones.html

Archivos:

```text id="q17e77"
pages/sesiones.html
css/sesiones.css
js/sesiones.js
```

Objetivo:

Convertir `sesiones.html` en un panel de seguimiento de tutorías.

Debe mostrar las sesiones separadas por estado:

```text id="fxgqv3"
- Sesiones pendientes.
- Sesiones aceptadas.
- Sesiones realizadas.
- Sesiones rechazadas.
- Sesiones canceladas.
```

Cada tarjeta debe mostrar:

```text id="r84cw8"
- Curso.
- Tutor.
- Fecha.
- Hora.
- Modalidad.
- Duración.
- Total.
- Estado.
```

Botones futuros:

```text id="l6ofzj"
- Ver detalle.
- Cancelar sesión.
- Volver a reservar.
```

---

# Etapa 8: Crear perfil-estudiante.html

Archivos futuros:

```text id="m4m2pe"
pages/perfil-estudiante.html
css/perfil-estudiante.css
js/perfil-estudiante.js
```

Objetivo:

Permitir que el estudiante tenga un perfil propio.

Debe mostrar:

```text id="0prq7y"
- Nombre.
- Correo.
- Nivel educativo.
- Cursos de interés.
- Historial de sesiones.
- Total invertido.
- Tutorías realizadas.
```

Más adelante, el estudiante podría editar:

```text id="d1ivdv"
- Nombre.
- Teléfono.
- Nivel.
- Cursos favoritos.
```

---

# Etapa 9: Conectar disponibilidad real del tutor

Cuando ya exista la disponibilidad del tutor, el estudiante no debe elegir cualquier hora.

La web debe validar:

```text id="c1j9t0"
- Si el tutor trabaja ese día.
- Si la hora está dentro de su horario disponible.
- Si esa hora ya fue reservada.
- Si la fecha no está vencida.
```

Colección relacionada:

```text id="x3c590"
disponibilidadTutores
```

Esto permitirá que las reservas sean más reales.

---

# Colecciones de Firebase relacionadas

Colecciones actuales:

```text id="ffjoqv"
usuarios
reservas
postulacionesTutores
tutores
```

Colección recomendada para mejorar la experiencia:

```text id="uc48mo"
disponibilidadTutores
```

Colecciones futuras opcionales:

```text id="eeurzs"
calificaciones
mensajesSesiones
notificaciones
```

No se deben crear todas de golpe.
Primero se debe terminar la base principal.

---

# Orden recomendado de trabajo

Esta mejora se hará después de terminar la plataforma del tutor.

Orden recomendado:

```text id="774me6"
1. Terminar tutor.html como plataforma de postulación.
2. Terminar panel-tutor.html como dashboard del tutor aprobado.
3. Crear perfil-tutor.html.
4. Crear disponibilidad-tutor.html.
5. Luego empezar la mejora de app.html para estudiantes.
6. Mejorar sesiones.html con estados reales.
7. Crear perfil-estudiante.html.
8. Crear detalle-tutor.html.
```

---

# Resultado esperado

Al terminar esta etapa, la plataforma del estudiante deberá sentirse como una app real:

```text id="ogjixs"
El estudiante entra.
Ve su resumen.
Busca tutores.
Compara perfiles.
Reserva una sesión.
Espera aprobación del tutor.
Consulta el estado de sus sesiones.
Revisa su historial.
```

Con esto, TutorFlash-Web dejará de verse como una maqueta simple y empezará a comportarse como una plataforma completa de tutorías.
