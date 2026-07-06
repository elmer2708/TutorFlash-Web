import {
  observarUsuario,
  cerrarSesion,
  obtenerPostulacionesTutores,
  aprobarPostulacionTutor,
  rechazarPostulacionTutor,
} from "./firebase-service.js";

/*
  Usa aquí los correos reales permitidos como administrador.
*/
const ADMIN_EMAILS = ["admin@gmail.com"].map((correo) =>
  correo.toLowerCase().trim(),
);

document.addEventListener("DOMContentLoaded", () => {
  const adminMensaje = document.getElementById("adminMensaje");
  const contenedorPostulaciones = document.getElementById(
    "contenedorPostulaciones",
  );
  const btnCerrarSesionAdmin = document.getElementById("btnCerrarSesionAdmin");
  const estadoVacio = document.getElementById("estadoVacio");
  const estadoVacioTitulo = document.getElementById("estadoVacioTitulo");
  const estadoVacioTexto = document.getElementById("estadoVacioTexto");
  const botonesFiltro = document.querySelectorAll("[data-filtro-admin]");

  const resumenTotal = document.getElementById("resumenTotal");
  const resumenPendientes = document.getElementById("resumenPendientes");
  const resumenAprobadas = document.getElementById("resumenAprobadas");
  const resumenRechazadas = document.getElementById("resumenRechazadas");
  const estadoPanelBadge = document.getElementById("estadoPanelBadge");
  const ultimaActualizacion = document.getElementById("ultimaActualizacion");

  let postulacionesActuales = [];
  let accionEnProceso = false;
  let filtroActual = "todos";

  function mostrarMensaje(texto, tipo = "info") {
    if (!adminMensaje) return;

    adminMensaje.textContent = texto;
    adminMensaje.className = `admin-mensaje ${tipo}`;
  }

  function ocultarMensaje() {
    if (!adminMensaje) return;
    adminMensaje.textContent = "";
    adminMensaje.className = "admin-mensaje oculto";
  }

  function escaparHtml(texto) {
    return String(texto || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizarEstado(estado) {
    return String(estado || "pendiente")
      .toLowerCase()
      .trim();
  }

  function obtenerClaseEstado(estado) {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "aprobado") return "estado-aprobado";
    if (estadoNormalizado === "rechazado") return "estado-rechazado";

    return "estado-pendiente";
  }

  function obtenerTextoEstado(estado) {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "aprobado") return "Aprobado";
    if (estadoNormalizado === "rechazado") return "Rechazado";

    return "Pendiente";
  }

  function formatearFecha(fecha) {
    if (!fecha) return "No registrada";

    try {
      if (typeof fecha.toDate === "function") {
        return fecha.toDate().toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      return new Date(fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "No registrada";
    }
  }

  function actualizarUltimaActualizacion() {
    if (!ultimaActualizacion) return;

    const ahora = new Date();

    ultimaActualizacion.textContent = `Última actualización: ${ahora.toLocaleTimeString(
      "es-PE",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;
  }

  function actualizarResumen(postulaciones) {
    const total = postulaciones.length;
    const pendientes = postulaciones.filter(
      (item) => normalizarEstado(item.estado) === "pendiente",
    ).length;
    const aprobadas = postulaciones.filter(
      (item) => normalizarEstado(item.estado) === "aprobado",
    ).length;
    const rechazadas = postulaciones.filter(
      (item) => normalizarEstado(item.estado) === "rechazado",
    ).length;

    if (resumenTotal) resumenTotal.textContent = total;
    if (resumenPendientes) resumenPendientes.textContent = pendientes;
    if (resumenAprobadas) resumenAprobadas.textContent = aprobadas;
    if (resumenRechazadas) resumenRechazadas.textContent = rechazadas;

    if (estadoPanelBadge) {
      if (pendientes > 0) {
        estadoPanelBadge.textContent = `${pendientes} pendiente(s) por revisar`;
      } else if (total > 0) {
        estadoPanelBadge.textContent = "Todo revisado";
      } else {
        estadoPanelBadge.textContent = "Sin postulaciones";
      }
    }

    actualizarUltimaActualizacion();
  }

  function ordenarPostulaciones(postulaciones) {
    return [...postulaciones].sort((a, b) => {
      const estadoA = normalizarEstado(a.estado);
      const estadoB = normalizarEstado(b.estado);

      if (estadoA === "pendiente" && estadoB !== "pendiente") return -1;
      if (estadoA !== "pendiente" && estadoB === "pendiente") return 1;

      const fechaA = a.fechaPostulacion?.toDate
        ? a.fechaPostulacion.toDate().getTime()
        : 0;
      const fechaB = b.fechaPostulacion?.toDate
        ? b.fechaPostulacion.toDate().getTime()
        : 0;

      return fechaB - fechaA;
    });
  }

  function obtenerTextoEstadoVacio(totalPostulaciones) {
    if (totalPostulaciones === 0) {
      return {
        titulo: "No hay postulaciones todavía",
        texto:
          "Cuando un usuario se postule como tutor, su solicitud aparecerá en esta sección para ser revisada.",
      };
    }

    if (filtroActual === "pendiente") {
      return {
        titulo: "No hay postulaciones pendientes",
        texto:
          "Por ahora no hay solicitudes nuevas por revisar. Las postulaciones aprobadas o rechazadas siguen disponibles en sus filtros correspondientes.",
      };
    }

    if (filtroActual === "aprobado") {
      return {
        titulo: "No hay postulaciones aprobadas",
        texto:
          "Todavía no hay tutores aprobados en este filtro. Cuando apruebes una solicitud, aparecerá aquí.",
      };
    }

    if (filtroActual === "rechazado") {
      return {
        titulo: "No hay postulaciones rechazadas",
        texto:
          "Todavía no hay solicitudes rechazadas. Si rechazas una postulación, se mostrará en esta sección.",
      };
    }

    return {
      titulo: "No hay resultados para mostrar",
      texto:
        "Prueba con otro filtro para revisar las postulaciones disponibles.",
    };
  }

  function mostrarEstadoVacio(mostrar, totalPostulaciones = 0) {
    if (!estadoVacio || !contenedorPostulaciones) return;

    if (mostrar) {
      const mensaje = obtenerTextoEstadoVacio(totalPostulaciones);

      if (estadoVacioTitulo) {
        estadoVacioTitulo.textContent = mensaje.titulo;
      }

      if (estadoVacioTexto) {
        estadoVacioTexto.textContent = mensaje.texto;
      }

      estadoVacio.classList.remove("oculto");
      contenedorPostulaciones.innerHTML = "";
    } else {
      estadoVacio.classList.add("oculto");
    }
  }
  function filtrarPostulaciones(postulaciones) {
    if (filtroActual === "todos") {
      return postulaciones;
    }

    return postulaciones.filter(
      (postulacion) => normalizarEstado(postulacion.estado) === filtroActual,
    );
  }

  function actualizarBotonesFiltro() {
    botonesFiltro.forEach((boton) => {
      const filtro = boton.dataset.filtroAdmin;

      if (filtro === filtroActual) {
        boton.classList.add("activo");
      } else {
        boton.classList.remove("activo");
      }
    });
  }

  function pintarPostulaciones(postulaciones) {
    if (!contenedorPostulaciones) return;

    actualizarResumen(postulaciones);

    const postulacionesFiltradas = filtrarPostulaciones(postulaciones);

    if (postulacionesFiltradas.length === 0) {
      mostrarEstadoVacio(true, postulaciones.length);
      ocultarMensaje();
      return;
    }

    mostrarEstadoVacio(false);

    const postulacionesOrdenadas = ordenarPostulaciones(postulacionesFiltradas);

    contenedorPostulaciones.innerHTML = postulacionesOrdenadas
      .map((postulacion) => {
        const estado = normalizarEstado(postulacion.estado);
        const estadoTexto = obtenerTextoEstado(estado);
        const claseEstado = obtenerClaseEstado(estado);
        const estaPendiente = estado === "pendiente";
        const botonesDeshabilitados = estaPendiente ? "" : "disabled";

        return `
          <article class="postulacion-card" data-id="${escaparHtml(postulacion.id)}">
            <div class="card-top">
              <div>
                <p class="postulacion-label">Tutor postulante</p>
                <h2>${escaparHtml(postulacion.nombre || "Tutor sin nombre")}</h2>
              </div>

              <span class="estado-postulacion ${claseEstado}">
                ${estadoTexto}
              </span>
            </div>

            <div class="postulacion-meta">
              <p class="postulacion-dato">
                <strong>Correo</strong>
                ${escaparHtml(postulacion.correo || postulacion.correoUsuario || "No registrado")}
              </p>

              <p class="postulacion-dato">
                <strong>Teléfono</strong>
                ${escaparHtml(postulacion.telefono || "No registrado")}
              </p>

              <p class="postulacion-dato">
                <strong>Cursos</strong>
                ${escaparHtml(postulacion.cursos || "No registrado")}
              </p>

              <p class="postulacion-dato">
                <strong>Nivel</strong>
                ${escaparHtml(postulacion.nivel || "No registrado")}
              </p>

              <p class="postulacion-dato">
                <strong>Disponibilidad</strong>
                ${escaparHtml(postulacion.disponibilidad || "No registrada")}
              </p>

              <p class="postulacion-dato">
                <strong>Experiencia</strong>
                ${escaparHtml(postulacion.experiencia || "No registrada")}
              </p>
            </div>

            <div class="postulacion-footer">
              <div class="postulacion-fecha">
                Fecha de postulación: ${escaparHtml(formatearFecha(postulacion.fechaPostulacion))}
              </div>

              <div class="postulacion-acciones">
                <button
                  type="button"
                  class="btn-aprobar"
                  data-id="${escaparHtml(postulacion.id)}"
                  ${botonesDeshabilitados}
                >
                  Aprobar tutor
                </button>

                <button
                  type="button"
                  class="btn-rechazar"
                  data-id="${escaparHtml(postulacion.id)}"
                  ${botonesDeshabilitados}
                >
                  Rechazar
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  async function cargarPostulaciones() {
    try {
      mostrarMensaje("Cargando postulaciones...", "info");

      postulacionesActuales = await obtenerPostulacionesTutores();

      pintarPostulaciones(postulacionesActuales);

      if (postulacionesActuales.length > 0) {
        ocultarMensaje();
      }
    } catch (error) {
      console.error("Error al cargar postulaciones:", error);
      mostrarMensaje("No se pudieron cargar las postulaciones.", "error");
    }
  }

  function buscarPostulacionPorId(id) {
    return postulacionesActuales.find((item) => item.id === id);
  }

  function bloquearBotonesTarjeta(id, claseBoton, textoBoton) {
    const tarjeta = contenedorPostulaciones?.querySelector(
      `.postulacion-card[data-id="${CSS.escape(id)}"]`,
    );

    if (!tarjeta) return;

    const botones = tarjeta.querySelectorAll("button");

    botones.forEach((boton) => {
      boton.disabled = true;
    });

    const botonActivo = tarjeta.querySelector(
      `.${claseBoton}[data-id="${CSS.escape(id)}"]`,
    );

    if (botonActivo) {
      botonActivo.textContent = textoBoton;
    }
  }

  async function aprobarPostulacion(id) {
    const postulacion = buscarPostulacionPorId(id);

    if (!postulacion) {
      mostrarMensaje("No se encontró la postulación seleccionada.", "error");
      return;
    }

    if (normalizarEstado(postulacion.estado) !== "pendiente") {
      mostrarMensaje("Esta postulación ya fue revisada.", "error");
      return;
    }

    const confirmar = confirm(
      `¿Seguro que deseas aprobar a ${postulacion.nombre || "este tutor"}?`,
    );

    if (!confirmar) return;

    try {
      accionEnProceso = true;
      bloquearBotonesTarjeta(id, "btn-aprobar", "Aprobando...");
      mostrarMensaje("Aprobando postulación...", "info");

      await aprobarPostulacionTutor(postulacion);

      mostrarMensaje(
        "Postulación aprobada correctamente. El tutor ya fue habilitado.",
        "exito",
      );

      await cargarPostulaciones();
    } catch (error) {
      console.error("Error al aprobar postulación:", error);
      mostrarMensaje("No se pudo aprobar la postulación.", "error");
      await cargarPostulaciones();
    } finally {
      accionEnProceso = false;
    }
  }

  async function rechazarPostulacion(id) {
    const postulacion = buscarPostulacionPorId(id);

    if (!postulacion) {
      mostrarMensaje("No se encontró la postulación seleccionada.", "error");
      return;
    }

    if (normalizarEstado(postulacion.estado) !== "pendiente") {
      mostrarMensaje("Esta postulación ya fue revisada.", "error");
      return;
    }

    const confirmar = confirm(
      `¿Seguro que deseas rechazar a ${postulacion.nombre || "este tutor"}?`,
    );

    if (!confirmar) return;

    try {
      accionEnProceso = true;
      bloquearBotonesTarjeta(id, "btn-rechazar", "Rechazando...");
      mostrarMensaje("Rechazando postulación...", "info");

      await rechazarPostulacionTutor(id);

      mostrarMensaje("Postulación rechazada correctamente.", "exito");

      await cargarPostulaciones();
    } catch (error) {
      console.error("Error al rechazar postulación:", error);
      mostrarMensaje("No se pudo rechazar la postulación.", "error");
      await cargarPostulaciones();
    } finally {
      accionEnProceso = false;
    }
  }

  botonesFiltro.forEach((boton) => {
    boton.addEventListener("click", () => {
      filtroActual = boton.dataset.filtroAdmin || "todos";
      actualizarBotonesFiltro();
      pintarPostulaciones(postulacionesActuales);
    });
  });
  if (contenedorPostulaciones) {
    contenedorPostulaciones.addEventListener("click", async (event) => {
      const boton = event.target.closest("button");

      if (!boton || accionEnProceso) return;

      const id = boton.dataset.id;

      if (!id) return;

      if (boton.classList.contains("btn-aprobar")) {
        await aprobarPostulacion(id);
      }

      if (boton.classList.contains("btn-rechazar")) {
        await rechazarPostulacion(id);
      }
    });
  }

  if (btnCerrarSesionAdmin) {
    btnCerrarSesionAdmin.addEventListener("click", async () => {
      try {
        await cerrarSesion();
        window.location.href = "../index.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        mostrarMensaje("No se pudo cerrar sesión.", "error");
      }
    });
  }

  observarUsuario((usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    const correoUsuario = String(usuario.email || "")
      .toLowerCase()
      .trim();

    if (!ADMIN_EMAILS.includes(correoUsuario)) {
      if (contenedorPostulaciones) {
        contenedorPostulaciones.innerHTML = "";
      }

      mostrarMensaje(
        "No tienes permiso para acceder a este panel. Inicia sesión con el correo administrador.",
        "error",
      );

      return;
    }

    cargarPostulaciones();
  });
});
