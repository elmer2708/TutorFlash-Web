document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".tutorflash-home");

  if (!page) return;

  const buttons = page.querySelectorAll(
    ".tf-card-btn, .tf-reserve-form button",
  );

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const originalText = button.textContent;

      button.textContent = "Solicitud enviada ✓";
      button.style.opacity = "0.85";

      setTimeout(() => {
        button.textContent = originalText;
        button.style.opacity = "1";
      }, 1800);
    });
  });
});

const mobileToggle = document.querySelector(".tf-mobile-toggle");
const mobileMenu = document.querySelector(".tf-menu");

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

const tutorButtons = document.querySelectorAll(".tf-card-btn");
const tutorInput = document.querySelector("#tutorElegido");
const cursoInput = document.querySelector("#cursoTema");
const reservarSection = document.querySelector("#reservar");

tutorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tutorCard = button.closest(".tf-tutor-card");
    const miniCard = button.closest(".tf-tutor-mini-card");

    let tutorNombre = "";
    let cursoNombre = "";

    if (tutorCard) {
      tutorNombre = tutorCard.querySelector("h3")?.textContent || "";
      cursoNombre =
        tutorCard.querySelector(".tf-tutor-head p")?.textContent || "";
    }

    if (miniCard) {
      tutorNombre = miniCard.querySelector("h4")?.textContent || "";
      const texto = miniCard.querySelector("p")?.textContent || "";
      cursoNombre = texto.split("·")[0].trim();
    }

    if (tutorInput) {
      tutorInput.value = tutorNombre;
    }

    if (cursoInput) {
      cursoInput.value = cursoNombre;
    }

    if (reservarSection) {
      reservarSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});
const inputBusqueda = document.querySelector("#busquedaTutor");
const btnBuscarTutor = document.querySelector("#btnBuscarTutor");
const mensajeBusqueda = document.querySelector("#mensajeBusqueda");
const tarjetasTutores = document.querySelectorAll(".tf-tutor-card");
const seccionTutores = document.querySelector("#tutores");

if (inputBusqueda && btnBuscarTutor && tarjetasTutores.length > 0) {
  btnBuscarTutor.addEventListener("click", () => {
    const textoBusqueda = inputBusqueda.value.trim().toLowerCase();
    let encontrados = 0;

    tarjetasTutores.forEach((tarjeta) => {
      const contenidoTarjeta = tarjeta.textContent.toLowerCase();

      if (textoBusqueda === "" || contenidoTarjeta.includes(textoBusqueda)) {
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
        mensajeBusqueda.textContent = `Se encontraron ${encontrados} tutor(es) relacionados con "${inputBusqueda.value}".`;
      } else {
        mensajeBusqueda.textContent = `No se encontraron tutores para "${inputBusqueda.value}".`;
      }
    }

    if (seccionTutores) {
      seccionTutores.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
}
