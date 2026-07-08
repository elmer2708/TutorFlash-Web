import {
  observarUsuario,
  obtenerMisSesiones,
  registrarPagoReserva,
  cancelarReservaEstudiante,
} from "./firebase-service.js";
import {
  limitarTexto,
  validarMontoPositivo,
  validarNumeroOperacion,
} from "./validaciones.js";

document.addEventListener("DOMContentLoaded", () => {
  const estadoSesiones = document.querySelector("#estadoSesiones");
  const listaMisSesiones = document.querySelector("#listaMisSesiones");

  const statTotalSesiones = document.querySelector("#statTotalSesiones");
  const statPendientes = document.querySelector("#statPendientes");
  const statAceptadas = document.querySelector("#statAceptadas");
  const statRealizadas = document.querySelector("#statRealizadas");

  const botonesFiltro = document.querySelectorAll("[data-filtro]");

  let sesionesGlobales = [];
  const filtrosPermitidos = [
    "todas",
    "pendiente",
    "aceptada",
    "en_curso",
    "finalizada",
    "canceladas",
    "rechazada",
    "no-atendida",
    "pago-pendiente",
  ];
  const ESTADOS_CERRADOS = [
    "finalizada",
    "rechazada",
    "cancelada_estudiante",
    "cancelada_tutor",
    "expirada",
  ];
  const ESTADOS_CANCELADOS = ["cancelada_estudiante", "cancelada_tutor"];
  const filtroUrl = new URLSearchParams(window.location.search).get("filtro");
  let filtroActivo = filtrosPermitidos.includes(filtroUrl || "")
    ? filtroUrl
    : "todas";

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

    const estadosPermitidos = [
      "pendiente",
      "aceptada",
      "en_curso",
      "finalizada",
      "rechazada",
      "cancelada_estudiante",
      "cancelada_tutor",
      "expirada",
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
      en_curso: "En curso",
      finalizada: "Finalizada",
      rechazada: "Rechazada",
      cancelada_estudiante: "Cancelada por estudiante",
      cancelada_tutor: "Cancelada por tutor",
      expirada: "No atendida",
    };

    return estados[estado] || "Pendiente";
  }

  function obtenerMensajeEstado(estado) {
    const mensajes = {
      pendiente: "Tu solicitud fue enviada. Espera la respuesta del tutor.",
      aceptada: "El tutor aceptó tu reserva. Revisa la fecha y hora.",
      rechazada:
        "El tutor rechazó esta solicitud. Puedes reservar con otro tutor.",
      en_curso: "Tu tutoría está en curso.",
      finalizada: "Esta sesión ya fue finalizada.",
      cancelada_estudiante: "Cancelaste esta reserva.",
      cancelada_tutor: "El tutor canceló esta reserva.",
      expirada: "Esta reserva no fue atendida a tiempo.",
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

  function obtenerMilisegundosCampoTemporal(valor) {
    if (!valor) return 0;

    if (typeof valor.toMillis === "function") {
      return valor.toMillis();
    }

    if (typeof valor.seconds === "number") {
      return valor.seconds * 1000;
    }

    const fecha = new Date(valor);
    const tiempo = fecha.getTime();

    return Number.isNaN(tiempo) ? 0 : tiempo;
  }

  function obtenerFechaCreacionSesion(sesion) {
    const camposCreacion = [
      "creadoEn",
      "creado",
      "creadoEnTimestamp",
      "fechaCreacion",
      "creadoEl",
      "timestamp",
      "createdAt",
      "fechaRegistro",
    ];

    for (const campo of camposCreacion) {
      const tiempo = obtenerMilisegundosCampoTemporal(sesion[campo]);

      if (tiempo) return tiempo;
    }

    return obtenerFechaHoraSesion(sesion)?.getTime() || 0;
  }

  function ordenarSesiones(sesiones) {
    return [...sesiones].sort((a, b) => {
      const fechaA = obtenerFechaCreacionSesion(a);
      const fechaB = obtenerFechaCreacionSesion(b);

      if (fechaA !== fechaB) {
        return fechaB - fechaA;
      }

      return obtenerFechaHoraSesion(b) - obtenerFechaHoraSesion(a);
    });
  }

  function obtenerEstadoPago(sesion) {
    return String(sesion.estadoPago || "pendiente")
      .toLowerCase()
      .trim();
  }

  function obtenerTextoPago(sesion) {
    const estadoPago = obtenerEstadoPago(sesion);

    const textos = {
      pendiente: "Pago pendiente",
      en_revision: "Pago en revisión",
      confirmado: "Pago confirmado",
      rechazado: "Pago rechazado",
      pagado: "Pago registrado",
      completado: "Pago registrado",
    };

    return textos[estadoPago] || "Pago pendiente";
  }

  function obtenerClasePago(sesion) {
    const estadoPago = obtenerEstadoPago(sesion);

    if (estadoPago === "confirmado" || estadoPago === "pagado") {
      return "pago-ok";
    }

    if (estadoPago === "en_revision") {
      return "pago-revision";
    }

    if (estadoPago === "rechazado") {
      return "pago-rechazado";
    }

    return "pago-pendiente";
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

    const finalizadas = sesiones.filter((sesion) => {
      return normalizarEstado(sesion.estado) === "finalizada";
    }).length;

    if (statTotalSesiones) statTotalSesiones.textContent = total;
    if (statPendientes) statPendientes.textContent = pendientes;
    if (statAceptadas) statAceptadas.textContent = aceptadas;
    if (statRealizadas) statRealizadas.textContent = finalizadas;
  }

  function filtrarSesiones(sesiones) {
    if (filtroActivo === "todas") {
      return sesiones;
    }

    return sesiones.filter((sesion) => {
      if (filtroActivo === "pago-pendiente") {
        const estado = normalizarEstado(sesion.estado);
        const estadoPago = obtenerEstadoPago(sesion);

        return (
          !ESTADOS_CERRADOS.includes(estado) &&
          (estadoPago === "pendiente" || estadoPago === "rechazado")
        );
      }

      if (filtroActivo === "canceladas") {
        return ESTADOS_CANCELADOS.includes(normalizarEstado(sesion.estado));
      }

      if (filtroActivo === "no-atendida") {
        return normalizarEstado(sesion.estado) === "expirada";
      }

      return normalizarEstado(sesion.estado) === filtroActivo;
    });
  }

  function crearFilaDatoPago(etiqueta, valor) {
    if (!valor) return "";

    return `
      <div>
        <span>${limpiarTexto(etiqueta)}</span>
        <strong>${limpiarTexto(valor)}</strong>
      </div>
    `;
  }

  function crearFormularioPago(sesion) {
    return `
      <form class="pago-form" data-id="${limpiarTexto(sesion.id)}">
        <label>
          Método de pago
          <select name="metodoPago" required>
            <option value="">Selecciona método</option>
            <option value="Yape">Yape</option>
            <option value="Plin">Plin</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Otro">Otro</option>
          </select>
        </label>

        <label>
          Monto pagado
          <input
            type="number"
            name="montoPagado"
            min="0"
            step="0.01"
            value="${limpiarTexto(sesion.total || "")}"
            placeholder="Ejemplo: 50"
            required
          />
        </label>

        <label>
          Número de operación
          <input
            type="text"
            name="numeroOperacion"
            placeholder="Ejemplo: 123456789"
            required
          />
        </label>

        <label class="pago-form-full">
          Comentario opcional
          <textarea
            name="comentarioPago"
            rows="3"
            placeholder="Ejemplo: Pago realizado desde mi cuenta personal."
          ></textarea>
        </label>

        <button type="submit" class="btn-registrar-pago">
          Enviar pago para revisión
        </button>
      </form>
    `;
  }

  function crearBloquePago(sesion) {
    const estado = normalizarEstado(sesion.estado);
    const estadoPago = obtenerEstadoPago(sesion);
    const datosPago = sesion.datosPagoTutor || {};
    const puedeRegistrar =
      (estado === "aceptada" || estado === "en_curso") &&
      (estadoPago === "pendiente" || estadoPago === "rechazado");

    if (estado !== "aceptada" && estado !== "en_curso") {
      return "";
    }

    if (estadoPago === "en_revision") {
      return `
        <div class="pago-estado-box en_revision">
          Pago enviado para revisión. El tutor debe confirmarlo.
        </div>
      `;
    }

    if (estadoPago === "confirmado") {
      return `
        <div class="pago-estado-box confirmado">
          Pago confirmado por el tutor.
        </div>
      `;
    }

    return `
      <div class="pago-tutor-box estado-${limpiarTexto(estadoPago)}">
        <div>
          <span class="sesion-label">
            ${estadoPago === "rechazado" ? "Pago rechazado" : "Pago pendiente"}
          </span>
          <h4>
            ${
              estadoPago === "rechazado"
                ? "Pago rechazado por el tutor."
                : "Datos de pago del tutor"
            }
          </h4>
          ${
            estadoPago === "rechazado"
              ? `<p class="pago-help">${limpiarTexto(sesion.motivoRechazoPago || "Revisa los datos y vuelve a registrar el pago.")}</p>`
              : ""
          }
        </div>

        <div class="pago-tutor-grid">
          ${crearFilaDatoPago("Yape", datosPago.yape)}
          ${crearFilaDatoPago("Plin", datosPago.plin)}
          ${crearFilaDatoPago("Banco", datosPago.banco)}
          ${crearFilaDatoPago("CCI", datosPago.cci)}
          ${crearFilaDatoPago("Titular", datosPago.titular)}
          ${crearFilaDatoPago("Instrucciones", datosPago.instrucciones)}
        </div>

        ${puedeRegistrar ? crearFormularioPago(sesion) : ""}
      </div>
    `;
  }

  function crearAccionCancelar(sesion) {
    if (normalizarEstado(sesion.estado) !== "pendiente") {
      return "";
    }

    return `
      <button
        type="button"
        class="sesion-action-btn danger"
        data-cancelar-reserva="${limpiarTexto(sesion.id)}"
      >
        Cancelar reserva
      </button>
    `;
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
        const pagoClase = obtenerClasePago(sesion);

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

              ${crearAccionCancelar(sesion)}
            </div>

            ${crearBloquePago(sesion)}
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
    if (boton.dataset.filtro === filtroActivo) {
      botonesFiltro.forEach((item) => item.classList.remove("is-active"));
      boton.classList.add("is-active");
    }

    boton.addEventListener("click", () => {
      botonesFiltro.forEach((item) => item.classList.remove("is-active"));
      boton.classList.add("is-active");

      filtroActivo = boton.dataset.filtro || "todas";

      mostrarSesiones(sesionesGlobales);
    });
  });

  if (listaMisSesiones) {
    listaMisSesiones.addEventListener("click", async (event) => {
      const boton = event.target.closest("[data-cancelar-reserva]");

      if (!boton) return;

      const reservaId = boton.dataset.cancelarReserva;

      if (!reservaId) {
        mostrarEstado("No se encontró la reserva seleccionada.");
        return;
      }

      const confirmar = confirm("¿Deseas cancelar esta reserva pendiente?");

      if (!confirmar) return;

      const textoOriginal = boton.textContent;

      try {
        boton.disabled = true;
        boton.textContent = "Cancelando...";

        await cancelarReservaEstudiante(reservaId);
        mostrarEstado("Reserva cancelada correctamente.");
        await cargarSesiones();
      } catch (error) {
        console.error("Error al cancelar reserva:", error);
        mostrarEstado(error.message || "No se pudo cancelar la reserva.");
        boton.disabled = false;
        boton.textContent = textoOriginal;
      }
    });

    listaMisSesiones.addEventListener("submit", async (event) => {
      const formulario = event.target.closest(".pago-form");

      if (!formulario) return;

      event.preventDefault();

      const reservaId = formulario.dataset.id;
      const boton = formulario.querySelector("button[type='submit']");
      const textoOriginal = boton?.textContent || "Enviar pago para revisión";

      try {
        if (boton) {
          boton.disabled = true;
          boton.textContent = "Enviando pago...";
        }

        await registrarPagoReserva(reservaId, {
          metodoPago: formulario.metodoPago.value,
          montoPagado: validarMontoPositivo(
            formulario.montoPagado.value,
            "monto pagado",
          ),
          numeroOperacion: validarNumeroOperacion(
            formulario.numeroOperacion.value,
          ),
          comentarioPago: limitarTexto(
            formulario.comentarioPago.value,
            300,
            "comentario",
          ),
        });

        mostrarEstado("Pago enviado para revisión del tutor.");
        await cargarSesiones();
      } catch (error) {
        console.error("Error al registrar pago:", error);
        mostrarEstado(error.message || "No se pudo registrar el pago.");

        if (boton) {
          boton.disabled = false;
          boton.textContent = textoOriginal;
        }
      }
    });
  }

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
