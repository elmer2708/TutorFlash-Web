import {
  observarUsuario,
  obtenerTutorActivoActual,
  obtenerReservasDelTutor,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const listaHistorialTutor = document.getElementById("listaHistorialTutor");

  function limpiarTexto(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizarEstado(estado) {
    return String(estado || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function formatearMonto(valor) {
    const numero = Number(
      String(valor || "0")
        .replace("S/", "")
        .trim(),
    );

    return Number.isFinite(numero) ? `S/ ${numero.toFixed(2)}` : "No registrado";
  }

  function pintarEstadoVacio(mensaje) {
    if (!listaHistorialTutor) return;

    listaHistorialTutor.innerHTML = `<div class="empty-state">${limpiarTexto(mensaje)}</div>`;
  }

  function pintarHistorial(reservas) {
    if (!listaHistorialTutor) return;

    const finalizadas = reservas.filter((reserva) => {
      const estado = normalizarEstado(reserva.estado);
      return estado === "realizada" || estado === "finalizada";
    });

    if (!finalizadas.length) {
      pintarEstadoVacio("Aun no tienes tutorias finalizadas.");
      return;
    }

    listaHistorialTutor.innerHTML = finalizadas
      .map((reserva) => {
        const estudiante =
          reserva.estudiante ||
          reserva.nombreEstudiante ||
          reserva.estudianteNombre ||
          "Estudiante no registrado";
        const curso = reserva.curso || "Curso no registrado";
        const fecha = reserva.fecha || "Fecha no disponible";
        const hora = reserva.hora || "Hora no disponible";
        const modalidad = reserva.modalidad || "Modalidad no registrada";
        const estadoPago = reserva.estadoPago || "No registrado";
        const total = reserva.total || reserva.montoPagado || reserva.precio || 0;

        return `
          <article class="reserva-card">
            <div>
              <div class="reserva-card-header">
                <h3>${limpiarTexto(curso)}</h3>
                <span class="estado-pill estado-realizada">Realizada</span>
              </div>

              <div class="reserva-grid">
                <p><strong>Estudiante:</strong> ${limpiarTexto(estudiante)}</p>
                <p><strong>Fecha:</strong> ${limpiarTexto(fecha)}</p>
                <p><strong>Hora:</strong> ${limpiarTexto(hora)}</p>
                <p><strong>Modalidad:</strong> ${limpiarTexto(modalidad)}</p>
                <p><strong>Pago:</strong> ${limpiarTexto(estadoPago)}</p>
                <p><strong>Monto:</strong> ${limpiarTexto(formatearMonto(total))}</p>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  observarUsuario(async (usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    try {
      pintarEstadoVacio("Cargando historial...");

      const tutorActivo = await obtenerTutorActivoActual();

      if (!tutorActivo) {
        window.location.href = "tutor.html";
        return;
      }

      const reservas = await obtenerReservasDelTutor();
      pintarHistorial(reservas);
    } catch (error) {
      console.error("Error al cargar historial del tutor:", error);
      pintarEstadoVacio("No se pudo cargar el historial. Intenta nuevamente.");
    }
  });
});
