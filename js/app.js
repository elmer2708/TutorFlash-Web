import {
  observarUsuario,
  cerrarSesion,
  obtenerUsuarioActual,
  guardarReserva,
  obtenerTutoresActivos,
  obtenerDisponibilidadPorTutorId,
  obtenerReservasOcupadasPorTutorFecha,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const inputBuscar = document.querySelector("#buscarCurso");
  const btnBuscar = document.querySelector("#btnBuscar");
  const mensaje = document.querySelector("#mensajeBusqueda");
  let tarjetas = [];
  let tutoresActivos = [];
  const botonesCursos = document.querySelectorAll(".tf-courses button");
  const seccionTutores = document.querySelector("#tutores");
  const listaTutores = document.querySelector("#listaTutores");

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
  const horasBaseReserva = horaReserva
    ? Array.from(horaReserva.options)
        .filter((option) => option.value)
        .map((option) => option.value)
    : [];
  const modalidadReserva = document.querySelector("#modalidadReserva");
  const duracionReserva = document.querySelector("#duracionReserva");
  const metodoPago = document.querySelector("#metodoPago");

  const finalTutor = document.querySelector("#finalTutor");
  const finalCurso = document.querySelector("#finalCurso");
  const finalFecha = document.querySelector("#finalFecha");
  const finalHora = document.querySelector("#finalHora");
  const finalModalidad = document.querySelector("#finalModalidad");
  const finalDuracion = document.querySelector("#finalDuracion");
  const finalTotal = document.querySelector("#finalTotal");

  const btnNuevaReserva = document.querySelector("#btnNuevaReserva");
  const btnMenu = document.querySelector("#btnMenu");
  const menuPrincipal = document.querySelector("#menuPrincipal");
  const textoSesionApp = document.querySelector("#textoSesionApp");
  const btnCerrarSesionApp = document.querySelector("#btnCerrarSesionApp");

  let tutorSeleccionado = {
    tutor: "",
    curso: "",
    rating: "",
    price: "",
    availability: "",
  };

  let disponibilidadTutorSeleccionado = null;
  let reservasOcupadasTutor = [];
  let hayHorasDisponiblesEnFecha = true;

  const obtenerFechaLocal = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const obtenerFechaMaxima = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();

    return `${year}-12-31`;
  };
  const obtenerFechaManana = () => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);

    const year = manana.getFullYear();
    const month = String(manana.getMonth() + 1).padStart(2, "0");
    const day = String(manana.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const fechaEsHoy = (fecha) => {
    return fecha === obtenerFechaLocal();
  };

  const convertirHoraA24 = (textoHora) => {
    const numero = Number(textoHora.match(/\d+/)?.[0] || 0);
    const texto = textoHora.toLowerCase();

    if (texto.includes("p.m.") && numero !== 12) {
      return numero + 12;
    }

    if (texto.includes("a.m.") && numero === 12) {
      return 0;
    }

    return numero;
  };

  const horaYaPaso = (textoHora) => {
    const ahora = new Date();
    const horaOpcion = convertirHoraA24(textoHora);

    const fechaHoraOpcion = new Date();
    fechaHoraOpcion.setHours(horaOpcion, 0, 0, 0);

    return ahora > fechaHoraOpcion;
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

  const normalizarDia = (dia) => {
    return String(dia || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const obtenerDiaPorFecha = (fecha) => {
    if (!fecha) return "";

    const [year, month, day] = fecha.split("-").map(Number);
    const fechaLocal = new Date(year, month - 1, day);

    return diasSemana[fechaLocal.getDay()];
  };

  const convertirHoraAMinutos = (textoHora) => {
    const texto = String(textoHora || "")
      .toLowerCase()
      .trim();
    const numeros = texto.match(/\d+/g) || [];

    let horas = Number(numeros[0] || 0);
    const minutos = Number(numeros[1] || 0);

    if (texto.includes("p.m.") && horas !== 12) {
      horas += 12;
    }

    if (texto.includes("a.m.") && horas === 12) {
      horas = 0;
    }

    return horas * 60 + minutos;
  };

  const obtenerBloquesActivosDelDia = (fecha) => {
    const bloques = disponibilidadTutorSeleccionado?.bloques || [];
    const diaSeleccionado = normalizarDia(obtenerDiaPorFecha(fecha));

    return bloques.filter((bloque) => {
      return (
        bloque.activo !== false && normalizarDia(bloque.dia) === diaSeleccionado
      );
    });
  };
  const horaEstaEnBloques = (hora, bloques) => {
    const minutosHora = convertirHoraAMinutos(hora);

    return bloques.some((bloque) => {
      const inicio = convertirHoraAMinutos(bloque.horaInicio);
      const fin = convertirHoraAMinutos(bloque.horaFin);

      return minutosHora >= inicio && minutosHora < fin;
    });
  };

  const formatearMinutosAHora = (minutosTotales) => {
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
  };

  const horaCabeEnBloques = (hora, bloques) => {
    const inicioHora = convertirHoraAMinutos(hora);
    const finHora = inicioHora + obtenerMinutosDuracion(duracionReserva?.value);

    return bloques.some((bloque) => {
      const inicio = convertirHoraAMinutos(bloque.horaInicio);
      const fin = convertirHoraAMinutos(bloque.horaFin);

      return inicioHora >= inicio && finHora <= fin;
    });
  };

  const generarHorasDesdeBloques = (bloques) => {
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
  };

  const tutorTieneDisponibilidadConfigurada = () => {
    return Array.isArray(disponibilidadTutorSeleccionado?.bloques);
  };

  const obtenerMinutosDuracion = (duracion) => {
    return Number(String(duracion || "").replace(/\D/g, "")) || 30;
  };

  const hayCruceDeHorario = (
    horaNueva,
    duracionNueva,
    horaReservada,
    duracionReservada,
  ) => {
    const inicioNuevo = convertirHoraAMinutos(horaNueva);
    const finNuevo = inicioNuevo + obtenerMinutosDuracion(duracionNueva);

    const inicioReservado = convertirHoraAMinutos(horaReservada);
    const finReservado =
      inicioReservado + obtenerMinutosDuracion(duracionReservada);

    return inicioNuevo < finReservado && finNuevo > inicioReservado;
  };

  const cargarReservasOcupadasTutor = async () => {
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
  };

  const horaChocaConReserva = (hora) => {
    return reservasOcupadasTutor.some((reserva) => {
      return hayCruceDeHorario(
        hora,
        duracionReserva.value,
        reserva.hora,
        reserva.duracion,
      );
    });
  };

  const hayHorarioDisponibleHoy = () => {
    if (!horaReserva) return false;

    const opcionesHora = Array.from(horaReserva.options).filter(
      (option) => option.value,
    );

    return opcionesHora.some((option) => !horaYaPaso(option.value));
  };

  const obtenerDisponibilidadReal = (disponibilidadBase) => {
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
  };

  const actualizarHorasDisponibles = async () => {
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
  };
  const actualizarDisponibilidadModal = () => {
    if (!modalInfo) return;

    const bloquesDelDia = obtenerBloquesActivosDelDia(fechaReserva.value);
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
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha pendiente";

    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  const obtenerMinutos = () => {
    const texto = duracionReserva.value;
    return Number(texto.replace(/\D/g, "")) || 30;
  };

  const calcularTotal = () => {
    const precioPorHora = Number(tutorSeleccionado.price) || 0;
    const minutos = obtenerMinutos();

    return precioPorHora * (minutos / 60);
  };

  const formatearSoles = (monto) => {
    if (Number.isInteger(monto)) {
      return `S/ ${monto}`;
    }

    return `S/ ${monto.toFixed(2)}`;
  };

  const actualizarTotal = () => {
    const total = calcularTotal();
    modalTotal.textContent = formatearSoles(total);
  };

  const normalizar = (texto) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const capitalizarTexto = (texto) => {
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
  };

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

  const corregirCurso = (curso) => {
    const clave = normalizar(curso);

    return cursosCorregidos[clave] || capitalizarTexto(curso);
  };

  const corregirListaCursos = (cursos) => {
    return cursos.map((curso) => corregirCurso(curso));
  };

  const obtenerPrecioTutor = (tutor) => {
    const precio = Number(tutor.precioHora || tutor.precio);

    if (Number.isFinite(precio) && precio > 0) {
      return precio;
    }

    return 25;
  };

  const obtenerRatingTutor = () => {
    return "4.8";
  };

  const obtenerDisponibilidadTutor = (disponibilidad) => {
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
  };

  const separarCursos = (cursos) => {
    if (Array.isArray(cursos)) {
      return cursos;
    }

    return String(cursos || "")
      .split(",")
      .map((curso) => curso.trim())
      .filter(Boolean);
  };

  const obtenerInicial = (nombre) => {
    return nombre.trim().charAt(0).toUpperCase() || "T";
  };

  const crearTarjetaTutor = (tutor) => {
    const nombreTutor = capitalizarTexto(tutor.nombre || "Tutor");
    const cursos = corregirListaCursos(separarCursos(tutor.cursos));
    const cursoPrincipal = cursos[0] || "Curso general";

    const precio = obtenerPrecioTutor(tutor);

    const rating = tutor.rating || obtenerRatingTutor();
    const disponibilidad = obtenerDisponibilidadTutor(tutor.disponibilidad);

    const modalidad = tutor.modalidad || "Modalidad no indicada";
    const nivel = tutor.nivel || "Nivel no indicado";
    const distrito = tutor.distrito || tutor.zona || "Zona no indicada";

    const presentacion =
      tutor.presentacion ||
      tutor.experiencia ||
      "Tutor disponible para ayudarte a reforzar tus cursos.";

    return `
    <article
      class="tf-tutor-card"
      data-id="${tutor.uid || tutor.id || ""}"
      data-tutor="${nombreTutor}"
      data-course="${cursoPrincipal}"
      data-rating="${rating}"
      data-price="${precio}"
      data-availability="${disponibilidad}"
      data-modalidad="${modalidad}"
      data-nivel="${nivel}"
      data-distrito="${distrito}"
    >
      <div class="tf-avatar">
        ${obtenerInicial(nombreTutor)}
      </div>

      <h3>${nombreTutor}</h3>

      <p class="tf-tutor-courses">
        ${cursos.length > 0 ? cursos.join(", ") : "Cursos disponibles"}
      </p>

      <p class="tf-tutor-description">
        ${presentacion}
      </p>

      <div class="tf-tutor-tags">
        <span>${nivel}</span>
        <span>${modalidad}</span>
        <span>${distrito}</span>
      </div>

      <span class="tf-tutor-meta">
        ⭐ ${rating} · ${disponibilidad}
      </span>

      <strong class="tf-tutor-price">
        S/ ${precio.toFixed(2)} por hora
      </strong>

      <button type="button" class="tf-card-btn">
        Reservar tutoría
      </button>
    </article>
  `;
  };

  const activarBotonesReserva = () => {
    document.querySelectorAll(".tf-card-btn").forEach((boton) => {
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
  };

  const cargarTutoresDesdeFirestore = async () => {
    try {
      if (!listaTutores) return;

      tutoresActivos = await obtenerTutoresActivos();

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

      if (mensaje) {
        mensaje.textContent = "Mostrando tutores activos de TutorFlash.";
      }
    } catch (error) {
      console.error("Error al cargar tutores:", error);

      if (mensaje) {
        mensaje.textContent = "No se pudieron cargar los tutores activos.";
      }
    }
  };

  const buscarTutores = () => {
    const textoOriginal = inputBuscar.value.trim();
    const texto = normalizar(textoOriginal);
    let encontrados = 0;

    tarjetas.forEach((tarjeta) => {
      const contenido = normalizar(
        `${tarjeta.dataset.tutor || ""} ${tarjeta.dataset.course || ""} ${tarjeta.textContent}`,
      );

      const coincide = texto === "" || contenido.includes(texto);

      if (coincide) {
        tarjeta.classList.remove("is-hidden");
        encontrados++;
      } else {
        tarjeta.classList.add("is-hidden");
      }
    });

    if (mensaje) {
      if (texto === "") {
        mensaje.textContent = "Mostrando todos los tutores disponibles.";
      } else if (encontrados > 0) {
        mensaje.textContent = `Se encontraron ${encontrados} tutor(es) para "${textoOriginal}".`;
      } else {
        mensaje.textContent = `No se encontraron tutores para "${textoOriginal}".`;
      }
    }

    seccionTutores?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  btnBuscar?.addEventListener("click", buscarTutores);

  inputBuscar?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      buscarTutores();
    }
  });

  botonesCursos.forEach((boton) => {
    boton.addEventListener("click", () => {
      const curso = boton.textContent.replace(/[^\p{L}\s]/gu, "").trim();

      if (inputBuscar) {
        inputBuscar.value = curso;
      }

      buscarTutores();
    });
  });

  const abrirModal = async () => {
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

    reservaFormulario.hidden = false;
    reservaConfirmacion.hidden = true;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("tf-modal-open");
  };
  const cerrarModalReserva = () => {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("tf-modal-open");
  };

  const actualizarModal = () => {
    modalAvatar.textContent = obtenerInicial(tutorSeleccionado.tutor);
    modalTutor.textContent = tutorSeleccionado.tutor;
    modalCurso.textContent = tutorSeleccionado.curso;
    modalInfo.textContent = `⭐ ${tutorSeleccionado.rating} · ${tutorSeleccionado.availability}`;

    actualizarTotal();
  };
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
      metodoPago: metodoPago?.value || "Pago simulado",
    };

    if (btnConfirmarReserva) {
      btnConfirmarReserva.disabled = true;
      btnConfirmarReserva.textContent = "Guardando reserva...";
    }

    try {
      await guardarReserva(reserva);

      finalTutor.textContent = reserva.tutor;
      finalCurso.textContent = reserva.curso;
      finalFecha.textContent = formatearFecha(reserva.fecha);
      finalHora.textContent = reserva.hora;
      finalModalidad.textContent = reserva.modalidad;
      finalDuracion.textContent = reserva.duracion;
      finalTotal.textContent = totalFormateado;

      reservaFormulario.hidden = true;
      reservaConfirmacion.hidden = false;
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

  btnMenu?.addEventListener("click", () => {
    menuPrincipal?.classList.toggle("is-open");
  });

  menuPrincipal?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuPrincipal.classList.remove("is-open");
    });
  });
  observarUsuario((usuario) => {
    if (usuario) {
      if (textoSesionApp) {
        textoSesionApp.textContent = "Sesión iniciada";
        textoSesionApp.title = usuario.email;
      }

      if (btnCerrarSesionApp) {
        btnCerrarSesionApp.classList.remove("oculto");
      }
    } else {
      if (textoSesionApp) {
        textoSesionApp.textContent = "Sin sesión";
        textoSesionApp.title = "No has iniciado sesión";
      }

      if (btnCerrarSesionApp) {
        btnCerrarSesionApp.classList.add("oculto");
      }
    }
  });

  btnCerrarSesionApp?.addEventListener("click", async () => {
    try {
      await cerrarSesion();
      alert("Sesión cerrada correctamente.");
    } catch (error) {
      console.error(error);
      alert("No se pudo cerrar sesión.");
    }
  });
  cargarTutoresDesdeFirestore();
});
