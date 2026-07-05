document.addEventListener("DOMContentLoaded", () => {
  const btnPostularTutor = document.getElementById("btnPostularTutor");
  const modalPostulacionTutor = document.getElementById(
    "modalPostulacionTutor",
  );
  const cerrarModalTutor = document.getElementById("cerrarModalTutor");
  const cancelarTutor = document.getElementById("cancelarTutor");
  const formPostulacionTutor = document.getElementById("formPostulacionTutor");
  const mensajeTutor = document.getElementById("mensajeTutor");

  function abrirModalTutor() {
    if (!modalPostulacionTutor) return;

    modalPostulacionTutor.classList.add("activo");
    document.body.style.overflow = "hidden";
  }

  function cerrarModalPostulacion() {
    if (!modalPostulacionTutor) return;

    modalPostulacionTutor.classList.remove("activo");
    document.body.style.overflow = "";

    if (mensajeTutor) {
      mensajeTutor.textContent = "";
      mensajeTutor.className = "mensaje-tutor";
    }
  }

  function mostrarMensajeTutor(texto, tipo) {
    if (!mensajeTutor) return;

    mensajeTutor.textContent = texto;
    mensajeTutor.className = `mensaje-tutor ${tipo}`;
  }

  if (btnPostularTutor) {
    btnPostularTutor.addEventListener("click", abrirModalTutor);
  }

  if (cerrarModalTutor) {
    cerrarModalTutor.addEventListener("click", cerrarModalPostulacion);
  }

  if (cancelarTutor) {
    cancelarTutor.addEventListener("click", cerrarModalPostulacion);
  }

  if (modalPostulacionTutor) {
    modalPostulacionTutor.addEventListener("click", (event) => {
      if (event.target === modalPostulacionTutor) {
        cerrarModalPostulacion();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      cerrarModalPostulacion();
    }
  });

  if (formPostulacionTutor) {
    formPostulacionTutor.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombreTutor = document.getElementById("nombreTutor").value.trim();
      const correoTutor = document.getElementById("correoTutor").value.trim();
      const telefonoTutor = document
        .getElementById("telefonoTutor")
        .value.trim();
      const cursosTutor = document.getElementById("cursosTutor").value.trim();
      const nivelTutor = document.getElementById("nivelTutor").value;
      const disponibilidadTutor = document.getElementById(
        "disponibilidadTutor",
      ).value;
      const experienciaTutor = document
        .getElementById("experienciaTutor")
        .value.trim();

      if (
        !nombreTutor ||
        !correoTutor ||
        !telefonoTutor ||
        !cursosTutor ||
        !nivelTutor ||
        !disponibilidadTutor ||
        !experienciaTutor
      ) {
        mostrarMensajeTutor(
          "Por favor completa todos los campos antes de enviar tu postulación.",
          "error",
        );
        return;
      }

      mostrarMensajeTutor(
        "Tu postulación fue registrada como maqueta. Muy pronto TutorFlash activará esta función.",
        "exito",
      );

      setTimeout(() => {
        formPostulacionTutor.reset();
        cerrarModalPostulacion();
      }, 1800);
    });
  }
});
