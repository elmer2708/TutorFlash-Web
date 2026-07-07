Estoy trabajando en TutorFlash-Web. Necesito una revisión y mejora funcional final, ordenada y segura.

IMPORTANTE GENERAL:

- No hagas commit.
- No hagas push.
- No toques Firebase Rules.
- No uses Firebase Storage.
- No actualices el plan de Firebase.
- No rompas login, registro, roles, reservas, pagos, notificaciones, favoritos, clase virtual ni paneles.
- No cambies rutas si no es necesario.
- No uses librerías externas.
- Mantén el estilo TutorFlash: azul oscuro, dorado/amarillo, blanco, crema y celeste suave.
- Usa mensajes visuales existentes como mostrarAviso() o mensajes-ui.js si ya existe.
- No uses alert() para errores normales.
- Solo usa confirm() en acciones delicadas como aprobar/rechazar/eliminar.
- Todos los mensajes deben estar en español y visibles en pantalla.
- Limpia espacios con trim() antes de guardar.
- Evita guardar campos vacíos o solo con espacios.
- Evita mostrar undefined, null, NaN o Invalid Date.
- Desactiva botones mientras se guarda o procesa para evitar doble clic.
- Reactiva botones si ocurre un error.
- Usa console.error para errores técnicos.
- Al final dame resumen claro de archivos modificados y pruebas manuales.

CONTEXTO IMPORTANTE:
TutorFlash será solo modalidad virtual por ahora.
No se debe pedir ni validar modalidad presencial.
No se debe pedir distrito obligatorio para clases presenciales.
El CV del tutor será SOLO por enlace de Google Drive u otro enlace seguro.
No se usará Firebase Storage por ahora.

ARCHIVOS A REVISAR:

HTML:

- pages/cuenta.html
- pages/informacion.html
- pages/estudiante.html
- pages/perfil-estudiante.html
- pages/buscar-tutor.html
- pages/tutores.html
- pages/sesiones.html
- pages/agenda-estudiante.html
- pages/tutor.html
- pages/panel-tutor.html
- pages/perfil-tutor.html
- pages/disponibilidad-tutor.html
- pages/admin.html

JS:

- js/cuenta.js
- js/estudiante.js
- js/perfil-estudiante.js
- js/buscar-tutor.js
- js/tutores.js
- js/sesiones.js
- js/agenda-estudiante.js
- js/tutor.js
- js/panel-tutor.js
- js/perfil-tutor.js
- js/disponibilidad-tutor.js
- js/admin.js
- js/firebase-service.js
- js/validaciones.js si ya existe
- js/mensajes-ui.js si ya existe
- js/sidebar-responsive.js si afecta menús

CSS:

- css/admin.css
- css/estudiante.css
- css/tutor.css
- css/panel-tutor.css
- css/cuenta.css
- css/informacion.css
- otros CSS relacionados si corresponde

==================================================

1. # MEJORAR DISEÑO DEL PANEL ADMIN

Objetivo:
El panel admin debe verse igual de profesional y consistente que el portal estudiante y el portal tutor.

Problema actual:

- Usa emojis en el sidebar.
- El logo aparece como “TF” en un bloque simple.
- El botón “Cerrar sesión” amarillo está dentro del sidebar.
- El diseño no se ve igual al estudiante ni tutor.
- Las tarjetas de postulaciones se ven grandes y algo antiguas.
- El correo se parte mal.
- Los filtros ocupan mucho espacio.

Cambios requeridos:

1.1 Unificar sidebar admin:

- Quitar emojis del menú.
- Usar iconos SVG inline lineales y consistentes.
- Usar fondo azul oscuro igual al estudiante/tutor.
- Usar logo TutorFlash con mismo estilo de contenedor.
- Usar estado activo con borde dorado.
- Mantener buen espaciado entre icono y texto.
- Usar clases consistentes como:
  sidebar-link
  sidebar-link active
  sidebar-icon
  sidebar-label
