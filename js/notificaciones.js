import {
  observarUsuario,
  cerrarSesion,
  obtenerPerfilUsuarioActual,
  obtenerMisSesiones,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const tituloBienvenida = document.querySelector("#tituloBienvenida");
  const avatarIniciales = document.querySelector("#avatarIniciales");
  const avatarInicialesMenu = document.querySelector("#avatarInicialesMenu");
  const saludoUsuarioMenu = document.querySelector("#saludoUsuarioMenu");
  const correoUsuarioMenu = document.querySelector("#correoUsuarioMenu");

  const btnUsuario = document.querySelector("#btnUsuario");
  const menuUsuario = document.querySelector("#menuUsuario");
  const btnCerrarSesionPortal = document.querySelector(
    "#btnCerrarSesionPortal",
  );

  const estadoNotificaciones = document.querySelector("#estadoNotificaciones");
  const listaNotificaciones = document.querySelector("#listaNotificaciones");
  const contadorNotificaciones = document.getElementById(
    "contadorNotificaciones",
  );

  function limpiarTexto(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function obtenerIniciales(nombre, correo) {
    const texto = String(nombre || correo || "Estudiante").trim();
    const partes = texto.replace("@", " ").split(" ").filter(Boolean);

    const inicial1 = partes[0]?.charAt(0) || "E";
    const inicial2 = partes[1]?.charAt(0) || "";

    return `${inicial1}${inicial2}`.toUpperCase();
  }

  function obtenerFechaLocal() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatearFecha(fecha) {
    if (!fecha) return "Fecha pendiente";

    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  }

  function mostrarEstado(mensaje) {
    if (estadoNotificaciones) {
      estadoNotificaciones.textContent = mensaje;
    }
  }

  async function cargarUsuario(usuario) {
    try {
      const perfil = await obtenerPerfilUsuarioActual();

      const nombre =
        perfil?.nombre ||
        perfil?.nombreCompleto ||
        usuario?.displayName ||
        "Estudiante";

      const correo = usuario?.email || perfil?.correo || "correo@ejemplo.com";
      const iniciales = obtenerIniciales(nombre, correo);

      if (tituloBienvenida) {
        tituloBienvenida.textContent = `Tus avisos importantes, ${nombre}`;
      }

      if (avatarIniciales) avatarIniciales.textContent = iniciales;
      if (avatarInicialesMenu) avatarInicialesMenu.textContent = iniciales;
      if (saludoUsuarioMenu)
        saludoUsuarioMenu.textContent = `¡Hola, ${nombre}!`;
      if (correoUsuarioMenu) correoUsuarioMenu.textContent = correo;
    } catch (error) {
      console.error("Error al cargar usuario:", error);
    }
  }

  function actualizarContadorNotificaciones(notificaciones) {
    if (!contadorNotificaciones) return;

    contadorNotificaciones.textContent = notificaciones.length
      ? String(notificaciones.length)
      : "0";
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

  function obtenerFechaOrdenSesion(sesion) {
    const camposOrden = [
      "pagoActualizadoEn",
      "actualizadoEn",
      "pagoRegistradoEn",
      "pagoConfirmadoEn",
      "pagoRechazadoEn",
      "creadoEn",
      "creado",
      "creadoEnTimestamp",
      "fechaCreacion",
      "creadoEl",
      "timestamp",
    ];

    for (const campo of camposOrden) {
      const tiempo = obtenerMilisegundosCampoTemporal(sesion[campo]);

      if (tiempo) return tiempo;
    }

    return 0;
  }

  function obtenerClaveNotificacionesLeidas() {
    const usuarioKey =
      window.__tfUsuarioNotificacionesKey || "usuario-sin-identificar";

    return `tfNotificacionesLeidas:${usuarioKey}`;
  }

  function obtenerIdsNotificacionesLeidas() {
    try {
      return new Set(
        JSON.parse(localStorage.getItem(obtenerClaveNotificacionesLeidas()) || "[]"),
      );
    } catch (error) {
      return new Set();
    }
  }

  function guardarIdsNotificacionesLeidas(idsLeidos) {
    localStorage.setItem(
      obtenerClaveNotificacionesLeidas(),
      JSON.stringify([...idsLeidos]),
    );
  }

  function ordenarNotificaciones(notificaciones) {
    return [...notificaciones].sort((a, b) => {
      if (a.fechaOrden !== b.fechaOrden) {
        return b.fechaOrden - a.fechaOrden;
      }

      return a.prioridad - b.prioridad;
    });
  }

  function filtrarNotificacionesLeidas(notificaciones) {
    const idsLeidos = obtenerIdsNotificacionesLeidas();

    return notificaciones.filter((notificacion) => {
      return !idsLeidos.has(notificacion.id);
    });
  }

  function crearNotificacionesOrdenadasDesdeSesiones(sesiones) {
    const hoy = obtenerFechaLocal();
    const notificaciones = [];

    sesiones.forEach((sesion) => {
      const idSesion =
        sesion.id || `${sesion.fecha || "sin-fecha"}-${sesion.curso || "curso"}`;
      const tutor = sesion.tutor || sesion.nombreTutor || "tu tutor";
      const curso = sesion.curso || "tu curso";
      const fecha = sesion.fecha || "";
      const hora = sesion.hora || "hora pendiente";
      const fechaOrden = obtenerFechaOrdenSesion(sesion);
      const estado = String(sesion.estado || "pendiente").toLowerCase().trim();
      const estadoPago = String(sesion.estadoPago || "pendiente")
        .toLowerCase()
        .trim();
      const estadoClase = String(sesion.estadoClase || "pendiente")
        .toLowerCase()
        .trim();
      const enlaceClase = String(sesion.enlaceClase || "").trim();
      const reservaFinalizada =
        estado === "realizada" ||
        estado === "cancelada" ||
        estado === "rechazada";
      const claseLista = estadoClase === "programada" || Boolean(enlaceClase);

      function agregarNotificacion(sufijo, datos) {
        notificaciones.push({
          id: `${idSesion}-${sufijo}`,
          fechaOrden,
          ...datos,
        });
      }

      if (estadoPago === "rechazado") {
        agregarNotificacion("pago-rechazado", {
          tipo: "pago",
          prioridad: 1,
          icono: "⚠️",
          titulo: "Tu pago fue rechazado",
          detalle: `Revisa el motivo y vuelve a registrar el pago de ${curso}.`,
        });
      } else if (estadoPago === "confirmado") {
        agregarNotificacion("pago-confirmado", {
          tipo: "pago",
          prioridad: 2,
          icono: "✅",
          titulo: "Tu pago fue confirmado",
          detalle: `El tutor confirmó el pago de tu tutoría de ${curso}.`,
        });
      } else if (estadoPago === "en_revision") {
        agregarNotificacion("pago-en-revision", {
          tipo: "pago",
          prioridad: 3,
          icono: "🧾",
          titulo: "Pago enviado para revisión",
          detalle: `Tu pago de ${curso} está pendiente de confirmación del tutor.`,
        });
      } else if (estadoPago === "pendiente" && !reservaFinalizada) {
        agregarNotificacion("pago-pendiente", {
          tipo: "pago",
          prioridad: 6,
          icono: "💳",
          titulo: "Pago pendiente",
          detalle: `Aún falta registrar el pago de tu tutoría de ${curso}.`,
        });
      }

      if (claseLista && !reservaFinalizada) {
        agregarNotificacion("clase-enlace", {
          tipo: "confirmada",
          prioridad: 4,
          icono: "🔗",
          titulo: "Tu clase virtual ya tiene enlace",
          detalle: `${curso} con ${tutor} ya tiene enlace disponible para ingresar.`,
        });
      } else if (estadoClase === "pendiente" && !reservaFinalizada) {
        agregarNotificacion("clase-pendiente", {
          tipo: "clase",
          prioridad: 7,
          icono: "💻",
          titulo: "Clase virtual pendiente",
          detalle: `El enlace de la clase con ${tutor} todavía no fue asignado.`,
        });
      }

      if ((estado === "aceptada" || estado === "confirmada") && !reservaFinalizada) {
        agregarNotificacion("reserva-confirmada", {
          tipo: "confirmada",
          prioridad: 5,
          icono: "✅",
          titulo: "Tu tutoría fue confirmada",
          detalle: `${curso} con ${tutor} está confirmada para el ${formatearFecha(fecha)}.`,
        });
      } else if (estado === "pendiente") {
        agregarNotificacion("reserva-pendiente", {
          tipo: "pendiente",
          prioridad: 8,
          icono: "⏳",
          titulo: "Tu reserva está pendiente",
          detalle: `${curso} con ${tutor} para el ${formatearFecha(fecha)}.`,
        });
      }

      if (fecha === hoy && !reservaFinalizada) {
        agregarNotificacion("clase-hoy", {
          tipo: "hoy",
          prioridad: 4,
          icono: "📅",
          titulo: "Tienes una clase programada para hoy",
          detalle: `${curso} con ${tutor} a las ${hora}.`,
        });
      }
    });

    return filtrarNotificacionesLeidas(ordenarNotificaciones(notificaciones));
  }

  function pintarNotificaciones(notificaciones) {
    if (!listaNotificaciones) return;

    if (!notificaciones.length) {
      listaNotificaciones.innerHTML = `
        <div class="tf-empty-state">
          <h3>No tienes notificaciones nuevas</h3>
          <p>Cuando tengas reservas, pagos o clases pendientes, aparecerán aquí.</p>
        </div>
      `;
      return;
    }

    listaNotificaciones.innerHTML = notificaciones
      .map((notificacion) => {
        return `
          <article
            class="tf-notification-card tf-notification-${limpiarTexto(notificacion.tipo)}"
            data-notificacion-id="${limpiarTexto(notificacion.id)}"
          >
            <div class="tf-notification-icon">
              ${limpiarTexto(notificacion.icono)}
            </div>

            <div class="tf-notification-body">
              <h3>${limpiarTexto(notificacion.titulo)}</h3>
              <p>${limpiarTexto(notificacion.detalle)}</p>
            </div>

            <button
              type="button"
              class="tf-notification-close"
              data-marcar-leida="${limpiarTexto(notificacion.id)}"
              aria-label="Ocultar notificación"
              title="Ocultar notificación"
            >
              ×
            </button>
          </article>
        `;
      })
      .join("");
  }

  async function cargarNotificaciones() {
    try {
      mostrarEstado("Cargando notificaciones...");

      const sesiones = await obtenerMisSesiones();
      const notificaciones = crearNotificacionesOrdenadasDesdeSesiones(sesiones);

      actualizarContadorNotificaciones(notificaciones);
      pintarNotificaciones(notificaciones);

      if (notificaciones.length) {
        mostrarEstado(
          `${notificaciones.length} notificación(es) encontrada(s).`,
        );
      } else {
        mostrarEstado("");
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
      mostrarEstado("No se pudieron cargar las notificaciones.");
    }
  }

  listaNotificaciones?.addEventListener("click", (event) => {
    const boton = event.target.closest("[data-marcar-leida]");

    if (!boton) return;

    const notificacionId = boton.dataset.marcarLeida;
    const idsLeidos = obtenerIdsNotificacionesLeidas();

    idsLeidos.add(notificacionId);
    guardarIdsNotificacionesLeidas(idsLeidos);

    const tarjeta = boton.closest(".tf-notification-card");
    tarjeta?.remove();

    const restantes = listaNotificaciones.querySelectorAll(
      ".tf-notification-card",
    );

    actualizarContadorNotificaciones([...restantes]);

    if (!restantes.length) {
      pintarNotificaciones([]);
      mostrarEstado("");
    } else {
      mostrarEstado(`${restantes.length} notificación(es) encontrada(s).`);
    }
  });

  btnUsuario?.addEventListener("click", () => {
    menuUsuario?.classList.toggle("oculto");
  });

  document.addEventListener("click", (evento) => {
    if (
      menuUsuario &&
      btnUsuario &&
      !menuUsuario.contains(evento.target) &&
      !btnUsuario.contains(evento.target)
    ) {
      menuUsuario.classList.add("oculto");
    }
  });

  btnCerrarSesionPortal?.addEventListener("click", async () => {
    try {
      await cerrarSesion();
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar sesión.");
    }
  });

  observarUsuario(async (usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    window.__tfUsuarioNotificacionesKey = usuario.uid || usuario.email || "usuario";

    await cargarUsuario(usuario);
    await cargarNotificaciones();
  });
});

