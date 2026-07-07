import {
  observarUsuario,
  obtenerTutorActivoActual,
  obtenerDisponibilidadTutorActual,
  guardarDisponibilidadTutorActual,
} from "./firebase-service.js";
import { mostrarAviso } from "./mensajes-ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const formBloqueHorario = document.getElementById("formBloqueHorario");
  const fechaDisponibilidad = document.getElementById("fechaDisponibilidad");
  const diaHorario = document.getElementById("diaHorario");
  const estadoHorario = document.getElementById("estadoHorario");
  const horaInicio = document.getElementById("horaInicio");
  const horaFin = document.getElementById("horaFin");

  const listaBloquesHorario = document.getElementById("listaBloquesHorario");
  const btnGuardarDisponibilidad = document.getElementById(
    "btnGuardarDisponibilidad",
  );
  const btnCerrarSesionTutor = document.getElementById("btnCerrarSesionTutor");
  const mensajeDisponibilidad = document.getElementById(
    "mensajeDisponibilidad",
  );

  let tutorActual = null;
  let bloquesHorario = [];

  const nombresDias = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
  };

  const ordenDias = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    domingo: 7,
  };

  const diasPorFecha = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];

  function obtenerFechaLocal() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function fechaEsValida(fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha || ""))) return false;

    const [year, month, day] = fecha.split("-").map(Number);
    const fechaLocal = new Date(year, month - 1, day);

    return (
      fechaLocal.getFullYear() === year &&
      fechaLocal.getMonth() === month - 1 &&
      fechaLocal.getDate() === day
    );
  }

  function obtenerDiaPorFecha(fecha) {
    if (!fechaEsValida(fecha)) return "";

    const [year, month, day] = fecha.split("-").map(Number);
    const fechaLocal = new Date(year, month - 1, day);

    return diasPorFecha[fechaLocal.getDay()] || "";
  }

  function normalizarDia(valor) {
    return String(valor || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function formatearFecha(fecha) {
    if (!fechaEsValida(fecha)) return "";

    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  }

  function sincronizarDiaConFecha() {
    if (!fechaDisponibilidad || !diaHorario) return;

    const diaCalculado = obtenerDiaPorFecha(fechaDisponibilidad.value);
    diaHorario.value = diaCalculado;
  }

  function mostrarMensaje(texto, tipo = "info") {
    if (mensajeDisponibilidad) {
      mensajeDisponibilidad.textContent = texto;
    }

    mostrarAviso(texto, tipo);
  }

  function obtenerMensajeErrorGuardado(error) {
    const detalle = `${error?.code || ""} ${error?.message || ""}`;

    if (/permission|permiso|insufficient/i.test(detalle)) {
      return "No tienes permiso para guardar esta disponibilidad.";
    }

    if (/Agrega al menos un horario válido/i.test(detalle)) {
      return "Agrega al menos un horario válido.";
    }

    if (/Ya agregaste ese horario/i.test(detalle)) {
      return "Ya agregaste ese horario.";
    }

    if (/fecha .*no es válida|Selecciona una fecha disponible/i.test(detalle)) {
      return "Selecciona una fecha disponible.";
    }

    if (/fecha disponible no puede ser anterior/i.test(detalle)) {
      return "La fecha disponible no puede ser anterior a hoy.";
    }

    if (/hora de inicio debe ser menor/i.test(detalle)) {
      return "La hora de inicio debe ser menor que la hora de fin.";
    }

    return "No se pudo guardar la disponibilidad. Intenta nuevamente.";
  }

  function bloquesValidosParaGuardar() {
    const clavesBloques = new Set();

    return bloquesHorario.map((bloque) => {
      if (!bloque || typeof bloque !== "object") {
        throw new Error("Agrega al menos un horario válido.");
      }

      const fecha = String(bloque.fecha || "").trim();
      const diaFecha = obtenerDiaPorFecha(fecha);
      const dia = normalizarDia(bloque.dia || diaFecha);
      const horaInicio = String(bloque.horaInicio || "").trim();
      const horaFin = String(bloque.horaFin || "").trim();

      if (!fecha || !fechaEsValida(fecha)) {
        throw new Error("Selecciona una fecha disponible.");
      }

      if (fecha < obtenerFechaLocal()) {
        throw new Error("La fecha disponible no puede ser anterior a hoy.");
      }

      if (!dia || dia !== diaFecha || !horaInicio || !horaFin) {
        throw new Error("Agrega al menos un horario válido.");
      }

      if (horaInicio >= horaFin) {
        throw new Error("La hora de inicio debe ser menor que la hora de fin.");
      }

      const claveBloque = `${fecha}|${horaInicio}|${horaFin}`;

      if (clavesBloques.has(claveBloque)) {
        throw new Error("Ya agregaste ese horario.");
      }

      clavesBloques.add(claveBloque);

      return {
        ...bloque,
        fecha,
        dia,
        horaInicio,
        horaFin,
      };
    });
  }

  function formatearHora(hora) {
    if (!hora) return "Hora no indicada";

    const [horas, minutos] = hora.split(":");
    const fecha = new Date();
    fecha.setHours(Number(horas), Number(minutos));

    return fecha.toLocaleTimeString("es-PE", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function ordenarBloques() {
    bloquesHorario.sort((a, b) => {
      if (a.fecha && b.fecha && a.fecha !== b.fecha) {
        return a.fecha.localeCompare(b.fecha);
      }

      const diaA = ordenDias[normalizarDia(a.dia)] || 99;
      const diaB = ordenDias[normalizarDia(b.dia)] || 99;

      if (diaA !== diaB) {
        return diaA - diaB;
      }

      return a.horaInicio.localeCompare(b.horaInicio);
    });
  }

  function limpiarFormulario() {
    if (fechaDisponibilidad) fechaDisponibilidad.value = "";
    if (diaHorario) diaHorario.value = "";
    if (estadoHorario) estadoHorario.value = "true";
    if (horaInicio) horaInicio.value = "";
    if (horaFin) horaFin.value = "";
  }

  function pintarBloques() {
    if (!listaBloquesHorario) return;

    ordenarBloques();

    if (!bloquesHorario.length) {
      listaBloquesHorario.innerHTML = `
        <div class="empty-state">
          Todavía no agregaste horarios disponibles.
        </div>
      `;
      return;
    }

    listaBloquesHorario.innerHTML = bloquesHorario
      .map((bloque, index) => {
        const estadoTexto = bloque.activo ? "Activo" : "Inactivo";
        const estadoClase = bloque.activo ? "activo" : "inactivo";
        const diaNormalizado = normalizarDia(bloque.dia);
        const diaTexto = nombresDias[diaNormalizado] || bloque.dia || "Día";
        const fechaTexto = formatearFecha(bloque.fecha);

        return `
          <article class="bloque-card">
            <div>
              <h3>${fechaTexto ? `${diaTexto} ${fechaTexto}` : diaTexto}</h3>

              <p>
                ${formatearHora(bloque.horaInicio)} - ${formatearHora(bloque.horaFin)}
              </p>

              <div class="bloque-tags">
                ${bloque.fecha ? `<span>${bloque.fecha}</span>` : ""}
                <span>${bloque.horaInicio} - ${bloque.horaFin}</span>
                <span class="${estadoClase}">${estadoTexto}</span>
              </div>
            </div>

            <button class="btn-eliminar" data-index="${index}">
              Eliminar
            </button>
          </article>
        `;
      })
      .join("");
  }

  function existeBloqueRepetido(nuevoBloque) {
    return bloquesHorario.some((bloque) => {
      return (
        bloque.fecha === nuevoBloque.fecha &&
        bloque.horaInicio === nuevoBloque.horaInicio &&
        bloque.horaFin === nuevoBloque.horaFin
      );
    });
  }

  function convertirHoraAMinutos(hora) {
    const [horas, minutos] = String(hora || "00:00").split(":").map(Number);
    return horas * 60 + minutos;
  }

  function bloqueSeSuperpone(nuevoBloque) {
    const nuevoInicio = convertirHoraAMinutos(nuevoBloque.horaInicio);
    const nuevoFin = convertirHoraAMinutos(nuevoBloque.horaFin);

    return bloquesHorario.some((bloque) => {
      if (bloque.fecha || nuevoBloque.fecha) {
        if (bloque.fecha !== nuevoBloque.fecha) return false;
      } else if (normalizarDia(bloque.dia) !== normalizarDia(nuevoBloque.dia)) {
        return false;
      }

      const inicio = convertirHoraAMinutos(bloque.horaInicio);
      const fin = convertirHoraAMinutos(bloque.horaFin);

      return nuevoInicio < fin && nuevoFin > inicio;
    });
  }

  async function cargarDisponibilidad() {
    try {
      mostrarMensaje("Cargando disponibilidad...");

      const disponibilidad = await obtenerDisponibilidadTutorActual();

      bloquesHorario = Array.isArray(disponibilidad.bloques)
        ? disponibilidad.bloques.map((bloque) => ({
            ...bloque,
            dia: bloque.dia || nombresDias[obtenerDiaPorFecha(bloque.fecha)] || "",
            activo: bloque.activo !== false,
          }))
        : [];

      pintarBloques();

      if (bloquesHorario.length) {
        mostrarMensaje(
          `Tienes ${bloquesHorario.length} bloque(s) de horario registrado(s).`,
        );
      } else {
        mostrarMensaje("Aún no tienes horarios registrados.");
      }
    } catch (error) {
      console.error("Error al cargar disponibilidad:", error);
      mostrarMensaje(error.message || "No se pudo cargar tu disponibilidad.");
    }
  }

  async function validarAccesoTutor() {
    observarUsuario(async (usuario) => {
      if (!usuario) {
        window.location.href = "cuenta.html";
        return;
      }

      try {
        mostrarMensaje("Validando acceso del tutor...");

        const tutorActivo = await obtenerTutorActivoActual();

        if (!tutorActivo) {
          window.location.href = "tutor.html";
          return;
        }

        tutorActual = tutorActivo;

        await cargarDisponibilidad();
      } catch (error) {
        console.error("Error al validar tutor:", error);
        window.location.href = "tutor.html";
      }
    });
  }

  if (formBloqueHorario) {
    if (fechaDisponibilidad) {
      fechaDisponibilidad.min = obtenerFechaLocal();
      fechaDisponibilidad.addEventListener("change", sincronizarDiaConFecha);
    }

    formBloqueHorario.addEventListener("submit", (event) => {
      event.preventDefault();

      sincronizarDiaConFecha();

      const fecha = fechaDisponibilidad?.value || "";
      const dia = diaHorario.value;
      const inicio = horaInicio.value;
      const fin = horaFin.value;
      const activo = estadoHorario.value === "true";

      if (!fecha) {
        mostrarMensaje("Selecciona una fecha disponible.", "advertencia");
        return;
      }

      if (!fechaEsValida(fecha)) {
        mostrarMensaje("Selecciona una fecha disponible.", "advertencia");
        return;
      }

      if (fecha < obtenerFechaLocal()) {
        mostrarMensaje(
          "La fecha disponible no puede ser anterior a hoy.",
          "advertencia",
        );
        return;
      }

      if (!dia || !inicio || !fin) {
        mostrarMensaje("Agrega al menos un horario válido.", "advertencia");
        return;
      }

      if (inicio >= fin) {
        mostrarMensaje(
          "La hora de inicio debe ser menor que la hora de fin.",
          "advertencia",
        );
        return;
      }

      if (convertirHoraAMinutos(fin) - convertirHoraAMinutos(inicio) < 30) {
        mostrarMensaje("El bloque debe durar al menos 30 minutos.", "advertencia");
        return;
      }

      const nuevoBloque = {
        fecha,
        dia,
        horaInicio: inicio,
        horaFin: fin,
        activo,
      };

      if (existeBloqueRepetido(nuevoBloque)) {
        mostrarMensaje("Ya agregaste ese horario.", "advertencia");
        return;
      }

      if (bloqueSeSuperpone(nuevoBloque)) {
        mostrarMensaje(
          "Ese horario se cruza con otro bloque del mismo día.",
          "advertencia",
        );
        return;
      }

      bloquesHorario.push(nuevoBloque);

      pintarBloques();
      limpiarFormulario();

      mostrarMensaje(
        "Bloque agregado. No olvides guardar la disponibilidad.",
        "info",
      );
    });
  }

  if (listaBloquesHorario) {
    listaBloquesHorario.addEventListener("click", (event) => {
      const botonEliminar = event.target.closest(".btn-eliminar");

      if (!botonEliminar) return;

      const index = Number(botonEliminar.dataset.index);

      if (Number.isNaN(index)) return;

      bloquesHorario.splice(index, 1);

      pintarBloques();

      mostrarMensaje(
        "Bloque eliminado. Guarda los cambios para actualizar Firebase.",
      );
    });
  }

  if (btnGuardarDisponibilidad) {
    btnGuardarDisponibilidad.addEventListener("click", async () => {
      if (!tutorActual) {
        mostrarMensaje("No se encontró un tutor activo.", "error");
        console.error("No se puede guardar disponibilidad sin tutor activo.");
        return;
      }

      try {
        const bloquesValidos = bloquesValidosParaGuardar();

        if (!bloquesValidos.length) {
          mostrarMensaje("Agrega al menos un horario válido.", "advertencia");
          return;
        }

        btnGuardarDisponibilidad.disabled = true;
        btnGuardarDisponibilidad.textContent = "Guardando...";

        await guardarDisponibilidadTutorActual(bloquesValidos);
        bloquesHorario = bloquesValidos;
        pintarBloques();

        mostrarMensaje("Disponibilidad guardada correctamente.", "exito");
      } catch (error) {
        console.error("Error al guardar disponibilidad:", error);
        mostrarMensaje(obtenerMensajeErrorGuardado(error), "error");
      } finally {
        btnGuardarDisponibilidad.disabled = false;
        btnGuardarDisponibilidad.textContent = "Guardar disponibilidad";
      }
    });
  } else {
    console.error("No se encontró el botón btnGuardarDisponibilidad.");
  }
  validarAccesoTutor();
});

