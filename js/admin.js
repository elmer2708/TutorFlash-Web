import {
  observarUsuario,
  cerrarSesion,
  obtenerPostulacionesTutores,
  aprobarPostulacionTutor,
  rechazarPostulacionTutor,
} from "./firebase-service.js";

/*
  Coloca aquí el correo que usarás como administrador.
  Debe ser el mismo correo con el que inicias sesión en TutorFlash.
*/
const ADMIN_EMAILS = ["prueba.tutorflash01@gmail.com"];

document.addEventListener("DOMContentLoaded", () => {
  const adminMensaje = document.getElementById("adminMensaje");
  const contenedorPostulaciones = document.getElementById(
    "contenedorPostulaciones",
  );
  const btnCerrarSesionAdmin = document.getElementById("btnCerrarSesionAdmin");

  let postulacionesActuales = [];

  function mostrarMensaje(texto, tipo = "") {
    if (!adminMensaje) return;

    adminMensaje.textContent = texto;
    adminMensaje.className = tipo ? `admin-mensaje ${tipo}` : "admin-mensaje";
  }

  function ocultarMensaje() {
    if (!adminMensaje) return;
    adminMensaje.className = "admin-mensaje oculto";
  }

  function escaparHtml(texto) {
    return String(texto || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function obtenerClaseEstado(estado) {
    if (estado === "aprobado") return "estado-aprobado";
    if (estado === "rechazado") return "estado-rechazado";
    return "estado-pendiente";
  }

  function pintarPostulaciones(postulaciones) {
    if (!contenedorPostulaciones) return;

    if (postulaciones.length === 0) {
      contenedorPostulaciones.innerHTML = "";
      mostrarMensaje("Todavía no hay postulaciones registradas.");
      return;
    }

    ocultarMensaje();

    contenedorPostulaciones.innerHTML = postulaciones
      .map((postulacion) => {
        const estado = postulacion.estado || "pendiente";
        const botonesDeshabilitados = estado !== "pendiente" ? "disabled" : "";

        return `
          <article class="postulacion-card">
            <h2>${escaparHtml(postulacion.nombre)}</h2>

            <span class="estado-postulacion ${obtenerClaseEstado(estado)}">
              ${escaparHtml(estado)}
            </span>

            <p class="postulacion-dato">
              <strong>Correo:</strong> ${escaparHtml(postulacion.correo)}
            </p>

            <p class="postulacion-dato">
              <strong>Teléfono:</strong> ${escaparHtml(postulacion.telefono)}
            </p>

            <p class="postulacion-dato">
              <strong>Cursos:</strong> ${escaparHtml(postulacion.cursos)}
            </p>

            <p class="postulacion-dato">
              <strong>Nivel:</strong> ${escaparHtml(postulacion.nivel)}
            </p>

            <p class="postulacion-dato">
              <strong>Disponibilidad:</strong> ${escaparHtml(postulacion.disponibilidad)}
            </p>

            <p class="postulacion-dato">
              <strong>Experiencia:</strong> ${escaparHtml(postulacion.experiencia)}
            </p>

            <div class="postulacion-acciones">
              <button
                class="btn-aprobar"
                data-id="${escaparHtml(postulacion.id)}"
                ${botonesDeshabilitados}
              >
                Aprobar
              </button>

              <button
                class="btn-rechazar"
                data-id="${escaparHtml(postulacion.id)}"
                ${botonesDeshabilitados}
              >
                Rechazar
              </button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  async function cargarPostulaciones() {
    try {
      mostrarMensaje("Cargando postulaciones...");

      postulacionesActuales = await obtenerPostulacionesTutores();

      pintarPostulaciones(postulacionesActuales);
    } catch (error) {
      console.error("Error al cargar postulaciones:", error);
      mostrarMensaje("No se pudieron cargar las postulaciones.", "error");
    }
  }

  async function aprobarPostulacion(id) {
    const postulacion = postulacionesActuales.find((item) => item.id === id);

    if (!postulacion) {
      mostrarMensaje("No se encontró la postulación seleccionada.", "error");
      return;
    }

    try {
      mostrarMensaje("Aprobando postulación...");

      await aprobarPostulacionTutor(postulacion);

      mostrarMensaje(
        "Postulación aprobada y tutor creado correctamente.",
        "exito",
      );

      await cargarPostulaciones();
    } catch (error) {
      console.error("Error al aprobar postulación:", error);
      mostrarMensaje("No se pudo aprobar la postulación.", "error");
    }
  }

  async function rechazarPostulacion(id) {
    try {
      mostrarMensaje("Rechazando postulación...");

      await rechazarPostulacionTutor(id);

      mostrarMensaje("Postulación rechazada correctamente.", "exito");

      await cargarPostulaciones();
    } catch (error) {
      console.error("Error al rechazar postulación:", error);
      mostrarMensaje("No se pudo rechazar la postulación.", "error");
    }
  }

  if (contenedorPostulaciones) {
    contenedorPostulaciones.addEventListener("click", async (event) => {
      const boton = event.target.closest("button");

      if (!boton) return;

      const id = boton.dataset.id;

      if (!id) return;

      if (boton.classList.contains("btn-aprobar")) {
        await aprobarPostulacion(id);
      }

      if (boton.classList.contains("btn-rechazar")) {
        await rechazarPostulacion(id);
      }
    });
  }

  if (btnCerrarSesionAdmin) {
    btnCerrarSesionAdmin.addEventListener("click", async () => {
      await cerrarSesion();
      window.location.href = "cuenta.html";
    });
  }

  observarUsuario((usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    if (!ADMIN_EMAILS.includes(usuario.email)) {
      mostrarMensaje(
        "No tienes permiso para acceder a este panel. Inicia sesión con el correo administrador.",
        "error",
      );
      return;
    }

    cargarPostulaciones();
  });
});
