import {
  observarUsuario,
  cerrarSesion,
  obtenerTutorActivoActual,
  obtenerReservasDelTutor,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const textoTutorActivo = document.getElementById("textoTutorActivo");
  const mensajePanelTutor = document.getElementById("mensajePanelTutor");
  const listaReservasTutor = document.getElementById("listaReservasTutor");
  const btnCerrarSesionTutor = document.getElementById("btnCerrarSesionTutor");

  function mostrarMensaje(texto, tipo = "") {
    if (!mensajePanelTutor) return;

    mensajePanelTutor.textContent = texto;
    mensajePanelTutor.className = tipo
      ? `panel-mensaje ${tipo}`
      : "panel-mensaje";
  }

  function ocultarMensaje() {
    if (!mensajePanelTutor) return;

    mensajePanelTutor.className = "panel-mensaje oculto";
  }

  function escaparHtml(texto) {
    return String(texto || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function capitalizarTexto(texto) {
    return String(texto || "")
      .toLowerCase()
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((palabra, index) => {
        const palabrasMinusculas = ["de", "del", "la", "las", "el", "los", "y"];

        if (index > 0 && palabrasMinusculas.includes(palabra)) {
          return palabra;
        }

        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
      })
      .join(" ");
  }

  function pintarReservas(reservas) {
    if (!listaReservasTutor) return;

    if (reservas.length === 0) {
      listaReservasTutor.innerHTML = "";
      mostrarMensaje("Todavía no tienes reservas recibidas.");
      return;
    }

    ocultarMensaje();

    listaReservasTutor.innerHTML = reservas
      .map((reserva) => {
        return `
          <article class="reserva-card">
            <h2>${escaparHtml(reserva.curso)}</h2>

            <span class="reserva-estado">
              ${escaparHtml(reserva.estado || "Confirmada")}
            </span>

            <p class="reserva-dato">
              <strong>Estudiante:</strong> ${escaparHtml(reserva.correoUsuario)}
            </p>

            <p class="reserva-dato">
              <strong>Fecha:</strong> ${escaparHtml(reserva.fecha)}
            </p>

            <p class="reserva-dato">
              <strong>Hora:</strong> ${escaparHtml(reserva.hora)}
            </p>

            <p class="reserva-dato">
              <strong>Modalidad:</strong> ${escaparHtml(reserva.modalidad)}
            </p>

            <p class="reserva-dato">
              <strong>Duración:</strong> ${escaparHtml(reserva.duracion)}
            </p>

            <p class="reserva-dato">
              <strong>Total:</strong> S/ ${escaparHtml(reserva.total)}
            </p>

            <p class="reserva-dato">
              <strong>Método de pago:</strong> ${escaparHtml(reserva.metodoPago)}
            </p>
          </article>
        `;
      })
      .join("");
  }

  async function cargarPanelTutor() {
    try {
      mostrarMensaje("Verificando perfil de tutor...");

      const tutorActivo = await obtenerTutorActivoActual();

      if (!tutorActivo) {
        if (textoTutorActivo) {
          textoTutorActivo.textContent =
            "Tu cuenta aún no está registrada como tutor activo.";
        }

        mostrarMensaje(
          "No tienes acceso al panel del tutor. Primero debes ser aprobado como tutor.",
          "error",
        );

        return;
      }

      if (textoTutorActivo) {
        textoTutorActivo.textContent = `Tutor activo: ${capitalizarTexto(tutorActivo.nombre)}`;
      }

      mostrarMensaje("Cargando tus reservas...");

      const reservas = await obtenerReservasDelTutor();

      pintarReservas(reservas);
    } catch (error) {
      console.error("Error al cargar panel del tutor:", error);

      mostrarMensaje("No se pudo cargar el panel del tutor.", "error");
    }
  }

  observarUsuario((usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    cargarPanelTutor();
  });

  btnCerrarSesionTutor?.addEventListener("click", async () => {
    try {
      await cerrarSesion();
      window.location.href = "cuenta.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      mostrarMensaje("No se pudo cerrar sesión.", "error");
    }
  });
});
