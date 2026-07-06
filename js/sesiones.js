import { observarUsuario, obtenerMisSesiones } from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const estadoSesiones = document.querySelector("#estadoSesiones");
  const listaMisSesiones = document.querySelector("#listaMisSesiones");

  const statTotalSesiones = document.querySelector("#statTotalSesiones");
  const statPendientes = document.querySelector("#statPendientes");
  const statAceptadas = document.querySelector("#statAceptadas");
  const statRealizadas = document.querySelector("#statRealizadas");

  const botonesFiltro = document.querySelectorAll("[data-filtro]");

  let sesionesGlobales = [];
  let filtroActivo = "todas";

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

  function obtenerEstadoPago(sesion) {
    return String(sesion.estadoPago || "pendiente")
      .toLowerCase()
      .trim();
  }

  function obtenerTextoPago(sesion) {
    const estadoPago = obtenerEstadoPago(sesion);

    if (estadoPago === "pagado" || estadoPago === "completado") {
      return "Pago registrado";
    }

    return "Pago pendiente";
  }

  function obtenerEstadoClase(sesion) {
    return String(sesion.estadoClase || "pendiente")
      .toLowerCase()
      .trim();
  }

  function obtenerTextoClase(sesion) {
    const enlace = sesion.enlaceClase || "";
    const estadoClase = obtenerEstadoClase(sesion);

    if (enlace || estadoClase === "lista" || estadoClase === "programada") {
      return "Clase virtual lista";
    }

    return "Enlace pendiente";
  }

  function actualizarEstadisticas(sesiones) {
    const total = sesiones.length;
    const pendientes = sesiones.filter((sesion) => {
      return normalizarEstado(sesion.estado) === "pendiente";
    }).length;

    const aceptadas = sesiones.filter((sesion) => {
      return normalizarEstado(sesion.estado) === "aceptada";
    }).length;

    const realizadas = sesiones.filter((sesion) => {
      return normalizarEstado(sesion.estado) === "realizada";
    }).length;

    if (statTotalSesiones) statTotalSesiones.textContent = total;
    if (statPendientes) statPendientes.textContent = pendientes;
    if (statAceptadas) statAceptadas.textContent = aceptadas;
    if (statRealizadas) statRealizadas.textContent = realizadas;
  }

  function filtrarSesiones(sesiones) {
    if (filtroActivo === "todas") {
      return sesiones;
    }

    return sesiones.filter((sesion) => {
      return normalizarEstado(sesion.estado) === filtroActivo;
    });
  }

  function mostrarSesiones(sesiones) {
    if (!listaMisSesiones) return;

    const sesionesFiltradas = filtrarSesiones(sesiones);

    if (!sesiones.length) {
      listaMisSesiones.innerHTML = `
        <div class="sesion-card sesion-vacia">
          <h3>Aún no tienes sesiones reservadas</h3>
          <p>Cuando reserves una tutoría, aparecerá en esta sección.</p>
          <a href="buscar-tutor.html" class="btn-volver">Buscar tutor</a>
        </div>
      `;
      return;
    }

    if (!sesionesFiltradas.length) {
      listaMisSesiones.innerHTML = `
        <div class="sesion-card sesion-vacia">
          <h3>No hay sesiones en este filtro</h3>
          <p>Prueba con otro estado para ver más tutorías.</p>
        </div>
      `;
      return;
    }

    const sesionesOrdenadas = ordenarSesiones(sesionesFiltradas);

    listaMisSesiones.innerHTML = sesionesOrdenadas
      .map((sesion) => {
        const estado = normalizarEstado(sesion.estado);
        const textoEstado = obtenerTextoEstado(estado);
        const mensajeEstado = obtenerMensajeEstado(estado);
        const claseEstado = obtenerClaseEstado(estado);

        const pagoTexto = obtenerTextoPago(sesion);
        const estadoPago = obtenerEstadoPago(sesion);
        const pagoClase =
          estadoPago === "pagado" || estadoPago === "completado"
            ? "pago-ok"
            : "pago-pendiente";

        const claseTexto = obtenerTextoClase(sesion);
        const enlaceClase = sesion.enlaceClase || "";
        const claseBadge = enlaceClase ? "clase-ok" : "clase-pendiente";

        return `
          <article class="sesion-card">
            <div class="sesion-card-header">
              <div>
                <span class="sesion-label">Tutoría reservada</span>
                <h3>${limpiarTexto(sesion.curso || "Tutoría")}</h3>
              </div>

              <span class="sesion-estado ${claseEstado}">
                ${limpiarTexto(textoEstado)}
              </span>
            </div>

            <p class="sesion-mensaje">${limpiarTexto(mensajeEstado)}</p>

            <div class="sesion-detalles">
              <div class="sesion-info-item">
                <span>Tutor</span>
                <strong>${limpiarTexto(sesion.tutor || "No registrado")}</strong>
              </div>

              <div class="sesion-info-item">
                <span>Fecha</span>
                <strong>${limpiarTexto(formatearFecha(sesion.fecha))}</strong>
              </div>

              <div class="sesion-info-item">
                <span>Hora</span>
                <strong>${limpiarTexto(sesion.hora || "No registrada")}</strong>
              </div>

              <div class="sesion-info-item">
                <span>Duración</span>
                <strong>${limpiarTexto(sesion.duracion || "No registrada")}</strong>
              </div>

              <div class="sesion-info-item">
                <span>Modalidad</span>
                <strong>${limpiarTexto(sesion.modalidad || "No registrada")}</strong>
              </div>

              <div class="sesion-info-item">
                <span>Total</span>
                <strong>S/ ${formatearMonto(sesion.total)}</strong>
              </div>
            </div>

            <div class="sesion-extra-row">
              <span class="sesion-badge ${pagoClase}">
                💳 ${limpiarTexto(pagoTexto)}
              </span>

              <span class="sesion-badge ${claseBadge}">
                💻 ${limpiarTexto(claseTexto)}
              </span>

              <span class="sesion-badge">
                📌 ${limpiarTexto(sesion.metodoPago || "Pago pendiente")}
              </span>
            </div>

            <div class="sesion-actions">
              ${
                enlaceClase
                  ? `
                    <a
                      href="${limpiarTexto(enlaceClase)}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="sesion-action-btn"
                    >
                      Entrar a clase
                    </a>
                  `
                  : `
                    <span class="sesion-action-btn secondary">
                      Enlace pendiente
                    </span>
                  `
              }

              <a href="buscar-tutor.html" class="sesion-action-btn secondary">
                Reservar otra tutoría
              </a>
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
      sesionesGlobales = sesiones;

      actualizarEstadisticas(sesiones);

      if (!sesiones.length) {
        mostrarEstado("Aún no tienes sesiones reservadas.");
      } else {
        mostrarEstado(`${sesiones.length} sesión(es) encontrada(s).`);
      }

      mostrarSesiones(sesionesGlobales);
    } catch (error) {
      console.error(error);
      mostrarEstado("No se pudieron cargar tus sesiones.");

      if (listaMisSesiones) {
        listaMisSesiones.innerHTML = `
          <div class="sesion-card">
            <h3>Ocurrió un problema</h3>
            <p class="sesion-mensaje">
              No pudimos cargar tus reservas. Intenta nuevamente en unos segundos.
            </p>
          </div>
        `;
      }
    }
  }

  botonesFiltro.forEach((boton) => {
    boton.addEventListener("click", () => {
      botonesFiltro.forEach((item) => item.classList.remove("is-active"));
      boton.classList.add("is-active");

      filtroActivo = boton.dataset.filtro || "todas";

      mostrarSesiones(sesionesGlobales);
    });
  });

  observarUsuario((usuario) => {
    if (!usuario) {
      mostrarEstado("Debes iniciar sesión para ver tus reservas.");

      if (listaMisSesiones) {
        listaMisSesiones.innerHTML = `
          <div class="sesion-card sesion-vacia">
            <h3>Inicia sesión</h3>
            <p>Para ver tus sesiones reservadas, primero debes iniciar sesión.</p>
            <a href="cuenta.html" class="btn-volver">Iniciar sesión</a>
          </div>
        `;
      }

      actualizarEstadisticas([]);
      return;
    }

    cargarSesiones();
  });
});
