import { observarUsuario, obtenerMisSesiones } from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const estadoSesiones = document.querySelector("#estadoSesiones");
  const listaMisSesiones = document.querySelector("#listaMisSesiones");

  function mostrarEstado(mensaje) {
    if (estadoSesiones) {
      estadoSesiones.textContent = mensaje;
    }
  }

  function limpiarTexto(valor) {
    const texto = String(valor ?? "");

    return texto
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatearFecha(fecha) {
    if (!fecha) return "No registrada";

    if (typeof fecha === "string" && fecha.includes("-")) {
      const [year, mes, dia] = fecha.split("-");
      return `${dia}/${mes}/${year}`;
    }

    return fecha;
  }

  function formatearMonto(total) {
    const monto = Number(total) || 0;
    return monto.toFixed(2);
  }

  function normalizarEstado(estado) {
    const estadoNormalizado = String(estado || "pendiente")
      .toLowerCase()
      .trim();

    if (estadoNormalizado === "confirmada") return "aceptada";
    if (estadoNormalizado === "confirmado") return "aceptada";

    const estadosPermitidos = [
      "pendiente",
      "aceptada",
      "rechazada",
      "realizada",
      "cancelada",
    ];

    if (!estadosPermitidos.includes(estadoNormalizado)) {
      return "pendiente";
    }

    return estadoNormalizado;
  }

  function obtenerTextoEstado(estado) {
    const estados = {
      pendiente: "Pendiente",
      aceptada: "Aceptada",
      rechazada: "Rechazada",
      realizada: "Realizada",
      cancelada: "Cancelada",
    };

    return estados[estado] || "Pendiente";
  }

  function obtenerMensajeEstado(estado) {
    const mensajes = {
      pendiente: "Tu solicitud fue enviada. Espera la respuesta del tutor.",
      aceptada: "El tutor aceptó tu reserva. Revisa la fecha y hora.",
      rechazada:
        "El tutor rechazó esta solicitud. Puedes reservar con otro tutor.",
      realizada: "Esta sesión ya fue marcada como realizada.",
      cancelada: "Esta sesión fue cancelada.",
    };

    return mensajes[estado] || "Tu solicitud está pendiente.";
  }

  function obtenerClaseEstado(estado) {
    return `estado-${estado}`;
  }

  function convertirHoraAMinutos(textoHora) {
    const texto = String(textoHora || "")
      .toLowerCase()
      .trim();

    const numeros = texto.match(/\d+/g) || [];

    let horas = Number(numeros[0] || 0);
    const minutos = Number(numeros[1] || 0);

    if ((texto.includes("p.m") || texto.includes("pm")) && horas !== 12) {
      horas += 12;
    }

    if ((texto.includes("a.m") || texto.includes("am")) && horas === 12) {
      horas = 0;
    }

    return horas * 60 + minutos;
  }

  function obtenerFechaHoraSesion(sesion) {
    const fecha = String(sesion.fecha || "");
    const partesFecha = fecha.split("-").map(Number);

    if (partesFecha.length !== 3) {
      return null;
    }

    const [year, month, day] = partesFecha;
    const minutosTotales = convertirHoraAMinutos(sesion.hora);

    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    const fechaHora = new Date(year, month - 1, day, horas, minutos, 0, 0);

    if (Number.isNaN(fechaHora.getTime())) {
      return null;
    }

    return fechaHora;
  }

  function ordenarSesiones(sesiones) {
    return [...sesiones].sort((a, b) => {
      const fechaA = obtenerFechaHoraSesion(a);
      const fechaB = obtenerFechaHoraSesion(b);

      if (!fechaA && !fechaB) return 0;
      if (!fechaA) return 1;
      if (!fechaB) return -1;

      return fechaB - fechaA;
    });
  }

  function mostrarSesiones(sesiones) {
    if (!listaMisSesiones) return;

    if (!sesiones.length) {
      listaMisSesiones.innerHTML = `
        <div class="sesion-card sesion-vacia">
          <h3>Aún no tienes sesiones reservadas</h3>
          <p>Cuando reserves una tutoría, aparecerá en esta sección.</p>
          <a href="app.html" class="btn-volver">Buscar tutor</a>
        </div>
      `;
      return;
    }

    const sesionesOrdenadas = ordenarSesiones(sesiones);

    listaMisSesiones.innerHTML = sesionesOrdenadas
      .map((sesion) => {
        const estado = normalizarEstado(sesion.estado);
        const textoEstado = obtenerTextoEstado(estado);
        const mensajeEstado = obtenerMensajeEstado(estado);
        const claseEstado = obtenerClaseEstado(estado);

        return `
          <article class="sesion-card">
            <div class="sesion-card-header">
              <div>
                <span class="sesion-label">Tutoría reservada</span>
                <h3>${limpiarTexto(sesion.curso || "Tutoría")}</h3>
              </div>

              <span class="sesion-estado ${claseEstado}">
                ${textoEstado}
              </span>
            </div>

            <p class="sesion-mensaje">${mensajeEstado}</p>

            <div class="sesion-detalles">
              <p><strong>Tutor:</strong> ${limpiarTexto(sesion.tutor || "No registrado")}</p>
              <p><strong>Fecha:</strong> ${limpiarTexto(formatearFecha(sesion.fecha))}</p>
              <p><strong>Hora:</strong> ${limpiarTexto(sesion.hora || "No registrada")}</p>
              <p><strong>Duración:</strong> ${limpiarTexto(sesion.duracion || "No registrada")}</p>
              <p><strong>Modalidad:</strong> ${limpiarTexto(sesion.modalidad || "No registrada")}</p>
              <p><strong>Total:</strong> S/ ${formatearMonto(sesion.total)}</p>
              <p><strong>Pago:</strong> ${limpiarTexto(sesion.metodoPago || "Simulado")}</p>
            </div>
          </article>
        `;
      })
      .join("");
  }

  async function cargarSesiones() {
    try {
      mostrarEstado("Cargando tus sesiones...");

      const sesiones = await obtenerMisSesiones();

      if (!sesiones.length) {
        mostrarEstado("Mis sesiones");
      } else {
        mostrarEstado("Sesiones reservadas");
      }

      mostrarSesiones(sesiones);
    } catch (error) {
      console.error(error);
      mostrarEstado("No se pudieron cargar tus sesiones.");

      if (listaMisSesiones) {
        listaMisSesiones.innerHTML = `
          <div class="sesion-card">
            <h3>Ocurrió un problema</h3>
            <p>No pudimos cargar tus reservas. Intenta nuevamente en unos segundos.</p>
          </div>
        `;
      }
    }
  }

  observarUsuario((usuario) => {
    if (!usuario) {
      mostrarEstado("Debes iniciar sesión para ver tus reservas.");

      if (listaMisSesiones) {
        listaMisSesiones.innerHTML = `
          <div class="sesion-card">
            <h3>Inicia sesión</h3>
            <p>Para ver tus sesiones reservadas, primero debes iniciar sesión.</p>
            <a href="cuenta.html" class="btn-volver">Iniciar sesión</a>
          </div>
        `;
      }

      return;
    }

    cargarSesiones();
  });
});
