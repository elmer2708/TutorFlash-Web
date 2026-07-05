document.addEventListener("DOMContentLoaded", () => {
  const inputBuscar = document.querySelector("#buscarCurso");
  const btnBuscar = document.querySelector("#btnBuscar");
  const mensaje = document.querySelector("#mensajeBusqueda");
  const tarjetas = document.querySelectorAll(".tf-tutor-card");
  const botonesCursos = document.querySelectorAll(".tf-courses button");
  const seccionTutores = document.querySelector("#tutores");

  const modal = document.querySelector("#reservaModal");
  const cerrarModal = document.querySelector("#cerrarModal");
  const btnCerrarModal = document.querySelector("#btnCerrarModal");

  const reservaFormulario = document.querySelector("#reservaFormulario");
  const reservaConfirmacion = document.querySelector("#reservaConfirmacion");
  const formReserva = document.querySelector("#formReserva");

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
  const btnMenu = document.querySelector("#btnMenu");
  const menuPrincipal = document.querySelector("#menuPrincipal");

  let tutorSeleccionado = {
    tutor: "",
    curso: "",
    rating: "",
    price: "",
    availability: "",
  };

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

  const actualizarHorasDisponibles = () => {
    if (!fechaReserva || !horaReserva) return;

    const esHoy = fechaEsHoy(fechaReserva.value);
    const opcionesHora = Array.from(horaReserva.options);
    const opcionesValidas = opcionesHora.filter((option) => option.value);

    let primeraDisponible = "";

    opcionesHora.forEach((option) => {
      if (!option.value) {
        option.disabled = false;
        return;
      }

      const debeBloquear = esHoy && horaYaPaso(option.value);

      option.disabled = debeBloquear;

      if (!debeBloquear && !primeraDisponible) {
        primeraDisponible = option.value;
      }
    });

    if (!primeraDisponible) {
      fechaReserva.value = obtenerFechaManana();

      opcionesHora.forEach((option) => {
        option.disabled = false;
      });

      if (opcionesValidas[0]) {
        horaReserva.value = opcionesValidas[0].value;
      }

      actualizarDisponibilidadModal();
      return;
    }

    if (!horaReserva.value || horaReserva.selectedOptions[0]?.disabled) {
      horaReserva.value = primeraDisponible;
    }
  };

  const actualizarDisponibilidadModal = () => {
    if (!modalInfo) return;

    const disponibilidad =
      fechaReserva.value === obtenerFechaManana()
        ? "Disponible mañana"
        : obtenerDisponibilidadReal(tutorSeleccionado.availability);

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
    const precioBase = Number(tutorSeleccionado.price) || 0;
    const minutos = obtenerMinutos();

    return precioBase * (minutos / 30);
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

  const abrirModal = () => {
    if (!modal) return;

    formReserva?.reset();

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

    actualizarHorasDisponibles();
    actualizarDisponibilidadModal();
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

  const obtenerInicial = (nombre) => {
    return nombre.trim().charAt(0).toUpperCase() || "T";
  };

  const actualizarModal = () => {
    modalAvatar.textContent = obtenerInicial(tutorSeleccionado.tutor);
    modalTutor.textContent = tutorSeleccionado.tutor;
    modalCurso.textContent = tutorSeleccionado.curso;
    modalInfo.textContent = `⭐ ${tutorSeleccionado.rating} · ${tutorSeleccionado.availability}`;

    actualizarTotal();
  };
  duracionReserva?.addEventListener("change", actualizarTotal);

  document.querySelectorAll(".tf-card-btn").forEach((boton) => {
    boton.addEventListener("click", () => {
      const tarjeta = boton.closest(".tf-tutor-card");

      tutorSeleccionado = {
        tutor: tarjeta.dataset.tutor,
        curso: tarjeta.dataset.course,
        rating: tarjeta.dataset.rating,
        price: tarjeta.dataset.price,
        availability: obtenerDisponibilidadReal(tarjeta.dataset.availability),
      };

      actualizarModal();
      abrirModal();
    });
  });

  if (fechaReserva) {
    const hoy = obtenerFechaLocal();
    const fechaMaxima = obtenerFechaMaxima();
    const yearActual = new Date().getFullYear();

    fechaReserva.min = hoy;
    fechaReserva.max = fechaMaxima;

    fechaReserva.addEventListener("input", () => {
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

      actualizarHorasDisponibles();
      actualizarDisponibilidadModal();
    });
  }
  formReserva?.addEventListener("submit", (event) => {
    event.preventDefault();

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

    fechaReserva.setCustomValidity("");

    finalTutor.textContent = tutorSeleccionado.tutor;
    finalCurso.textContent = tutorSeleccionado.curso;
    finalFecha.textContent = formatearFecha(fechaReserva.value);
    finalHora.textContent = horaReserva.value;
    finalModalidad.textContent = modalidadReserva.value;
    finalDuracion.textContent = duracionReserva.value;
    finalTotal.textContent = formatearSoles(calcularTotal());

    reservaFormulario.hidden = true;
    reservaConfirmacion.hidden = false;
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
});
