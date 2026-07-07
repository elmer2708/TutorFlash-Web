import {
  observarUsuario,
  cerrarSesion,
  obtenerTutorActivoActual,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnUsuario = document.getElementById("btnUsuarioTutor");
  const menuUsuario = document.getElementById("menuUsuarioTutor");
  const cerrarMenuUsuario = document.getElementById("cerrarMenuTutor");
  const btnCerrarSesionTutor = document.getElementById("btnCerrarSesionTutor");
  const avatarIniciales = document.getElementById("avatarTutorTop");
  const avatarMenu = document.getElementById("avatarTutorMenu");
  const nombreUsuarioTop = document.getElementById("nombreTutorTop");
  const correoUsuarioMenu = document.getElementById("correoTutorMenu");
  const saludoUsuarioMenu = document.getElementById("saludoTutorMenu");

  if (!btnUsuario || !menuUsuario) return;

  function obtenerIniciales(nombre) {
    const partes = String(nombre || "TutorFlash Tutor")
      .trim()
      .split(" ")
      .filter(Boolean);

    return `${partes[0]?.charAt(0) || "T"}${partes[1]?.charAt(0) || "F"}`.toUpperCase();
  }

  function cerrarMenu() {
    menuUsuario.classList.add("oculto");
  }

  function pintarCuenta(nombre, correo) {
    const iniciales = obtenerIniciales(nombre);

    if (avatarIniciales) avatarIniciales.textContent = iniciales;
    if (avatarMenu) avatarMenu.textContent = iniciales;
    if (nombreUsuarioTop) nombreUsuarioTop.textContent = nombre;
    if (correoUsuarioMenu) correoUsuarioMenu.textContent = correo;
    if (saludoUsuarioMenu) saludoUsuarioMenu.textContent = `Hola, ${nombre}`;
  }

  btnUsuario.addEventListener("click", () => {
    menuUsuario.classList.toggle("oculto");
  });

  cerrarMenuUsuario?.addEventListener("click", cerrarMenu);

  document.addEventListener("click", (event) => {
    if (!menuUsuario.contains(event.target) && !btnUsuario.contains(event.target)) {
      cerrarMenu();
    }
  });

  btnCerrarSesionTutor?.addEventListener("click", async () => {
    try {
      btnCerrarSesionTutor.disabled = true;
      btnCerrarSesionTutor.textContent = "Cerrando sesion...";
      await cerrarSesion();
      window.location.href = "cuenta.html";
    } catch (error) {
      console.error("Error al cerrar sesion:", error);
      btnCerrarSesionTutor.disabled = false;
      btnCerrarSesionTutor.textContent = "Cerrar sesion";
    }
  });

  observarUsuario(async (usuario) => {
    if (!usuario) return;

    const nombreBase = usuario.displayName || "Tutor";
    const correoBase = usuario.email || "correo no registrado";

    pintarCuenta(nombreBase, correoBase);

    try {
      const tutorActivo = await obtenerTutorActivoActual();
      const nombreTutor =
        tutorActivo?.tutor ||
        tutorActivo?.nombre ||
        tutorActivo?.nombreCompleto ||
        nombreBase;
      const correoTutor = tutorActivo?.correo || correoBase;

      pintarCuenta(nombreTutor, correoTutor);
    } catch (error) {
      console.warn("No se pudo cargar el chip del tutor:", error);
    }
  });
});
