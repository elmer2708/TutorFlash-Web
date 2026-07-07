import {
  observarUsuario,
  cerrarSesion,
  obtenerTutorActivoActual,
  obtenerReservasDelTutor,
  actualizarEstadoReserva,
  actualizarEnlaceClaseReserva,
  confirmarPagoReserva,
  rechazarPagoReserva,
  obtenerMisDatosPagoTutor,
} from "./firebase-service.js";
import { validarEnlaceClase } from "./validaciones.js";

document.addEventListener("DOMContentLoaded", () => {
  const nombreTutorPanel = document.getElementById("nombreTutorPanel");
  const correoTutorPanel = document.getElementById("correoTutorPanel");
  const nombreTutorCard = document.getElementById("nombreTutorCard");
  const avatarTutor = document.getElementById("avatarTutor");

  const cursosTutorPanel = document.getElementById("cursosTutorPanel");
  const nivelTutorPanel = document.getElementById("nivelTutorPanel");
  const disponibilidadTutorPanel = document.getElementById(
    "disponibilidadTutorPanel",
  );
  const estadoTutorPanel = document.getElementById("estadoTutorPanel");

  const panelMensaje = document.getElementById("panelMensaje");

  const statPendientes = document.getElementById("statPendientes");
  const statAceptadas = document.getElementById("statAceptadas");
  const statRealizadas = document.getElementById("statRealizadas");
  const statIngresos = document.getElementById("statIngresos");
  const statPagosRevision = document.getElementById("statPagosRevision");

  const proximaSesionCard = document.getElementById("proximaSesionCard");
  const listaReservasTutor = document.getElementById("listaReservasTutor");
  const listaHistorialTutor = document.getElementById("listaHistorialTutor");
  const filtroReservas = document.getElementById("filtroReservas");
  const checklistTutor = document.getElementById("checklistTutor");

  const btnCerrarSesionTutor = document.getElementById("btnCerrarSesionTutor");

  let tutorActual = null;
  let reservasActuales = [];
  let accionReservaEnProceso = false;
  let datosPagoTutorActual = null;

  function mostrarMensaje(texto, tipo = "info") {
    if (!panelMensaje) return;

    panelMensaje.textContent = texto;
    panelMensaje.className = `mensaje-panel ${tipo}`;
  }

  function normalizarTexto(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function normalizarEstado(estado) {
    const estadoNormalizado = normalizarTexto(estado);

    if (!estadoNormalizado) return "pendiente";
    if (estadoNormalizado === "confirmada") return "aceptada";
    if (estadoNormalizado === "confirmado") return "aceptada";

    return estadoNormalizado;
  }

  function obtenerEtiquetaEstado(estado) {
    const estadoNormalizado = normalizarEstado(estado);

    const etiquetas = {
      pendiente: "Pendiente",
      aceptada: "Aceptada",
      realizada: "Realizada",
      rechazada: "Rechazada",
      cancelada: "Cancelada",
    };

    return etiquetas[estadoNormalizado] || estado || "Pendiente";
  }

  function obtenerIniciales(nombre) {
    const partes = String(nombre || "TutorFlash Tutor")
      .trim()
      .split(" ")
      .filter(Boolean);

    const primera = partes[0]?.charAt(0) || "T";
    const segunda = partes[1]?.charAt(0) || "F";

    return `${primera}${segunda}`.toUpperCase();
  }

  function convertirNumero(valor) {
    const numero = Number(
      String(valor || "0")
        .replace("S/", "")
        .trim(),
    );
    return Number.isFinite(numero) ? numero : 0;
  }

  function limpiarTexto(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatearMonto(valor) {
    const monto = convertirNumero(valor);
    return monto.toFixed(2);
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

  function obtenerFechaHora(reserva) {
    const fecha = String(reserva.fecha || "");
    const partesFecha = fecha.split("-").map(Number);

    if (partesFecha.length !== 3) {
      return null;
    }

    const [year, month, day] = partesFecha;
    const minutosTotales = convertirHoraAMinutos(reserva.hora);

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

  function obtenerFechaCreacionReserva(reserva) {
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
      const tiempo = obtenerMilisegundosCampoTemporal(reserva[campo]);

      if (tiempo) return tiempo;
    }

    return obtenerFechaHora(reserva)?.getTime() || 0;
  }

  function formatearFecha(fecha) {
    if (!fecha) return "Fecha no indicada";

    const partes = String(fecha).split("-");

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return fecha;
  }

  function ordenarReservasPorFechaHora(reservas, direccion = "asc") {
    return [...reservas].sort((a, b) => {
      const fechaA = obtenerFechaHora(a);
      const fechaB = obtenerFechaHora(b);

      if (!fechaA && !fechaB) return 0;
      if (!fechaA) return 1;
      if (!fechaB) return -1;

      if (direccion === "desc") {
        return fechaB - fechaA;
      }

      return fechaA - fechaB;
    });
  }

  function pintarPerfilTutor(tutor) {
    const nombre = tutor.nombre || "TutorFlash Tutor";
    const correo =
      tutor.correoUsuario || tutor.correo || "Correo no registrado";
    const cursos = tutor.cursos || "Cursos no registrados";
    const nivel = tutor.nivel || "Nivel no indicado";
    const disponibilidad = tutor.disponibilidad || "Disponibilidad no indicada";
    const estado = tutor.estado || "activo";

    if (nombreTutorPanel) nombreTutorPanel.textContent = `Hola, ${nombre}`;
    if (correoTutorPanel) correoTutorPanel.textContent = correo;
    if (nombreTutorCard) nombreTutorCard.textContent = nombre;
    if (avatarTutor) avatarTutor.textContent = obtenerIniciales(nombre);

    if (cursosTutorPanel) cursosTutorPanel.textContent = cursos;
    if (nivelTutorPanel) nivelTutorPanel.textContent = nivel;
    if (disponibilidadTutorPanel)
      disponibilidadTutorPanel.textContent = disponibilidad;
    if (estadoTutorPanel) estadoTutorPanel.textContent = `Estado: ${estado}`;
  }

  function calcularResumen(reservas) {
    const pendientes = reservas.filter(
      (reserva) => normalizarEstado(reserva.estado) === "pendiente",
    );

    const aceptadas = reservas.filter((reserva) => {
      const estado = normalizarEstado(reserva.estado);
      return estado === "aceptada";
    });

    const realizadas = reservas.filter(
      (reserva) => normalizarEstado(reserva.estado) === "realizada",
    );

    const pagosRevision = reservas.filter((reserva) => {
      return String(reserva.estadoPago || "pendiente").toLowerCase().trim() ===
        "en_revision";
    }).length;

    const ingresosConfirmados = reservas
      .filter((reserva) => {
        return String(reserva.estadoPago || "").toLowerCase().trim() ===
          "confirmado";
      })
      .reduce((total, reserva) => total + convertirNumero(reserva.total), 0);

    if (statPendientes) statPendientes.textContent = pendientes.length;
    if (statAceptadas) statAceptadas.textContent = aceptadas.length;
    if (statRealizadas) statRealizadas.textContent = realizadas.length;
    if (statPagosRevision) statPagosRevision.textContent = pagosRevision;
    if (statIngresos)
      statIngresos.textContent = `S/ ${ingresosConfirmados.toFixed(2)}`;
  }

  function pintarChecklistTutor(reservas) {
    if (!checklistTutor) return;

    const perfilCompleto = Boolean(tutorActual?.perfilCompleto);
    const disponibilidadRegistrada = Boolean(tutorActual?.disponibilidad);
    const pendientes = reservas.filter(
      (reserva) => normalizarEstado(reserva.estado) === "pendiente",
    ).length;
    const pagosRevision = reservas.filter((reserva) => {
      return String(reserva.estadoPago || "").toLowerCase().trim() ===
        "en_revision";
    }).length;

    const items = [
      {
        ok: perfilCompleto,
        texto: perfilCompleto ? "Perfil completo" : "Perfil pendiente",
      },
      {
        ok: Boolean(datosPagoTutorActual),
        texto: datosPagoTutorActual
          ? "Métodos de pago registrados"
          : "Métodos de pago pendientes",
        ayuda: !datosPagoTutorActual
          ? "Completa tus métodos de pago antes de aceptar reservas."
          : "",
      },
      {
        ok: disponibilidadRegistrada,
        texto: disponibilidadRegistrada
          ? "Disponibilidad registrada"
          : "Disponibilidad pendiente",
        ayuda: !disponibilidadRegistrada
          ? "Completa tu disponibilidad para que los estudiantes puedan reservar contigo."
          : "",
      },
      {
        ok: pendientes === 0,
        texto: `${pendientes} reserva(s) pendientes por revisar`,
      },
      {
        ok: pagosRevision === 0,
        texto: `${pagosRevision} pago(s) por revisar`,
      },
    ];

    checklistTutor.innerHTML = items
      .map((item) => {
        return `
          <div class="checklist-item ${item.ok ? "ok" : "warning"}">
            <strong>${item.ok ? "✅" : "⚠️"} ${limpiarTexto(item.texto)}</strong>
            ${item.ayuda ? `<p>${limpiarTexto(item.ayuda)}</p>` : ""}
          </div>
        `;
      })
      .join("");
  }

  function obtenerProximaSesion(reservas) {
    const ahora = new Date();

    return reservas
      .filter((reserva) => {
        const estado = normalizarEstado(reserva.estado);
        const fechaHora = obtenerFechaHora(reserva);

        return (
          fechaHora &&
          fechaHora >= ahora &&
          (estado === "pendiente" || estado === "aceptada")
        );
      })
      .sort((a, b) => obtenerFechaHora(a) - obtenerFechaHora(b))[0];
  }

  function pintarProximaSesion(reservas) {
    if (!proximaSesionCard) return;

    const proxima = obtenerProximaSesion(reservas);

    if (!proxima) {
      proximaSesionCard.className = "empty-state";
      proximaSesionCard.innerHTML =
        "Todavía no hay una próxima sesión registrada.";
      return;
    }

    proximaSesionCard.className = "proxima-detalle";
    proximaSesionCard.innerHTML = `
  <div class="proxima-curso">
    ${limpiarTexto(proxima.curso || "Curso no indicado")}
  </div>

  <span class="estado-pill estado-${normalizarEstado(proxima.estado)}">
    ${limpiarTexto(obtenerEtiquetaEstado(proxima.estado))}
  </span>

  <div class="proxima-meta">
    <div><strong>Estudiante:</strong> ${limpiarTexto(proxima.correoUsuario || "No registrado")}</div>
    <div><strong>Fecha:</strong> ${limpiarTexto(formatearFecha(proxima.fecha))}</div>
    <div><strong>Hora:</strong> ${limpiarTexto(proxima.hora || "No indicada")}</div>
    <div><strong>Modalidad:</strong> ${limpiarTexto(proxima.modalidad || "No indicada")}</div>
    <div><strong>Total:</strong> S/ ${formatearMonto(proxima.total)}</div>
  </div>
`;
  }

  function obtenerReservasFiltradas() {
    const filtro = filtroReservas?.value || "todas";

    if (filtro === "todas") {
      return reservasActuales;
    }

    if (filtro === "pago-revision") {
      return reservasActuales.filter((reserva) => {
        return String(reserva.estadoPago || "").toLowerCase().trim() ===
          "en_revision";
      });
    }

    return reservasActuales.filter(
      (reserva) => normalizarEstado(reserva.estado) === filtro,
    );
  }

  function crearOpcionPlataforma(valor, plataformaActual) {
    const seleccionado =
      normalizarTexto(valor) === normalizarTexto(plataformaActual)
        ? "selected"
        : "";

    return `
    <option value="${limpiarTexto(valor)}" ${seleccionado}>
      ${limpiarTexto(valor)}
    </option>
  `;
  }

  function crearBloqueClaseVirtual(reserva) {
    const estado = normalizarEstado(reserva.estado);
    const plataformaClase = reserva.plataformaClase || "Google Meet";
    const enlaceClase = reserva.enlaceClase || "";
    const tieneEnlace = Boolean(enlaceClase);

    if (estado !== "aceptada" && estado !== "realizada") {
      return `
      <div class="clase-virtual-box clase-pendiente">
        <div class="clase-virtual-header">
          <strong>Clase virtual</strong>
          <span class="clase-estado pendiente">Pendiente</span>
        </div>
        <p>Acepta la reserva para poder agregar el enlace de la clase.</p>
      </div>
    `;
    }

    return `
    <div class="clase-virtual-box">
      <div class="clase-virtual-header">
        <strong>Clase virtual</strong>

        <span class="clase-estado ${tieneEnlace ? "programada" : "pendiente"}">
          ${tieneEnlace ? "Enlace enviado" : "Enlace pendiente"}
        </span>
      </div>

      ${
        tieneEnlace
          ? `
            <p>
              Plataforma: <strong>${limpiarTexto(plataformaClase)}</strong>
            </p>

            <a
              href="${limpiarTexto(enlaceClase)}"
              target="_blank"
              rel="noopener noreferrer"
              class="clase-link"
            >
              Abrir enlace de clase
            </a>
          `
          : `
            <p>
              Agrega el enlace de Google Meet, Zoom u otra plataforma para que el estudiante pueda ingresar.
            </p>
          `
      }

      ${
        estado === "aceptada"
          ? `
            <form class="form-clase" data-id="${limpiarTexto(reserva.id)}">
              <label>
                Plataforma
                <select name="plataformaClase" required>
                  ${crearOpcionPlataforma("Google Meet", plataformaClase)}
                  ${crearOpcionPlataforma("Zoom", plataformaClase)}
                  ${crearOpcionPlataforma("WhatsApp", plataformaClase)}
                  ${crearOpcionPlataforma("Otro", plataformaClase)}
                </select>
              </label>

              <label>
                Enlace de clase
                <input
                  type="url"
                  name="enlaceClase"
                  value="${limpiarTexto(enlaceClase)}"
                  placeholder="https://meet.google.com/..."
                  required
                />
              </label>

              <button type="submit" class="btn-guardar-clase">
                ${tieneEnlace ? "Actualizar enlace" : "Guardar enlace"}
              </button>
            </form>
          `
          : ""
      }
    </div>
  `;
  }

  function ordenarReservasRecientes(reservas) {
    return [...reservas].sort((a, b) => {
      const fechaB = obtenerFechaCreacionReserva(b);
      const fechaA = obtenerFechaCreacionReserva(a);

      if (fechaA !== fechaB) {
        return fechaB - fechaA;
      }

      const prioridadEstado = {
        pendiente: 3,
        aceptada: 2,
        confirmada: 2,
        realizada: 1,
        cancelada: 0,
        rechazada: 0,
      };

      return (
        (prioridadEstado[normalizarEstado(b.estado)] || 0) -
        (prioridadEstado[normalizarEstado(a.estado)] || 0)
      );
    });
  }

  function obtenerEstadoPago(reserva) {
    return String(reserva.estadoPago || "pendiente")
      .toLowerCase()
      .trim();
  }

  function formatearMontoPago(valor) {
    const monto = Number(valor || 0);
    return monto.toFixed(2);
  }

  function crearBloquePagoTutor(reserva) {
    const estadoPago = obtenerEstadoPago(reserva);
    const comentarioPago = reserva.comentarioPago || "Sin comentario";

    if (estadoPago === "en_revision") {
      return `
        <div class="pago-panel-box estado-en_revision">
          <div class="pago-panel-header">
            <strong>Pago en revisión</strong>
            <span class="clase-estado programada">En revisión</span>
          </div>

          <div class="pago-panel-grid">
            <div><span>Método</span><strong>${limpiarTexto(reserva.metodoPago || "No indicado")}</strong></div>
            <div><span>Monto</span><strong>S/ ${formatearMontoPago(reserva.montoPagado)}</strong></div>
            <div><span>Número de operación</span><strong>${limpiarTexto(reserva.numeroOperacion || "No indicado")}</strong></div>
            <div><span>Comentario</span><strong>${limpiarTexto(comentarioPago)}</strong></div>
          </div>

          <div class="pago-panel-actions">
            <button
              type="button"
              class="btn-confirmar-pago"
              data-id="${limpiarTexto(reserva.id)}"
              data-pago-accion="confirmar"
            >
              Confirmar pago
            </button>

            <button
              type="button"
              class="btn-rechazar-pago"
              data-id="${limpiarTexto(reserva.id)}"
              data-pago-accion="rechazar"
            >
              Rechazar pago
            </button>
          </div>
        </div>
      `;
    }

    if (estadoPago === "confirmado") {
      return `
        <div class="pago-panel-box estado-confirmado">
          <div class="pago-panel-header">
            <strong>Pago confirmado.</strong>
            <span class="clase-estado programada">Confirmado</span>
          </div>
        </div>
      `;
    }

    if (estadoPago === "rechazado") {
      return `
        <div class="pago-panel-box estado-rechazado">
          <div class="pago-panel-header">
            <strong>Pago rechazado.</strong>
            <span class="clase-estado pendiente">Rechazado</span>
          </div>
          <p>${limpiarTexto(reserva.motivoRechazoPago || "Sin motivo registrado.")}</p>
        </div>
      `;
    }

    return `
      <div class="pago-panel-box estado-pendiente">
        <div class="pago-panel-header">
          <strong>Pago pendiente.</strong>
          <span class="clase-estado pendiente">Pendiente</span>
        </div>
        <p>El estudiante todavía no registró pago.</p>
      </div>
    `;
  }

  function crearBotonesAccion(reserva) {
    const estado = normalizarEstado(reserva.estado);

    if (estado === "pendiente") {
      return `
      <button class="btn-accion btn-aceptar" data-id="${reserva.id}" data-estado="aceptada">
        Aceptar
      </button>

      <button class="btn-accion btn-rechazar" data-id="${reserva.id}" data-estado="rechazada">
        Rechazar
      </button>
    `;
    }

    if (estado === "aceptada") {
      return `
      <button class="btn-accion btn-realizada" data-id="${reserva.id}" data-estado="realizada">
        Marcar realizada
      </button>

      <button class="btn-accion btn-cancelar" data-id="${reserva.id}" data-estado="cancelada">
        Cancelar
      </button>
    `;
    }

    return `
    <span class="sin-acciones">
      Sin acciones pendientes
    </span>
  `;
  }

  function pintarReservas() {
    if (!listaReservasTutor) return;

    const reservas = obtenerReservasFiltradas();

    if (!reservas.length) {
      listaReservasTutor.innerHTML = `
      <div class="empty-state">
        No hay reservas para este filtro.
      </div>
    `;
      return;
    }

    const reservasOrdenadas = ordenarReservasRecientes(reservas);

    listaReservasTutor.innerHTML = reservasOrdenadas
      .map((reserva) => {
        const estado = normalizarEstado(reserva.estado);

        return `
        <article class="reserva-card reserva-${estado}">
          <div>
            <div class="reserva-card-header">
              <h3>${limpiarTexto(reserva.curso || "Curso no indicado")}</h3>

              <span class="estado-pill estado-${estado}">
                ${obtenerEtiquetaEstado(reserva.estado)}
              </span>
            </div>

            <div class="reserva-grid">
              <div><strong>Estudiante:</strong> ${limpiarTexto(reserva.correoUsuario || "No registrado")}</div>
              <div><strong>Tutor:</strong> ${limpiarTexto(reserva.tutor || tutorActual?.nombre || "Tutor")}</div>
              <div><strong>Fecha:</strong> ${limpiarTexto(formatearFecha(reserva.fecha))}</div>
              <div><strong>Hora:</strong> ${limpiarTexto(reserva.hora || "No indicada")}</div>
              <div><strong>Modalidad:</strong> ${limpiarTexto(reserva.modalidad || "No indicada")}</div>
              <div><strong>Duración:</strong> ${limpiarTexto(reserva.duracion || "No indicada")}</div>
              <div><strong>Total:</strong> S/ ${formatearMonto(reserva.total)}</div>
              <div><strong>Método:</strong> ${limpiarTexto(reserva.metodoPago || "Simulado")}</div>
            </div>
            ${crearBloqueClaseVirtual(reserva)}
            ${crearBloquePagoTutor(reserva)}
          </div>

          <div class="reserva-actions">
            ${crearBotonesAccion(reserva)}
          </div>
        </article>
      `;
      })
      .join("");
  }
  function pintarHistorial(reservas) {
    if (!listaHistorialTutor) return;

    const realizadas = ordenarReservasPorFechaHora(
      reservas.filter(
        (reserva) => normalizarEstado(reserva.estado) === "realizada",
      ),
      "desc",
    );

    if (!realizadas.length) {
      listaHistorialTutor.innerHTML = `
      <div class="empty-state">
        Todavía no tienes sesiones realizadas.
      </div>
    `;
      return;
    }

    listaHistorialTutor.innerHTML = realizadas
      .map((reserva) => {
        return `
        <article class="reserva-card reserva-realizada">
          <div>
            <div class="reserva-card-header">
              <h3>${limpiarTexto(reserva.curso || "Curso no indicado")}</h3>

              <span class="estado-pill estado-realizada">
                Realizada
              </span>
            </div>

            <div class="reserva-grid">
              <div><strong>Estudiante:</strong> ${limpiarTexto(reserva.correoUsuario || "No registrado")}</div>
              <div><strong>Fecha:</strong> ${limpiarTexto(formatearFecha(reserva.fecha))}</div>
              <div><strong>Hora:</strong> ${limpiarTexto(reserva.hora || "No indicada")}</div>
              <div><strong>Total:</strong> S/ ${formatearMonto(reserva.total)}</div>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  }

  async function cargarPanelTutor(tutor) {
    tutorActual = tutor;

    pintarPerfilTutor(tutorActual);
    mostrarMensaje("Cargando reservas recibidas...", "info");

    try {
      reservasActuales = await obtenerReservasDelTutor();
      datosPagoTutorActual = await obtenerMisDatosPagoTutor().catch(() => null);

      calcularResumen(reservasActuales);
      pintarProximaSesion(reservasActuales);
      pintarReservas();
      pintarHistorial(reservasActuales);
      pintarChecklistTutor(reservasActuales);

      if (!reservasActuales.length) {
        mostrarMensaje(
          "Tu perfil está activo. Cuando un estudiante reserve contigo, aparecerá aquí.",
          "info",
        );
        return;
      }

      mostrarMensaje(
        `Tienes ${reservasActuales.length} reserva(s) registrada(s) en tu panel.`,
        "exito",
      );
    } catch (error) {
      console.error("Error al cargar reservas del tutor:", error);
      mostrarMensaje("No se pudieron cargar tus reservas.", "error");
    }
  }

  async function validarAccesoTutor() {
    observarUsuario(async (usuario) => {
      if (!usuario) {
        window.location.href = "cuenta.html";
        return;
      }

      try {
        mostrarMensaje("Validando acceso del tutor...", "info");

        const tutorActivo = await obtenerTutorActivoActual();

        if (!tutorActivo) {
          window.location.href = "tutor.html";
          return;
        }

        await cargarPanelTutor(tutorActivo);
      } catch (error) {
        console.error("Error al validar tutor:", error);
        window.location.href = "tutor.html";
      }
    });
  }

  if (filtroReservas) {
    filtroReservas.addEventListener("change", pintarReservas);
  }

  document.querySelectorAll(".stat-link[data-href]").forEach((tarjeta) => {
    tarjeta.addEventListener("click", () => {
      const filtro = tarjeta.dataset.filtro;

      if (filtroReservas && filtro) {
        filtroReservas.value = filtro;
        pintarReservas();
      }

      document.querySelector(tarjeta.dataset.href)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  if (listaReservasTutor) {
    listaReservasTutor.addEventListener("submit", async (event) => {
      const formulario = event.target.closest(".form-clase");

      if (!formulario || accionReservaEnProceso) return;

      event.preventDefault();

      const reservaId = formulario.dataset.id;
      const plataformaClase = formulario.plataformaClase.value;
      const enlaceClase = formulario.enlaceClase.value;
      const botonGuardar = formulario.querySelector("button[type='submit']");
      const textoOriginal = botonGuardar?.textContent || "Guardar enlace";

      if (!reservaId) {
        mostrarMensaje("No se encontró la reserva seleccionada.", "error");
        return;
      }

      try {
        accionReservaEnProceso = true;

        if (botonGuardar) {
          botonGuardar.disabled = true;
          botonGuardar.textContent = "Guardando...";
        }

        await actualizarEnlaceClaseReserva(reservaId, {
          plataformaClase,
          enlaceClase: validarEnlaceClase(enlaceClase),
        });

        mostrarMensaje(
          "Enlace de clase guardado correctamente. El estudiante ya podrá verlo.",
          "exito",
        );

        if (tutorActual) {
          await cargarPanelTutor(tutorActual);
        }
      } catch (error) {
        console.error("Error al guardar enlace de clase:", error);

        mostrarMensaje(
          error.message || "No se pudo guardar el enlace de la clase.",
          "error",
        );

        if (botonGuardar) {
          botonGuardar.disabled = false;
          botonGuardar.textContent = textoOriginal;
        }
      } finally {
        accionReservaEnProceso = false;
      }
    });
  }

  if (listaReservasTutor) {
    listaReservasTutor.addEventListener("click", async (event) => {
      const boton = event.target.closest("[data-id][data-pago-accion]");

      if (!boton || accionReservaEnProceso) return;

      const reservaId = boton.dataset.id;
      const accionPago = boton.dataset.pagoAccion;

      if (!reservaId || !["confirmar", "rechazar"].includes(accionPago)) {
        mostrarMensaje("La acción de pago seleccionada no es válida.", "error");
        return;
      }

      let motivo = "";

      if (accionPago === "rechazar") {
        motivo = prompt("Indica el motivo del rechazo del pago:") || "";

        if (!motivo.trim()) {
          mostrarMensaje("Ingresa un motivo para rechazar el pago.", "error");
          return;
        }
      }

      const tarjeta = boton.closest(".pago-panel-box");
      const botonesPago = tarjeta
        ? tarjeta.querySelectorAll("[data-id][data-pago-accion]")
        : [boton];
      const textoOriginal = boton.textContent;

      try {
        accionReservaEnProceso = true;

        botonesPago.forEach((btn) => {
          btn.disabled = true;
        });

        boton.textContent =
          accionPago === "confirmar" ? "Confirmando..." : "Rechazando...";

        if (accionPago === "confirmar") {
          await confirmarPagoReserva(reservaId);
          mostrarMensaje("Pago confirmado correctamente.", "exito");
        } else {
          await rechazarPagoReserva(reservaId, motivo);
          mostrarMensaje("Pago rechazado correctamente.", "exito");
        }

        if (tutorActual) {
          await cargarPanelTutor(tutorActual);
        }
      } catch (error) {
        console.error("Error al actualizar pago:", error);

        botonesPago.forEach((btn) => {
          btn.disabled = false;
        });

        boton.textContent = textoOriginal;

        mostrarMensaje(
          error.message || "No se pudo actualizar el estado del pago.",
          "error",
        );
      } finally {
        accionReservaEnProceso = false;
      }
    });
  }

  if (listaReservasTutor) {
    listaReservasTutor.addEventListener("click", async (event) => {
      const boton = event.target.closest("[data-id][data-estado]");

      if (!boton || accionReservaEnProceso) return;

      const reservaId = boton.dataset.id;
      const nuevoEstado = normalizarEstado(boton.dataset.estado);

      const estadosPermitidosDesdePanel = [
        "aceptada",
        "rechazada",
        "realizada",
        "cancelada",
      ];

      if (!reservaId || !estadosPermitidosDesdePanel.includes(nuevoEstado)) {
        mostrarMensaje("La acción seleccionada no es válida.", "error");
        return;
      }

      const mensajesConfirmacion = {
        aceptada: "¿Deseas aceptar esta reserva?",
        rechazada: "¿Deseas rechazar esta reserva?",
        realizada: "¿Deseas marcar esta sesión como realizada?",
        cancelada: "¿Deseas cancelar esta reserva?",
      };

      const confirmarCambio = confirm(
        mensajesConfirmacion[nuevoEstado] || "¿Deseas actualizar esta reserva?",
      );

      if (!confirmarCambio) {
        return;
      }

      const tarjeta = boton.closest(".reserva-card");
      const botonesTarjeta = tarjeta
        ? tarjeta.querySelectorAll("[data-id][data-estado]")
        : [boton];

      const textoOriginalBoton = boton.textContent;

      try {
        accionReservaEnProceso = true;

        botonesTarjeta.forEach((btn) => {
          btn.disabled = true;
        });

        boton.textContent = "Actualizando...";

        await actualizarEstadoReserva(reservaId, nuevoEstado);

        mostrarMensaje(
          "Estado de la reserva actualizado correctamente.",
          "exito",
        );

        if (tutorActual) {
          await cargarPanelTutor(tutorActual);
        }
      } catch (error) {
        console.error("Error al actualizar reserva:", error);

        botonesTarjeta.forEach((btn) => {
          btn.disabled = false;
        });

        boton.textContent = textoOriginalBoton;

        mostrarMensaje(
          error.message || "No se pudo actualizar el estado de la reserva.",
          "error",
        );
      } finally {
        accionReservaEnProceso = false;
      }
    });
  }
  validarAccesoTutor();
});

