# TutorFlash Web

Página web del proyecto TutorFlash.

## Archivos principales

- `index.html`: estructura y contenido de la página.
- `css/style.css`: diseño, colores, botones, tarjetas y responsive.
- `js/script.js`: funciones interactivas.
- `assets/img`: imágenes del proyecto.

## Atajos útiles de VS Code

- `Ctrl + S`: guardar cambios.
- `Ctrl + F`: buscar dentro del archivo actual.
- `Ctrl + Shift + F`: buscar en todo el proyecto.
- `Ctrl + H`: buscar y reemplazar.
- `Ctrl + P`: abrir archivo rápido.
- `Ctrl + G`: ir a una línea específica.
- `Ctrl + ,`: abrir configuración.

## Live Server

Para ver la página:

1. Abrir `index.html`.
2. Clic en `Go Live`.
3. Se abre el navegador con una dirección parecida a:

http://127.0.0.1:5500/index.html

Cada vez que edite algo, debo guardar con `Ctrl + S` para que se actualice.

## Extensiones instaladas

- Live Server
- Prettier - Code formatter
- Auto Rename Tag
- Color Highlight
- Material Icon Theme

## Recordatorio

La página debe mantener el tema de TutorFlash:
tutorías rápidas antes de exámenes, búsqueda de tutores, reserva de sesión y aprendizaje rápido.

Estoy trabajando en una página web llamada TutorFlash-Web. Es una landing page para presentar una app de tutorías rápidas antes de exámenes. El proyecto usa HTML, CSS y JavaScript. Quiero que me ayudes a mejorar el diseño y el código, manteniendo estas secciones: inicio, problema, solución, cómo funciona, MVP, usuario objetivo, modelo de ingresos y conclusión.

Cuando ya esté más avanzado, lo ideal será subir tu carpeta a GitHub. Así Codex puede revisar el proyecto completo con más orden. Codex puede ayudar a escribir código, responder preguntas sobre una base de código, corregir errores y proponer cambios.

# TutorFlash-Web

TutorFlash-Web es un proyecto web desarrollado con **HTML, CSS y JavaScript puro**.  
La plataforma simula un servicio de tutorías rápidas para estudiantes que necesitan reforzar cursos antes de un examen.

## Enlaces del proyecto

- **GitHub Pages:** https://elmer2708.github.io/TutorFlash-Web/
- **Repositorio:** https://github.com/elmer2708/TutorFlash-Web

## Idea principal

TutorFlash permite al estudiante seguir este flujo:

1. Buscar un curso.
2. Elegir un tutor disponible.
3. Reservar una sesión.
4. Confirmar la solicitud.

El objetivo es mostrar una plataforma simple, moderna y funcional para conectar estudiantes con tutores de manera rápida.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript
- Visual Studio Code
- GitHub
- GitHub Pages

## Estructura del proyecto

````txt
TUTORFLASH-WEB
├── assets
│   └── img
│       ├── logo-preview.html
│       ├── logo-tutorflash-transparente.png
│       └── referencia-pantalla.png
├── css
│   ├── index.css
│   ├── presentacion.css
│   └── app.css
├── js
│   ├── script.js
│   └── app.js
├── index.html
├── presentacion.html
├── app.html
└── README.md

## Páginas principales

### index.html

Página principal de presentación de TutorFlash.
Desde esta página el usuario puede ingresar a la plataforma mediante el botón principal.

### app.html

Página principal de la plataforma web. Incluye:

- Header con logo y menú.
- Hero principal.
- Buscador de tutorías.
- Cursos disponibles.
- Tarjetas de tutores.
- Sección “Cómo funciona”.
- Contacto.
- Modal de reserva.
- Confirmación final de solicitud.

### presentacion.html

Página de presentación académica del proyecto.

## Funcionalidades actuales

- Diseño responsive para computadora y celular.
- Menú hamburguesa en celular.
- Header fijo al hacer scroll.
- Buscador funcional por curso o tutor.
- Botones de cursos que filtran tutores automáticamente.
- Modal de reserva al presionar “Solicitar”.
- Cálculo dinámico del total según duración.
- Validación de fecha.
- Confirmación final de la solicitud.
- Logo enlazado al inicio principal.

## Cursos disponibles

Actualmente la plataforma incluye tutores para:

- Matemática
- Cálculo
- Inglés
- Programación
- Estadística
- Contabilidad
- Física
- Química

## Validaciones implementadas

La reserva cuenta con validación de fecha para evitar fechas no válidas.
Solo se permite seleccionar fechas desde el día actual hasta el 31 de diciembre del año actual.

También se calcula el total según la duración:

```txt
30 minutos = precio base
45 minutos = precio base x 1.5
60 minutos = precio base x 2
````
