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

  function obtenerClaveNotificacionesLeidas(usuario) {
    const usuarioKey = usuario?.uid || usuario?.email || "usuario";

    return `tfNotificacionesLeidas:${usuarioKey}`;
  }

  function obtenerIdsNotificacionesLeidas(usuario) {
    try {
      return new Set(
        JSON.parse(localStorage.getItem(obtenerClaveNotificacionesLeidas(usuario)) || "[]"),
      );
    } catch (error) {
      return new Set();
    }
  }

  function contarNotificacionesDesdeSesiones(sesiones, usuario) {
    const hoy = obtenerFechaLocal();
    let total = 0;
    const idsLeidos = obtenerIdsNotificacionesLeidas(usuario);

    function contarSiNoLeida(id) {
      if (!idsLeidos.has(id)) {
        total += 1;
      }
    }

    sesiones.forEach((sesion) => {
      const idSesion =
        sesion.id || `${sesion.fecha || "sin-fecha"}-${sesion.curso || "curso"}`;
      const estado = normalizarTexto(sesion.estado, "pendiente");
      const estadoPago = normalizarTexto(sesion.estadoPago, "pendiente");
      const estadoClase = normalizarTexto(sesion.estadoClase, "pendiente");
      const enlaceClase = String(sesion.enlaceClase || "").trim();
      const reservaFinalizada = [
        "finalizada",
        "rechazada",
        "cancelada_estudiante",
        "cancelada_tutor",
        "expirada",
      ].includes(estado);
      const claseLista = estadoClase === "programada" || Boolean(enlaceClase);

      if (estadoPago === "rechazado") {
        contarSiNoLeida(`${idSesion}-pago-rechazado`);
      } else if (estadoPago === "confirmado") {
        contarSiNoLeida(`${idSesion}-pago-confirmado`);
      } else if (estadoPago === "en_revision") {
        contarSiNoLeida(`${idSesion}-pago-en-revision`);
      } else if (estadoPago === "pendiente" && !reservaFinalizada) {
        contarSiNoLeida(`${idSesion}-pago-pendiente`);
      }

      if (claseLista && !reservaFinalizada) {
        contarSiNoLeida(`${idSesion}-clase-enlace`);
      } else if (estadoClase === "pendiente" && !reservaFinalizada) {
        contarSiNoLeida(`${idSesion}-clase-pendiente`);
      }

      if (estado === "aceptada" && !reservaFinalizada) {
        contarSiNoLeida(`${idSesion}-reserva-aceptada`);
      } else if (estado === "pendiente") {
        contarSiNoLeida(`${idSesion}-reserva-pendiente`);
      }

      if (sesion.fecha === hoy && !reservaFinalizada) {
        contarSiNoLeida(`${idSesion}-clase-hoy`);
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
      actualizarContadores(contarNotificacionesDesdeSesiones(sesiones, usuario));
    } catch (error) {
      console.error("Error al actualizar contador de notificaciones:", error);
      actualizarContadores(0);
    }
  });
});
