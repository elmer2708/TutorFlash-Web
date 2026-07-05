import {
  observarUsuario,
  cerrarSesion,
  obtenerTutorActivoActual,
  obtenerReservasDelTutor,
  actualizarEstadoReserva,
} from "./firebase-service.js";

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

  const proximaSesionCard = document.getElementById("proximaSesionCard");
  const listaReservasTutor = document.getElementById("listaReservasTutor");
  const listaHistorialTutor = document.getElementById("listaHistorialTutor");
  const filtroReservas = document.getElementById("filtroReservas");

  const btnCerrarSesionTutor = document.getElementById("btnCerrarSesionTutor");

  let tutorActual = null;
  let reservasActuales = [];

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

    const ingresosEstimados = reservas
      .filter((reserva) => {
        const estado = normalizarEstado(reserva.estado);
        return estado === "aceptada" || estado === "realizada";
      })
      .reduce((total, reserva) => total + convertirNumero(reserva.total), 0);

    if (statPendientes) statPendientes.textContent = pendientes.length;
    if (statAceptadas) statAceptadas.textContent = aceptadas.length;
    if (statRealizadas) statRealizadas.textContent = realizadas.length;
    if (statIngresos)
      statIngresos.textContent = `S/ ${ingresosEstimados.toFixed(2)}`;
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
      <div class="proxima-curso">${proxima.curso || "Curso no indicado"}</div>

      <span class="estado-pill estado-${normalizarEstado(proxima.estado)}">
        ${obtenerEtiquetaEstado(proxima.estado)}
      </span>

      <div class="proxima-meta">
        <div><strong>Estudiante:</strong> ${proxima.correoUsuario || "No registrado"}</div>
        <div><strong>Fecha:</strong> ${formatearFecha(proxima.fecha)}</div>
        <div><strong>Hora:</strong> ${proxima.hora || "No indicada"}</div>
        <div><strong>Modalidad:</strong> ${proxima.modalidad || "No indicada"}</div>
        <div><strong>Total:</strong> S/ ${proxima.total || "0"}</div>
      </div>
    `;
  }

  function obtenerReservasFiltradas() {
    const filtro = filtroReservas?.value || "todas";

    if (filtro === "todas") {
      return reservasActuales;
    }

    return reservasActuales.filter(
      (reserva) => normalizarEstado(reserva.estado) === filtro,
    );
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

    const reservasOrdenadas = ordenarReservasPorFechaHora(reservas, "asc");

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

      calcularResumen(reservasActuales);
      pintarProximaSesion(reservasActuales);
      pintarReservas();
      pintarHistorial(reservasActuales);

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
          window.location.href = "app.html";
          return;
        }

        await cargarPanelTutor(tutorActivo);
      } catch (error) {
        console.error("Error al validar tutor:", error);
        window.location.href = "app.html";
      }
    });
  }

  if (filtroReservas) {
    filtroReservas.addEventListener("change", pintarReservas);
  }

  if (listaReservasTutor) {
    listaReservasTutor.addEventListener("click", async (event) => {
      const boton = event.target.closest("[data-id][data-estado]");

      if (!boton) return;

      const reservaId = boton.dataset.id;
      const nuevoEstado = boton.dataset.estado;
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

      try {
        boton.disabled = true;
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
        mostrarMensaje(
          "No se pudo actualizar el estado de la reserva.",
          "error",
        );
      }
    });
  }

  if (btnCerrarSesionTutor) {
    btnCerrarSesionTutor.addEventListener("click", async () => {
      try {
        await cerrarSesion();
        window.location.href = "cuenta.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        mostrarMensaje("No se pudo cerrar sesión.", "error");
      }
    });
  }

  validarAccesoTutor();
});
