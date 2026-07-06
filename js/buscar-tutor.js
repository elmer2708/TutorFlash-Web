import {
  observarUsuario,
  cerrarSesion,
  obtenerUsuarioActual,
  guardarReserva,
  obtenerTutoresActivos,
  obtenerDisponibilidadPorTutorId,
  obtenerReservasOcupadasPorTutorFecha,
  obtenerPerfilUsuarioActual,
  guardarTutorFavorito,
  obtenerMisFavoritos,
} from "./firebase-service.js";

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

  const inputBuscar = document.querySelector("#buscarCurso");
  const btnBuscar = document.querySelector("#btnBuscar");
  const mensaje = document.querySelector("#mensajeBusqueda");
  const listaTutores = document.querySelector("#listaTutores");
  const seccionTutores = document.querySelector("#tutores");

  const filtroNivel = document.querySelector("#filtroNivel");
  const filtroModalidad = document.querySelector("#filtroModalidad");
  const botonesCursos = document.querySelectorAll(".tf-courses button");

  const modal = document.querySelector("#reservaModal");
  const cerrarModal = document.querySelector("#cerrarModal");
  const btnCerrarModal = document.querySelector("#btnCerrarModal");

  const reservaFormulario = document.querySelector("#reservaFormulario");
  const reservaConfirmacion = document.querySelector("#reservaConfirmacion");
  const formReserva = document.querySelector("#formReserva");
  const btnConfirmarReserva = formReserva?.querySelector(
    'button[type="submit"]',
  );

  const modalAvatar = document.querySelector("#modalAvatar");
  const modalTutor = document.querySelector("#modalTutor");
  const modalCurso = document.querySelector("#modalCurso");
  const modalInfo = document.querySelector("#modalInfo");
  const modalTotal = document.querySelector("#modalTotal");

  const fechaReserva = document.querySelector("#fechaReserva");
  const horaReserva = document.querySelector("#horaReserva");
  const modalidadReserva = document.querySelector("#modalidadReserva");
  const duracionReserva = document.querySelector("#duracionReserva");

  const finalTutor = document.querySelector("#finalTutor");
  const finalCurso = document.querySelector("#finalCurso");
  const finalFecha = document.querySelector("#finalFecha");
  const finalHora = document.querySelector("#finalHora");
  const finalModalidad = document.querySelector("#finalModalidad");
  const finalDuracion = document.querySelector("#finalDuracion");
  const finalTotal = document.querySelector("#finalTotal");

  const btnNuevaReserva = document.querySelector("#btnNuevaReserva");

  const horasBaseReserva = horaReserva
    ? Array.from(horaReserva.options)
        .filter((option) => option.value)
        .map((option) => option.value)
    : [];

  let tarjetas = [];
  let tutoresActivos = [];
  let disponibilidadTutorSeleccionado = null;
  let reservasOcupadasTutor = [];
  let hayHorasDisponiblesEnFecha = true;

  let tutorSeleccionado = {
    tutorId: "",
    tutor: "",
    curso: "",
    rating: "",
    price: "",
    availability: "",
  };

  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];

  function limpiarTexto(valor) {
    return String(valor ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizar(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
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

  function obtenerInicial(nombre) {
    return (
      String(nombre || "Tutor")
        .trim()
        .charAt(0)
        .toUpperCase() || "T"
    );
  }

  function mostrarDatosUsuario(usuario, perfil) {
    const nombre = obtenerNombreUsuario(usuario, perfil);
    const correo = usuario?.email || perfil?.correo || "correo@ejemplo.com";
    const iniciales = obtenerIniciales(nombre, correo);

    if (tituloBienvenida) {
      tituloBienvenida.textContent = `Encuentra tu tutor, ${nombre} 🔎`;
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

  function obtenerFechaLocal() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function obtenerFechaManana() {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);

    const year = manana.getFullYear();
    const month = String(manana.getMonth() + 1).padStart(2, "0");
    const day = String(manana.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function obtenerFechaMaxima() {
    const hoy = new Date();
    const year = hoy.getFullYear();

    return `${year}-12-31`;
  }

  function fechaEsHoy(fecha) {
    return fecha === obtenerFechaLocal();
  }

  function normalizarDia(dia) {
    return String(dia || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function obtenerDiaPorFecha(fecha) {
    if (!fecha) return "";

    const [year, month, day] = fecha.split("-").map(Number);
    const fechaLocal = new Date(year, month - 1, day);

    return diasSemana[fechaLocal.getDay()];
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

  function formatearMinutosAHora(minutosTotales) {
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(
      2,
      "0",
    )}`;
  }

  function obtenerMinutosDuracion(duracion) {
    return Number(String(duracion || "").replace(/\D/g, "")) || 30;
  }

  function obtenerMinutos() {
    return obtenerMinutosDuracion(duracionReserva?.value);
  }

  function horaYaPaso(textoHora) {
    const ahora = new Date();
    const minutosOpcion = convertirHoraAMinutos(textoHora);

    const fechaHoraOpcion = new Date();
    fechaHoraOpcion.setHours(
      Math.floor(minutosOpcion / 60),
      minutosOpcion % 60,
      0,
      0,
    );

    return ahora > fechaHoraOpcion;
  }

  function obtenerBloquesActivosDelDia(fecha) {
    const bloques = disponibilidadTutorSeleccionado?.bloques || [];
    const diaSeleccionado = normalizarDia(obtenerDiaPorFecha(fecha));

    return bloques.filter((bloque) => {
      return (
        bloque.activo !== false && normalizarDia(bloque.dia) === diaSeleccionado
      );
    });
  }

  function tutorTieneDisponibilidadConfigurada() {
    return Array.isArray(disponibilidadTutorSeleccionado?.bloques);
  }

  function horaCabeEnBloques(hora, bloques) {
    const inicioHora = convertirHoraAMinutos(hora);
    const finHora = inicioHora + obtenerMinutosDuracion(duracionReserva?.value);

    return bloques.some((bloque) => {
      const inicio = convertirHoraAMinutos(bloque.horaInicio);
      const fin = convertirHoraAMinutos(bloque.horaFin);

      return inicioHora >= inicio && finHora <= fin;
    });
  }

  function generarHorasDesdeBloques(bloques) {
    const intervalo = 30;
    const duracion = obtenerMinutosDuracion(duracionReserva?.value);
    const horas = [];

    bloques.forEach((bloque) => {
      const inicio = convertirHoraAMinutos(bloque.horaInicio);
      const fin = convertirHoraAMinutos(bloque.horaFin);

      for (
        let minutos = inicio;
        minutos + duracion <= fin;
        minutos += intervalo
      ) {
        horas.push(formatearMinutosAHora(minutos));
      }
    });

    return [...new Set(horas)].sort((a, b) => {
      return convertirHoraAMinutos(a) - convertirHoraAMinutos(b);
    });
  }

  function hayCruceDeHorario(
    horaNueva,
    duracionNueva,
    horaReservada,
    duracionReservada,
  ) {
    const inicioNuevo = convertirHoraAMinutos(horaNueva);
    const finNuevo = inicioNuevo + obtenerMinutosDuracion(duracionNueva);

    const inicioReservado = convertirHoraAMinutos(horaReservada);
    const finReservado =
      inicioReservado + obtenerMinutosDuracion(duracionReservada);

    return inicioNuevo < finReservado && finNuevo > inicioReservado;
  }

  async function cargarReservasOcupadasTutor() {
    if (!tutorSeleccionado.tutorId || !fechaReserva?.value) {
      reservasOcupadasTutor = [];
      return;
    }

    try {
      reservasOcupadasTutor = await obtenerReservasOcupadasPorTutorFecha(
        tutorSeleccionado.tutorId,
        fechaReserva.value,
      );
    } catch (error) {
      console.error("Error al cargar reservas ocupadas:", error);
      reservasOcupadasTutor = [];
    }
  }

  function horaChocaConReserva(hora) {
    return reservasOcupadasTutor.some((reserva) => {
      return hayCruceDeHorario(
        hora,
        duracionReserva.value,
        reserva.hora,
        reserva.duracion,
      );
    });
  }

  function hayHorarioDisponibleHoy() {
    if (!horaReserva) return false;

    const opcionesHora = Array.from(horaReserva.options).filter(
      (option) => option.value,
    );

    return opcionesHora.some((option) => !horaYaPaso(option.value));
  }

  function obtenerDisponibilidadReal(disponibilidadBase) {
    const base = disponibilidadBase || "";

    if (!hayHorarioDisponibleHoy()) {
      return "Disponible mañana";
    }

    if (base.toLowerCase().includes("ahora")) {
      return "Disponible ahora";
    }

    if (base.toLowerCase().includes("mañana")) {
      return "Disponible mañana";
    }

    return "Disponible hoy";
  }

  function actualizarDisponibilidadModal() {
    if (!modalInfo) return;

    const bloquesDelDia = obtenerBloquesActivosDelDia(fechaReserva?.value);
    const tieneDisponibilidadReal = tutorTieneDisponibilidadConfigurada();

    let disponibilidad = "Disponible según horario del tutor";

    if (tieneDisponibilidadReal && bloquesDelDia.length === 0) {
      disponibilidad = "Sin horario disponible para esta fecha";
    }

    if (
      tieneDisponibilidadReal &&
      bloquesDelDia.length > 0 &&
      !hayHorasDisponiblesEnFecha
    ) {
      disponibilidad = "Horario ocupado para esta fecha";
    }

    if (!tieneDisponibilidadReal) {
      disponibilidad = obtenerDisponibilidadReal(
        tutorSeleccionado.availability,
      );
    }

    modalInfo.textContent = `⭐ ${tutorSeleccionado.rating} · ${disponibilidad}`;
  }

  async function actualizarHorasDisponibles() {
    if (!fechaReserva || !horaReserva) return;

    await cargarReservasOcupadasTutor();

    const esHoy = fechaEsHoy(fechaReserva.value);
    const bloquesDelDia = obtenerBloquesActivosDelDia(fechaReserva.value);
    const tieneDisponibilidadReal = tutorTieneDisponibilidadConfigurada();

    const opcionesOriginales = tieneDisponibilidadReal
      ? generarHorasDesdeBloques(bloquesDelDia)
      : horasBaseReserva;

    const horasDisponibles = opcionesOriginales.filter((hora) => {
      const fueraDeHorarioTutor =
        tieneDisponibilidadReal && !horaCabeEnBloques(hora, bloquesDelDia);

      const horaPasada = esHoy && horaYaPaso(hora);
      const horaOcupada = horaChocaConReserva(hora);

      return !fueraDeHorarioTutor && !horaPasada && !horaOcupada;
    });

    horaReserva.innerHTML = "";

    if (!horasDisponibles.length) {
      hayHorasDisponiblesEnFecha = false;

      const opcionSinHorario = document.createElement("option");
      opcionSinHorario.value = "";
      opcionSinHorario.textContent = "No hay horarios disponibles";
      opcionSinHorario.selected = true;

      horaReserva.appendChild(opcionSinHorario);
      horaReserva.disabled = true;

      actualizarDisponibilidadModal();
      return;
    }

    hayHorasDisponiblesEnFecha = true;

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Selecciona una hora";

    horaReserva.appendChild(opcionInicial);

    horasDisponibles.forEach((hora) => {
      const opcion = document.createElement("option");
      opcion.value = hora;
      opcion.textContent = hora;

      horaReserva.appendChild(opcion);
    });

    horaReserva.disabled = false;
    horaReserva.value = horasDisponibles[0];

    actualizarDisponibilidadModal();
  }

  function formatearFecha(fecha) {
    if (!fecha) return "Fecha pendiente";

    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  }

  function formatearSoles(monto) {
    if (Number.isInteger(monto)) {
      return `S/ ${monto}`;
    }

    return `S/ ${monto.toFixed(2)}`;
  }

  function calcularTotal() {
    const precioPorHora = Number(tutorSeleccionado.price) || 0;
    const minutos = obtenerMinutos();

    return precioPorHora * (minutos / 60);
  }

  function actualizarTotal() {
    if (!modalTotal) return;

    const total = calcularTotal();
    modalTotal.textContent = formatearSoles(total);
  }

  function capitalizarTexto(texto) {
    return String(texto || "")
      .toLowerCase()
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((palabra, index) => {
        const palabrasMinusculas = ["de", "del", "la", "las", "el", "los", "y"];

        if (index > 0 && palabrasMinusculas.includes(palabra)) {
          return palabra;
        }

        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
      })
      .join(" ");
  }

  const cursosCorregidos = {
    matematica: "Matemática",
    calculo: "Cálculo",
    algebra: "Álgebra",
    estadistica: "Estadística",
    quimica: "Química",
    fisica: "Física",
    ingles: "Inglés",
    programacion: "Programación",
    comunicacion: "Comunicación",
    economia: "Economía",
    contabilidad: "Contabilidad",
    biologia: "Biología",
    historia: "Historia",
    geografia: "Geografía",
    filosofia: "Filosofía",
    psicologia: "Psicología",
    computacion: "Computación",
    informatica: "Informática",
    administracion: "Administración",
    "matematica financiera": "Matemática financiera",
    "razonamiento matematico": "Razonamiento matemático",
    "razonamiento verbal": "Razonamiento verbal",
  };

  function corregirCurso(curso) {
    const clave = normalizar(curso);

    return cursosCorregidos[clave] || capitalizarTexto(curso);
  }

  function separarCursos(cursos) {
    if (Array.isArray(cursos)) {
      return cursos;
    }

    return String(cursos || "")
      .split(",")
      .map((curso) => curso.trim())
      .filter(Boolean);
  }

  function corregirListaCursos(cursos) {
    return cursos.map((curso) => corregirCurso(curso));
  }

  function obtenerPrecioTutor(tutor) {
    const precio = Number(tutor.precioHora || tutor.precio);

    if (Number.isFinite(precio) && precio > 0) {
      return precio;
    }

    return 25;
  }

  function obtenerRatingTutor(tutor) {
    return tutor.rating || tutor.calificacion || "4.8";
  }

  function obtenerDisponibilidadTutor(disponibilidad) {
    if (!disponibilidad) {
      return "Disponible hoy";
    }

    if (disponibilidad === "Mañana") {
      return "Disponible mañana";
    }

    if (disponibilidad === "Tarde") {
      return "Disponible hoy";
    }

    if (disponibilidad === "Noche") {
      return "Disponible hoy";
    }

    if (disponibilidad === "Fines de semana") {
      return "Disponible fines de semana";
    }

    return disponibilidad;
  }

  function tutorEstaEnLinea(tutor) {
    if (tutor.estaEnLinea === true) return true;
    return false;
  }

  function crearTarjetaTutor(tutor) {
    const tutorId = tutor.id || tutor.uid || tutor.tutorId || "";
    const nombreTutor = capitalizarTexto(tutor.nombre || "Tutor");
    const cursos = corregirListaCursos(separarCursos(tutor.cursos));
    const cursoPrincipal = cursos[0] || "Curso general";

    const precio = obtenerPrecioTutor(tutor);
    const rating = obtenerRatingTutor(tutor);
    const disponibilidad = obtenerDisponibilidadTutor(tutor.disponibilidad);

    const modalidad = tutor.modalidad || "Modalidad no indicada";
    const nivel = tutor.nivel || "Nivel no indicado";
    const distrito = tutor.distrito || tutor.zona || "Zona no indicada";

    const presentacion =
      tutor.presentacion ||
      tutor.experiencia ||
      "Tutor disponible para ayudarte a reforzar tus cursos.";

    const estadoLinea = tutorEstaEnLinea(tutor)
      ? "🟢 En línea"
      : "⚪ Disponible";

    return `
      <article
        class="tf-tutor-card"
        data-id="${limpiarTexto(tutorId)}"
        data-tutor="${limpiarTexto(nombreTutor)}"
        data-course="${limpiarTexto(cursoPrincipal)}"
        data-rating="${limpiarTexto(rating)}"
        data-price="${limpiarTexto(precio)}"
        data-availability="${limpiarTexto(disponibilidad)}"
        data-modalidad="${limpiarTexto(modalidad)}"
        data-nivel="${limpiarTexto(nivel)}"
        data-distrito="${limpiarTexto(distrito)}"
      >
        <div class="tf-avatar">
          ${limpiarTexto(obtenerInicial(nombreTutor))}
        </div>

        <h3>${limpiarTexto(nombreTutor)}</h3>

        <p class="tf-tutor-courses">
          ${limpiarTexto(
            cursos.length > 0 ? cursos.join(", ") : "Cursos disponibles",
          )}
        </p>

        <p class="tf-tutor-description">
          ${limpiarTexto(presentacion)}
        </p>

        <div class="tf-tutor-tags">
          <span>${limpiarTexto(nivel)}</span>
          <span>${limpiarTexto(modalidad)}</span>
          <span>${limpiarTexto(distrito)}</span>
        </div>

        <span class="tf-tutor-meta">
          ⭐ ${limpiarTexto(rating)} · ${limpiarTexto(disponibilidad)}
        </span>

        <span class="tf-tutor-meta">
          ${estadoLinea}
        </span>

        <strong class="tf-tutor-price">
          S/ ${precio.toFixed(2)} por hora
        </strong>

       <div class="tf-tutor-actions">
  <button
    type="button"
    class="tf-reserve-btn"
    data-tutor-id="${limpiarTexto(tutorId)}"
  >
    Reservar tutoría
  </button>

  <button
    type="button"
    class="tf-favorite-btn"
    data-tutor-id="${limpiarTexto(tutorId)}"
  >
    ♡ Guardar favorito
  </button>
</div>
      </article>
    `;
  }

  function actualizarModal() {
    if (!modalAvatar || !modalTutor || !modalCurso || !modalInfo) return;

    modalAvatar.textContent = obtenerInicial(tutorSeleccionado.tutor);
    modalTutor.textContent = tutorSeleccionado.tutor;
    modalCurso.textContent = tutorSeleccionado.curso;
    modalInfo.textContent = `⭐ ${tutorSeleccionado.rating} · ${tutorSeleccionado.availability}`;

    actualizarTotal();
  }

  async function abrirModal() {
    if (!modal) return;

    formReserva?.reset();

    if (btnConfirmarReserva) {
      btnConfirmarReserva.disabled = false;
      btnConfirmarReserva.textContent = "Confirmar reserva";
    }

    if (duracionReserva) {
      duracionReserva.value = "30 min";
    }

    if (modalidadReserva) {
      modalidadReserva.value = "Virtual";
    }

    if (fechaReserva) {
      fechaReserva.setCustomValidity("");

      if (hayHorarioDisponibleHoy()) {
        fechaReserva.value = obtenerFechaLocal();
      } else {
        fechaReserva.value = obtenerFechaManana();
      }
    }

    await actualizarHorasDisponibles();
    actualizarTotal();

    if (reservaFormulario) reservaFormulario.hidden = false;
    if (reservaConfirmacion) reservaConfirmacion.hidden = true;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("tf-modal-open");
  }

  function cerrarModalReserva() {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("tf-modal-open");
  }

  function activarBotonesReserva() {
    document.querySelectorAll(".tf-reserve-btn").forEach((boton) => {
      boton.addEventListener("click", async () => {
        const tarjeta = boton.closest(".tf-tutor-card");

        tutorSeleccionado = {
          tutorId: tarjeta.dataset.id,
          tutor: tarjeta.dataset.tutor,
          curso: tarjeta.dataset.course,
          rating: tarjeta.dataset.rating,
          price: tarjeta.dataset.price,
          availability: obtenerDisponibilidadReal(tarjeta.dataset.availability),
        };

        actualizarModal();

        try {
          disponibilidadTutorSeleccionado =
            await obtenerDisponibilidadPorTutorId(tutorSeleccionado.tutorId);
        } catch (error) {
          console.error("Error al cargar disponibilidad del tutor:", error);
          disponibilidadTutorSeleccionado = null;
        }

        await abrirModal();
      });
    });
  }

  function activarFavoritosVisuales(tutores, favoritosIds) {
    document.querySelectorAll(".tf-favorite-btn").forEach((boton) => {
      const tutorId = boton.dataset.tutorId;

      if (favoritosIds.includes(tutorId)) {
        boton.textContent = "♥ Guardado";
        boton.disabled = true;
        return;
      }

      boton.addEventListener("click", async () => {
        try {
          const tutor = tutores.find((item) => {
            const id = item.id || item.uid || item.tutorId;
            return id === tutorId;
          });

          if (!tutor) {
            alert("No se encontró la información del tutor.");
            return;
          }

          boton.disabled = true;
          boton.textContent = "Guardando...";

          await guardarTutorFavorito(tutor);

          boton.textContent = "♥ Guardado";
        } catch (error) {
          console.error("Error al guardar favorito:", error);
          boton.disabled = false;
          boton.textContent = "♡ Guardar favorito";
          alert(`No se pudo guardar el tutor como favorito: ${error.message}`);
        }
      });
    });
  }

  async function cargarTutoresDesdeFirestore() {
    try {
      if (!listaTutores) return;

      tutoresActivos = await obtenerTutoresActivos();

      const favoritos = await obtenerMisFavoritos();
      const favoritosIds = favoritos.map((favorito) => favorito.tutorId);

      if (tutoresActivos.length === 0) {
        listaTutores.innerHTML = `
          <div class="tf-empty-tutors">
            <h3>Aún no hay tutores activos</h3>
            <p>Cuando un tutor aprobado complete su perfil público, aparecerá aquí.</p>
          </div>
        `;

        if (mensaje) {
          mensaje.textContent = "Todavía no hay tutores activos registrados.";
        }

        return;
      }

      listaTutores.innerHTML = tutoresActivos
        .map((tutor) => crearTarjetaTutor(tutor))
        .join("");

      tarjetas = Array.from(listaTutores.querySelectorAll(".tf-tutor-card"));

      activarBotonesReserva();
      activarFavoritosVisuales(tutoresActivos, favoritosIds);

      if (mensaje) {
        mensaje.textContent = "Mostrando tutores activos de TutorFlash.";
      }
    } catch (error) {
      console.error("Error al cargar tutores:", error);

      if (mensaje) {
        mensaje.textContent = "No se pudieron cargar los tutores activos.";
      }
    }
  }

  function buscarTutores() {
    const textoOriginal = inputBuscar?.value.trim() || "";
    const texto = normalizar(textoOriginal);

    const nivelElegido = normalizar(filtroNivel?.value || "");
    const modalidadElegida = normalizar(filtroModalidad?.value || "");

    let encontrados = 0;

    tarjetas.forEach((tarjeta) => {
      const contenido = normalizar(
        `${tarjeta.dataset.tutor || ""} ${tarjeta.dataset.course || ""} ${
          tarjeta.textContent
        }`,
      );

      const nivelTutor = normalizar(tarjeta.dataset.nivel || "");
      const modalidadTutor = normalizar(tarjeta.dataset.modalidad || "");

      const coincideTexto = texto === "" || contenido.includes(texto);

      const coincideNivel =
        nivelElegido === "" || nivelTutor.includes(nivelElegido);

      const coincideModalidad =
        modalidadElegida === "" || modalidadTutor.includes(modalidadElegida);

      const coincide = coincideTexto && coincideNivel && coincideModalidad;

      if (coincide) {
        tarjeta.classList.remove("is-hidden");
        encontrados++;
      } else {
        tarjeta.classList.add("is-hidden");
      }
    });

    if (mensaje) {
      if (texto === "" && !nivelElegido && !modalidadElegida) {
        mensaje.textContent = "Mostrando todos los tutores disponibles.";
      } else if (encontrados > 0) {
        mensaje.textContent = `Se encontraron ${encontrados} tutor(es).`;
      } else {
        mensaje.textContent = "No se encontraron tutores con esos filtros.";
      }
    }

    seccionTutores?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function cargarUsuarioPortal(usuario) {
    try {
      const perfil = await obtenerPerfilUsuarioActual();
      mostrarDatosUsuario(usuario, perfil);
    } catch (error) {
      console.error(error);
      mostrarDatosUsuario(usuario, null);
    }
  }

  btnBuscar?.addEventListener("click", buscarTutores);

  inputBuscar?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      buscarTutores();
    }
  });

  filtroNivel?.addEventListener("change", buscarTutores);
  filtroModalidad?.addEventListener("change", buscarTutores);

  botonesCursos.forEach((boton) => {
    boton.addEventListener("click", () => {
      const curso = boton.textContent.replace(/[^\p{L}\s]/gu, "").trim();

      if (inputBuscar) {
        inputBuscar.value = curso;
      }

      buscarTutores();
    });
  });

  duracionReserva?.addEventListener("change", async () => {
    actualizarTotal();
    await actualizarHorasDisponibles();
  });

  if (fechaReserva) {
    const hoy = obtenerFechaLocal();
    const fechaMaxima = obtenerFechaMaxima();
    const yearActual = new Date().getFullYear();

    fechaReserva.min = hoy;
    fechaReserva.max = fechaMaxima;

    fechaReserva.addEventListener("input", async () => {
      fechaReserva.setCustomValidity("");

      if (!fechaReserva.value) return;

      const yearElegido = Number(fechaReserva.value.split("-")[0]);

      if (
        fechaReserva.value < hoy ||
        fechaReserva.value > fechaMaxima ||
        yearElegido !== yearActual
      ) {
        fechaReserva.setCustomValidity(
          `Elige una fecha válida del año ${yearActual}.`,
        );
        fechaReserva.reportValidity();
        return;
      }

      await actualizarHorasDisponibles();
    });
  }

  formReserva?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (btnConfirmarReserva?.disabled) {
      return;
    }

    const usuario = obtenerUsuarioActual();

    if (!usuario) {
      alert("Primero debes iniciar sesión para reservar una tutoría.");
      window.location.href = "cuenta.html";
      return;
    }

    const hoy = obtenerFechaLocal();
    const fechaMaxima = obtenerFechaMaxima();
    const yearActual = new Date().getFullYear();
    const yearElegido = Number(fechaReserva.value.split("-")[0]);

    if (
      fechaReserva.value < hoy ||
      fechaReserva.value > fechaMaxima ||
      yearElegido !== yearActual
    ) {
      fechaReserva.setCustomValidity(
        `Elige una fecha válida del año ${yearActual}.`,
      );
      fechaReserva.reportValidity();
      return;
    }

    if (!fechaReserva.value || !horaReserva.value) {
      alert("Completa la fecha y la hora de la reserva.");
      return;
    }

    await cargarReservasOcupadasTutor();

    if (horaChocaConReserva(horaReserva.value)) {
      alert(
        "Ese horario acaba de ser reservado por otra persona. Elige otro horario.",
      );
      await actualizarHorasDisponibles();
      return;
    }

    const bloquesDelDia = obtenerBloquesActivosDelDia(fechaReserva.value);

    if (
      tutorTieneDisponibilidadConfigurada() &&
      !horaCabeEnBloques(horaReserva.value, bloquesDelDia)
    ) {
      alert("Ese horario no está dentro de la disponibilidad del tutor.");
      return;
    }

    if (fechaEsHoy(fechaReserva.value) && horaYaPaso(horaReserva.value)) {
      alert("Esa hora ya pasó. Elige otro horario disponible.");
      return;
    }

    fechaReserva.setCustomValidity("");

    const totalCalculado = calcularTotal();
    const totalFormateado = formatearSoles(totalCalculado);

    const reserva = {
      tutorId: tutorSeleccionado.tutorId || "",
      tutor: tutorSeleccionado.tutor,
      curso: tutorSeleccionado.curso,
      fecha: fechaReserva.value,
      hora: horaReserva.value,
      modalidad: modalidadReserva.value,
      duracion: duracionReserva.value,
      total: totalCalculado,

      estado: "pendiente",
      estadoPago: "pendiente",
      metodoPago: "Pago pendiente",

      plataformaClase: "",
      enlaceClase: "",
      estadoClase: "pendiente",
    };

    if (btnConfirmarReserva) {
      btnConfirmarReserva.disabled = true;
      btnConfirmarReserva.textContent = "Guardando reserva...";
    }

    try {
      await guardarReserva(reserva);

      if (finalTutor) finalTutor.textContent = reserva.tutor;
      if (finalCurso) finalCurso.textContent = reserva.curso;
      if (finalFecha) finalFecha.textContent = formatearFecha(reserva.fecha);
      if (finalHora) finalHora.textContent = reserva.hora;
      if (finalModalidad) finalModalidad.textContent = reserva.modalidad;
      if (finalDuracion) finalDuracion.textContent = reserva.duracion;
      if (finalTotal) finalTotal.textContent = totalFormateado;

      if (reservaFormulario) reservaFormulario.hidden = true;
      if (reservaConfirmacion) reservaConfirmacion.hidden = false;
    } catch (error) {
      console.error("Error al guardar reserva:", error);

      alert(
        error.message || "No se pudo guardar la reserva. Inténtalo otra vez.",
      );

      if (btnConfirmarReserva) {
        btnConfirmarReserva.disabled = false;
        btnConfirmarReserva.textContent = "Confirmar reserva";
      }
    }
  });

  cerrarModal?.addEventListener("click", cerrarModalReserva);
  btnCerrarModal?.addEventListener("click", cerrarModalReserva);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      cerrarModalReserva();
    }
  });

  btnNuevaReserva?.addEventListener("click", () => {
    cerrarModalReserva();

    setTimeout(() => {
      seccionTutores?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 250);
  });

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
        window.location.href = "cuenta.html";
      } catch (error) {
        console.error(error);
        alert("No se pudo cerrar sesión.");
      }
    });
  }

  observarUsuario(async (usuario) => {
    if (!usuario) {
      window.location.href = "cuenta.html";
      return;
    }

    await cargarUsuarioPortal(usuario);
    await cargarTutoresDesdeFirestore();
  });
});
