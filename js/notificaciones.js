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

  function crearNotificacionesDesdeSesiones(sesiones) {
    const hoy = obtenerFechaLocal();
    const notificaciones = [];

    sesiones.forEach((sesion) => {
      const tutor = sesion.tutor || sesion.nombreTutor || "tu tutor";
      const curso = sesion.curso || "tu curso";
      const fecha = sesion.fecha || "";
      const hora = sesion.hora || "hora pendiente";

      const estado = sesion.estado || "pendiente";
      const estadoPago = sesion.estadoPago || "pendiente";
      const estadoClase = sesion.estadoClase || "pendiente";
      const enlaceClase = sesion.enlaceClase || "";

      if (fecha === hoy && estado !== "realizada" && estado !== "cancelada") {
        notificaciones.push({
          tipo: "hoy",
          icono: "📅",
          titulo: "Tienes una clase programada para hoy",
          detalle: `${curso} con ${tutor} a las ${hora}.`,
        });
      }

      if (estado === "pendiente") {
        notificaciones.push({
          tipo: "pendiente",
          icono: "⏳",
          titulo: "Tu reserva está pendiente",
          detalle: `${curso} con ${tutor} para el ${formatearFecha(fecha)}.`,
        });
      }

      if (estadoPago === "pendiente") {
        notificaciones.push({
          tipo: "pago",
          icono: "💳",
          titulo: "Pago pendiente",
          detalle: `Aún falta registrar el pago de tu tutoría de ${curso}.`,
        });
      }

      if (estadoClase === "pendiente" && !enlaceClase) {
        notificaciones.push({
          tipo: "clase",
          icono: "💻",
          titulo: "Clase virtual pendiente",
          detalle: `El enlace de la clase con ${tutor} todavía no fue asignado.`,
        });
      }

      if (estado === "confirmada") {
        notificaciones.push({
          tipo: "confirmada",
          icono: "✅",
          titulo: "Tu tutoría fue confirmada",
          detalle: `${curso} con ${tutor} está confirmada para el ${formatearFecha(fecha)}.`,
        });
      }
    });

    return notificaciones;
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
          <article class="tf-notification-card tf-notification-${limpiarTexto(notificacion.tipo)}">
            <div class="tf-notification-icon">
              ${limpiarTexto(notificacion.icono)}
            </div>

            <div>
              <h3>${limpiarTexto(notificacion.titulo)}</h3>
              <p>${limpiarTexto(notificacion.detalle)}</p>
            </div>
          </article>
        `;
      })
      .join("");
  }

  async function cargarNotificaciones() {
    try {
      mostrarEstado("Cargando notificaciones...");

      const sesiones = await obtenerMisSesiones();
      const notificaciones = crearNotificacionesDesdeSesiones(sesiones);

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
      window.location.href = "cuenta.html";
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

    await cargarUsuario(usuario);
    await cargarNotificaciones();
  });
});
