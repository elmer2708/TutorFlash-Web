# TutorFlash-Web - Etapa 14: Portal del estudiante avanzado

Este documento organiza la nueva etapa de mejora para TutorFlash-Web.

La idea principal es convertir la plataforma del estudiante en un portal más profesional, ordenado y útil para reservar clases virtuales, revisar sesiones, ver agenda, guardar tutores favoritos y recibir notificaciones.

## Objetivo de esta etapa

El objetivo es que el estudiante ya no vea una página tipo maqueta o landing, sino un verdadero portal de usuario.

El portal debe permitir:

- Ver un panel principal del estudiante.
- Revisar próximas tutorías.
- Acceder a una agenda de clases.
- Buscar tutores en una página separada.
- Guardar tutores favoritos.
- Ver notificaciones importantes.
- Ver si tutores favoritos están en línea.
- Entrar a una clase virtual mediante enlace externo como Google Meet.
- Ver el estado de pago como pendiente.
- Acceder a su perfil de estudiante.

## Idea general del nuevo portal

El portal del estudiante tendrá una estructura más parecida a una plataforma real.

```text
Portal del estudiante
│
├── Panel principal
├── Mi agenda
├── Buscar tutor
├── Tutores
├── Favoritos
├── Notificaciones
├── Mis sesiones
├── Mi perfil
└── Clase virtual
```

## Archivos principales de esta etapa

Se trabajará con nuevos archivos para no romper la versión anterior.

```text
pages/estudiante.html
css/estudiante.css
js/estudiante.js
```

Luego se crearán páginas adicionales:

```text
pages/agenda-estudiante.html
css/agenda-estudiante.css
js/agenda-estudiante.js

pages/buscar-tutor.html
js/buscar-tutor.js

pages/tutores.html
js/tutores.js

pages/favoritos.html
js/favoritos.js

pages/perfil-estudiante.html
css/perfil-estudiante.css
js/perfil-estudiante.js

pages/clase-virtual.html
css/clase-virtual.css
js/clase-virtual.js
```

No se crearán todas al mismo tiempo. Se trabajará paso a paso.

## Estado actual antes de continuar

Ya se empezó a crear el nuevo portal principal del estudiante.

Archivos creados o iniciados:

```text
pages/estudiante.html
css/estudiante.css
js/estudiante.js
```

El portal ya tiene la idea de:

- Menú lateral.
- Panel principal.
- Avatar del usuario.
- Menú desplegable de usuario.
- Resumen de sesiones.
- Próxima tutoría.
- Accesos rápidos.

Pero todavía falta conectar varias funciones con Firebase.

## Menú lateral recomendado

El menú lateral debe ser la navegación principal del estudiante.

```text
Panel
Mi agenda
Buscar tutor
Tutores
Favoritos
Notificaciones
Mis sesiones
Mi perfil
```

La idea es evitar que todo esté dentro del mismo HTML.

Cada opción debe llevar a una página diferente.

Ejemplo:

```text
Panel          → estudiante.html
Mi agenda      → agenda-estudiante.html
Buscar tutor   → buscar-tutor.html
Tutores        → tutores.html
Favoritos      → favoritos.html
Notificaciones → notificaciones.html
Mis sesiones   → sesiones.html
Mi perfil      → perfil-estudiante.html
```

## Menú del avatar

El menú del avatar no debe repetir las mismas opciones del menú lateral.

Debe servir solo para mostrar la cuenta del usuario.

Contenido recomendado:

```text
Correo del usuario
Avatar o iniciales
Hola, nombre del estudiante
Ver perfil del estudiante
Cerrar sesión
```

Ejemplo visual:

```text
usuario@gmail.com

[ DA ]

¡Hola, Dani!

Ver perfil del estudiante
Cerrar sesión
```

## Etapa 14.1 - Limpiar portal principal del estudiante

Primero se debe dejar limpio `pages/estudiante.html`.

Debe contener:

