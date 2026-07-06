import {
  observarUsuario,
  cerrarSesion,
  obtenerPerfilUsuarioActual,
  actualizarPerfilUsuarioActual,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const tituloBienvenida = document.querySelector("#tituloBienvenida");

  const btnUsuario = document.querySelector("#btnUsuario");
  const menuUsuario = document.querySelector("#menuUsuario");
  const cerrarMenuUsuario = document.querySelector("#cerrarMenuUsuario");
  const btnCerrarSesionPortal = document.querySelector(
    "#btnCerrarSesionPortal",
  );

  const avatarIniciales = document.querySelector("#avatarIniciales");
  const avatarInicialesMenu = document.querySelector("#avatarInicialesMenu");
  const nombreUsuarioTop = document.querySelector("#nombreUsuarioTop");
  const correoUsuarioMenu = document.querySelector("#correoUsuarioMenu");
  const saludoUsuarioMenu = document.querySelector("#saludoUsuarioMenu");

  const perfilAvatarGrande = document.querySelector("#perfilAvatarGrande");
  const perfilNombreResumen = document.querySelector("#perfilNombreResumen");
  const perfilCorreoResumen = document.querySelector("#perfilCorreoResumen");
  const perfilNivelResumen = document.querySelector("#perfilNivelResumen");
  const perfilDistritoResumen = document.querySelector(
    "#perfilDistritoResumen",
  );

  const formularioPerfil = document.querySelector("#formularioPerfil");
  const nombrePerfil = document.querySelector("#nombrePerfil");
  const correoPerfil = document.querySelector("#correoPerfil");
  const telefonoPerfil = document.querySelector("#telefonoPerfil");
  const nivelPerfil = document.querySelector("#nivelPerfil");
  const distritoPerfil = document.querySelector("#distritoPerfil");
  const cursosPerfil = document.querySelector("#cursosPerfil");
  const estadoPerfil = document.querySelector("#estadoPerfil");
  const btnGuardarPerfil = document.querySelector("#btnGuardarPerfil");

  let usuarioActual = null;

  function obtenerIniciales(nombre, correo) {
    const texto = String(nombre || correo || "Estudiante").trim();
    const partes = texto.replace("@", " ").split(" ").filter(Boolean);

    const inicial1 = partes[0]?.charAt(0) || "E";
    const inicial2 = partes[1]?.charAt(0) || "";

    return `${inicial1}${inicial2}`.toUpperCase();
  }

  function obtenerNombrePerfil(usuario, perfil) {
    return (
      perfil?.nombre ||
      perfil?.nombreCompleto ||
      perfil?.nombreUsuario ||
      usuario?.displayName ||
      "Estudiante"
    );
  }

  function convertirCursosATexto(cursos) {
    if (Array.isArray(cursos)) {
      return cursos.join(", ");
    }

    return String(cursos || "");
  }

  function convertirTextoACursos(texto) {
    return String(texto || "")
      .split(",")
      .map((curso) => curso.trim())
      .filter(Boolean);
  }

  function mostrarEstado(mensaje, tipo = "") {
    if (!estadoPerfil) return;

    estadoPerfil.textContent = mensaje;
    estadoPerfil.classList.remove("is-success", "is-error");

    if (tipo) {
      estadoPerfil.classList.add(tipo);
    }
  }

  function pintarDatosUsuario(usuario, perfil = {}) {
    const nombre = obtenerNombrePerfil(usuario, perfil);
    const correo = usuario?.email || perfil?.correo || "correo@ejemplo.com";
    const iniciales = obtenerIniciales(nombre, correo);

    const telefono = perfil?.telefono || "";
    const nivel = perfil?.nivelAcademico || perfil?.nivel || "";
    const distrito = perfil?.distrito || "";
    const cursos = perfil?.cursosInteres || perfil?.cursos || "";

    if (tituloBienvenida) {
      tituloBienvenida.textContent = `Mi perfil, ${nombre}`;
    }

    if (nombreUsuarioTop) {
      nombreUsuarioTop.textContent = nombre;
    }

    if (correoUsuarioMenu) {
      correoUsuarioMenu.textContent = correo;
    }

    if (saludoUsuarioMenu) {
      saludoUsuarioMenu.textContent = `¡Hola, ${nombre}!`;
    }

    if (avatarIniciales) {
      avatarIniciales.textContent = iniciales;
    }

    if (avatarInicialesMenu) {
      avatarInicialesMenu.textContent = iniciales;
    }

    if (perfilAvatarGrande) {
      perfilAvatarGrande.textContent = iniciales;
    }

    if (perfilNombreResumen) {
      perfilNombreResumen.textContent = nombre;
    }

    if (perfilCorreoResumen) {
      perfilCorreoResumen.textContent = correo;
    }

    if (perfilNivelResumen) {
      perfilNivelResumen.textContent = nivel || "Nivel no registrado";
    }

    if (perfilDistritoResumen) {
      perfilDistritoResumen.textContent = distrito || "Distrito no registrado";
    }

    if (nombrePerfil) nombrePerfil.value = nombre;
    if (correoPerfil) correoPerfil.value = correo;
    if (telefonoPerfil) telefonoPerfil.value = telefono;
    if (nivelPerfil) nivelPerfil.value = nivel;
    if (distritoPerfil) distritoPerfil.value = distrito;
    if (cursosPerfil) cursosPerfil.value = convertirCursosATexto(cursos);
  }

  async function cargarPerfil(usuario) {
    try {
      mostrarEstado("Cargando perfil...");

      const perfil = await obtenerPerfilUsuarioActual();

      pintarDatosUsuario(usuario, perfil);

      mostrarEstado("Completa tus datos y guarda los cambios.");
    } catch (error) {
      console.error("Error al cargar perfil:", error);

      pintarDatosUsuario(usuario, {});

      mostrarEstado(
        "No se pudo cargar todo el perfil, pero puedes editar tus datos.",
        "is-error",
      );
    }
  }

  formularioPerfil?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!usuarioActual) {
      alert("Primero debes iniciar sesión.");
      return;
    }

    const nombre = nombrePerfil?.value.trim() || "";
    const telefono = telefonoPerfil?.value.trim() || "";
    const nivelAcademico = nivelPerfil?.value || "";
    const distrito = distritoPerfil?.value.trim() || "";
    const cursosInteres = convertirTextoACursos(cursosPerfil?.value);

    if (!nombre) {
      mostrarEstado("El nombre es obligatorio.", "is-error");
      nombrePerfil?.focus();
      return;
    }

    const datosPerfil = {
      nombre,
      telefono,
      nivelAcademico,
      distrito,
      cursosInteres,
      rol: "estudiante",
      perfilEstudianteCompleto: true,
    };

    try {
      if (btnGuardarPerfil) {
        btnGuardarPerfil.disabled = true;
        btnGuardarPerfil.textContent = "Guardando...";
      }

      mostrarEstado("Guardando cambios...");

      const perfilActualizado =
        await actualizarPerfilUsuarioActual(datosPerfil);

      pintarDatosUsuario(usuarioActual, perfilActualizado);

      mostrarEstado("Perfil actualizado correctamente.", "is-success");
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      mostrarEstado(
        error.message || "No se pudo guardar el perfil. Inténtalo otra vez.",
        "is-error",
      );
    } finally {
      if (btnGuardarPerfil) {
        btnGuardarPerfil.disabled = false;
        btnGuardarPerfil.textContent = "Guardar cambios";
      }
    }
  });

  btnUsuario?.addEventListener("click", () => {
    menuUsuario?.classList.toggle("oculto");
  });

  cerrarMenuUsuario?.addEventListener("click", () => {
    menuUsuario?.classList.add("oculto");
  });

  document.addEventListener("click", (evento) => {
    if (
      menuUsuario &&
      btnUsuario &&
      !menuUsuario.contains(evento.target) &&
      !btnUsuario.contains(evento.target)
    ) {
      menuUsuario.classList.add("oculto");
    }
  });

  btnCerrarSesionPortal?.addEventListener("click", async () => {
    try {
      await cerrarSesion();
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar sesión.");
    }
  });

  observarUsuario(async (usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    usuarioActual = usuario;

    await cargarPerfil(usuario);
  });
});
