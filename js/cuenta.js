import {
  observarUsuario,
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerTutorActivoActual,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#loginForm");
  const registroForm = document.querySelector("#registroForm");

  const mostrarRegistro = document.querySelector("#mostrarRegistro");
  const mostrarLogin = document.querySelector("#mostrarLogin");

  const registroNombre = document.querySelector("#registroNombre");
  const registroRol = document.querySelector("#registroRol");
  const registroCorreo = document.querySelector("#registroCorreo");
  const registroPassword = document.querySelector("#registroPassword");
  const btnRegistro = document.querySelector("#btnRegistro");

  const loginCorreo = document.querySelector("#loginCorreo");
  const loginPassword = document.querySelector("#loginPassword");
  const btnLogin = document.querySelector("#btnLogin");

  const btnCerrarSesion = document.querySelector("#btnCerrarSesion");
  const cuentaActiva = document.querySelector("#cuentaActiva");
  const usuarioActualTexto = document.querySelector("#usuarioActualTexto");
  const authMensaje = document.querySelector("#authMensaje");

  let redireccionando = false;
  let accionAuthEnProceso = false;

  function mostrarMensaje(mensaje) {
    if (authMensaje) {
      authMensaje.textContent = mensaje;
    }
  }

  function limpiarCampos() {
    if (registroNombre) registroNombre.value = "";
    if (registroCorreo) registroCorreo.value = "";
    if (registroPassword) registroPassword.value = "";
    if (loginCorreo) loginCorreo.value = "";
    if (loginPassword) loginPassword.value = "";
  }

  function mostrarVistaLogin() {
    if (loginForm) loginForm.classList.remove("oculto");
    if (registroForm) registroForm.classList.add("oculto");

    mostrarMensaje("Inicia sesión para continuar.");
  }

  function mostrarVistaRegistro() {
    if (loginForm) loginForm.classList.add("oculto");
    if (registroForm) registroForm.classList.remove("oculto");

    mostrarMensaje("Crea una cuenta para guardar tus reservas.");
  }

  async function redirigirSegunRol() {
    if (redireccionando) return;

    redireccionando = true;
    mostrarMensaje("Revisando tu tipo de usuario...");

    try {
      const tutorActivo = await obtenerTutorActivoActual();

      if (tutorActivo) {
        window.location.href = "panel-tutor.html";
      } else {
        window.location.href = "app.html";
      }
    } catch (error) {
      redireccionando = false;
      mostrarMensaje("No se pudo revisar el tipo de usuario.");
      console.error(error);
    }
  }

  if (mostrarRegistro) {
    mostrarRegistro.addEventListener("click", mostrarVistaRegistro);
  }

  if (mostrarLogin) {
    mostrarLogin.addEventListener("click", mostrarVistaLogin);
  }

  observarUsuario((usuario) => {
    if (usuario) {
      if (loginForm) loginForm.classList.add("oculto");
      if (registroForm) registroForm.classList.add("oculto");
      if (cuentaActiva) cuentaActiva.classList.remove("oculto");

      if (usuarioActualTexto) {
        usuarioActualTexto.textContent = `Conectado como: ${usuario.email}`;
      }

      mostrarMensaje("Sesión iniciada correctamente.");

      if (!accionAuthEnProceso) {
        redirigirSegunRol();
      }
    } else {
      if (cuentaActiva) cuentaActiva.classList.add("oculto");
      mostrarVistaLogin();
    }
  });

  if (btnRegistro) {
    btnRegistro.addEventListener("click", async () => {
      const nombre = registroNombre.value.trim();
      const rol = registroRol ? registroRol.value : "estudiante";
      const correo = registroCorreo.value.trim();
      const password = registroPassword.value.trim();

      if (!nombre || !correo || !password) {
        mostrarMensaje("Completa todos los campos para registrarte.");
        return;
      }

      if (password.length < 6) {
        mostrarMensaje("La contraseña debe tener mínimo 6 caracteres.");
        return;
      }

      try {
        accionAuthEnProceso = true;

        await registrarUsuario(nombre, correo, password, rol);

        limpiarCampos();
        mostrarMensaje("Cuenta creada correctamente. Redirigiendo...");

        await redirigirSegunRol();
      } catch (error) {
        mostrarMensaje(
          "No se pudo crear la cuenta. Revisa el correo o la contraseña.",
        );
        console.error(error);
      } finally {
        accionAuthEnProceso = false;
      }
    });
  }

  if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      const correo = loginCorreo.value.trim();
      const password = loginPassword.value.trim();

      if (!correo || !password) {
        mostrarMensaje("Ingresa tu correo y contraseña.");
        return;
      }

      try {
        accionAuthEnProceso = true;

        await iniciarSesion(correo, password);

        limpiarCampos();
        mostrarMensaje("Inicio de sesión correcto. Redirigiendo...");

        await redirigirSegunRol();
      } catch (error) {
        mostrarMensaje("Correo o contraseña incorrectos.");
        console.error(error);
      } finally {
        accionAuthEnProceso = false;
      }
    });
  }

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", async () => {
      try {
        await cerrarSesion();
        mostrarMensaje("Sesión cerrada.");
      } catch (error) {
        mostrarMensaje("No se pudo cerrar sesión.");
        console.error(error);
      }
    });
  }
});
