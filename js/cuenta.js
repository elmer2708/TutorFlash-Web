import {
  observarUsuario,
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerUsuarioActual,
  obtenerPerfilUsuarioActual,
  obtenerTutorActivoActual,
  obtenerPostulacionTutorPorUid,
  enviarRestablecimientoPassword,
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
  const btnRestablecerPassword = document.querySelector(
    "#btnRestablecerPassword",
  );

  const cuentaActiva = document.querySelector("#cuentaActiva");
  const usuarioActualTexto = document.querySelector("#usuarioActualTexto");
  const authMensaje = document.querySelector("#authMensaje");

  const ADMIN_EMAILS = ["admin@gmail.com"].map((correo) =>
    correo.toLowerCase().trim(),
  );

  let accionAuthEnProceso = false;
  let redireccionando = false;

  function normalizarCorreo(correo) {
    return String(correo || "")
      .trim()
      .toLowerCase();
  }

  function esAdmin(correo) {
    return ADMIN_EMAILS.includes(normalizarCorreo(correo));
  }

  function mostrarMensaje(mensaje, tipo = "info") {
    if (!authMensaje) return;

    authMensaje.textContent = mensaje;
    authMensaje.className = `auth-mensaje ${tipo}`;
  }

  function limpiarMensaje() {
    if (!authMensaje) return;

    authMensaje.textContent = "";
    authMensaje.className = "auth-mensaje oculto";
  }

  function limpiarCampos() {
    if (registroNombre) registroNombre.value = "";
    if (registroCorreo) registroCorreo.value = "";
    if (registroPassword) registroPassword.value = "";
    if (loginCorreo) loginCorreo.value = "";
    if (loginPassword) loginPassword.value = "";
  }

  function cambiarTextoBoton(boton, texto, deshabilitado = true) {
    if (!boton) return;

    if (!boton.dataset.textoOriginal) {
      boton.dataset.textoOriginal = boton.textContent;
    }

    boton.textContent = texto;
    boton.disabled = deshabilitado;
  }

  function restaurarBoton(boton) {
    if (!boton) return;

    boton.textContent = boton.dataset.textoOriginal || boton.textContent;
    boton.disabled = false;
  }

  function mostrarVistaLogin() {
    if (loginForm) loginForm.classList.remove("oculto");
    if (registroForm) registroForm.classList.add("oculto");
    if (cuentaActiva) cuentaActiva.classList.add("oculto");

    mostrarMensaje("Inicia sesión para continuar en TutorFlash.", "info");
  }

  function mostrarVistaRegistro() {
    if (loginForm) loginForm.classList.add("oculto");
    if (registroForm) registroForm.classList.remove("oculto");
    if (cuentaActiva) cuentaActiva.classList.add("oculto");

    mostrarMensaje("Crea tu cuenta para acceder a TutorFlash.", "info");
  }

  function obtenerMensajeError(error) {
    const codigo = error?.code || "";

    if (codigo.includes("auth/invalid-email")) {
      return "El correo ingresado no tiene un formato válido.";
    }

    if (codigo.includes("auth/email-already-in-use")) {
      return "Este correo ya está registrado. Inicia sesión o usa otro correo.";
    }

    if (
      codigo.includes("auth/invalid-credential") ||
      codigo.includes("auth/wrong-password") ||
      codigo.includes("auth/user-not-found")
    ) {
      return "Correo o contraseña incorrectos.";
    }

    if (codigo.includes("auth/weak-password")) {
      return "La contraseña debe tener mínimo 6 caracteres.";
    }

    if (codigo.includes("auth/network-request-failed")) {
      return "Hay un problema de conexión. Revisa tu internet e intenta otra vez.";
    }

    return "Ocurrió un error. Intenta nuevamente.";
  }

  async function redirigirSegunRol(rolRegistro = null) {
    if (redireccionando) return;

    const usuario = obtenerUsuarioActual();

    if (!usuario) {
      return;
    }

    redireccionando = true;
    mostrarMensaje("Revisando tu tipo de usuario...", "info");

    try {
      const correoUsuario = normalizarCorreo(usuario.email);

      if (esAdmin(correoUsuario)) {
        mostrarMensaje(
          "Acceso administrador validado. Redirigiendo...",
          "exito",
        );
        window.location.href = "admin.html";
        return;
      }

      const tutorActivo = await obtenerTutorActivoActual();

      if (tutorActivo) {
        mostrarMensaje("Tutor aprobado. Redirigiendo a tu panel...", "exito");
        window.location.href = "panel-tutor.html";
        return;
      }

      const postulacionTutor = await obtenerPostulacionTutorPorUid(usuario.uid);

      if (postulacionTutor) {
        mostrarMensaje("Redirigiendo a tu postulación de tutor...", "info");
        window.location.href = "tutor.html";
        return;
      }

      const perfilUsuario = await obtenerPerfilUsuarioActual();
      const rol = rolRegistro || perfilUsuario?.rol || "estudiante";

      if (rol === "tutor") {
        mostrarMensaje("Redirigiendo a la página de tutor...", "info");
        window.location.href = "tutor.html";
        return;
      }

      mostrarMensaje(
        "Acceso validado. Redirigiendo a la plataforma...",
        "exito",
      );
      window.location.href = "estudiante.html";
    } catch (error) {
      console.error("Error al redirigir según rol:", error);
      redireccionando = false;
      mostrarMensaje(
        "No se pudo validar tu acceso. Intenta nuevamente.",
        "error",
      );
    }
  }

  async function manejarRegistro(event) {
    if (event) event.preventDefault();

    if (accionAuthEnProceso) return;

    const nombre = registroNombre?.value.trim() || "";
    const correo = registroCorreo?.value.trim().toLowerCase() || "";
    const password = registroPassword?.value.trim() || "";

    let rol = registroRol ? registroRol.value : "estudiante";

    if (rol === "admin") {
      rol = "estudiante";
    }

    if (!nombre || !correo || !password) {
      mostrarMensaje(
        "Completa todos los campos para crear tu cuenta.",
        "error",
      );
      return;
    }

    if (nombre.length < 2 || /^\d+$/.test(nombre)) {
      mostrarMensaje("Ingresa un nombre válido.", "error");
      return;
    }

    if (!correo.includes("@") || !correo.includes(".")) {
      mostrarMensaje("Ingresa un correo válido.", "error");
      return;
    }

    if (password.length < 6) {
      mostrarMensaje("La contraseña debe tener mínimo 6 caracteres.", "error");
      return;
    }

    try {
      accionAuthEnProceso = true;
      cambiarTextoBoton(btnRegistro, "Creando cuenta...");

      await registrarUsuario(nombre, correo, password, rol);

      limpiarCampos();

      if (rol === "tutor") {
        mostrarMensaje(
          "Cuenta creada. Ahora completa tu postulación como tutor.",
          "exito",
        );
      } else {
        mostrarMensaje("Cuenta creada correctamente. Redirigiendo...", "exito");
      }

      await redirigirSegunRol(rol);
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      mostrarMensaje(obtenerMensajeError(error), "error");
    } finally {
      accionAuthEnProceso = false;
      restaurarBoton(btnRegistro);
    }
  }

  async function manejarLogin(event) {
    if (event) event.preventDefault();

    if (accionAuthEnProceso) return;

    const correo = loginCorreo?.value.trim().toLowerCase() || "";
    const password = loginPassword?.value.trim() || "";

    if (!correo || !password) {
      mostrarMensaje("Ingresa tu correo y contraseña.", "error");
      return;
    }

    try {
      accionAuthEnProceso = true;
      cambiarTextoBoton(btnLogin, "Iniciando sesión...");

      await iniciarSesion(correo, password);

      limpiarCampos();
      mostrarMensaje("Inicio de sesión correcto. Redirigiendo...", "exito");

      await redirigirSegunRol();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      mostrarMensaje(obtenerMensajeError(error), "error");
    } finally {
      accionAuthEnProceso = false;
      restaurarBoton(btnLogin);
    }
  }

  if (mostrarRegistro) {
    mostrarRegistro.addEventListener("click", mostrarVistaRegistro);
  }

  if (mostrarLogin) {
    mostrarLogin.addEventListener("click", mostrarVistaLogin);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", manejarLogin);
  }

  if (registroForm) {
    registroForm.addEventListener("submit", manejarRegistro);
  }

  btnRestablecerPassword?.addEventListener("click", async () => {
    if (accionAuthEnProceso) return;

    const correo = loginCorreo?.value.trim().toLowerCase() || "";

    try {
      accionAuthEnProceso = true;
      cambiarTextoBoton(btnRestablecerPassword, "Enviando...");

      await enviarRestablecimientoPassword(correo);

      mostrarMensaje(
        "Te enviamos un enlace para restablecer tu contraseña.",
        "exito",
      );
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      mostrarMensaje(
        error.message || "No se pudo enviar el correo de restablecimiento.",
        "error",
      );
    } finally {
      accionAuthEnProceso = false;
      restaurarBoton(btnRestablecerPassword);
    }
  });

  if (btnLogin && btnLogin.type !== "submit") {
    btnLogin.addEventListener("click", manejarLogin);
  }

  if (btnRegistro && btnRegistro.type !== "submit") {
    btnRegistro.addEventListener("click", manejarRegistro);
  }

  observarUsuario((usuario) => {
    if (usuario) {
      if (loginForm) loginForm.classList.add("oculto");
      if (registroForm) registroForm.classList.add("oculto");
      if (cuentaActiva) cuentaActiva.classList.remove("oculto");

      if (usuarioActualTexto) {
        usuarioActualTexto.textContent = "Redirigiendo a tu panel...";
      }

      if (!accionAuthEnProceso && !redireccionando) {
        redirigirSegunRol();
      }

      return;
    }

    redireccionando = false;

    if (cuentaActiva) cuentaActiva.classList.add("oculto");

    mostrarVistaLogin();
  });
});