- El menú debe verse bien en escritorio y móvil.

Menú admin sugerido:

- Dashboard
- Postulaciones
- Tutores activos
- Pagos
- Notificaciones
- Sesiones
- Configuración solo si ya existe o si no requiere función grande.

Si alguna sección no existe todavía, no crear una función grande. Mantener los enlaces reales existentes.

1.2 Quitar botón “Cerrar sesión” del sidebar:

- Quitar el botón amarillo “Cerrar sesión” del sidebar.
- Manejar la cuenta igual que estudiante/tutor:
  - chip de usuario arriba a la derecha
  - inicial del usuario
  - nombre “Administrador”
  - texto “Mi cuenta”
  - al hacer clic, mostrar tarjeta desplegable
  - correo del admin
  - avatar con inicial
  - saludo
  - botón “Cerrar sesión”
- No duplicar botones de cerrar sesión.

  1.3 Topbar admin:

- Crear o mejorar el encabezado superior del admin para que tenga:
  - chip de cuenta arriba a la derecha
  - campana de notificaciones si ya existe lógica
  - dropdown de cuenta
  - botón cerrar sesión
  - diseño responsive
- Debe verse parecido al portal estudiante y portal tutor.

  1.4 Tarjetas de postulaciones:

- Tarjetas más limpias, modernas y compactas.
- Mejorar grid interno de datos.
- Evitar que el correo se corte mal.
- Usar word-break o overflow-wrap donde corresponda.
- Mostrar datos con etiquetas claras:
  - Correo
  - Teléfono
  - Cursos
  - Nivel
  - Disponibilidad
  - Experiencia
  - CV si existe
- Si falta un dato, mostrar “No registrado”.
- No mostrar undefined, null ni campos vacíos.
- Mantener badges de estado:
  - Pendiente
  - Aprobado
  - Rechazado
- Botones aprobar/rechazar deben verse consistentes.
- Si ya está aprobado, no mostrar botones innecesarios.

  1.5 Filtros admin:

- Mejorar filtros:
  - Todos
  - Pendientes
  - Aprobadas
  - Rechazadas
- Mejorar alineación.
- En móvil deben bajar bien.
- No deben ocupar demasiado espacio.
- Mantener estado activo claro.

  1.6 Dashboard admin:

- Tarjetas redondeadas.
- Sombras suaves.
- Colores consistentes.
- Títulos claros.
- Métricas limpias.
- Estados vacíos bonitos.
- Responsive correcto.

  1.7 Responsive admin:
  Revisar en:

- 320px
- 360px
- 390px
- 480px
- 768px
- 1024px
- 1280px
- 1440px

Debe evitar:

- scroll horizontal
- sidebar roto
- tarjetas salidas de pantalla
- correos cortados feo
- filtros desordenados
- topbar apretado
- botón cerrar sesión duplicado
- contenido tapado por sidebar
- menú hamburguesa roto

================================================== 2. CV DEL TUTOR SOLO POR ENLACE
==================================================

Objetivo:
El tutor debe poder agregar su CV o currículum mediante enlace, y el admin debe poder verlo antes de aprobarlo.

IMPORTANTE:

- No usar Firebase Storage.
- No pedir adjuntar archivo todavía.
- No tocar Firebase Rules.
- No actualizar plan de Firebase.
- Implementar solo “Enlace de CV”.

Revisar:

- pages/tutor.html
- pages/perfil-tutor.html
- pages/admin.html
- js/tutor.js
- js/perfil-tutor.js
- js/admin.js
- js/firebase-service.js si hace falta

Requerimientos:

