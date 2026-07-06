import { observarUsuario, cerrarSesion } from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const textoSesionApp = document.querySelector("#textoSesionApp");
  const subtextoSesionApp = document.querySelector("#subtextoSesionApp");
  const usuarioAvatar = document.querySelector("#usuarioAvatar");
  const btnUsuarioMenu = document.querySelector("#btnUsuarioMenu");
  const usuarioMenu = document.querySelector("#usuarioMenu");
  const btnCerrarUsuarioMenu = document.querySelector("#btnCerrarUsuarioMenu");
  const usuarioCorreo = document.querySelector("#usuarioCorreo");
  const usuarioAvatarGrande = document.querySelector("#usuarioAvatarGrande");
  const usuarioNombreGrande = document.querySelector("#usuarioNombreGrande");
  const tituloBienvenida = document.querySelector("#tituloBienvenida");
  const btnCerrarSesionApp = document.querySelector("#btnCerrarSesionApp");

  const capitalizarPalabra = (texto) => {
    const valor = String(texto || "").trim();

    if (!valor) return "";

    return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
  };

  const obtenerNombreUsuario = (usuario) => {
    if (!usuario) return "Invitado";

    const nombreDirecto = String(usuario.displayName || "").trim();

    if (nombreDirecto) {
      return nombreDirecto;
    }

    const correo = String(usuario.email || "").trim();

    if (!correo) {
      return "Usuario";
    }

    const base = correo.split("@")[0];

    return base
      .split(/[.\-_ ]+/)
      .filter(Boolean)
      .map((parte) => capitalizarPalabra(parte))
      .join(" ");
  };

  const obtenerInicialesUsuario = (nombre) => {
    const partes = String(nombre || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }

    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }

    return "U";
  };

  const pintarAvatarUsuario = (contenedor, usuario, iniciales) => {
    if (!contenedor) return;

    if (usuario?.photoURL) {
      contenedor.innerHTML = `
        <img src="${usuario.photoURL}" alt="Foto de perfil" />
      `;
      return;
    }

    contenedor.textContent = iniciales;
  };

  const abrirMenuUsuario = () => {
    if (!usuarioMenu || !btnUsuarioMenu) return;

    usuarioMenu.hidden = false;
    btnUsuarioMenu.setAttribute("aria-expanded", "true");
  };

  const cerrarMenuUsuario = () => {
    if (!usuarioMenu || !btnUsuarioMenu) return;

    usuarioMenu.hidden = true;
    btnUsuarioMenu.setAttribute("aria-expanded", "false");
  };

  btnUsuarioMenu?.addEventListener("click", (event) => {
    event.stopPropagation();

    if (usuarioMenu?.hidden) {
      abrirMenuUsuario();
    } else {
      cerrarMenuUsuario();
    }
  });

  btnCerrarUsuarioMenu?.addEventListener("click", cerrarMenuUsuario);

  document.addEventListener("click", (event) => {
    if (!usuarioMenu || usuarioMenu.hidden) return;

    const hizoClickDentro = usuarioMenu.contains(event.target);
    const hizoClickEnBoton = btnUsuarioMenu?.contains(event.target);

    if (!hizoClickDentro && !hizoClickEnBoton) {
      cerrarMenuUsuario();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      cerrarMenuUsuario();
    }
  });

  observarUsuario((usuario) => {
    if (usuario) {
      const nombreMostrado = obtenerNombreUsuario(usuario);
      const primerNombre = nombreMostrado.split(" ")[0];
      const iniciales = obtenerInicialesUsuario(nombreMostrado);
      const correo = usuario.email || "Correo no disponible";

      if (textoSesionApp) {
        textoSesionApp.textContent = nombreMostrado;
        textoSesionApp.title = correo;
      }

      if (subtextoSesionApp) {
        subtextoSesionApp.textContent = "Mi cuenta";
      }

      if (usuarioCorreo) {
        usuarioCorreo.textContent = correo;
      }

      if (usuarioNombreGrande) {
        usuarioNombreGrande.textContent = `¡Hola, ${primerNombre}!`;
      }

      if (tituloBienvenida) {
        tituloBienvenida.textContent = `Hola, ${primerNombre} 👋`;
      }

      pintarAvatarUsuario(usuarioAvatar, usuario, iniciales);
      pintarAvatarUsuario(usuarioAvatarGrande, usuario, iniciales);

      btnCerrarSesionApp?.classList.remove("oculto");
      return;
    }

    if (textoSesionApp) {
      textoSesionApp.textContent = "Invitado";
      textoSesionApp.title = "No has iniciado sesión";
    }

    if (subtextoSesionApp) {
      subtextoSesionApp.textContent = "Inicia sesión";
    }

    if (usuarioCorreo) {
      usuarioCorreo.textContent = "No has iniciado sesión";
    }

    if (usuarioNombreGrande) {
      usuarioNombreGrande.textContent = "Hola, invitado";
    }

    if (tituloBienvenida) {
      tituloBienvenida.textContent = "Hola, estudiante 👋";
    }

    pintarAvatarUsuario(usuarioAvatar, null, "U");
    pintarAvatarUsuario(usuarioAvatarGrande, null, "U");

    btnCerrarSesionApp?.classList.add("oculto");
  });

  btnCerrarSesionApp?.addEventListener("click", async () => {
    try {
      await cerrarSesion();
      cerrarMenuUsuario();
      alert("Sesión cerrada correctamente.");
    } catch (error) {
      console.error(error);
      alert("No se pudo cerrar sesión.");
    }
  });
});
