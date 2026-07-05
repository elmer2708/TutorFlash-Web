# TutorFlash-Web - Plan para versión funcional con base de datos

Este documento resume la siguiente etapa de desarrollo de **TutorFlash-Web**, con el objetivo de convertir el prototipo actual en una web más funcional, con inicio de sesión, base de datos y reservas guardadas.

---

## 1. Estado actual del proyecto

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

Esta primera versión cumple la base del MVP: **buscar tutores disponibles por curso y reservar una tutoría rápida**.

---

## 2. Objetivo de la siguiente versión

El objetivo será hacer que TutorFlash-Web funcione más como una web real.

La nueva versión deberá permitir:

1. Registrar usuarios.
2. Iniciar sesión.
3. Cerrar sesión.
4. Guardar reservas en una base de datos.
5. Mostrar las reservas del usuario en una sección llamada **“Mis sesiones”**.
6. Mantener el pago como simulación.
7. Seguir usando GitHub Pages como hosting.

---

## 3. Tecnología recomendada

Para esta etapa se usará **Firebase**.

### Estructura recomendada

- **Frontend:** HTML, CSS y JavaScript puro.
- **Hosting:** GitHub Pages.
- **Login:** Firebase Authentication.
- **Base de datos:** Firebase Firestore.
- **Repositorio:** GitHub.

La computadora solo se usará para editar y subir cambios.  
Una vez publicada la web, podrá funcionar aunque la computadora esté apagada, porque GitHub Pages y Firebase funcionan en la nube.

---

## 4. Flujo esperado de la web

El flujo completo será:

1. El usuario entra a TutorFlash-Web.
2. Presiona **“Entrar”**.
3. Se registra o inicia sesión con correo y contraseña.
4. Busca un curso.
5. Elige un tutor.
6. Selecciona fecha, hora, modalidad y duración.
7. Elige un método de pago simulado.
8. Confirma la reserva.
9. La reserva se guarda en Firebase.
10. El usuario puede ver la reserva en **“Mis sesiones”**.

---

## 5. Funciones nuevas por implementar

### 5.1 Registro de usuario

Se agregará un formulario para que el estudiante pueda registrarse.

Campos básicos:

- Nombre.
- Correo.
- Contraseña.

No se implementará todavía un perfil avanzado.

---

### 5.2 Inicio de sesión

Se agregará un formulario para que el usuario pueda iniciar sesión.

Campos:

- Correo.
- Contraseña.

Cuando el usuario inicie sesión, la web deberá mostrar su nombre o correo.

---

### 5.3 Cerrar sesión

Se agregará un botón de **“Cerrar sesión”**.

Cuando el usuario cierre sesión:

- Ya no podrá ver sus reservas.
- La web volverá al estado inicial de usuario no conectado.

---

### 5.4 Guardar reservas en Firebase

Cuando el usuario confirme una tutoría, la información se guardará en Firestore.

Datos que debe guardar cada reserva:

- ID del usuario.
- Tutor.
- Curso.
- Fecha.
- Hora.
- Modalidad.
- Duración.
- Total.
- Método de pago simulado.
- Estado de la reserva.
- Fecha de creación.

Ejemplos de estado:

- Confirmada.
- Pendiente.
- Cancelada.

Para esta versión se usará principalmente el estado **“Confirmada”**.

---

### 5.5 Crear sección “Mis sesiones”

Se creará una sección nueva llamada:

```txt
Mis sesiones
```

Ahí el estudiante podrá ver sus reservas guardadas.

Cada sesión mostrará:

- Tutor.
- Curso.
- Fecha.
- Hora.
- Modalidad.
- Duración.
- Total.
- Estado.

Ejemplo:

```txt
Tutor: Carlos A.
Curso: Matemática
Fecha: 05/12/2026
Hora: 6:00 p.m.
Modalidad: Virtual
Duración: 60 min
Total: S/ 60
Estado: Confirmada
```

---

### 5.6 Pago simulado

No se agregará pago real todavía.

Solo se agregará una opción simulada dentro del modal de reserva.

Opciones posibles:

- Yape.
- Plin.
- Tarjeta.
- Pago pendiente.

El método elegido se guardará junto con la reserva.

---

### 5.7 Mejorar confirmación final

La confirmación actual dice:

```txt
Solicitud enviada
```

Se cambiará por algo más real, como:

```txt
Reserva confirmada
Tu tutoría fue registrada correctamente.
```

También puede incluir botones:

- Ver mis sesiones.
- Reservar otra tutoría.

---

## 6. Estructura sugerida en Firebase

### 6.1 Colección: usuarios

Campos sugeridos:

```txt
nombre
correo
rol
fechaRegistro
```

Rol inicial:

```txt
estudiante
```

Más adelante se podrá agregar:

```txt
tutor
```

---

### 6.2 Colección: reservas

Campos sugeridos:

```txt
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
```

---

### 6.3 Colección futura: tutores

Por ahora los tutores están escritos directamente en el HTML.

Más adelante se podrán guardar en Firebase.

Campos sugeridos:

```txt
nombre
curso
especialidad
precio
rating
disponibilidad
modalidad
estado
```

---

## 7. Archivos que probablemente se modificarán

### 7.1 app.html

Se agregará:

- Botón de iniciar sesión.
- Botón de cerrar sesión.
- Sección **“Mis sesiones”**.
- Campos de pago simulado en el modal.
- Contenedores para mostrar usuario conectado.

---

### 7.2 css/app.css

Se agregarán estilos para:

- Login.
- Registro.
- Botón cerrar sesión.
- Sección **“Mis sesiones”**.
- Tarjetas de reservas.
- Pago simulado.

---

### 7.3 js/app.js

