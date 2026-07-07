import {
  observarUsuario,
  cerrarSesion,
  obtenerPerfilUsuarioActual,
  obtenerMisSesiones,
} from "./firebase-service.js";
import { mostrarAviso } from "./mensajes-ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const tituloBienvenida = document.querySelector("#tituloBienvenida");

  const btnUsuario = document.querySelector("#btnUsuario");
  const menuUsuario = document.querySelector("#menuUsuario");
  const cerrarMenuUsuario = document.querySelector("#cerrarMenuUsuario");
  const btnCerrarSesionPortal = document.querySelector(
    "#btnCerrarSesionPortal",
  );

  const avatarIniciales = document.querySelector("#avatarIniciales");
  const avatarInicialesMenu = document.querySelector("#avatarInicialesMenu");
  const nombreUsuarioTop = document.querySelector("#nombreUsuarioTop");
  const correoUsuarioMenu = document.querySelector("#correoUsuarioMenu");
  const saludoUsuarioMenu = document.querySelector("#saludoUsuarioMenu");

  const btnNotificaciones = document.querySelector("#btnNotificaciones");
  const panelNotificaciones = document.querySelector("#panelNotificaciones");
  const cerrarNotificaciones = document.querySelector("#cerrarNotificaciones");

  const contenedorProximaClase = document.querySelector(
    "#contenedorProximaClase",
  );
  const contenedorClasesHoy = document.querySelector("#contenedorClasesHoy");
  const contenedorClasesSemana = document.querySelector(
    "#contenedorClasesSemana",
  );

  function limpiarTexto(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function obtenerNombreUsuario(usuario, perfil) {
    return (
      perfil?.nombre ||
      perfil?.nombreCompleto ||
      perfil?.nombreUsuario ||
      usuario?.displayName ||
      "estudiante"
    );
  }

  function obtenerIniciales(nombre, correo) {
    const texto = String(nombre || correo || "Usuario").trim();
    const partes = texto.replace("@", " ").split(" ").filter(Boolean);

    const inicial1 = partes[0]?.charAt(0) || "U";
    const inicial2 = partes[1]?.charAt(0) || "";

    return `${inicial1}${inicial2}`.toUpperCase();
  }

  function normalizarEstado(estado) {
    const estadoNormalizado = String(estado || "pendiente")
      .toLowerCase()
      .trim();

    if (estadoNormalizado === "confirmada") return "aceptada";
    if (estadoNormalizado === "confirmado") return "aceptada";
    if (estadoNormalizado === "aceptado") return "aceptada";
    if (estadoNormalizado === "completada") return "realizada";
    if (estadoNormalizado === "completado") return "realizada";

    return estadoNormalizado;
  }

  function formatearEstado(estado) {
    const estadoNormalizado = normalizarEstado(estado).replaceAll("_", " ");
    return (
      estadoNormalizado.charAt(0).toUpperCase() + estadoNormalizado.slice(1)
    );
  }

  function obtenerClaseEstado(estado) {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "aceptada" || estadoNormalizado === "realizada") {
      return "is-ok";
    }

    if (
      estadoNormalizado === "rechazada" ||
      estadoNormalizado === "cancelada"
    ) {
      return "is-danger";
    }

    return "is-pending";
  }

  function obtenerEstadoPago(sesion) {
    return sesion.estadoPago || sesion.pago || "pendiente";
  }

  function obtenerClasePago(estadoPago) {
    const pago = String(estadoPago || "pendiente").toLowerCase();

    if (pago.includes("pagado")) return "is-ok";
    if (pago.includes("rechazado")) return "is-danger";

    return "is-pending";
  }

  function formatearFecha(fecha) {
    if (!fecha || !String(fecha).includes("-")) return "No registrada";

    const [year, mes, dia] = String(fecha).split("-");
    return `${dia}/${mes}/${year}`;
  }

  function obtenerFechaLocalTexto(fecha = new Date()) {
    const year = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${year}-${mes}-${dia}`;
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
    const partesFecha = String(sesion.fecha || "")
      .split("-")
      .map(Number);

    if (partesFecha.length !== 3) return null;

    const [year, month, day] = partesFecha;

    const minutosTotales = convertirHoraAMinutos(sesion.hora);
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    const fechaHora = new Date(year, month - 1, day, horas, minutos, 0, 0);

    if (Number.isNaN(fechaHora.getTime())) return null;

    return fechaHora;
  }

  function estaEnSemanaActual(fechaHora) {
    const hoy = new Date();

    const inicioSemana = new Date(hoy);
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(hoy);
    finSemana.setHours(23, 59, 59, 999);

    const diaSemana = hoy.getDay();
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const diasHastaDomingo = 6 - diasDesdeLunes;

    inicioSemana.setDate(hoy.getDate() - diasDesdeLunes);
    finSemana.setDate(hoy.getDate() + diasHastaDomingo);

    return fechaHora >= inicioSemana && fechaHora <= finSemana;
  }

  function obtenerTutor(sesion) {
    return (
      sesion.tutor ||
      sesion.nombreTutor ||
      sesion.tutorNombre ||
      "Tutor no registrado"
    );
  }

  function obtenerCurso(sesion) {
    return sesion.curso || sesion.nombreCurso || "Tutoría";
  }

  function obtenerEnlaceClase(sesion) {
    const enlace = sesion.enlaceClase || sesion.linkClase || "";

    if (!String(enlace).startsWith("http")) {
      return "";
    }

    return enlace;
  }

  function crearTarjetaClase(sesion, destacada = false) {
    const estado = normalizarEstado(sesion.estado);
    const estadoPago = obtenerEstadoPago(sesion);
    const enlaceClase = obtenerEnlaceClase(sesion);
    const plataformaClase =
      sesion.plataformaClase || sesion.plataforma || "Aún no disponible";

    const claseExtra = destacada ? " tf-agenda-card-destacada" : "";

    const botonClase = enlaceClase
      ? `<a class="tf-agenda-link" href="${limpiarTexto(
          enlaceClase,
        )}" target="_blank" rel="noopener noreferrer">Entrar a clase virtual</a>`
      : `<a class="tf-agenda-link is-secondary" href="sesiones.html">Ver detalle</a>`;

    return `
      <article class="tf-agenda-card${claseExtra}">
        <div>
          <h3>${limpiarTexto(obtenerCurso(sesion))}</h3>

          <p><strong>Tutor:</strong> ${limpiarTexto(obtenerTutor(sesion))}</p>
          <p><strong>Fecha:</strong> ${limpiarTexto(formatearFecha(sesion.fecha))}</p>
          <p><strong>Hora:</strong> ${limpiarTexto(sesion.hora || "No registrada")}</p>
          <p><strong>Modalidad:</strong> ${limpiarTexto(sesion.modalidad || "Virtual")}</p>
          <p><strong>Clase virtual:</strong> ${limpiarTexto(plataformaClase)}</p>

          <div class="tf-agenda-badges">
            <span class="tf-agenda-badge ${obtenerClaseEstado(estado)}">
              Reserva: ${limpiarTexto(formatearEstado(estado))}
            </span>

            <span class="tf-agenda-badge ${obtenerClasePago(estadoPago)}">
              Pago: ${limpiarTexto(formatearEstado(estadoPago))}
            </span>
          </div>
        </div>

        <div class="tf-agenda-actions">
          ${botonClase}
        </div>
      </article>
    `;
  }

  function mostrarVacio(contenedor, mensaje) {
    if (!contenedor) return;

    contenedor.innerHTML = `
      <p class="tf-agenda-empty">${limpiarTexto(mensaje)}</p>
    `;
  }

  function mostrarDatosUsuario(usuario, perfil) {
    const nombre = obtenerNombreUsuario(usuario, perfil);
    const correo = usuario?.email || perfil?.correo || "correo@ejemplo.com";
    const iniciales = obtenerIniciales(nombre, correo);

    if (tituloBienvenida) {
      tituloBienvenida.textContent = `Mi agenda, ${nombre} 📅`;
    }

    if (nombreUsuarioTop) {
      nombreUsuarioTop.textContent = nombre;
    }

    if (correoUsuarioMenu) {
      correoUsuarioMenu.textContent = correo;
    }

    if (saludoUsuarioMenu) {
      saludoUsuarioMenu.textContent = `¡Hola, ${nombre}!`;
    }

    if (avatarIniciales) {
      avatarIniciales.textContent = iniciales;
    }

    if (avatarInicialesMenu) {
      avatarInicialesMenu.textContent = iniciales;
    }
  }

  function mostrarAgenda(sesiones = []) {
    const ahora = new Date();
    const fechaHoy = obtenerFechaLocalTexto();

    const sesionesOrdenadas = sesiones
      .map((sesion) => ({
        ...sesion,
        fechaHora: obtenerFechaHoraSesion(sesion),
      }))
      .filter((sesion) => sesion.fechaHora)
      .sort((a, b) => a.fechaHora - b.fechaHora);

    const proximas = sesionesOrdenadas.filter((sesion) => {
      const estado = normalizarEstado(sesion.estado);

      return (
        sesion.fechaHora >= ahora && ["pendiente", "aceptada"].includes(estado)
      );
    });

    const proxima = proximas[0];

    if (proxima) {
      contenedorProximaClase.innerHTML = crearTarjetaClase(proxima, true);
    } else {
      mostrarVacio(
        contenedorProximaClase,
        "Aún no tienes una próxima clase programada.",
      );
    }

    const clasesHoy = sesionesOrdenadas.filter((sesion) => {
      return String(sesion.fecha) === fechaHoy;
    });

    if (clasesHoy.length > 0) {
      contenedorClasesHoy.innerHTML = clasesHoy
        .map((sesion) => crearTarjetaClase(sesion))
        .join("");
    } else {
      mostrarVacio(
        contenedorClasesHoy,
        "No tienes clases registradas para hoy.",
      );
    }

    const clasesSemana = sesionesOrdenadas.filter((sesion) => {
      return estaEnSemanaActual(sesion.fechaHora);
    });

    if (clasesSemana.length > 0) {
      contenedorClasesSemana.innerHTML = clasesSemana
        .map((sesion) => crearTarjetaClase(sesion))
        .join("");
    } else {
      mostrarVacio(
        contenedorClasesSemana,
        "No tienes clases registradas para esta semana.",
      );
    }
  }

  async function cargarAgenda(usuario) {
    try {
      const perfil = await obtenerPerfilUsuarioActual();
      mostrarDatosUsuario(usuario, perfil);

      const sesiones = await obtenerMisSesiones();
      mostrarAgenda(sesiones);
    } catch (error) {
      console.error(error);
      mostrarDatosUsuario(usuario, null);
      mostrarAgenda([]);
    }
  }

  if (btnUsuario && menuUsuario) {
    btnUsuario.addEventListener("click", () => {
      menuUsuario.classList.toggle("oculto");

      if (panelNotificaciones) {
        panelNotificaciones.classList.add("oculto");
      }
    });
  }

  if (cerrarMenuUsuario && menuUsuario) {
    cerrarMenuUsuario.addEventListener("click", () => {
      menuUsuario.classList.add("oculto");
    });
  }

  if (btnNotificaciones && panelNotificaciones) {
    btnNotificaciones.addEventListener("click", () => {
      panelNotificaciones.classList.toggle("oculto");

      if (menuUsuario) {
        menuUsuario.classList.add("oculto");
      }
    });
  }

  if (cerrarNotificaciones && panelNotificaciones) {
    cerrarNotificaciones.addEventListener("click", () => {
      panelNotificaciones.classList.add("oculto");
    });
  }

  document.addEventListener("click", (evento) => {
    if (
      menuUsuario &&
      btnUsuario &&
      !menuUsuario.contains(evento.target) &&
      !btnUsuario.contains(evento.target)
    ) {
      menuUsuario.classList.add("oculto");
    }

    if (
      panelNotificaciones &&
      btnNotificaciones &&
      !panelNotificaciones.contains(evento.target) &&
      !btnNotificaciones.contains(evento.target)
    ) {
      panelNotificaciones.classList.add("oculto");
    }
  });

  if (btnCerrarSesionPortal) {
    btnCerrarSesionPortal.addEventListener("click", async () => {
      try {
        await cerrarSesion();
        window.location.href = "../index.html";
      } catch (error) {
        console.error(error);
        mostrarAviso("No se pudo cerrar sesión.", "error");
      }
    });
  }

  observarUsuario((usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    cargarAgenda(usuario);
  });
});