- Agregar campo “Enlace de CV”.
- Guardar el enlace como cvUrl.
- Guardar cvTipo: "drive" si corresponde.
- Guardar cvActualizadoEn si ya se usan timestamps.
- El CV puede ser opcional al inicio.
- Si el tutor lo llena, debe ser una URL válida.
- Debe iniciar con http:// o https://.
- No aceptar enlaces con espacios.
- Mostrar mensaje claro si el enlace no es válido.
- En admin, mostrar botón “Ver CV” si existe cvUrl.
- El botón “Ver CV” debe abrir en nueva pestaña.
- Usar target="\_blank" y rel="noopener noreferrer".
- Si no hay CV, mostrar “CV no registrado”.
- No mostrar undefined, null ni campo vacío.

================================================== 3. VALIDAR CELULAR PERUANO DE 9 DÍGITOS
==================================================

Objetivo:
El celular debe estar bien escrito. Debe tener 9 dígitos y empezar con 9.

Aplicar en:

- postulación de tutor
- perfil tutor
- perfil estudiante
- datos de pago tutor si hay Yape o Plin
- cualquier formulario que tenga teléfono/celular

Validación recomendada:

- pattern="^9[0-9]{8}$"
- maxlength="9"
- minlength="9"
- inputmode="numeric"
- autocomplete="tel"
- mensaje claro: “Ingresa un celular válido de 9 dígitos.”

En JS:

- aplicar trim()
- quitar espacios
- evitar letras
- validar que empiece con 9
- validar longitud exacta de 9 dígitos
- no guardar celulares inválidos en Firebase

================================================== 4. BOTÓN CONTACTAR POR WHATSAPP
==================================================

Objetivo:
Cuando exista un celular válido, mostrar botón para contactar por WhatsApp.

Aplicar donde corresponda:

- estudiante al ver tutor
- admin al revisar tutor
- sesiones si corresponde
- perfil tutor si corresponde

Requerimiento:

- Solo mostrar si el celular es válido.
- Celular debe tener 9 dígitos y empezar con 9.
- Crear enlace:
  https://wa.me/51NUMERO
- Ejemplo:
  https://wa.me/51987654321
- Usar target="\_blank".
- Usar rel="noopener noreferrer".
- Botón con texto claro:
  “Contactar por WhatsApp”
- No mostrar botón si el número está vacío o inválido.
- No mostrar enlaces rotos.

================================================== 5. MODALIDAD SOLO VIRTUAL
==================================================

Objetivo:
Por ahora TutorFlash será solo virtual.

Revisar:

- formularios de reserva
- sesiones
- agenda
- perfil tutor
- panel tutor
- panel estudiante
- admin si muestra modalidad

Requerimiento:

- Quitar opciones de modalidad presencial si existen.
- Dejar modalidad fija como “Virtual”.
- Si hay select de modalidad, reemplazarlo por texto o input oculto con valor "Virtual".
- Al guardar reservas, guardar siempre:
  modalidad: "Virtual"
- No permitir guardar modalidad vacía o diferente a "Virtual".
- Actualizar textos visuales para que no confundan al usuario.
- No pedir distrito obligatorio para clases presenciales.

================================================== 6. RESTABLECER CONTRASEÑA
==================================================

Objetivo:
El usuario debe poder recuperar o cambiar su contraseña.

Revisar:

- pages/cuenta.html
- pages/informacion.html
- js/cuenta.js
- tarjeta de cuenta estudiante
- tarjeta de cuenta tutor
- tarjeta de cuenta admin si existe

Implementación:

- Agregar opción “Olvidé mi contraseña” en el login.
- Usar Firebase Auth sendPasswordResetEmail.
- El usuario escribe su correo y recibe enlace para restablecer contraseña.
- Validar correo obligatorio.
- Validar formato de correo.
- Mostrar mensaje bonito:
  “Te enviamos un enlace para restablecer tu contraseña.”
- Mostrar error claro si el correo está vacío o no es válido.
- No mostrar mensajes técnicos al usuario.

Si agregas opción dentro de la cuenta:

- botón “Cambiar contraseña”
- usar correo actual del usuario si está disponible
- enviar correo de restablecimiento
- mostrar mensaje visual claro