- Menú lateral.
- Topbar con avatar.
- Menú desplegable del usuario.
- Bienvenida personalizada.
- Resumen de tutorías.
- Próxima tutoría.
- Accesos rápidos.

No debe contener todavía:

- Buscador completo.
- Listado grande de tutores.
- Modal de reserva.
- Filtros avanzados.

Eso irá en `buscar-tutor.html`.

## Etapa 14.2 - Crear agenda del estudiante

Archivo recomendado:

```text
pages/agenda-estudiante.html
css/agenda-estudiante.css
js/agenda-estudiante.js
```

La agenda debe mostrar las clases del estudiante de forma ordenada.

Debe incluir:

- Próxima clase.
- Clases de hoy.
- Clases de la semana.
- Estado de cada clase.
- Botón para reservar nueva clase.
- Botón para entrar a clase virtual si ya existe enlace.

Ejemplo:

```text
Mi agenda

Próxima clase virtual:
Curso: Matemática
Tutor: Ana Torres
Fecha: 12/07/2026
Hora: 5:00 p. m.
Estado: Aceptada

[Entrar a clase virtual]
```

Estados que se pueden mostrar:

```text
Pendiente
Aceptada
Realizada
Cancelada
Rechazada
```

La agenda debe leer datos desde la colección:

```text
reservas
```

## Etapa 14.3 - Crear página Buscar tutor

Archivo recomendado:

```text
pages/buscar-tutor.html
js/buscar-tutor.js
```

Esta página será la parte funcional para buscar y reservar.

Debe contener:

- Buscador por curso.
- Filtros por nivel.
- Filtros por modalidad.
- Filtros por precio.
- Lista de tutores activos.
- Botón reservar.
- Botón guardar favorito.
- Modal de reserva.
- Validación de disponibilidad real.
- Validación de horarios ocupados.
- Cálculo del total.

Esta página puede usar como base la lógica actual de:

```text
js/app.js
```

Porque ahí ya existe lógica para:

- Cargar tutores activos.
- Abrir modal de reserva.
- Validar disponibilidad del tutor.
- Generar horarios reales.
- Guardar reservas.
- Bloquear horarios ocupados.

## Etapa 14.4 - Crear página de tutores

Archivo recomendado:

```text
pages/tutores.html
js/tutores.js
```

Esta página servirá para ver todos los tutores activos de forma más profesional.

Debe mostrar:

- Nombre del tutor.
- Cursos.
- Nivel.
- Modalidad.
- Precio.
- Estado en línea o desconectado.
- Botón ver perfil.
- Botón reservar.
- Botón guardar favorito.

Ejemplo:

```text
Ana Torres
Matemática y Física

Nivel: Secundaria y preuniversitario
Modalidad: Virtual
Precio: S/ 25 por hora
Estado: En línea

[Ver perfil]
[Reservar]
[Guardar favorito]
```

## Etapa 14.5 - Tutores favoritos

Archivo recomendado:

```text
pages/favoritos.html
js/favoritos.js
```

El estudiante debe poder guardar tutores preferidos.

Cada tutor puede tener un botón:

```text
♡ Guardar
```

Cuando ya esté guardado:

```text
♥ Guardado
```

Colección recomendada en Firebase:

```text
favoritosTutores
```

Campos sugeridos:

```js
{
  estudianteId: "",
  tutorId: "",
  nombreTutor: "",
  cursos: [],
  precioHora: 0,
  modalidad: "",
  fechaGuardado: ""
}
```

La página de favoritos debe mostrar:

- Tutores guardados.
- Estado en línea.
- Curso principal.
- Precio.
- Botón reservar otra clase.
- Botón quitar de favoritos.

## Etapa 14.6 - Estado en línea de tutores

Para mostrar si un tutor está en línea, se puede usar la información del tutor en Firebase.

Campos sugeridos en la colección `tutores`:

```js
{
  estaEnLinea: true,
  ultimaConexion: ""
}
```

Recomendación:

