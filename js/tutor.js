import {
  observarUsuario,
  obtenerPostulacionTutorPorUid,
  guardarPostulacionTutor,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnPostularTutor = document.getElementById("btnPostularTutor");
  const modalPostulacionTutor = document.getElementById(
    "modalPostulacionTutor",
  );
  const cerrarModalTutor = document.getElementById("cerrarModalTutor");
  const cancelarTutor = document.getElementById("cancelarTutor");
  const formPostulacionTutor = document.getElementById("formPostulacionTutor");
  const mensajeTutor = document.getElementById("mensajeTutor");

  let usuarioActual = null;
  let postulacionExistente = null;

  observarUsuario(async (usuario) => {
    usuarioActual = usuario;

    if (!usuarioActual) {
      postulacionExistente = null;
      return;
    }

    try {
      postulacionExistente = await obtenerPostulacionTutorPorUid(
        usuarioActual.uid,
      );
    } catch (error) {
      console.error("Error al revisar la postulación del tutor:", error);
    }
  });

  function abrirModalTutor() {
    if (!usuarioActual) {
      alert("Para postular como tutor, primero debes iniciar sesión.");
      window.location.href = "cuenta.html";
      return;
    }

    if (postulacionExistente) {
      alert(
        `Ya tienes una postulación registrada con estado: ${postulacionExistente.estado}.`,
      );
      return;
    }

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
    formPostulacionTutor.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!usuarioActual) {
        mostrarMensajeTutor(
          "Debes iniciar sesión antes de enviar tu postulación.",
          "error",
        );
        return;
      }

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

      try {
        await guardarPostulacionTutor({
          nombre: nombreTutor,
          correo: correoTutor,
          telefono: telefonoTutor,
          cursos: cursosTutor,
          nivel: nivelTutor,
          disponibilidad: disponibilidadTutor,
          experiencia: experienciaTutor,
        });

        postulacionExistente = {
          uid: usuarioActual.uid,
          nombre: nombreTutor,
          correo: correoTutor,
          telefono: telefonoTutor,
          cursos: cursosTutor,
          nivel: nivelTutor,
          disponibilidad: disponibilidadTutor,
          experiencia: experienciaTutor,
          estado: "pendiente",
        };

        mostrarMensajeTutor(
          "Tu postulación fue enviada correctamente. TutorFlash revisará tu información.",
          "exito",
        );

        setTimeout(() => {
          formPostulacionTutor.reset();
          cerrarModalPostulacion();
        }, 1800);
      } catch (error) {
        console.error("Error al guardar la postulación:", error);

        mostrarMensajeTutor(
          error.message || "Ocurrió un error al enviar tu postulación.",
          "error",
        );
      }
    });
  }
});
