document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".tutorflash-home");

  if (!page) return;

  const mobileToggle = page.querySelector(".tf-mobile-toggle");
  const mobileMenu = page.querySelector(".tf-menu");

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
      });
    });
  }

  const inputBusqueda = page.querySelector("#busquedaTutor");
  const btnBuscarTutor = page.querySelector("#btnBuscarTutor");
  const mensajeBusqueda = page.querySelector("#mensajeBusqueda");
  const tarjetasTutores = page.querySelectorAll(".tf-tutor-card");
  const seccionTutores = page.querySelector("#tutores");

  if (inputBusqueda && btnBuscarTutor && tarjetasTutores.length > 0) {
    const normalizarBusqueda = (texto) =>
      texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const quitarPluralSimple = (texto) =>
      texto.endsWith("s") ? texto.slice(0, -1) : texto;

    const ejecutarBusqueda = () => {
      const textoOriginal = inputBusqueda.value.trim();
      const textoBusqueda = normalizarBusqueda(textoOriginal);
      const textoSinPlural = quitarPluralSimple(textoBusqueda);
      let encontrados = 0;

      tarjetasTutores.forEach((tarjeta) => {
        const contenidoTarjeta = normalizarBusqueda(
          `${tarjeta.dataset.tutor || ""} ${
            tarjeta.dataset.course || tarjeta.dataset.curso || ""
          } ${tarjeta.dataset.availability || ""} ${tarjeta.textContent || ""}`,
        );

        const coincide =
          textoBusqueda === "" ||
          contenidoTarjeta.includes(textoBusqueda) ||
          contenidoTarjeta.includes(textoSinPlural);

        if (coincide) {
          tarjeta.classList.remove("is-hidden");
          encontrados++;
        } else {
          tarjeta.classList.add("is-hidden");
        }
      });

      if (mensajeBusqueda) {
        if (textoBusqueda === "") {
          mensajeBusqueda.textContent =
            "Mostrando todos los tutores disponibles.";
        } else if (encontrados > 0) {
          mensajeBusqueda.textContent = `Se encontraron ${encontrados} tutor(es) relacionados con "${textoOriginal}".`;
        } else {
          mensajeBusqueda.textContent = `No se encontraron tutores para "${textoOriginal}".`;
        }
      }

      seccionTutores?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    btnBuscarTutor.addEventListener("click", ejecutarBusqueda);

    inputBusqueda.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        ejecutarBusqueda();
      }
    });
  }

  const reservaState = {
    tutor: "Pendiente",
    curso: "Pendiente",
    rating: "--",
    disponibilidad: "Disponibilidad pendiente",
    fecha: "Hoy",
    hora: "5:00 p.m.",
    modalidad: "Virtual",
    duracion: "45 minutos",
    total: "S/ 45",
  };

  const fields = {
    tutorInput: page.querySelector("#tutorElegido"),
    cursoInput: page.querySelector("#cursoTema"),
    reservaAvatar: page.querySelector("#reservaAvatar"),
    reservaTutorNombre: page.querySelector("#reservaTutorNombre"),
    reservaTutorCurso: page.querySelector("#reservaTutorCurso"),
    reservaTutorRating: page.querySelector("#reservaTutorRating"),
    reservaTutorDisponibilidad: page.querySelector(
      "#reservaTutorDisponibilidad",
    ),
    resumenTitulo: page.querySelector("#resumenTitulo"),
    resumenTutor: page.querySelector("#resumenTutor"),
    resumenCurso: page.querySelector("#resumenCurso"),
    resumenFecha: page.querySelector("#resumenFecha"),
    resumenHora: page.querySelector("#resumenHora"),
    resumenModalidad: page.querySelector("#resumenModalidad"),
    resumenDuracion: page.querySelector("#resumenDuracion"),
    resumenTotal: page.querySelector("#resumenTotal"),
    finalTutor: page.querySelector("#finalTutor"),
    finalCurso: page.querySelector("#finalCurso"),
    finalFecha: page.querySelector("#finalFecha"),
    finalHora: page.querySelector("#finalHora"),
    finalModalidad: page.querySelector("#finalModalidad"),
    finalDuracion: page.querySelector("#finalDuracion"),
    finalTotal: page.querySelector("#finalTotal"),
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  const formatDate = (value) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value))
      return value || "Elegir fecha";

    const [year, month, day] = value.split("-");
    if (Number(year) < 2026) return "Elegir fecha";

    return `${day}/${month}/${year}`;
  };

  const customDateInput = page.querySelector("#fechaPersonalizada");
  const today = new Date().toISOString().slice(0, 10);
  if (customDateInput) customDateInput.min = today;

  const getCheckedInput = (name) =>
    page.querySelector(`input[name="${name}"]:checked`);

  const getDurationText = (input) => {
    const optionCard = input?.closest(".tf-option-card");
    const visibleText = optionCard?.querySelector("strong")?.textContent.trim();

    if (visibleText && visibleText !== "-") return visibleText;
    if (input?.value && input.value !== "-") return input.value;

    const price = input?.dataset.price || "45";
    if (price === "35") return "30 minutos";
    if (price === "60") return "60 minutos";
    return "45 minutos";
  };

  const syncReservationControls = () => {
    const checkedDate = getCheckedInput("fechaReserva");
    const checkedHour = getCheckedInput("horaReserva");
    const checkedMode = getCheckedInput("modalidadReserva");
    const checkedDuration = getCheckedInput("duracionReserva");
    const customDate = page.querySelector("#fechaPersonalizada")?.value;

    if (checkedDate) {
      reservaState.fecha =
        checkedDate.value === "Elegir fecha"
          ? formatDate(customDate)
          : checkedDate.value;
    }

    if (checkedHour) reservaState.hora = checkedHour.value;
    if (checkedMode) reservaState.modalidad = checkedMode.value;

    if (checkedDuration) {
      reservaState.duracion = getDurationText(checkedDuration);
      reservaState.total = `S/ ${checkedDuration.dataset.price || "45"}`;
    }
  };

  const updateSummary = () => {
    syncReservationControls();
    if (fields.tutorInput) fields.tutorInput.value = reservaState.tutor;
    if (fields.cursoInput) fields.cursoInput.value = reservaState.curso;

    if (fields.reservaAvatar)
      fields.reservaAvatar.textContent = getInitials(reservaState.tutor);
    if (fields.reservaTutorNombre)
      fields.reservaTutorNombre.textContent = reservaState.tutor;
    if (fields.reservaTutorCurso)
      fields.reservaTutorCurso.textContent = reservaState.curso;
    if (fields.reservaTutorRating)
      fields.reservaTutorRating.textContent =
        reservaState.rating === "--" ? "--" : `⭐ ${reservaState.rating}`;
    if (fields.reservaTutorDisponibilidad)
      fields.reservaTutorDisponibilidad.textContent =
        reservaState.disponibilidad;

    if (fields.resumenTitulo) {
      fields.resumenTitulo.textContent =
        reservaState.tutor === "Pendiente"
          ? "Completa tu reserva"
          : `Reserva con ${reservaState.tutor}`;
    }

    fields.resumenTutor &&
      (fields.resumenTutor.textContent = reservaState.tutor);
    fields.resumenCurso &&
      (fields.resumenCurso.textContent = reservaState.curso);
    fields.resumenFecha &&
      (fields.resumenFecha.textContent = reservaState.fecha);
    fields.resumenHora && (fields.resumenHora.textContent = reservaState.hora);
    fields.resumenModalidad &&
      (fields.resumenModalidad.textContent = reservaState.modalidad);
    fields.resumenDuracion &&
      (fields.resumenDuracion.textContent = reservaState.duracion);
    fields.resumenTotal &&
      (fields.resumenTotal.textContent = reservaState.total);
  };

  const setSelectedOption = (input) => {
    const groupName = input.name;
    page
      .querySelectorAll(`input[name="${groupName}"]`)
      .forEach((groupInput) => {
        groupInput
          .closest(".tf-option-card, .tf-pill-option")
          ?.classList.remove("is-selected");
      });
    input
      .closest(".tf-option-card, .tf-pill-option")
      ?.classList.add("is-selected");
  };

  page.querySelectorAll(".tf-card-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const tutorCard = button.closest(".tf-tutor-card");
      if (!tutorCard) return;

      reservaState.tutor =
        tutorCard.dataset.tutor ||
        tutorCard.querySelector("h3")?.textContent ||
        "Pendiente";
      reservaState.curso =
        tutorCard.dataset.course ||
        tutorCard.querySelector(".tf-tutor-head p")?.textContent ||
        "Pendiente";
      reservaState.rating = tutorCard.dataset.rating || "--";
      reservaState.disponibilidad =
        tutorCard.dataset.availability || "Disponibilidad pendiente";

      updateSummary();
      page
        .querySelector("#reservar")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  page.querySelectorAll('input[name="fechaReserva"]').forEach((input) => {
    input.addEventListener("change", () => {
      setSelectedOption(input);
      const customDate = page.querySelector("#fechaPersonalizada")?.value;
      reservaState.fecha =
        input.value === "Elegir fecha" && customDate
          ? formatDate(customDate)
          : input.value;
      updateSummary();
    });
  });

  page
    .querySelector("#fechaPersonalizada")
    ?.addEventListener("change", (event) => {
      const customRadio = page.querySelector(
        'input[name="fechaReserva"][value="Elegir fecha"]',
      );
      if (customRadio) {
        customRadio.checked = true;
        setSelectedOption(customRadio);
      }
      reservaState.fecha = formatDate(event.target.value);
      updateSummary();
    });

  page.querySelectorAll('input[name="horaReserva"]').forEach((input) => {
    input.addEventListener("change", () => {
      setSelectedOption(input);
      reservaState.hora = input.value;
      updateSummary();
    });
  });

  page.querySelectorAll('input[name="modalidadReserva"]').forEach((input) => {
    input.addEventListener("change", () => {
      setSelectedOption(input);
      reservaState.modalidad = input.value;
      updateSummary();
    });
  });

  page.querySelectorAll('input[name="duracionReserva"]').forEach((input) => {
    input.addEventListener("change", () => {
      setSelectedOption(input);
      reservaState.duracion = getDurationText(input);
      reservaState.total = `S/ ${input.dataset.price || "45"}`;
      updateSummary();
    });
  });

  page.querySelector("#formReserva")?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (reservaState.tutor === "Pendiente") {
      if (fields.resumenTitulo)
        fields.resumenTitulo.textContent = "Primero elige un tutor";
      page
        .querySelector("#tutores")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    syncReservationControls();
    updateSummary();

    fields.finalTutor && (fields.finalTutor.textContent = reservaState.tutor);
    fields.finalCurso && (fields.finalCurso.textContent = reservaState.curso);
    fields.finalFecha && (fields.finalFecha.textContent = reservaState.fecha);
    fields.finalHora && (fields.finalHora.textContent = reservaState.hora);
    fields.finalModalidad &&
      (fields.finalModalidad.textContent = reservaState.modalidad);
    fields.finalDuracion &&
      (fields.finalDuracion.textContent = reservaState.duracion);
    fields.finalTotal && (fields.finalTotal.textContent = reservaState.total);

    const confirmation = page.querySelector("#reservaConfirmacion");
    if (confirmation) {
      confirmation.hidden = false;
      confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  updateSummary();
});

/* Abrir reserva en ventana modal */

const tfReservaModalEl = document.getElementById("reservaModal");
const tfAbrirReservaModalBtn = document.getElementById("abrirReservaModal");
const tfCerrarReservaModalBtn = document.getElementById("cerrarReservaModal");
const tfCerrarReservaFondo = document.getElementById("cerrarReservaFondo");

function tfReiniciarVistaReserva() {
  const workflow = document.querySelector(".tf-reserve-workflow");
  const confirmacion = document.getElementById("reservaConfirmacion");
  const modalBox = document.querySelector(".tf-reserva-modal-box");

  if (workflow) {
    workflow.classList.remove("reserva-finalizada");
  }

  if (confirmacion) {
    confirmacion.hidden = true;
  }

  if (modalBox) {
    modalBox.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }
}

function tfAbrirModalReserva() {
  if (!tfReservaModalEl) return;

  tfReiniciarVistaReserva();

  tfReservaModalEl.classList.add("is-open");
  tfReservaModalEl.setAttribute("aria-hidden", "false");
  document.body.classList.add("tf-modal-open");
}

function tfCerrarModalReserva() {
  if (!tfReservaModalEl) return;

  tfReservaModalEl.classList.remove("is-open");
  tfReservaModalEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("tf-modal-open");
}

if (tfAbrirReservaModalBtn) {
  tfAbrirReservaModalBtn.addEventListener("click", tfAbrirModalReserva);
}

if (tfCerrarReservaModalBtn) {
  tfCerrarReservaModalBtn.addEventListener("click", tfCerrarModalReserva);
}

if (tfCerrarReservaFondo) {
  tfCerrarReservaFondo.addEventListener("click", tfCerrarModalReserva);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    tfCerrarModalReserva();
  }
});