```text
Si ultimaConexion fue hace menos de 5 minutos → En línea
Si fue hace más de 5 minutos → Desconectado
```

Estados visuales:

```text
🟢 En línea
⚪ Desconectado
🟡 Disponible pronto
```

Esto será útil para notificar al estudiante cuando un tutor favorito esté disponible.

## Etapa 14.7 - Notificaciones y ventana tipo chat

El portal debe tener un botón arriba, cerca del avatar:

```text
🔔
```

o:

```text
💬
```

Al hacer clic, debe abrir una ventana pequeña con notificaciones.

Ejemplo:

```text
Notificaciones

🟢 Ana Torres está en línea.
✅ Tu tutoría de Matemática fue aceptada.
📌 Recuerda tu clase virtual de hoy a las 5:00 p. m.
💬 Tienes un mensaje del tutor.
```

Primero será una ventana visual de notificaciones.

Más adelante se puede convertir en chat real.

Colección futura recomendada:

```text
notificaciones
```

Campos sugeridos:

```js
{
  estudianteId: "",
  tipo: "tutor_en_linea",
  titulo: "Ana Torres está en línea",
  mensaje: "Puedes reservar una tutoría ahora.",
  leida: false,
  fechaCreacion: ""
}
```

Tipos de notificación:

```text
tutor_en_linea
reserva_aceptada
reserva_rechazada
clase_proxima
mensaje_tutor
pago_pendiente
```

## Etapa 14.8 - Clase virtual con Google Meet

No se recomienda crear videollamadas propias dentro de TutorFlash en esta versión.

Lo más ordenado es usar enlaces externos:

```text
Google Meet
Zoom
Microsoft Teams
WhatsApp llamada
```

La reserva debe tener campos para la clase virtual.

Campos recomendados en `reservas`:

```js
{
  plataformaClase: "Google Meet",
  enlaceClase: "https://meet.google.com/xxx-xxxx-xxx",
  estadoClase: "pendiente"
}
```

Estados posibles de clase:

```text
pendiente
programada
finalizada
cancelada
```

Flujo recomendado:

```text
Estudiante reserva clase virtual
        ↓
Reserva queda pendiente
        ↓
Tutor acepta la reserva
        ↓
Tutor agrega enlace de Google Meet
        ↓
Estudiante ve el botón “Entrar a clase virtual”
        ↓
Estudiante entra desde agenda o sesiones
```

## Etapa 14.9 - Página previa de clase virtual

Archivo recomendado:

```text
pages/clase-virtual.html
css/clase-virtual.css
js/clase-virtual.js
```

Esta página no será una videollamada propia.

Será una sala previa para mostrar información de la clase.

Debe mostrar:

- Curso.
- Tutor.
- Fecha.
- Hora.
- Modalidad.
- Estado.
- Plataforma.
- Enlace de clase.
- Checklist antes de entrar.

Ejemplo:

```text
Clase virtual de Matemática

Tutor: Ana Torres
Fecha: 12/07/2026
Hora: 5:00 p. m.
Plataforma: Google Meet

Antes de entrar:
✓ Revisa tu conexión.
✓ Ten tus preguntas listas.
✓ Entra 5 minutos antes.

[Entrar a Google Meet]
```

## Etapa 14.10 - Pago pendiente

El pago no debe marcarse como realizado al momento de reservar.

Debe quedar pendiente.

Flujo recomendado:

```text
Estudiante reserva
        ↓
Reserva: pendiente
Pago: pendiente
        ↓
Tutor acepta
        ↓
Reserva: aceptada
Pago: pendiente
        ↓
Estudiante realiza pago simulado
        ↓
Pago: pagado_simulado
```

Estados recomendados para pago:

```text
pendiente
pagado_simulado
verificacion
rechazado
```

Por ahora se usará principalmente:

```text
pendiente
pagado_simulado
```

Cuando se guarde una reserva, debe incluir:

```js
{
  estado: "pendiente",
  estadoPago: "pendiente",
  metodoPago: "Pago pendiente",
  plataformaClase: "",
  enlaceClase: "",
  estadoClase: "pendiente"
}
```