================================================== 7. VALIDACIONES LOGIN / REGISTRO
==================================================

Validar:

- Correo obligatorio.
- Correo con formato válido.
- Correo sin espacios.
- Contraseña mínima de 6 caracteres si Firebase usa mínimo 6.
- Si el proyecto ya usa mínimo 8, respetar 8.
- Nombre obligatorio en registro.
- Nombre mínimo 2 caracteres.
- No permitir nombre solo con números.
- No permitir campos solo con espacios.
- Mostrar mensaje claro si el rol no existe o no se puede detectar.
- Mostrar mensaje claro si el correo o contraseña son incorrectos.
- Botón de login/registro debe desactivarse mientras procesa.

Agregar atributos HTML donde falten:

- required
- type="email"
- minlength
- maxlength
- autocomplete
- placeholder claro

================================================== 8. VALIDACIONES PERFIL ESTUDIANTE
==================================================

Validar:

- Nombre obligatorio.
- Nombre mínimo 2 caracteres.
- Teléfono opcional, pero si existe debe ser celular peruano válido.
- Celular: 9 dígitos y debe empezar con 9.
- Distrito/zona opcional con máximo razonable de caracteres.
- Nivel académico obligatorio si se usa para recomendaciones.
- No guardar campos solo con espacios.
- Mostrar mensaje claro si algo falla.

================================================== 9. VALIDACIONES BUSCAR TUTOR / RESERVA
==================================================

Validar:

- No permitir reservar si no hay tutor seleccionado.
- No permitir reservar sin fecha.
- No permitir reservar sin hora.
- Modalidad debe ser siempre "Virtual".
- No permitir modalidad vacía ni diferente a "Virtual".
- No permitir duración inválida.
- No permitir fecha pasada.
- No permitir reservas demasiado futuras, máximo 60 o 90 días.
- Validar que la hora esté dentro de la disponibilidad real del tutor.
- Validar que no choque con otra reserva ocupada si ya existe esa lógica.
- Validar duración positiva y dentro de opciones permitidas.
- Validar que el total calculado sea mayor a 0.
- Evitar doble clic en “Confirmar reserva”.
- Mostrar mensajes claros.

Al guardar reserva, guardar siempre:
modalidad: "Virtual"

================================================== 10. VALIDACIONES PERFIL TUTOR
==================================================

Validar:

- Nombre público obligatorio.
- Nombre mínimo 2 caracteres.
- Cursos obligatorios.
- Cursos con máximo razonable de caracteres.
- Precio por hora obligatorio.
- Precio mayor a 0.
- Precio máximo razonable, por ejemplo S/ 300.
- Presentación/experiencia con máximo de 300 o 500 caracteres.
- Modalidad debe ser "Virtual".
- Estado público solo debe aceptar valores esperados: activo/inactivo.
- No guardar perfil incompleto si afecta reservas.
- No guardar textos solo con espacios.
- CV por enlace debe validarse si se llena.

No pedir distrito/zona obligatorio para clases presenciales porque TutorFlash será solo virtual.

================================================== 11. VALIDACIONES DISPONIBILIDAD TUTOR
==================================================

Validar:

- Día obligatorio.
- Hora inicio obligatoria.
- Hora fin obligatoria.
- Hora inicio debe ser menor que hora fin.
- Evitar bloques duplicados el mismo día con la misma hora.
- Evitar bloques superpuestos.
- No permitir bloques demasiado cortos, por ejemplo menos de 30 minutos.
- No permitir disponibilidad vacía si el tutor quiere aparecer disponible.
- Botón guardar debe desactivarse mientras guarda.
- Mostrar mensaje claro si hay error.

================================================== 12. VALIDACIONES DATOS DE PAGO TUTOR
==================================================

Validar:

