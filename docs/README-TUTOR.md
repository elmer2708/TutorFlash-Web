## Plan de mejora: Plataforma Tutor avanzada

El objetivo de esta etapa es mejorar la experiencia del tutor dentro de TutorFlash-Web, para que no solo exista un formulario de postulación, sino una plataforma completa, organizada y conectada con Firebase.

La plataforma debe separar claramente los roles:

```text
Estudiante → app.html
Tutor nuevo o pendiente → tutor.html
Tutor aprobado → panel-tutor.html
Administrador → admin.html
```

---

## Flujo general del tutor

```text
1. El usuario crea una cuenta como tutor.
2. El sistema lo redirige a tutor.html.
3. El tutor completa su formulario de postulación.
4. La postulación se guarda en Firestore como pendiente.
5. El administrador revisa la postulación desde admin.html.
6. Si el administrador aprueba:
   - La postulación cambia a aprobado.
   - Se crea un tutor real en la colección tutores.
7. El tutor aprobado inicia sesión.
8. El sistema lo redirige a panel-tutor.html.
9. Desde su panel, el tutor podrá gestionar reservas, perfil y disponibilidad.
10. El estudiante verá al tutor activo desde app.html y podrá reservar una tutoría.
```

---

# Etapas para mejorar la plataforma tutor

## Etapa 1: Mejorar tutor.html como plataforma de postulación

Archivo principal:

```text
pages/tutor.html
css/tutor.css
js/tutor.js
```

Objetivo:

Convertir `tutor.html` en una página más clara, visual y profesional para los tutores nuevos.

Debe mostrar:

```text
- Mensaje de bienvenida para el tutor.
- Explicación del proceso de postulación.
- Estado de postulación: pendiente, aprobado o rechazado.
- Formulario ordenado para postular.
- Botón para enviar postulación.
- Botón para volver a la plataforma.
- Botón para cerrar sesión.
```

Flujo esperado:

```text
Tutor nuevo
   ↓
Entra a tutor.html
   ↓
Lee las instrucciones
   ↓
Completa el formulario
   ↓
Envía postulación
   ↓
Espera revisión del administrador
```

---

## Etapa 2: Mejorar panel-tutor.html como dashboard real

Archivos:

```text
pages/panel-tutor.html
css/panel-tutor.css
js/panel-tutor.js
```

Objetivo:

Crear un panel principal para el tutor aprobado.

Debe mostrar información real desde Firestore:

```text
- Nombre del tutor.
- Reservas de hoy.
- Reservas pendientes.
- Reservas aceptadas.
- Sesiones realizadas.
- Ingresos estimados.
- Próxima sesión.
- Lista de reservas recibidas.
```

Secciones recomendadas:

```text
Dashboard del tutor
Mis reservas
Historial de sesiones
Mi perfil tutor
Mi disponibilidad
Salir
```

---

## Etapa 3: Crear perfil-tutor.html

Archivos futuros:

```text
pages/perfil-tutor.html
css/perfil-tutor.css
js/perfil-tutor.js
```

Objetivo:

Permitir que el tutor aprobado edite su perfil público.

El perfil debe guardar datos como:

```text
- Nombre completo.
- Foto o iniciales.
- Presentación breve.
- Experiencia.
- Cursos que enseña.
- Nivel que enseña.
- Precio por hora.
- Modalidad: virtual, presencial o ambas.
- Distrito o zona.
- Estado del tutor: activo o pausado.
```

Este perfil será visible para los estudiantes desde `app.html`.

---

## Etapa 4: Crear disponibilidad-tutor.html

Archivos futuros:

```text
pages/disponibilidad-tutor.html
css/disponibilidad-tutor.css
js/disponibilidad-tutor.js
```

Objetivo:

Permitir que el tutor configure sus horarios disponibles.

Ejemplo:

