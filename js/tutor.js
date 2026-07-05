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

  const normalizar = (texto) => {
    return String(texto || "")
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

  const corregirCursosTexto = (texto) => {
    return String(texto || "")
      .split(",")
      .map((curso) => corregirCurso(curso.trim()))
      .filter(Boolean)
      .join(", ");
  };

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
      if (postulacionExistente.estado === "aprobado") {
        alert(
          "Tu postulación ya fue aprobada. Ahora formas parte de TutorFlash como tutor.",
        );
        return;
      }

      if (postulacionExistente.estado === "pendiente") {
        alert(
          "Ya tienes una postulación pendiente. TutorFlash está revisando tu información.",
        );
        return;
      }

      if (postulacionExistente.estado === "rechazado") {
        alert(
          "Tu postulación fue revisada. Más adelante podrás volver a postular.",
        );
        return;
      }

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

      const nombreTutor = capitalizarTexto(
        document.getElementById("nombreTutor").value,
      );

      const correoTutor = document
        .getElementById("correoTutor")
        .value.trim()
        .toLowerCase();

      const telefonoTutor = document
        .getElementById("telefonoTutor")
        .value.trim();

      const cursosTutor = corregirCursosTexto(
        document.getElementById("cursosTutor").value,
      );

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

  const inputNombreTutor = document.getElementById("nombreTutor");
  const inputCursosTutor = document.getElementById("cursosTutor");

  inputNombreTutor?.addEventListener("blur", () => {
    inputNombreTutor.value = capitalizarTexto(inputNombreTutor.value);
  });

  inputCursosTutor?.addEventListener("blur", () => {
    inputCursosTutor.value = corregirCursosTexto(inputCursosTutor.value);
  });
});