- Titular obligatorio.
- Al menos un método de pago obligatorio: Yape, Plin, banco o CCI.
- Yape y Plin: 9 dígitos y empezar con 9.
- CCI/cuenta: permitir solo números, guiones y espacios.
- CCI/cuenta con máximo razonable.
- Banco con máximo razonable de caracteres.
- Instrucciones con máximo de 300 o 500 caracteres.
- Evitar guardar métodos de pago con solo espacios.
- Mostrar mensajes claros.

================================================== 13. VALIDACIONES PAGO MANUAL ESTUDIANTE
==================================================

Validar:

- Método de pago obligatorio.
- Monto pagado obligatorio.
- Monto pagado numérico y mayor a 0.
- Monto pagado no debe exceder demasiado el total esperado.
- Número de operación obligatorio.
- Número de operación mínimo 5 y máximo 30 caracteres.
- Número de operación sin símbolos raros.
- Comentario opcional con máximo razonable.
- Evitar reenviar pago varias veces por doble clic.
- Mostrar mensaje visual claro.

================================================== 14. PANEL TUTOR / REVISIÓN DE PAGO
==================================================

Validar:

- Confirmar pago solo si la reserva existe.
- Confirmar pago solo si estadoPago === "en_revision".
- Rechazar pago solo con motivo obligatorio.
- Motivo de rechazo con máximo razonable de caracteres.
- No permitir confirmar/rechazar pagos de reservas canceladas, rechazadas o realizadas.
- Botones deben desactivarse mientras procesan.
- Mostrar mensaje claro.

================================================== 15. CLASE VIRTUAL
==================================================

Validar:

- Plataforma obligatoria si se guarda enlace.
- Enlace obligatorio.
- Enlace debe empezar con http:// o https://.
- No permitir enlaces con espacios.
- No permitir enlace en reservas pendientes.
- No permitir editar enlace si la reserva está realizada, cancelada o rechazada.
- Mostrar mensaje claro si el enlace no es válido.

================================================== 16. ADMIN VALIDACIONES
==================================================

Validar:

- Aprobar tutor solo si existe ID válido.
- Rechazar tutor solo si existe ID válido.
- Pedir confirmación antes de aprobar/rechazar.
- Evitar aprobar postulaciones incompletas si faltan datos importantes.
- Validar estados permitidos: pendiente, aprobado, rechazado.
- No ejecutar acciones sobre documentos inexistentes.
- Mostrar mensaje visual claro.
- Usar console.error para errores técnicos.

================================================== 17. NOTIFICACIONES
==================================================

Validar:

- Cada notificación debe tener ID estable.
- Evitar duplicados por misma reserva si ya existe lógica.
- No contar notificaciones leídas en localStorage.
- No mostrar notificaciones pendientes si la reserva está cancelada, rechazada o realizada.
- No mostrar undefined/null en notificaciones.

================================================== 18. VALIDACIONES GENERALES HTML
==================================================

Agregar donde corresponda:

- required
- maxlength
- minlength
- min
- max
- type="email"
- type="number"
- type="url"
- type="date"
- type="time"
- inputmode
- autocomplete
- placeholder claro
- labels conectados con for e id

================================================== 19. VALIDACIONES GENERALES JS
==================================================

Aplicar:

- trim() antes de guardar.
- No guardar campos solo con espacios.
- No guardar objetos vacíos.
- No guardar números negativos.
- No mostrar undefined/null/NaN/Invalid Date.
- Desactivar botones mientras se guarda o procesa.
- Reactivar botones si ocurre error.
- Usar console.error para errores técnicos.
- Usar mensajes visuales en español para el usuario.

================================================== 20. VERIFICACIÓN FINAL
==================================================

Después de modificar, revisar:

- login
- registro
- recuperar contraseña
- redirección por rol
- perfil estudiante
- postulación tutor
- perfil tutor
- disponibilidad tutor
- datos de pago tutor
- búsqueda de tutor
- reserva
- pago manual
- revisión de pago tutor
- clase virtual
- admin aprobar/rechazar tutor
- CV tutor por enlace
- WhatsApp
- notificaciones
- panel admin visual
- responsive móvil
- responsive tablet
- responsive escritorio

