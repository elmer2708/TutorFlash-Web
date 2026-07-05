# TutorFlash-Web - Plan para versión funcional con base de datos

Este documento resume lo que se hará en la siguiente etapa de TutorFlash-Web para convertir el prototipo actual en una web más funcional, con inicio de sesión, base de datos y reservas guardadas.

## Estado actual del proyecto

TutorFlash-Web ya cuenta con una primera versión funcional del MVP.  
Actualmente permite:

- Entrar desde una pantalla principal.
- Acceder a la plataforma web desde `app.html`.
- Buscar tutores por curso.
- Ver tutores disponibles.
- Abrir un modal de reserva.
- Elegir fecha, hora, modalidad y duración.
- Calcular el total según duración.
- Confirmar una solicitud de tutoría.
- Usar la web en computadora y celular.
- Navegar con menú hamburguesa en celular.
- Publicar la web mediante GitHub Pages.

Esta primera versión cumple la base del MVP: buscar tutores disponibles por curso y reservar una tutoría rápida.

## Objetivo de la siguiente versión

El objetivo será hacer que TutorFlash-Web funcione más como una web real.

La nueva versión deberá permitir:

1. Registrar usuarios.
2. Iniciar sesión.
3. Cerrar sesión.
4. Guardar reservas en una base de datos.
5. Mostrar las reservas del usuario en una sección llamada “Mis sesiones”.
6. Mantener el pago como simulación.
7. Seguir usando GitHub Pages como hosting.

## Tecnología recomendada

Para esta etapa se usará Firebase.

### Estructura recomendada

- Frontend: HTML, CSS y JavaScript puro.
- Hosting: GitHub Pages.
- Login: Firebase Authentication.
- Base de datos: Firebase Firestore.
- Repositorio: GitHub.

La computadora solo se usará para editar y subir cambios.  
Una vez publicada la web, podrá funcionar aunque la computadora esté apagada, porque GitHub Pages y Firebase funcionan en la nube.

## Flujo esperado de la web

El flujo completo será:

1. El usuario entra a TutorFlash-Web.
2. Presiona “Entrar”.
3. Se registra o inicia sesión con correo y contraseña.
4. Busca un curso.
5. Elige un tutor.
6. Selecciona fecha, hora, modalidad y duración.
7. Elige un método de pago simulado.
8. Confirma la reserva.
9. La reserva se guarda en Firebase.
10. El usuario puede ver la reserva en “Mis sesiones”.

## Funciones nuevas por implementar

### 1. Registro de usuario

Se agregará un formulario para que el estudiante pueda registrarse.

Campos básicos:

- Nombre
- Correo
- Contraseña

No se implementará todavía un perfil avanzado.

### 2. Inicio de sesión

Se agregará un formulario para que el usuario pueda iniciar sesión.

Campos:

- Correo
- Contraseña

Cuando el usuario inicie sesión, la web deberá mostrar su nombre o correo.

### 3. Cerrar sesión

Se agregará un botón de “Cerrar sesión”.

Cuando el usuario cierre sesión:

- Ya no podrá ver sus reservas.
- La web volverá al estado inicial de usuario no conectado.

### 4. Guardar reservas en Firebase

Cuando el usuario confirme una tutoría, la información se guardará en Firestore.

Datos que debe guardar cada reserva:

- ID del usuario
- Tutor
- Curso
- Fecha
- Hora
- Modalidad
- Duración
- Total
- Método de pago simulado
- Estado de la reserva
- Fecha de creación

Ejemplo de estado:

- Confirmada
- Pendiente
- Cancelada

Para esta versión se usará principalmente “Confirmada”.

### 5. Crear sección “Mis sesiones”

Se creará una sección nueva llamada:

```txt
Mis sesiones

Ahí el estudiante podrá ver sus reservas guardadas.

Cada sesión mostrará:

Tutor
Curso
Fecha
Hora
Modalidad
Duración
Total
Estado

Ejemplo:

Tutor: Carlos A.
Curso: Matemática
Fecha: 05/12/2026
Hora: 6:00 p.m.
Modalidad: Virtual
Duración: 60 min
Total: S/ 60
Estado: Confirmada
6. Pago simulado

No se agregará pago real todavía.

Solo se agregará una opción simulada dentro del modal de reserva.

Opciones posibles:

Yape
Plin
Tarjeta
Pago pendiente

El método elegido se guardará junto con la reserva.

7. Mejorar confirmación final

La confirmación actual dice “Solicitud enviada”.

Se cambiará por algo más real, como:

Reserva confirmada
Tu tutoría fue registrada correctamente.

También puede incluir botones:

Ver mis sesiones
Reservar otra tutoría
Estructura sugerida en Firebase
Colección: usuarios

Campos sugeridos:

nombre
correo
rol
fechaRegistro

Rol inicial:

estudiante

Más adelante se podrá agregar:

tutor
Colección: reservas

Campos sugeridos:

usuarioId
tutor
curso
fecha
hora
modalidad
duracion
total
metodoPago
estado
creadoEn
Colección futura: tutores

Por ahora los tutores están escritos en el HTML.

Más adelante se podrán guardar en Firebase.

Campos sugeridos:

nombre
curso
especialidad
precio
rating
disponibilidad
modalidad
estado
Archivos que probablemente se modificarán
app.html

Se agregará:

Botón de iniciar sesión.
Botón de cerrar sesión.
Sección “Mis sesiones”.
Campos de pago simulado en el modal.
Contenedores para mostrar usuario conectado.
css/app.css

Se agregarán estilos para:

Login.
Registro.
Botón cerrar sesión.
Sección “Mis sesiones”.
Tarjetas de reservas.
Pago simulado.
js/app.js

Se agregará lógica para:

Conectar Firebase.
Registrar usuario.
Iniciar sesión.
Cerrar sesión.
Detectar usuario conectado.
Guardar reservas en Firestore.
Leer reservas del usuario.
Mostrar reservas en “Mis sesiones”.
Nuevo archivo opcional

Se puede crear un archivo separado:

js/firebase-config.js

Este archivo tendrá la configuración de Firebase.

Orden recomendado de trabajo
Etapa 1: Preparar Firebase
Crear proyecto en Firebase.
Activar Authentication.
Habilitar correo y contraseña.
Crear Firestore Database.
Copiar configuración web de Firebase.
Conectar Firebase con el proyecto.
Etapa 2: Crear login simple
Agregar formulario de registro.
Agregar formulario de inicio de sesión.
Agregar botón cerrar sesión.
Mostrar usuario conectado.
Etapa 3: Guardar reservas
Modificar el botón de confirmar reserva.
Guardar la reserva en Firestore.
Asociar la reserva al usuario conectado.
Mostrar mensaje de reserva confirmada.
Etapa 4: Crear “Mis sesiones”
Crear sección en app.html.
Leer reservas desde Firestore.
Mostrar reservas en tarjetas.
Agregar botón para volver a buscar tutores.
Etapa 5: Agregar pago simulado
Agregar selector de método de pago.
Guardar el método elegido.
Mostrarlo en la confirmación.
Mostrarlo en “Mis sesiones”.
Etapa 6: Probar todo

Probar en computadora:

Registro.
Login.
Reserva.
Confirmación.
Mis sesiones.
Cerrar sesión.

Probar en celular:

Menú hamburguesa.
Buscador.
Modal.
Reserva.
Mis sesiones.
Diseño responsive.
```
