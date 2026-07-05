import {
  observarUsuario,
  cerrarSesion,
  obtenerTutorActivoActual,
  obtenerDisponibilidadTutorActual,
  guardarDisponibilidadTutorActual,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const formBloqueHorario = document.getElementById("formBloqueHorario");
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

  function mostrarMensaje(texto) {
    if (mensajeDisponibilidad) {
      mensajeDisponibilidad.textContent = texto;
    }
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
      const diaA = ordenDias[a.dia] || 99;
      const diaB = ordenDias[b.dia] || 99;

      if (diaA !== diaB) {
        return diaA - diaB;
      }

      return a.horaInicio.localeCompare(b.horaInicio);
    });
  }

  function limpiarFormulario() {
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

        return `
          <article class="bloque-card">
            <div>
              <h3>${nombresDias[bloque.dia] || bloque.dia}</h3>

              <p>
                ${formatearHora(bloque.horaInicio)} - ${formatearHora(bloque.horaFin)}
              </p>

              <div class="bloque-tags">
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
        bloque.dia === nuevoBloque.dia &&
        bloque.horaInicio === nuevoBloque.horaInicio &&
        bloque.horaFin === nuevoBloque.horaFin
      );
    });
  }

  async function cargarDisponibilidad() {
    try {
      mostrarMensaje("Cargando disponibilidad...");

      const disponibilidad = await obtenerDisponibilidadTutorActual();

      bloquesHorario = Array.isArray(disponibilidad.bloques)
        ? disponibilidad.bloques
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
      mostrarMensaje("No se pudo cargar tu disponibilidad.");
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
          window.location.href = "app.html";
          return;
        }

        tutorActual = tutorActivo;

        await cargarDisponibilidad();
      } catch (error) {
        console.error("Error al validar tutor:", error);
        window.location.href = "app.html";
      }
    });
  }

  if (formBloqueHorario) {
    formBloqueHorario.addEventListener("submit", (event) => {
      event.preventDefault();

      const dia = diaHorario.value;
      const inicio = horaInicio.value;
      const fin = horaFin.value;
      const activo = estadoHorario.value === "true";

      if (!dia || !inicio || !fin) {
        mostrarMensaje("Completa el día, la hora de inicio y la hora de fin.");
        return;
      }

      if (inicio >= fin) {
        mostrarMensaje("La hora de inicio debe ser menor que la hora de fin.");
        return;
      }

      const nuevoBloque = {
        dia,
        horaInicio: inicio,
        horaFin: fin,
        activo,
      };

      if (existeBloqueRepetido(nuevoBloque)) {
        mostrarMensaje("Ese bloque de horario ya fue agregado.");
        return;
      }

      bloquesHorario.push(nuevoBloque);

      pintarBloques();
      limpiarFormulario();

      mostrarMensaje("Bloque agregado. No olvides guardar la disponibilidad.");
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
        mostrarMensaje("No se encontró un tutor activo.");
        return;
      }

      try {
        btnGuardarDisponibilidad.disabled = true;
        btnGuardarDisponibilidad.textContent = "Guardando...";

        await guardarDisponibilidadTutorActual(bloquesHorario);

        mostrarMensaje("Disponibilidad guardada correctamente.");
      } catch (error) {
        console.error("Error al guardar disponibilidad:", error);
        mostrarMensaje("No se pudo guardar la disponibilidad.");
      } finally {
        btnGuardarDisponibilidad.disabled = false;
        btnGuardarDisponibilidad.textContent = "Guardar disponibilidad";
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
        mostrarMensaje("No se pudo cerrar sesión.");
      }
    });
  }

  validarAccesoTutor();
});
