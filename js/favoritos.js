import {
  observarUsuario,
  cerrarSesion,
  obtenerPerfilUsuarioActual,
  obtenerMisFavoritos,
  eliminarTutorFavorito,
} from "./firebase-service.js";
import { mostrarAviso } from "./mensajes-ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const nombreUsuario = document.querySelector("#nombreUsuarioTop");
  const avatarUsuario = document.querySelector("#avatarIniciales");
  const avatarUsuarioMenu = document.querySelector("#avatarInicialesMenu");
  const saludoUsuarioMenu = document.querySelector("#saludoUsuarioMenu");
  const correoUsuarioMenu = document.querySelector("#correoUsuarioMenu");
  const botonCerrarSesion = document.querySelector("#btnCerrarSesionPortal");

  const btnUsuario = document.querySelector("#btnUsuario");
  const menuUsuario = document.querySelector("#menuUsuario");
  const cerrarMenuUsuario = document.querySelector("#cerrarMenuUsuario");

  const listaFavoritos = document.querySelector("#listaFavoritos");
  const estadoFavoritos = document.querySelector("#estadoFavoritos");

  function limpiarTexto(valor) {
    const texto = String(valor ?? "");

    return texto
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function mostrarEstado(mensaje) {
    if (estadoFavoritos) {
      estadoFavoritos.textContent = mensaje;
    }
  }

  function obtenerInicial(nombre) {
    const texto = String(nombre || "E").trim();
    return texto.charAt(0).toUpperCase();
  }

  function abrirCerrarMenuUsuario() {
    if (!menuUsuario) return;
    menuUsuario.classList.toggle("oculto");
  }

  function cerrarMenu() {
    if (!menuUsuario) return;
    menuUsuario.classList.add("oculto");
  }

  if (btnUsuario) {
    btnUsuario.addEventListener("click", (evento) => {
      evento.stopPropagation();
      abrirCerrarMenuUsuario();
    });
  }

  if (cerrarMenuUsuario) {
    cerrarMenuUsuario.addEventListener("click", cerrarMenu);
  }

  document.addEventListener("click", (evento) => {
    if (!menuUsuario || !btnUsuario) return;

    const clicDentroMenu = menuUsuario.contains(evento.target);
    const clicEnBoton = btnUsuario.contains(evento.target);

    if (!clicDentroMenu && !clicEnBoton) {
      cerrarMenu();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      cerrarMenu();
    }
  });

  function pintarFavoritos(favoritos) {
    if (!listaFavoritos) return;

    if (!favoritos.length) {
      listaFavoritos.innerHTML = `
        <div class="tf-empty-state">
          <h3>Aún no tienes tutores favoritos</h3>
          <p>Guarda tutores para encontrarlos rápido cuando necesites una clase.</p>
          <a href="tutores.html" class="tf-primary-link">Ver tutores disponibles</a>
        </div>
      `;
      return;
    }

    listaFavoritos.innerHTML = favoritos
      .map((favorito) => {
        const tutorId = favorito.tutorId || "";
        const nombre = favorito.nombre || "Tutor";
        const cursos = favorito.cursos || "Curso no registrado";
        const nivel = favorito.nivel || "Nivel no registrado";
        const modalidad = favorito.modalidad || "Modalidad no registrada";
        const distrito = favorito.distrito || "Distrito no registrado";
        const descripcion =
          favorito.descripcion || "Este tutor aún no tiene descripción.";
        const precioHora = Number(favorito.precioHora || 25);
        const disponibilidad =
          favorito.disponibilidad || "Disponibilidad no registrada";
        const estadoLinea = favorito.estaEnLinea
          ? "En línea"
          : "No disponible ahora";

        return `
          <article class="tf-tutor-card">
            <div class="tf-tutor-card__top">
              <div class="tf-tutor-avatar">
                ${limpiarTexto(obtenerInicial(nombre))}
              </div>

              <div>
                <h3>${limpiarTexto(nombre)}</h3>
                <p>${limpiarTexto(cursos)}</p>
              </div>
            </div>

            <div class="tf-tutor-tags">
              <span>${limpiarTexto(nivel)}</span>
              <span>${limpiarTexto(modalidad)}</span>
              <span>${limpiarTexto(distrito)}</span>
            </div>

            <p class="tf-tutor-description">
              ${limpiarTexto(descripcion)}
            </p>

            <div class="tf-tutor-info">
              <p><strong>Disponibilidad:</strong> ${limpiarTexto(disponibilidad)}</p>
              <p><strong>Estado:</strong> ${limpiarTexto(estadoLinea)}</p>
              <p><strong>Precio:</strong> S/ ${precioHora.toFixed(2)} por hora</p>
            </div>

            <div class="tf-tutor-actions">
              <a href="buscar-tutor.html" class="tf-reserve-btn">
                Reservar tutoría
              </a>

              <button
                type="button"
                class="tf-remove-favorite-btn"
                data-tutor-id="${limpiarTexto(tutorId)}"
              >
                Eliminar favorito
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    activarEliminarFavoritos();
  }

  function activarEliminarFavoritos() {
    document.querySelectorAll(".tf-remove-favorite-btn").forEach((boton) => {
      boton.addEventListener("click", async () => {
        const tutorId = boton.dataset.tutorId;

        if (!tutorId) {
          mostrarAviso("No se encontró el ID del tutor.", "error");
          return;
        }

        const confirmar = confirm(
          "¿Quieres eliminar este tutor de tus favoritos?",
        );

        if (!confirmar) return;

        try {
          boton.disabled = true;
          boton.textContent = "Eliminando...";

          await eliminarTutorFavorito(tutorId);
          await cargarFavoritos();
        } catch (error) {
          console.error("Error al eliminar favorito:", error);
          boton.disabled = false;
          boton.textContent = "Eliminar favorito";
          mostrarAviso("No se pudo eliminar el tutor favorito.", "error");
        }
      });
    });
  }

  async function cargarUsuario(usuarioAuth) {
    try {
      const perfil = await obtenerPerfilUsuarioActual();

      const nombre =
        perfil?.nombre ||
        perfil?.displayName ||
        usuarioAuth?.displayName ||
        "Estudiante";

      const correo =
        perfil?.correo ||
        perfil?.email ||
        usuarioAuth?.email ||
        "Correo no registrado";

      const inicial = obtenerInicial(nombre);

      if (nombreUsuario) nombreUsuario.textContent = nombre;
      if (avatarUsuario) avatarUsuario.textContent = inicial;
      if (avatarUsuarioMenu) avatarUsuarioMenu.textContent = inicial;
      if (saludoUsuarioMenu) saludoUsuarioMenu.textContent = `Hola, ${nombre}`;
      if (correoUsuarioMenu) correoUsuarioMenu.textContent = correo;
    } catch (error) {
      console.error("Error al cargar usuario:", error);
    }
  }

  async function cargarFavoritos() {
    try {
      mostrarEstado("Cargando favoritos...");

      const favoritos = await obtenerMisFavoritos();

      pintarFavoritos(favoritos);

      if (favoritos.length) {
        mostrarEstado(`${favoritos.length} tutor(es) guardado(s).`);
      } else {
        mostrarEstado("");
      }
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      mostrarEstado("No se pudieron cargar tus favoritos.");
    }
  }

  if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", async () => {
      try {
        await cerrarSesion();
        window.location.href = "../index.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        mostrarAviso("No se pudo cerrar sesión.", "error");
      }
    });
  }

  observarUsuario(async (usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    await cargarUsuario(usuario);
    await cargarFavoritos();
  });
});
