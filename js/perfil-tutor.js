import {
  observarUsuario,
  obtenerTutorActivoActual,
  actualizarPerfilTutorActual,
  actualizarDatosPagoTutor,
  obtenerMisDatosPagoTutor,
  soloDigitos,
  validarCelularPeruOpcional,
  validarNumeroCuentaOpcional,
  validarCciOpcional,
} from "./firebase-service.js";
import { limitarTexto, validarEnlaceClase } from "./validaciones.js";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const formPerfilTutor = $("formPerfilTutor");
  const mensajePerfilTutor = $("mensajePerfilTutor");
  const btnGuardarPerfilTutor = $("btnGuardarPerfilTutor");
  const btnGuardarDatosPago = $("btnGuardarDatosPago");
  const mensajeDatosPago = $("mensajeDatosPago");

  const campos = {
    nombre: $("nombreTutorPerfil"),
    correo: $("correoTutorPerfil"),
    presentacion: $("presentacionTutorPerfil"),
    experiencia: $("experienciaTutorPerfil"),
    cursos: $("cursosTutorPerfil"),
    nivel: $("nivelTutorPerfil"),
    modalidad: $("modalidadTutorPerfil"),
    precio: $("precioTutorPerfil"),
    disponibilidad: $("disponibilidadTutorPerfil"),
    distrito: $("distritoTutorPerfil"),
    estadoPublico: $("estadoPublicoTutorPerfil"),
    cvUrl: $("cvUrlTutorPerfil"),
  };

  const pagoCampos = {
    yape: $("pagoYape"),
    plin: $("pagoPlin"),
    banco: $("pagoBanco"),
    numeroCuenta: $("pagoNumeroCuenta"),
    cci: $("pagoCci"),
    titular: $("pagoTitular"),
    instrucciones: $("pagoInstrucciones"),
  };

  const preview = {
    avatar: $("avatarTutorPreview"),
    nombre: $("previewNombre"),
    presentacion: $("previewPresentacion"),
    cursos: $("previewCursos"),
    nivel: $("previewNivel"),
    modalidad: $("previewModalidad"),
    precio: $("previewPrecio"),
    disponibilidad: $("previewDisponibilidad"),
    distrito: $("previewDistrito"),
    estado: $("previewEstado"),
  };

  let tutorActual = null;

  function mostrarMensaje(elemento, claseBase, texto, tipo = "info") {
    if (!elemento) return;

    let mensaje = texto;

    if (
      String(texto).includes("Missing or insufficient permissions") ||
      String(texto).includes("permission-denied")
    ) {
      mensaje =
        "No tienes permisos para guardar estos datos. Revisa las reglas de Firebase o vuelve a iniciar sesión.";
    }

    elemento.textContent = mensaje;
    elemento.className = `${claseBase} ${tipo}`;
  }

  function mostrarMensajePerfil(texto, tipo = "info") {
    mostrarMensaje(mensajePerfilTutor, "mensaje-perfil", texto, tipo);
  }

  function mostrarMensajePago(texto, tipo = "info") {
    mostrarMensaje(mensajeDatosPago, "mensaje-datos-pago", texto, tipo);
  }

  function capitalizarTexto(texto) {
    return String(texto || "")
      .toLowerCase()
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((palabra, index) => {
        const minusculas = ["de", "del", "la", "las", "el", "los", "y"];
        return index > 0 && minusculas.includes(palabra)
          ? palabra
          : palabra.charAt(0).toUpperCase() + palabra.slice(1);
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
    const nombre = campos.nombre?.value.trim() || "TutorFlash Tutor";
    const presentacion =
      campos.presentacion?.value.trim() || "Tu presentación aparecerá aquí.";
    const cursos = campos.cursos?.value.trim() || "Cursos no registrados";
    const nivel = campos.nivel?.value || "Nivel no indicado";
    const modalidad = "Virtual";
    const precio = Number(campos.precio?.value || 0);
    const disponibilidad = campos.disponibilidad?.value || "No indicada";
    const distrito = campos.distrito?.value.trim() || "No indicado";
    const estadoPublico = campos.estadoPublico?.value || "activo";

    if (preview.avatar) preview.avatar.textContent = obtenerIniciales(nombre);
    if (preview.nombre) preview.nombre.textContent = nombre;
    if (preview.presentacion) preview.presentacion.textContent = presentacion;
    if (preview.cursos) preview.cursos.textContent = cursos;
    if (preview.nivel) preview.nivel.textContent = nivel;
    if (preview.modalidad) preview.modalidad.textContent = modalidad;
    if (preview.precio) preview.precio.textContent = `S/ ${precio.toFixed(2)}`;
    if (preview.disponibilidad) preview.disponibilidad.textContent = disponibilidad;
    if (preview.distrito) preview.distrito.textContent = distrito;
    if (preview.estado) {
      preview.estado.textContent = estadoPublico === "pausado" ? "Pausado" : "Activo";
    }
  }

  function llenarFormulario(tutor) {
    if (!tutor) return;

    const valores = {
      nombre: tutor.nombre || "",
      correo: tutor.correo || tutor.correoUsuario || tutor.email || "",
      presentacion: tutor.presentacion || "",
      experiencia: tutor.experiencia || tutor.descripcion || "",
      cursos: tutor.cursos || tutor.curso || "",
      nivel: tutor.nivel || "",
      modalidad: "Virtual",
      precio: tutor.precioHora || tutor.precio || "",
      disponibilidad: tutor.disponibilidad || "",
      distrito: tutor.distrito || tutor.zona || "",
      estadoPublico: tutor.estadoPublico || "activo",
      cvUrl: tutor.cvUrl || "",
    };

    Object.entries(valores).forEach(([clave, valor]) => {
      if (campos[clave]) campos[clave].value = valor;
    });

    actualizarPreview();
  }

  function marcarValidez(input, esValido) {
    if (!input) return;

    if (!input.value.trim()) {
      input.removeAttribute("data-valido");
      input.removeAttribute("aria-invalid");
      return;
    }

    input.dataset.valido = esValido ? "true" : "false";
    input.setAttribute("aria-invalid", esValido ? "false" : "true");
  }

  function limitarCampoNumerico(input, maximo, validador) {
    if (!input) return;

    const limpiarYValidar = () => {
      input.value = soloDigitos(input.value).slice(0, maximo);
      marcarValidez(input, validador(input.value));
    };

    input.addEventListener("input", limpiarYValidar);
    input.addEventListener("blur", limpiarYValidar);
  }

  function validarDatosPagoFormulario() {
    const yape = validarCelularPeruOpcional(pagoCampos.yape?.value, "Yape");
    const plin = validarCelularPeruOpcional(pagoCampos.plin?.value, "Plin");
    const banco = limitarTexto(pagoCampos.banco?.value || "", 60, "banco").trim();
    const numeroCuenta = validarNumeroCuentaOpcional(pagoCampos.numeroCuenta?.value);
    const cci = validarCciOpcional(pagoCampos.cci?.value);
    const titular = limitarTexto(pagoCampos.titular?.value || "", 120, "titular").trim();
    const instrucciones = limitarTexto(
      pagoCampos.instrucciones?.value || "",
      250,
      "instrucciones",
    ).trim();

    const tieneBilletera = Boolean(yape || plin);
    const tieneCuentaBancaria = Boolean(numeroCuenta || cci);

    if (!tieneBilletera && !tieneCuentaBancaria) {
      throw new Error("Agrega al menos un método de pago: Yape, Plin o cuenta bancaria.");
    }

    if (tieneCuentaBancaria && !banco) {
      throw new Error("Si registras cuenta bancaria, ingresa el nombre del banco.");
    }

    if (!titular) {
      throw new Error("Ingresa el nombre del titular del pago.");
    }

    return {
      yape,
      plin,
      banco,
      numeroCuenta,
      cci,
      titular,
      instrucciones,
    };
  }

  function actualizarEstadoPagoEnVivo() {
    try {
      validarDatosPagoFormulario();
      mostrarMensajePago("Los datos de pago tienen un formato correcto.", "exito");
    } catch (error) {
      mostrarMensajePago(error.message, "info");
    }
  }

  function normalizarPagoCargado(datosPago) {
    const yape = soloDigitos(datosPago?.yape || "").slice(0, 9);
    const plin = soloDigitos(datosPago?.plin || "").slice(0, 9);
    let numeroCuenta = soloDigitos(
      datosPago?.numeroCuenta ||
        datosPago?.numeroDeCuenta ||
        datosPago?.cuenta ||
        datosPago?.cuentaBanco ||
        datosPago?.bancoCuenta ||
        "",
    ).slice(0, 20);
    let cci = soloDigitos(datosPago?.cci || datosPago?.pagoCci || "").slice(0, 20);

    if (!numeroCuenta && cci && cci.length !== 20) {
      numeroCuenta = cci;
      cci = "";
    }

    return {
      yape,
      plin,
      banco: datosPago?.banco || "",
      numeroCuenta,
      cci,
      titular: datosPago?.titular || "",
      instrucciones: datosPago?.instrucciones || "",
    };
  }

  function llenarFormularioDatosPago(datosPago) {
    const pago = normalizarPagoCargado(datosPago);

    Object.entries(pago).forEach(([clave, valor]) => {
      if (pagoCampos[clave]) pagoCampos[clave].value = valor;
    });

    marcarValidez(pagoCampos.yape, !pago.yape || /^9\d{8}$/.test(pago.yape));
    marcarValidez(pagoCampos.plin, !pago.plin || /^9\d{8}$/.test(pago.plin));
    marcarValidez(
      pagoCampos.numeroCuenta,
      !pago.numeroCuenta || /^\d{10,20}$/.test(pago.numeroCuenta),
    );
    marcarValidez(pagoCampos.cci, !pago.cci || /^\d{20}$/.test(pago.cci));
  }

  async function cargarDatosPagoTutor() {
    try {
      const datosPago = await obtenerMisDatosPagoTutor();

      if (datosPago) {
        llenarFormularioDatosPago(datosPago);
        mostrarMensajePago("Datos de pago cargados correctamente.", "exito");
        return;
      }

      mostrarMensajePago(
        "Agrega Yape, Plin o una cuenta bancaria para aceptar reservas.",
        "info",
      );
    } catch (error) {
      console.error("Error al cargar datos de pago:", error);
      mostrarMensajePago(error.message || "No se pudieron cargar tus datos de pago.", "error");
    }
  }

  async function validarAcceso() {
    observarUsuario(async (usuario) => {
      if (!usuario) {
        window.location.href = "cuenta.html";
        return;
      }

      try {
        mostrarMensajePerfil("Validando perfil del tutor...", "info");

        const tutorActivo = await obtenerTutorActivoActual();

        if (!tutorActivo) {
          window.location.href = "tutor.html";
          return;
        }

        tutorActual = tutorActivo;
        llenarFormulario(tutorActual);
        await cargarDatosPagoTutor();

        mostrarMensajePerfil(
          "Perfil cargado correctamente. Puedes editar tus datos.",
          "exito",
        );
      } catch (error) {
        console.error("Error al cargar perfil tutor:", error);
        mostrarMensajePerfil("No se pudo cargar tu perfil de tutor.", "error");
      }
    });
  }

  [
    campos.nombre,
    campos.presentacion,
    campos.cursos,
    campos.nivel,
    campos.modalidad,
    campos.precio,
    campos.disponibilidad,
    campos.distrito,
    campos.estadoPublico,
    campos.cvUrl,
  ].forEach((campo) => {
    campo?.addEventListener("input", actualizarPreview);
    campo?.addEventListener("change", actualizarPreview);
  });

  campos.nombre?.addEventListener("blur", () => {
    campos.nombre.value = capitalizarTexto(campos.nombre.value);
    actualizarPreview();
  });

  campos.cursos?.addEventListener("blur", () => {
    campos.cursos.value = corregirCursosTexto(campos.cursos.value);
    actualizarPreview();
  });

  campos.distrito?.addEventListener("blur", () => {
    campos.distrito.value = capitalizarTexto(campos.distrito.value);
    actualizarPreview();
  });

  formPerfilTutor?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!tutorActual) {
      mostrarMensajePerfil("No se encontró un tutor activo para actualizar.", "error");
      return;
    }

    const nombre = capitalizarTexto(campos.nombre?.value || "");
    const correo = campos.correo?.value.trim().toLowerCase() || "";
    const presentacion = campos.presentacion?.value.trim() || "";
    const experiencia = campos.experiencia?.value.trim() || "";
    const cursos = corregirCursosTexto(campos.cursos?.value || "");
    const nivel = campos.nivel?.value || "";
    const modalidad = "Virtual";
    const precioHora = Number(campos.precio?.value || 0);
    const disponibilidad = campos.disponibilidad?.value || "";
    const distrito = capitalizarTexto(campos.distrito?.value || "");
    const estadoPublico = campos.estadoPublico?.value || "activo";
    const cvUrl = campos.cvUrl?.value.trim() || "";

    if (
      !nombre ||
      !presentacion ||
      !experiencia ||
      !cursos ||
      !nivel ||
      !precioHora ||
      !disponibilidad
    ) {
      mostrarMensajePerfil("Completa todos los campos antes de guardar tu perfil.", "error");
      return;
    }

    if (precioHora <= 0) {
      mostrarMensajePerfil("El precio por hora debe ser mayor a cero.", "error");
      return;
    }

    if (precioHora > 300) {
      mostrarMensajePerfil("El precio por hora no debe superar S/ 300.", "error");
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
      mostrarMensajePerfil("Perfil actualizado correctamente.", "exito");
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      mostrarMensajePerfil(error.message || "No se pudo guardar el perfil del tutor.", "error");
    } finally {
      if (btnGuardarPerfilTutor) {
        btnGuardarPerfilTutor.disabled = false;
        btnGuardarPerfilTutor.textContent = "Guardar perfil";
      }
    }
  });

  limitarCampoNumerico(pagoCampos.yape, 9, (valor) => !valor || /^9\d{8}$/.test(valor));
  limitarCampoNumerico(pagoCampos.plin, 9, (valor) => !valor || /^9\d{8}$/.test(valor));
  limitarCampoNumerico(
    pagoCampos.numeroCuenta,
    20,
    (valor) => !valor || /^\d{10,20}$/.test(valor),
  );
  limitarCampoNumerico(pagoCampos.cci, 20, (valor) => !valor || /^\d{20}$/.test(valor));

  Object.values(pagoCampos).forEach((campo) => {
    campo?.addEventListener("input", actualizarEstadoPagoEnVivo);
    campo?.addEventListener("change", actualizarEstadoPagoEnVivo);
  });

  btnGuardarDatosPago?.addEventListener("click", async () => {
    try {
      const datosPago = validarDatosPagoFormulario();

      btnGuardarDatosPago.disabled = true;
      btnGuardarDatosPago.textContent = "Guardando datos...";

      await actualizarDatosPagoTutor(datosPago);

      llenarFormularioDatosPago(datosPago);
      mostrarMensajePago("Datos de pago guardados correctamente.", "exito");
    } catch (error) {
      console.error("Error al guardar datos de pago:", error);
      mostrarMensajePago(error.message || "No se pudieron guardar tus datos de pago.", "error");
    } finally {
      btnGuardarDatosPago.disabled = false;
      btnGuardarDatosPago.textContent = "Guardar datos de pago";
    }
  });

  validarAcceso();
});