Esto hace que la reserva sea más realista.

El estudiante verá:

```text
Estado de reserva: Pendiente
Estado de pago: Pendiente
Clase virtual: Aún no disponible
```

## Etapa 14.11 - Perfil del estudiante

Archivo recomendado:

```text
pages/perfil-estudiante.html
css/perfil-estudiante.css
js/perfil-estudiante.js
```

El perfil debe mostrar:

- Nombre.
- Correo.
- Avatar o iniciales.
- Rol: Estudiante.
- Modalidad preferida.
- Cursos de interés.
- Horario preferido.
- Total de sesiones.
- Total invertido.
- Tutorías realizadas.

Ejemplo:

```text
Dani
Estudiante

Correo:
dani@gmail.com

Modalidad preferida:
Virtual

Cursos de interés:
Matemática, Inglés, Contabilidad

Horario favorito:
Tardes y fines de semana
```

Más adelante se puede permitir editar:

- Nombre.
- Teléfono.
- Nivel educativo.
- Cursos favoritos.
- Modalidad preferida.
- Horario preferido.

## Colecciones de Firebase relacionadas

Colecciones actuales:

```text
usuarios
reservas
tutores
postulacionesTutores
disponibilidadTutores
```

Colecciones futuras recomendadas:

```text
favoritosTutores
notificaciones
mensajesSesiones
```

No se deben crear todas de golpe.

Primero se debe mejorar la estructura visual y luego conectar cada función.

## Campos nuevos recomendados en reservas

Para mejorar la reserva, se recomienda agregar:

```js
{
  estado: "pendiente",
  estadoPago: "pendiente",
  metodoPago: "Pago pendiente",

  plataformaClase: "",
  enlaceClase: "",
  estadoClase: "pendiente"
}
```

Si el tutor acepta y agrega Meet:

```js
{
  estado: "aceptada",
  plataformaClase: "Google Meet",
  enlaceClase: "https://meet.google.com/xxx-xxxx-xxx",
  estadoClase: "programada"
}
```

## Orden recomendado de trabajo

Para no romper el proyecto, el orden será:

```text
1. Limpiar y terminar pages/estudiante.html como panel principal.
2. Mejorar el avatar y menú desplegable.
3. Agregar botón visual de notificaciones.
4. Crear agenda-estudiante.html.
5. Conectar agenda con reservas.
6. Crear buscar-tutor.html con buscador, filtros y reservas.
7. Ajustar reserva para que el pago quede pendiente.
8. Crear tutores.html.
9. Agregar favoritos.
10. Crear favoritos.html.
11. Mostrar estado en línea de tutores.
12. Crear perfil-estudiante.html.
13. Crear clase-virtual.html.
14. Permitir que el tutor agregue enlace Meet.
15. Mostrar botón “Entrar a clase virtual” al estudiante.
16. Mejorar notificaciones reales desde Firebase.
```

## Resultado esperado

Al terminar esta etapa, el estudiante tendrá una experiencia más completa.

Flujo esperado:

```text
Estudiante inicia sesión
        ↓
Entra al portal principal
        ↓
Ve su resumen
        ↓
Revisa su agenda
        ↓
Busca tutor
        ↓
Guarda tutores favoritos
        ↓
Reserva una clase virtual
        ↓
La reserva queda pendiente
        ↓
El tutor acepta
        ↓
El tutor agrega enlace de Meet
        ↓
El estudiante entra a clase desde su agenda
        ↓
El estudiante ve sus sesiones e historial
```

## Nota importante

Esta etapa debe hacerse poco a poco.

No se debe modificar todo al mismo tiempo porque el flujo de reservas ya funciona y no se debe romper.

La prioridad será mantener funcionando:

```text
login
roles
tutores activos
reservas
disponibilidad real
sesiones del estudiante
panel del tutor
```

Cada mejora debe probarse antes de hacer commit.
