import {
  observarUsuario,
  cerrarSesion,
  obtenerTutorActivoActual,
  actualizarPerfilTutorActual,
} from "./firebase-service.js";

document.addEventListener("DOMContentLoaded", () => {
  const formPerfilTutor = document.getElementById("formPerfilTutor");
  const mensajePerfilTutor = document.getElementById("mensajePerfilTutor");
  const btnGuardarPerfilTutor = document.getElementById(
    "btnGuardarPerfilTutor",
  );
  const btnCerrarSesionTutor = document.getElementById("btnCerrarSesionTutor");

  const nombreInput = document.getElementById("nombreTutorPerfil");
  const correoInput = document.getElementById("correoTutorPerfil");
  const presentacionInput = document.getElementById("presentacionTutorPerfil");
  const experienciaInput = document.getElementById("experienciaTutorPerfil");
  const cursosInput = document.getElementById("cursosTutorPerfil");
  const nivelInput = document.getElementById("nivelTutorPerfil");
  const modalidadInput = document.getElementById("modalidadTutorPerfil");
  const precioInput = document.getElementById("precioTutorPerfil");
  const disponibilidadInput = document.getElementById(
    "disponibilidadTutorPerfil",
  );
  const distritoInput = document.getElementById("distritoTutorPerfil");
  const estadoPublicoInput = document.getElementById(
    "estadoPublicoTutorPerfil",
  );

  const avatarPreview = document.getElementById("avatarTutorPreview");
  const previewNombre = document.getElementById("previewNombre");
  const previewPresentacion = document.getElementById("previewPresentacion");
  const previewCursos = document.getElementById("previewCursos");
  const previewNivel = document.getElementById("previewNivel");
  const previewModalidad = document.getElementById("previewModalidad");
  const previewPrecio = document.getElementById("previewPrecio");
  const previewDisponibilidad = document.getElementById(
    "previewDisponibilidad",
  );
  const previewDistrito = document.getElementById("previewDistrito");
  const previewEstado = document.getElementById("previewEstado");

  let tutorActual = null;

  function mostrarMensaje(texto, tipo = "info") {
    if (!mensajePerfilTutor) return;

    mensajePerfilTutor.textContent = texto;
    mensajePerfilTutor.className = `mensaje-perfil ${tipo}`;
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

  function normalizar(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  const cursosCorregidos = {
    matematica: "Matemática",
    algebra: "Álgebra",
    calculo: "Cálculo",
    estadistica: "Estadística",
    quimica: "Química",
    fisica: "Física",
    ingles: "Inglés",
    comunicacion: "Comunicación",
    programacion: "Programación",
    contabilidad: "Contabilidad",
    administracion: "Administración",
    biologia: "Biología",
    historia: "Historia",
    geografia: "Geografía",
    economia: "Economía",
    psicologia: "Psicología",
  };

  function corregirCurso(curso) {
    const clave = normalizar(curso);
    return cursosCorregidos[clave] || capitalizarTexto(curso);
  }

  function corregirCursosTexto(texto) {
    return String(texto || "")
      .split(",")
      .map((curso) => corregirCurso(curso.trim()))
      .filter(Boolean)
      .join(", ");
  }

  function obtenerIniciales(nombre) {
    const partes = String(nombre || "TutorFlash Tutor")
      .trim()
      .split(" ")
      .filter(Boolean);

    const primera = partes[0]?.charAt(0) || "T";
    const segunda = partes[1]?.charAt(0) || "F";

    return `${primera}${segunda}`.toUpperCase();
  }

  function actualizarPreview() {
    const nombre = nombreInput?.value.trim() || "TutorFlash Tutor";
    const presentacion =
      presentacionInput?.value.trim() || "Tu presentación aparecerá aquí.";
    const cursos = cursosInput?.value.trim() || "Cursos no registrados";
    const nivel = nivelInput?.value || "Nivel no indicado";
    const modalidad = modalidadInput?.value || "Modalidad no indicada";
    const precio = Number(precioInput?.value || 0);
    const disponibilidad = disponibilidadInput?.value || "No indicada";
    const distrito = distritoInput?.value.trim() || "No indicado";
    const estadoPublico = estadoPublicoInput?.value || "activo";

    if (avatarPreview) avatarPreview.textContent = obtenerIniciales(nombre);
    if (previewNombre) previewNombre.textContent = nombre;
    if (previewPresentacion) previewPresentacion.textContent = presentacion;
    if (previewCursos) previewCursos.textContent = cursos;
    if (previewNivel) previewNivel.textContent = nivel;
    if (previewModalidad) previewModalidad.textContent = modalidad;
    if (previewPrecio) previewPrecio.textContent = `S/ ${precio.toFixed(2)}`;
    if (previewDisponibilidad)
      previewDisponibilidad.textContent = disponibilidad;
    if (previewDistrito) previewDistrito.textContent = distrito;

    if (previewEstado) {
      previewEstado.textContent =
        estadoPublico === "pausado" ? "Pausado" : "Activo";
    }
  }

  function llenarFormulario(tutor) {
    const nombre = tutor.nombre || "";
    const correo = tutor.correo || tutor.correoUsuario || "";
    const presentacion = tutor.presentacion || "";
    const experiencia = tutor.experiencia || tutor.descripcion || "";
    const cursos = tutor.cursos || "";
    const nivel = tutor.nivel || "";
    const modalidad = tutor.modalidad || "";
    const precioHora = tutor.precioHora || tutor.precio || "";
    const disponibilidad = tutor.disponibilidad || "";
    const distrito = tutor.distrito || tutor.zona || "";
    const estadoPublico = tutor.estadoPublico || "activo";

    if (nombreInput) nombreInput.value = nombre;
    if (correoInput) correoInput.value = correo;
    if (presentacionInput) presentacionInput.value = presentacion;
    if (experienciaInput) experienciaInput.value = experiencia;
    if (cursosInput) cursosInput.value = cursos;
    if (nivelInput) nivelInput.value = nivel;
    if (modalidadInput) modalidadInput.value = modalidad;
    if (precioInput) precioInput.value = precioHora;
    if (disponibilidadInput) disponibilidadInput.value = disponibilidad;
    if (distritoInput) distritoInput.value = distrito;
    if (estadoPublicoInput) estadoPublicoInput.value = estadoPublico;

    actualizarPreview();
  }

  async function validarAcceso() {
    observarUsuario(async (usuario) => {
      if (!usuario) {
        window.location.href = "cuenta.html";
        return;
      }

      try {
        mostrarMensaje("Validando perfil del tutor...", "info");

        const tutorActivo = await obtenerTutorActivoActual();

        if (!tutorActivo) {
          window.location.href = "app.html";
          return;
        }

        tutorActual = tutorActivo;
        llenarFormulario(tutorActual);

        mostrarMensaje(
          "Perfil cargado correctamente. Puedes editar tus datos.",
          "exito",
        );
      } catch (error) {
        console.error("Error al cargar perfil tutor:", error);
        mostrarMensaje("No se pudo cargar tu perfil de tutor.", "error");
      }
    });
  }

  const camposPreview = [
    nombreInput,
    presentacionInput,
    cursosInput,
    nivelInput,
    modalidadInput,
    precioInput,
    disponibilidadInput,
    distritoInput,
    estadoPublicoInput,
  ];

  camposPreview.forEach((campo) => {
    campo?.addEventListener("input", actualizarPreview);
    campo?.addEventListener("change", actualizarPreview);
  });

  nombreInput?.addEventListener("blur", () => {
    nombreInput.value = capitalizarTexto(nombreInput.value);
    actualizarPreview();
  });

  cursosInput?.addEventListener("blur", () => {
    cursosInput.value = corregirCursosTexto(cursosInput.value);
    actualizarPreview();
  });

  distritoInput?.addEventListener("blur", () => {
    distritoInput.value = capitalizarTexto(distritoInput.value);
    actualizarPreview();
  });

  if (formPerfilTutor) {
    formPerfilTutor.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!tutorActual) {
        mostrarMensaje(
          "No se encontró un tutor activo para actualizar.",
          "error",
        );
        return;
      }

      const nombre = capitalizarTexto(nombreInput?.value || "");
      const correo = correoInput?.value.trim().toLowerCase() || "";
      const presentacion = presentacionInput?.value.trim() || "";
      const experiencia = experienciaInput?.value.trim() || "";
      const cursos = corregirCursosTexto(cursosInput?.value || "");
      const nivel = nivelInput?.value || "";
      const modalidad = modalidadInput?.value || "";
      const precioHora = Number(precioInput?.value || 0);
      const disponibilidad = disponibilidadInput?.value || "";
      const distrito = capitalizarTexto(distritoInput?.value || "");
      const estadoPublico = estadoPublicoInput?.value || "activo";

      if (
        !nombre ||
        !presentacion ||
        !experiencia ||
        !cursos ||
        !nivel ||
        !modalidad ||
        !precioHora ||
        !disponibilidad ||
        !distrito
      ) {
        mostrarMensaje(
          "Completa todos los campos antes de guardar tu perfil.",
          "error",
        );
        return;
      }

      if (precioHora <= 0) {
        mostrarMensaje("El precio por hora debe ser mayor a cero.", "error");
        return;
      }

      try {
        if (btnGuardarPerfilTutor) {
          btnGuardarPerfilTutor.disabled = true;
          btnGuardarPerfilTutor.textContent = "Guardando perfil...";
        }

        const perfilActualizado = await actualizarPerfilTutorActual({
          nombre,
          correo,
          presentacion,
          experiencia,
          cursos,
          nivel,
          modalidad,
          precioHora,
          disponibilidad,
          distrito,
          estadoPublico,
          perfilCompleto: true,
        });

        tutorActual = perfilActualizado;
        llenarFormulario(tutorActual);

        mostrarMensaje("Perfil actualizado correctamente.", "exito");
      } catch (error) {
        console.error("Error al guardar perfil:", error);

        mostrarMensaje(
          error.message || "No se pudo guardar el perfil del tutor.",
          "error",
        );
      } finally {
        if (btnGuardarPerfilTutor) {
          btnGuardarPerfilTutor.disabled = false;
          btnGuardarPerfilTutor.textContent = "Guardar perfil";
        }
      }
    });
  }

  if (btnCerrarSesionTutor) {
    btnCerrarSesionTutor.addEventListener("click", async () => {
      try {
        await cerrarSesion();
        window.location.href = "../index.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        mostrarMensaje("No se pudo cerrar sesión.", "error");
      }
    });
  }

  validarAcceso();
});
