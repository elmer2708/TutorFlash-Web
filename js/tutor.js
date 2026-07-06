import {
  observarUsuario,
  cerrarSesion,
  obtenerPostulacionTutorPorUid,
  guardarPostulacionTutor,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const formPostulacionTutor = document.getElementById("formPostulacionTutor");
  const mensajeTutor = document.getElementById("mensajeTutor");

  const estadoEtiqueta = document.getElementById("estadoEtiqueta");
  const estadoTitulo = document.getElementById("estadoTitulo");
  const estadoDescripcion = document.getElementById("estadoDescripcion");

  const enlaceCuentaTutor = document.getElementById("enlaceCuentaTutor");
  const enlacePanelTutor = document.getElementById("enlacePanelTutor");

  const btnCerrarSesionTutor = document.getElementById("btnCerrarSesionTutor");
  const btnEnviarPostulacion = document.getElementById("btnEnviarPostulacion");

  const inputNombreTutor = document.getElementById("nombreTutor");
  const inputCorreoTutor = document.getElementById("correoTutor");
  const inputTelefonoTutor = document.getElementById("telefonoTutor");
  const inputCursosTutor = document.getElementById("cursosTutor");
  const inputNivelTutor = document.getElementById("nivelTutor");
  const inputDisponibilidadTutor = document.getElementById(
    "disponibilidadTutor",
  );
  const inputExperienciaTutor = document.getElementById("experienciaTutor");

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

  function mostrarMensajeTutor(texto, tipo = "info") {
    if (!mensajeTutor) return;

    mensajeTutor.textContent = texto;
    mensajeTutor.className = `mensaje-tutor ${tipo}`;
  }

  function limpiarMensajeTutor() {
    if (!mensajeTutor) return;

    mensajeTutor.textContent = "";
    mensajeTutor.className = "mensaje-tutor";
  }

  function mostrarEstado(tipo, titulo, descripcion) {
    if (estadoEtiqueta) {
      estadoEtiqueta.textContent = tipo;
      estadoEtiqueta.className = `estado-badge estado-${normalizar(tipo)}`;
    }

    if (estadoTitulo) {
      estadoTitulo.textContent = titulo;
    }

    if (estadoDescripcion) {
      estadoDescripcion.textContent = descripcion;
    }
  }

  function bloquearFormulario(bloquear) {
    const campos = [
      inputNombreTutor,
      inputTelefonoTutor,
      inputCursosTutor,
      inputNivelTutor,
      inputDisponibilidadTutor,
      inputExperienciaTutor,
      btnEnviarPostulacion,
    ];

    campos.forEach((campo) => {
      if (campo) {
        campo.disabled = bloquear;
      }
    });

    if (inputCorreoTutor) {
      inputCorreoTutor.readOnly = true;
      inputCorreoTutor.disabled = false;
    }
  }

  function completarFormulario(postulacion) {
    if (!postulacion) return;

    if (inputNombreTutor) inputNombreTutor.value = postulacion.nombre || "";
    if (inputCorreoTutor) {
      inputCorreoTutor.value =
        postulacion.correo ||
        postulacion.correoUsuario ||
        usuarioActual?.email ||
        "";
    }
    if (inputTelefonoTutor)
      inputTelefonoTutor.value = postulacion.telefono || "";
    if (inputCursosTutor) inputCursosTutor.value = postulacion.cursos || "";
    if (inputNivelTutor) inputNivelTutor.value = postulacion.nivel || "";
    if (inputDisponibilidadTutor) {
      inputDisponibilidadTutor.value = postulacion.disponibilidad || "";
    }
    if (inputExperienciaTutor) {
      inputExperienciaTutor.value =
        postulacion.experiencia || postulacion.descripcion || "";
    }
  }

  function prepararVistaSinSesion() {
    usuarioActual = null;
    postulacionExistente = null;

    mostrarEstado(
      "neutro",
      "Inicia sesión para postular",
      "Para enviar una postulación como tutor, primero debes crear una cuenta o iniciar sesión.",
    );

    if (inputCorreoTutor) {
      inputCorreoTutor.value = "";
    }

    if (enlaceCuentaTutor) enlaceCuentaTutor.classList.remove("oculto");
    if (enlacePanelTutor) enlacePanelTutor.classList.add("oculto");

    bloquearFormulario(true);
    mostrarMensajeTutor(
      "Primero inicia sesión para completar tu postulación.",
      "info",
    );
  }

  function prepararVistaNuevaPostulacion(usuario) {
    mostrarEstado(
      "nueva",
      "Puedes enviar tu postulación",
      "Completa el formulario. El administrador revisará tus datos antes de aprobar tu perfil como tutor.",
    );

    if (inputCorreoTutor) {
      inputCorreoTutor.value = usuario.email || "";
    }

    if (enlaceCuentaTutor) enlaceCuentaTutor.classList.add("oculto");
    if (enlacePanelTutor) enlacePanelTutor.classList.add("oculto");

    bloquearFormulario(false);
    limpiarMensajeTutor();
  }

  function prepararVistaPostulacionPendiente(postulacion) {
    completarFormulario(postulacion);

    mostrarEstado(
      "pendiente",
      "Tu postulación está pendiente",
      "TutorFlash ya recibió tu solicitud. El administrador revisará tu información y actualizará tu estado.",
    );

    if (enlaceCuentaTutor) enlaceCuentaTutor.classList.add("oculto");
    if (enlacePanelTutor) enlacePanelTutor.classList.add("oculto");

    bloquearFormulario(true);
    mostrarMensajeTutor(
      "Ya tienes una postulación pendiente. Espera la revisión del administrador.",
      "info",
    );
  }

  function prepararVistaPostulacionAprobada(postulacion) {
    completarFormulario(postulacion);

    mostrarEstado(
      "aprobado",
      "Tu postulación fue aprobada",
      "Ya formas parte de TutorFlash como tutor. Puedes entrar a tu panel para revisar tus reservas.",
    );

    if (enlaceCuentaTutor) enlaceCuentaTutor.classList.add("oculto");
    if (enlacePanelTutor) enlacePanelTutor.classList.remove("oculto");

    bloquearFormulario(true);
    mostrarMensajeTutor(
      "Tu perfil ya fue aprobado. Ingresa al panel tutor para continuar.",
      "exito",
    );
  }

  function prepararVistaPostulacionRechazada(postulacion) {
    completarFormulario(postulacion);

    mostrarEstado(
      "rechazado",
      "Tu postulación fue rechazada",
      "Tu solicitud ya fue revisada. Por ahora no puedes enviar otra postulación desde esta pantalla.",
    );

    if (enlaceCuentaTutor) enlaceCuentaTutor.classList.add("oculto");
    if (enlacePanelTutor) enlacePanelTutor.classList.add("oculto");

    bloquearFormulario(true);
    mostrarMensajeTutor(
      "Tu postulación fue rechazada. Más adelante se puede agregar una opción para volver a postular.",
      "error",
    );
  }

  observarUsuario(async (usuario) => {
    if (!usuario) {
      prepararVistaSinSesion();
      return;
    }

    usuarioActual = usuario;

    try {
      mostrarEstado(
        "neutro",
        "Revisando tu postulación",
        "Estamos verificando si ya tienes una solicitud registrada.",
      );

      postulacionExistente = await obtenerPostulacionTutorPorUid(usuario.uid);

      if (!postulacionExistente) {
        prepararVistaNuevaPostulacion(usuario);
        return;
      }

      if (postulacionExistente.estado === "pendiente") {
        prepararVistaPostulacionPendiente(postulacionExistente);
        return;
      }

      if (postulacionExistente.estado === "aprobado") {
        prepararVistaPostulacionAprobada(postulacionExistente);
        return;
      }

      if (postulacionExistente.estado === "rechazado") {
        prepararVistaPostulacionRechazada(postulacionExistente);
        return;
      }

      completarFormulario(postulacionExistente);
      bloquearFormulario(true);

      mostrarEstado(
        "neutro",
        "Postulación registrada",
        `Tu postulación tiene el estado: ${postulacionExistente.estado}.`,
      );
    } catch (error) {
      console.error("Error al revisar la postulación del tutor:", error);

      mostrarEstado(
        "error",
        "No se pudo revisar tu estado",
        "Ocurrió un problema al consultar tu postulación. Intenta nuevamente.",
      );

      bloquearFormulario(true);
      mostrarMensajeTutor(
        "No se pudo cargar tu información de tutor.",
        "error",
      );
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

      if (postulacionExistente) {
        mostrarMensajeTutor("Ya tienes una postulación registrada.", "error");
        return;
      }

      const nombreTutor = capitalizarTexto(inputNombreTutor?.value || "");
      const correoTutor = String(inputCorreoTutor?.value || "")
        .trim()
        .toLowerCase();
      const telefonoTutor = String(inputTelefonoTutor?.value || "").trim();
      const cursosTutor = corregirCursosTexto(inputCursosTutor?.value || "");
      const nivelTutor = inputNivelTutor?.value || "";
      const disponibilidadTutor = inputDisponibilidadTutor?.value || "";
      const experienciaTutor = String(
        inputExperienciaTutor?.value || "",
      ).trim();

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
          "Completa todos los campos antes de enviar tu postulación.",
          "error",
        );
        return;
      }

      if (telefonoTutor.length < 7) {
        mostrarMensajeTutor("Ingresa un teléfono o WhatsApp válido.", "error");
        return;
      }

      try {
        if (btnEnviarPostulacion) {
          btnEnviarPostulacion.disabled = true;
          btnEnviarPostulacion.textContent = "Enviando postulación...";
        }

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
          correoUsuario: usuarioActual.email,
          nombre: nombreTutor,
          correo: correoTutor,
          telefono: telefonoTutor,
          cursos: cursosTutor,
          nivel: nivelTutor,
          disponibilidad: disponibilidadTutor,
          experiencia: experienciaTutor,
          estado: "pendiente",
        };

        completarFormulario(postulacionExistente);
        prepararVistaPostulacionPendiente(postulacionExistente);

        mostrarMensajeTutor(
          "Tu postulación fue enviada correctamente. TutorFlash revisará tu información.",
          "exito",
        );
      } catch (error) {
        console.error("Error al guardar la postulación:", error);

        mostrarMensajeTutor(
          error.message || "Ocurrió un error al enviar tu postulación.",
          "error",
        );

        if (btnEnviarPostulacion) {
          btnEnviarPostulacion.disabled = false;
          btnEnviarPostulacion.textContent = "Enviar postulación";
        }
      }
    });
  }

  inputNombreTutor?.addEventListener("blur", () => {
    inputNombreTutor.value = capitalizarTexto(inputNombreTutor.value);
  });

  inputCursosTutor?.addEventListener("blur", () => {
    inputCursosTutor.value = corregirCursosTexto(inputCursosTutor.value);
  });

  if (btnCerrarSesionTutor) {
    btnCerrarSesionTutor.addEventListener("click", async () => {
      try {
        await cerrarSesion();
        window.location.href = "../index.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        mostrarMensajeTutor("No se pudo cerrar sesión.", "error");
      }
    });
  }
});