```text
Lunes: 4:00 p. m. - 8:00 p. m.
Martes: 5:00 p. m. - 9:00 p. m.
Miércoles: No disponible
Jueves: 3:00 p. m. - 7:00 p. m.
Viernes: 4:00 p. m. - 6:00 p. m.
Sábado: 9:00 a. m. - 1:00 p. m.
```

Colección recomendada:

```text
disponibilidadTutores
```

Estructura sugerida:

```js
{
  tutorId: "idDelTutor",
  uid: "uidDelUsuario",
  bloques: [
    {
      dia: "lunes",
      horaInicio: "16:00",
      horaFin: "20:00",
      activo: true
    }
  ]
}
```

---

## Etapa 5: Mejorar reservas entre estudiante y tutor

Actualmente las reservas pueden guardarse como confirmadas.
Más adelante se recomienda usar estados más reales.

Estados recomendados:

```text
pendiente
aceptada
rechazada
realizada
cancelada
```

Flujo recomendado:

```text
Estudiante reserva una tutoría
        ↓
La reserva queda como pendiente
        ↓
El tutor la ve en panel-tutor.html
        ↓
El tutor acepta o rechaza
        ↓
El estudiante ve el estado en sesiones.html
        ↓
Si la clase se completa, el tutor marca la sesión como realizada
```

---

## Etapa 6: Mejorar app.html para mostrar perfiles reales

Archivo principal:

```text
pages/app.html
css/app.css
js/app.js
```

Objetivo:

Hacer que el estudiante vea tutores reales con información más completa.

Cada tutor debe mostrar:

```text
- Nombre.
- Cursos.
- Nivel.
- Precio por hora.
- Modalidad.
- Disponibilidad.
- Estado activo.
- Botón para ver perfil.
- Botón para reservar.
```

El estudiante podrá buscar por curso y elegir un tutor según su perfil.

---

## Etapa 7: Mejorar sesiones.html para el estudiante

Archivos:

```text
pages/sesiones.html
css/sesiones.css
js/sesiones.js
```

Objetivo:

Permitir que el estudiante vea el estado real de sus reservas.

Debe mostrar:

```text
- Curso.
- Tutor.
- Fecha.
- Hora.
- Modalidad.
- Duración.
- Total.
- Estado de la reserva.
```

Estados visibles:

```text
Pendiente
Aceptada
Rechazada
Realizada
Cancelada
```

---

# Colecciones de Firebase necesarias

Actualmente se usan:

```text
usuarios
reservas
postulacionesTutores
tutores
```

Para la plataforma tutor avanzada, se recomienda agregar:

```text
disponibilidadTutores
```

Más adelante se podrían agregar:

```text
calificaciones
mensajesSesiones
notificaciones
```

Pero no se deben crear todas al mismo tiempo.
Primero se debe terminar la base principal.

---

# Orden recomendado de trabajo

```text
1. Mejorar tutor.html como plataforma de postulación.
2. Mejorar panel-tutor.html como dashboard del tutor aprobado.
3. Crear perfil-tutor.html.
4. Crear disponibilidad-tutor.html.
5. Cambiar estados de reserva: pendiente, aceptada, rechazada, realizada y cancelada.
6. Mejorar app.html para mostrar perfiles reales de tutores.
7. Mejorar sesiones.html para que el estudiante vea el estado real de sus reservas.
8. Reforzar reglas de seguridad en Firestore.
```

---

# Resultado esperado

Al finalizar esta etapa, TutorFlash-Web tendrá una separación más profesional:

```text
Estudiante:
Busca tutores, reserva sesiones y revisa sus tutorías.

Tutor nuevo:
Postula y espera aprobación.

Tutor aprobado:
Gestiona perfil, disponibilidad y reservas.

Administrador:
Revisa postulaciones y aprueba o rechaza tutores.
```

Esto permitirá que TutorFlash-Web deje de funcionar como una maqueta simple y empiece a comportarse como una plataforma real de tutorías.