document.querySelectorAll(".tf-tutor-card .tf-card-btn").forEach((button) => {
  button.addEventListener("click", () => {
    setTimeout(() => {
      tfAbrirModalReserva();
    }, 100);
  });
});

/* Mejorar vista final de solicitud enviada */

const tfWorkflowReserva = document.querySelector(".tf-reserve-workflow");
const tfNuevaReservaBtn = document.getElementById("nuevaReservaBtn");
const tfCerrarReservaFinalBtn = document.getElementById(
  "cerrarReservaFinalBtn",
);

if (formReserva) {
  formReserva.addEventListener("submit", () => {
    if (!tfWorkflowReserva || !reservaConfirmacion) return;

    setTimeout(() => {
      tfWorkflowReserva.classList.add("reserva-finalizada");
      reservaConfirmacion.hidden = false;

      const modalBox = document.querySelector(".tf-reserva-modal-box");
      if (modalBox) {
        modalBox.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }, 50);
  });
}

if (tfNuevaReservaBtn) {
  tfNuevaReservaBtn.addEventListener("click", () => {
    tfCerrarModalReserva();

    setTimeout(() => {
      const seccionTutores = document.getElementById("tutores");

      if (seccionTutores) {
        seccionTutores.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 250);
  });
}

if (tfCerrarReservaFinalBtn) {
  tfCerrarReservaFinalBtn.addEventListener("click", () => {
    tfCerrarModalReserva();
  });
}
