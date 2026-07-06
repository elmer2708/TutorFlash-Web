import {
  observarUsuario,
  cerrarSesion,
  obtenerPerfilUsuarioActual,
  obtenerMisSesiones,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnUsuario = document.querySelector("#btnUsuario");
  const menuUsuario = document.querySelector("#menuUsuario");
  const cerrarMenuUsuario = document.querySelector("#cerrarMenuUsuario");
  const btnCerrarSesionPortal = document.querySelector(
    "#btnCerrarSesionPortal",
  );

  const tituloBienvenida = document.querySelector("#tituloBienvenida");
  const avatarIniciales = document.querySelector("#avatarIniciales");
  const avatarInicialesMenu = document.querySelector("#avatarInicialesMenu");
  const nombreUsuarioTop = document.querySelector("#nombreUsuarioTop");
  const correoUsuarioMenu = document.querySelector("#correoUsuarioMenu");
  const saludoUsuarioMenu = document.querySelector("#saludoUsuarioMenu");

  const btnNotificaciones = document.querySelector("#btnNotificaciones");
  const panelNotificaciones = document.querySelector("#panelNotificaciones");
  const cerrarNotificaciones = document.querySelector("#cerrarNotificaciones");

  const totalPendientes = document.querySelector("#totalPendientes");
  const totalAceptadas = document.querySelector("#totalAceptadas");
  const totalRealizadas = document.querySelector("#totalRealizadas");
  const totalInvertido = document.querySelector("#totalInvertido");

  const proximaCurso = document.querySelector("#proximaCurso");
  const proximaTutor = document.querySelector("#proximaTutor");
  const proximaFecha = document.querySelector("#proximaFecha");
  const proximaHora = document.querySelector("#proximaHora");
  const proximaEstado = document.querySelector("#proximaEstado");

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

  function formatearFecha(fecha) {
    if (!fecha || !String(fecha).includes("-")) return "No registrada";

    const [year, mes, dia] = String(fecha).split("-");
    return `${dia}/${mes}/${year}`;
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

  function obtenerTotalSesion(sesion) {
    return (
      Number(sesion.total) ||
      Number(sesion.totalReserva) ||
      Number(sesion.montoTotal) ||
      Number(sesion.precioTotal) ||
      0
    );
  }

  function mostrarDatosUsuario(usuario, perfil) {
    const nombre = obtenerNombreUsuario(usuario, perfil);
    const correo = usuario?.email || perfil?.correo || "correo@ejemplo.com";
    const iniciales = obtenerIniciales(nombre, correo);

    if (tituloBienvenida) {
      tituloBienvenida.textContent = `Hola, ${nombre} 👋`;
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

  function mostrarResumenSesiones(sesiones = []) {
    const pendientes = sesiones.filter(
      (sesion) => normalizarEstado(sesion.estado) === "pendiente",
    ).length;

    const aceptadas = sesiones.filter(
      (sesion) => normalizarEstado(sesion.estado) === "aceptada",
    ).length;

    const realizadas = sesiones.filter(
      (sesion) => normalizarEstado(sesion.estado) === "realizada",
    ).length;

    const invertido = sesiones.reduce((acumulado, sesion) => {
      return acumulado + obtenerTotalSesion(sesion);
    }, 0);

    if (totalPendientes) totalPendientes.textContent = pendientes;
    if (totalAceptadas) totalAceptadas.textContent = aceptadas;
    if (totalRealizadas) totalRealizadas.textContent = realizadas;
    if (totalInvertido) {
      totalInvertido.textContent = `S/ ${invertido.toFixed(2)}`;
    }
  }

  function mostrarProximaSesion(sesiones = []) {
    const ahora = new Date();

    const proximas = sesiones
      .map((sesion) => ({
        ...sesion,
        fechaHora: obtenerFechaHoraSesion(sesion),
      }))
      .filter((sesion) => {
        const estado = normalizarEstado(sesion.estado);

        return (
          sesion.fechaHora &&
          sesion.fechaHora >= ahora &&
          ["pendiente", "aceptada"].includes(estado)
        );
      })
      .sort((a, b) => a.fechaHora - b.fechaHora);

    const proxima = proximas[0];

    if (!proxima) {
      if (proximaCurso) proximaCurso.textContent = "Aún no hay próxima sesión";
      if (proximaTutor) proximaTutor.textContent = "-";
      if (proximaFecha) proximaFecha.textContent = "-";
      if (proximaHora) proximaHora.textContent = "-";
      if (proximaEstado) proximaEstado.textContent = "Pendiente";
      return;
    }

    const estado = normalizarEstado(proxima.estado);

    if (proximaCurso) {
      proximaCurso.textContent = proxima.curso || "Tutoría";
    }

    if (proximaTutor) {
      proximaTutor.textContent =
        proxima.tutor ||
        proxima.nombreTutor ||
        proxima.tutorNombre ||
        "No registrado";
    }

    if (proximaFecha) {
      proximaFecha.textContent = formatearFecha(proxima.fecha);
    }

    if (proximaHora) {
      proximaHora.textContent = proxima.hora || "No registrada";
    }

    if (proximaEstado) {
      proximaEstado.textContent =
        estado.charAt(0).toUpperCase() + estado.slice(1);
    }
  }

  async function cargarPanel(usuario) {
    try {
      const perfil = await obtenerPerfilUsuarioActual();
      mostrarDatosUsuario(usuario, perfil);

      const sesiones = await obtenerMisSesiones();
      mostrarResumenSesiones(sesiones);
      mostrarProximaSesion(sesiones);
    } catch (error) {
      console.error(error);
      mostrarDatosUsuario(usuario, null);
      mostrarResumenSesiones([]);
      mostrarProximaSesion([]);
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
        alert("No se pudo cerrar sesión.");
      }
    });
  }

  observarUsuario((usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    cargarPanel(usuario);
  });
});