AL FINAL DIME:

1. Archivos modificados.
2. Qué cambiaste en el diseño del admin.
3. Si quitaste emojis del admin.
4. Si quitaste el botón amarillo “Cerrar sesión” del sidebar admin.
5. Qué agregaste en el topbar admin.
6. Qué mejoraste en las tarjetas de postulaciones.
7. Si agregaste soporte visual para CV.
8. Si implementaste CV solo como enlace.
9. Qué campo usaste para guardar el CV.
10. Si Firebase Storage fue usado o no.
11. Qué validación de celular agregaste.
12. Dónde agregaste botón WhatsApp.
13. Qué cambiaste para modalidad solo virtual.
14. Cómo funciona restablecer contraseña.
15. Qué validaciones agregaste en login/registro.
16. Qué validaciones agregaste en perfil estudiante.
17. Qué validaciones agregaste en reservas.
18. Qué validaciones agregaste en perfil tutor.
19. Qué validaciones agregaste en disponibilidad tutor.
20. Qué validaciones agregaste en datos de pago.
21. Qué validaciones agregaste en pago manual.
22. Qué validaciones agregaste en clase virtual.
23. Qué validaciones agregaste en admin.
24. Qué debo probar manualmente antes de hacer git.

Crear sistema de chat entre estudiante y tutor en TutorFlash-Web.

IMPORTANTE:

- No hagas commit.
- No hagas push.
- No toques Firebase Rules.
- No rompas reservas, sesiones, pagos, notificaciones, favoritos, clase virtual ni roles.
- No uses librerías externas.
- Mantén el diseño TutorFlash: azul oscuro, dorado, blanco, crema y celeste suave.
- Usa mensajes visuales existentes.
- No uses alert() para errores normales.

Archivos nuevos:

- pages/chat.html
- js/chat.js
- css/chat.css

También agregar mini chat flotante en portal estudiante y portal tutor.

El chat debe permitir:

- conversaciones entre estudiante y tutor solo si existe una reserva entre ambos
- enviar mensajes
- listar mensajes
- mostrar último mensaje
- contador de mensajes no leídos
- marcar mensajes como leídos
- abrir mini chat flotante desde cualquier página del estudiante o tutor
- abrir chat completo desde pages/chat.html
- diseño responsive
- mensajes visuales bonitos

Firestore sugerido:

- chats
- chats/{chatId}/mensajes

Estructura sugerida de chat:

- estudianteId
- estudianteNombre
- tutorId
- tutorNombre
- reservaId
- ultimoMensaje
- actualizadoEn
- participantes: [estudianteId, tutorId]

Estructura sugerida de mensaje:

- texto
- autorId
- autorRol
- fecha
- leido

Reglas funcionales:

- El estudiante solo puede chatear con tutores con quienes tenga reserva.
- El tutor solo puede chatear con estudiantes que le reservaron.
- No permitir mensajes vacíos.
- No permitir mensajes solo con espacios.
- Evitar doble clic al enviar.
- Mostrar estado vacío: “Aún no tienes mensajes.”
- Mostrar error visual si no se puede cargar el chat.
- No mostrar undefined/null.

Mini chat flotante:

- Agregar icono de chat en portal estudiante y tutor.
- Al hacer clic, abrir una ventanita pequeña.
- Debe permitir ver conversaciones recientes.
- Debe tener botón “Abrir chat completo”.
- Debe ser responsive.
- No debe tapar botones importantes.
- Debe poder cerrarse.

Al final indicar:

1. Archivos creados.
2. Archivos modificados.
3. Estructura usada en Firestore.
4. Cómo se crea una conversación.
5. Cómo se validan los participantes.
6. Cómo se prueba desde estudiante.
7. Cómo se prueba desde tutor.
8. Qué debo revisar manualmente antes de hacer git.
