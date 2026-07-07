import {
  observarUsuario,
  cerrarSesion,
  obtenerTutorActivoActual,
  actualizarPerfilTutorActual,
  actualizarDatosPagoTutor,
  obtenerMisDatosPagoTutor,
} from "./firebase-service.js";
import {
  limitarTexto,
  validarCelularPeru,
  validarEnlaceClase,
} from "./validaciones.js";

document.addEventListener("DOMContentLoaded", () => {
  const formPerfilTutor = document.getElementById("formPerfilTutor");
  const mensajePerfilTutor = document.getElementById("mensajePerfilTutor");
  const btnGuardarPerfilTutor = document.getElementById(
    "btnGuardarPerfilTutor",
  );
  const btnCerrarSesionTutor = document.getElementById("btnCerrarSesionTutor");
  const btnGuardarDatosPago = document.getElementById("btnGuardarDatosPago");
  const mensajeDatosPago = document.getElementById("mensajeDatosPago");

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
  const pagoYapeInput = document.getElementById("pagoYape");
  const pagoPlinInput = document.getElementById("pagoPlin");
  const pagoBancoInput = document.getElementById("pagoBanco");
  const pagoCciInput = document.getElementById("pagoCci");
  const pagoTitularInput = document.getElementById("pagoTitular");
  const pagoInstruccionesInput = document.getElementById("pagoInstrucciones");
  const cvUrlInput = document.getElementById("cvUrlTutorPerfil");

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

  function mostrarMensajeDatosPago(texto, tipo = "info") {
    if (!mensajeDatosPago) return;

    let mensajeTraducido = texto;

    if (
      String(texto).includes("Missing or insufficient permissions") ||
      String(texto).includes("permission-denied")
    ) {
      mensajeTraducido =
        "No tienes permisos para guardar tus datos de pago. Revisa las reglas de Firebase o vuelve a iniciar sesión.";
    }

    mensajeDatosPago.textContent = mensajeTraducido;
    mensajeDatosPago.className = `mensaje-datos-pago ${tipo}`;
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
    const modalidad = "Virtual";
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
    const modalidad = "Virtual";
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
    if (cvUrlInput) cvUrlInput.value = tutor.cvUrl || "";

    actualizarPreview();
  }

  function llenarFormularioDatosPago(datosPago) {
    if (!datosPago) return;

    if (pagoYapeInput) pagoYapeInput.value = datosPago.yape || "";
    if (pagoPlinInput) pagoPlinInput.value = datosPago.plin || "";
    if (pagoBancoInput) pagoBancoInput.value = datosPago.banco || "";
    if (pagoCciInput) pagoCciInput.value = datosPago.cci || "";
    if (pagoTitularInput) pagoTitularInput.value = datosPago.titular || "";
    if (pagoInstruccionesInput) {
      pagoInstruccionesInput.value = datosPago.instrucciones || "";
    }
  }

  async function cargarDatosPagoTutor() {
    try {
      const datosPago = await obtenerMisDatosPagoTutor();

      if (datosPago) {
        llenarFormularioDatosPago(datosPago);
        mostrarMensajeDatosPago(
          "Datos de pago cargados correctamente.",
          "exito",
        );
        return;
      }

      mostrarMensajeDatosPago(
        "Agrega tus métodos de pago para mostrarlos al estudiante.",
        "info",
      );
    } catch (error) {
      console.error("Error al cargar datos de pago:", error);
      mostrarMensajeDatosPago(
        error.message || "No se pudieron cargar tus datos de pago.",
        "error",
      );
    }
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
          window.location.href = "tutor.html";
          return;
        }

        tutorActual = tutorActivo;
        llenarFormulario(tutorActual);
        await cargarDatosPagoTutor();

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
    cvUrlInput,
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
      const modalidad = "Virtual";
      const precioHora = Number(precioInput?.value || 0);
      const disponibilidad = disponibilidadInput?.value || "";
      const distrito = capitalizarTexto(distritoInput?.value || "");
      const estadoPublico = estadoPublicoInput?.value || "activo";
      const cvUrl = cvUrlInput?.value.trim() || "";

      if (
        !nombre ||
        !presentacion ||
        !experiencia ||
        !cursos ||
        !nivel ||
        !precioHora ||
        !disponibilidad
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

      if (precioHora > 300) {
        mostrarMensaje("El precio por hora no debe superar S/ 300.", "error");
        return;
      }

      try {
        const cvUrlValidado = cvUrl ? validarEnlaceClase(cvUrl) : "";

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
          zona: distrito,
          estadoPublico,
          cvUrl: cvUrlValidado,
          cvTipo: cvUrlValidado.includes("drive.google.com")
            ? "drive"
            : cvUrlValidado
              ? "enlace"
              : "",
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

  if (btnGuardarDatosPago) {
    btnGuardarDatosPago.addEventListener("click", async () => {
      let yape = pagoYapeInput?.value.trim() || "";
      let plin = pagoPlinInput?.value.trim() || "";
      const banco = pagoBancoInput?.value.trim() || "";
      const cci = pagoCciInput?.value.trim() || "";
      const titular = pagoTitularInput?.value.trim() || "";
      const instrucciones = pagoInstruccionesInput?.value.trim() || "";
      const tieneMetodoPago = yape || plin || banco || cci;

      if (!tieneMetodoPago) {
        mostrarMensajeDatosPago(
          "Agrega al menos un método de pago: Yape, Plin, banco o CCI.",
          "error",
        );
        return;
      }

      if (!titular) {
        mostrarMensajeDatosPago(
          "Ingresa el nombre del titular del pago.",
          "error",
        );
        return;
      }

      try {
        if (yape) yape = validarCelularPeru(yape, "Yape");
        if (plin) plin = validarCelularPeru(plin, "Plin");

        if (banco.length > 60) {
          throw new Error("El banco no debe superar 60 caracteres.");
        }

        if (cci && !/^[0-9\s-]{5,34}$/.test(cci)) {
          throw new Error(
            "El CCI o número de cuenta solo debe tener números, espacios o guiones.",
          );
        }

        btnGuardarDatosPago.disabled = true;
        btnGuardarDatosPago.textContent = "Guardando datos...";

        await actualizarDatosPagoTutor({
          yape,
          plin,
          banco,
          cci,
          titular,
          instrucciones: limitarTexto(instrucciones, 500, "instrucciones"),
        });

        mostrarMensajeDatosPago(
          "Datos de pago guardados correctamente.",
          "exito",
        );
      } catch (error) {
        console.error("Error al guardar datos de pago:", error);
        mostrarMensajeDatosPago(
          error.message || "No se pudieron guardar tus datos de pago.",
          "error",
        );
      } finally {
        btnGuardarDatosPago.disabled = false;
        btnGuardarDatosPago.textContent = "Guardar datos de pago";
      }
    });
  }
  validarAcceso();
});