Se agregará lógica para:

- Conectar Firebase.
- Registrar usuario.
- Iniciar sesión.
- Cerrar sesión.
- Detectar usuario conectado.
- Guardar reservas en Firestore.
- Leer reservas del usuario.
- Mostrar reservas en **“Mis sesiones”**.

---

### 7.4 Nuevo archivo opcional

Se puede crear un archivo separado:

```txt
js/firebase-config.js
```

Este archivo tendrá la configuración de Firebase.

---

## 8. Orden recomendado de trabajo

### Etapa 1: Preparar Firebase

1. Crear proyecto en Firebase.
2. Activar Authentication.
3. Habilitar correo y contraseña.
4. Crear Firestore Database.
5. Copiar configuración web de Firebase.
6. Conectar Firebase con el proyecto.

---

### Etapa 2: Crear login simple

1. Agregar formulario de registro.
2. Agregar formulario de inicio de sesión.
3. Agregar botón cerrar sesión.
4. Mostrar usuario conectado.

---

### Etapa 3: Guardar reservas

1. Modificar el botón de confirmar reserva.
2. Guardar la reserva en Firestore.
3. Asociar la reserva al usuario conectado.
4. Mostrar mensaje de reserva confirmada.

---

### Etapa 4: Crear “Mis sesiones”

1. Crear sección en `app.html`.
2. Leer reservas desde Firestore.
3. Mostrar reservas en tarjetas.
4. Agregar botón para volver a buscar tutores.

---

### Etapa 5: Agregar pago simulado

1. Agregar selector de método de pago.
2. Guardar el método elegido.
3. Mostrarlo en la confirmación.
4. Mostrarlo en **“Mis sesiones”**.

---

### Etapa 6: Probar todo

Probar en computadora:

- Registro.
- Login.
- Reserva.
- Confirmación.
- Mis sesiones.
- Cerrar sesión.

Probar en celular:

- Menú hamburguesa.
- Buscador.
- Modal.
- Reserva.
- Mis sesiones.
- Diseño responsive.

---

### Etapa 7: Subir a GitHub

Comandos recomendados:

```bash
git status
git add .
git commit -m "Agregar plan futuro con Firebase"
git push
```

---

## 9. Funciones que no se harán todavía

Para no complicar demasiado el proyecto final, todavía no se hará:

- Pago real.
- Chat interno completo.
- Videollamada.
- Panel avanzado de tutor.
- Recuperación avanzada de contraseña.
- Perfil completo de usuario.
- Historial detallado de clases.
- Sistema de membresías.
- Recomendaciones con inteligencia artificial.

Estas funciones pueden quedar como futuras mejoras.

---

## 10. Versión recomendada para el proyecto final

La versión ideal para presentar sería:

- Web publicada en GitHub Pages.
- Registro con correo y contraseña.
- Inicio de sesión.
- Reserva de tutoría.
- Reserva guardada en Firebase.
- Sección **“Mis sesiones”**.
- Pago simulado.
- Diseño responsive.
- README actualizado.

Con eso TutorFlash-Web dejaría de ser solo una maqueta y pasaría a ser una web funcional básica con base de datos.

---

## 11. Objetivo final

El objetivo final de esta etapa es que un estudiante pueda entrar a TutorFlash, registrarse, reservar una tutoría y ver su reserva guardada desde cualquier dispositivo.

Flujo final esperado:

```txt
Entrar
↓
Registrarse o iniciar sesión
↓
Buscar curso
↓
Elegir tutor
↓
Reservar tutoría
↓
Elegir pago simulado
↓
Confirmar reserva
↓
Ver reserva en Mis sesiones


```

# Nota importante sobre Firebase Firestore

## Estado actual de Firestore

Para esta primera versión funcional de TutorFlash-Web, Firestore se configurará en:

**Modo de prueba**

Esto se hará porque el proyecto todavía está en etapa de desarrollo y se necesita probar:

- Registro de usuarios.
- Inicio de sesión.
- Guardado de reservas.
- Visualización de reservas en “Mis sesiones”.
- Pago simulado.

## ¿Por qué se usará modo de prueba?

El modo de prueba permite que la web pueda leer y guardar datos mientras se desarrolla la conexión con Firebase.

Esto facilitará comprobar que:

1. El usuario se registra correctamente.
2. El usuario inicia sesión correctamente.
3. La reserva se guarda en Firestore.
4. Cada reserva aparece en la sección “Mis sesiones”.

## Advertencia importante

El modo de prueba no debe quedarse para siempre.

Cuando el proyecto ya funcione correctamente, se deben cambiar las reglas de Firestore a reglas seguras.

## Pendiente obligatorio antes de presentar o publicar mejor

Antes de considerar la versión final, se deberá cambiar Firestore de modo de prueba a reglas seguras.

El objetivo será que:

- Solo usuarios registrados puedan crear reservas.
- Cada usuario solo pueda ver sus propias reservas.
- Nadie pueda modificar reservas de otros usuarios.
- La base de datos no quede abierta públicamente.

## Reglas futuras sugeridas

Más adelante se deberán configurar reglas parecidas a estas:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /usuarios/{usuarioId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == usuarioId;
    }

    match /reservas/{reservaId} {
      allow create: if request.auth != null;

      allow read: if request.auth != null
                  && request.auth.uid == resource.data.usuarioId;

      allow update, delete: if false;
    }
  }
}
```
## Nota importante sobre reglas de Firestore

Firestore está en modo de prueba durante el desarrollo. Antes de presentar o publicar una versión más completa, se deben cambiar las reglas a reglas seguras.

Cada usuario solo debe poder ver y modificar sus propias reservas. No se debe dejar la base de datos abierta permanentemente.