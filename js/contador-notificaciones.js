import { observarUsuario, obtenerMisSesiones } from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const contadores = document.querySelectorAll(
    "#contadorNotificaciones, .tf-notification-dot",
  );

  if (!contadores.length) return;

  function obtenerFechaLocal() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function actualizarContadores(total) {
    contadores.forEach((contador) => {
      contador.textContent = total ? String(total) : "0";
    });
  }

  function normalizarTexto(valor, fallback = "") {
    return String(valor || fallback).toLowerCase().trim();
  }

  function contarNotificacionesDesdeSesiones(sesiones) {
    const hoy = obtenerFechaLocal();
    let total = 0;

    sesiones.forEach((sesion) => {
      const estado = normalizarTexto(sesion.estado, "pendiente");
      const estadoPago = normalizarTexto(sesion.estadoPago, "pendiente");
      const estadoClase = normalizarTexto(sesion.estadoClase, "pendiente");
      const enlaceClase = String(sesion.enlaceClase || "").trim();
      const reservaFinalizada =
        estado === "realizada" ||
        estado === "cancelada" ||
        estado === "rechazada";

      if (enlaceClase && !reservaFinalizada) {
        total += 1;
        return;
      }

      if (sesion.fecha === hoy && !reservaFinalizada) {
        total += 1;
      }

      if (estado === "pendiente") {
        total += 1;
      }

      if (estadoPago === "pendiente") {
        total += 1;
      }

      if (estadoClase === "pendiente" && !enlaceClase && !reservaFinalizada) {
        total += 1;
      }

      if (estado === "confirmada") {
        total += 1;
      }
    });

    return total;
  }

  observarUsuario(async (usuario) => {
    if (!usuario) {
      actualizarContadores(0);
      return;
    }

    try {
      const sesiones = await obtenerMisSesiones();
      actualizarContadores(contarNotificacionesDesdeSesiones(sesiones));
    } catch (error) {
      console.error("Error al actualizar contador de notificaciones:", error);
      actualizarContadores(0);
    }
  });
});
