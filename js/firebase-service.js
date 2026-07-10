import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
  setDoc,
  getDoc,
  doc,
  orderBy,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_EMAILS = ["admin@gmail.com"].map((correo) =>
  correo.toLowerCase().trim(),
);

const ESTADOS_RESERVA_VALIDOS = [
  "pendiente",
  "aceptada",
  "en_curso",
  "finalizada",
  "rechazada",
  "cancelada_estudiante",
  "cancelada_tutor",
  "expirada",
];

function normalizarCorreo(correo) {
  return String(correo || "")
    .toLowerCase()
    .trim();
}

function normalizarEstado(estado) {
  return String(estado || "")
    .toLowerCase()
    .trim();
}

function obtenerUsuarioAutenticado(mensajeError) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error(mensajeError || "Debes iniciar sesión para continuar.");
  }

  return usuario;
}

function asegurarAdmin() {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión como administrador.",
  );

  if (!ADMIN_EMAILS.includes(normalizarCorreo(usuario.email))) {
    throw new Error("No tienes permiso de administrador para esta acción.");
  }

  return usuario;
}

function validarCampoObligatorio(valor, mensajeError) {
  if (valor === undefined || valor === null || String(valor).trim() === "") {
    throw new Error(mensajeError);
  }
}

function limpiarTextoSeguro(valor) {
  return String(valor || "").trim();
}

function validarUrlOpcional(valor, campo = "enlace") {
  const enlace = limpiarTextoSeguro(valor);

  if (!enlace) return "";

  if (/\s/.test(enlace) || !/^https?:\/\//i.test(enlace)) {
    throw new Error(
      `El ${campo} debe empezar con http:// o https:// y no tener espacios.`,
    );
  }

  return enlace;
}

export function validarCelularPeruOpcional(valor, campo = "celular") {
  const celular = String(valor || "").replace(/\s+/g, "");

  if (!celular) return "";

  if (!/^9\d{8}$/.test(celular)) {
    throw new Error(`${campo} debe tener 9 dígitos y empezar con 9.`);
  }

  return celular;
}

export function soloDigitos(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export function validarNumeroCuentaOpcional(valor) {
  const numero = soloDigitos(valor);

  if (!numero) return "";

  if (numero.length < 10 || numero.length > 20) {
    throw new Error("El número de cuenta debe tener entre 10 y 20 dígitos.");
  }

  return numero;
}

export function validarCciOpcional(valor) {
  const numero = soloDigitos(valor);

  if (!numero) return "";

  if (numero.length !== 20) {
    throw new Error("El CCI debe tener exactamente 20 dígitos.");
  }

  return numero;
}

function obtenerCvTipo(url) {
  return /drive\.google\.com/i.test(url) ? "drive" : "enlace";
}

export function observarUsuario(callback) {
  onAuthStateChanged(auth, callback);
}

export async function enviarRestablecimientoPassword(correo) {
  const correoNormalizado = normalizarCorreo(correo);

  if (
    !correoNormalizado ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNormalizado)
  ) {
    throw new Error("Ingresa un correo válido para restablecer tu contraseña.");
  }

  await sendPasswordResetEmail(auth, correoNormalizado);
}

export async function registrarUsuario(nombre, correo, password, rol) {
  validarCampoObligatorio(nombre, "Ingresa tu nombre para registrarte.");
  validarCampoObligatorio(correo, "Ingresa tu correo para registrarte.");
  validarCampoObligatorio(password, "Ingresa una contraseña para registrarte.");

  const correoNormalizado = normalizarCorreo(correo);

  let rolSeguro = String(rol || "estudiante")
    .toLowerCase()
    .trim();

  const rolesPermitidos = ["estudiante", "tutor"];

  if (!rolesPermitidos.includes(rolSeguro)) {
    rolSeguro = "estudiante";
  }

  const credencial = await createUserWithEmailAndPassword(
    auth,
    correoNormalizado,
    password,
  );

  await addDoc(collection(db, "usuarios"), {
    usuarioId: credencial.user.uid,
    nombre: nombre.trim(),
    correo: correoNormalizado,
    rol: rolSeguro,
    fechaRegistro: serverTimestamp(),
  });

  return credencial.user;
}

export async function iniciarSesion(correo, password) {
  const credencial = await signInWithEmailAndPassword(
    auth,
    normalizarCorreo(correo),
    password,
  );
  return credencial.user;
}

export async function iniciarSesionGoogle() {
  const provider = new GoogleAuthProvider();
  const credencial = await signInWithPopup(auth, provider);
  const usuario = credencial.user;
  const perfil = await obtenerPerfilUsuarioActual();

  if (!perfil) {
    await addDoc(collection(db, "usuarios"), {
      usuarioId: usuario.uid,
      nombre: usuario.displayName || "Estudiante",
      correo: normalizarCorreo(usuario.email),
      rol: "estudiante",
      fechaRegistro: serverTimestamp(),
      proveedor: "google",
    });
  }

  return usuario;
}

export async function cerrarSesion() {
  await signOut(auth);
}

export function obtenerUsuarioActual() {
  return auth.currentUser;
}

export async function guardarReserva(reserva) {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para guardar una reserva.",
  );

  validarCampoObligatorio(
    reserva?.tutorId,
    "Selecciona un tutor válido para reservar.",
  );
  validarCampoObligatorio(
    reserva?.tutor,
    "No se encontró el nombre del tutor.",
  );
  validarCampoObligatorio(
    reserva?.curso,
    "Selecciona un curso para la reserva.",
  );
  validarCampoObligatorio(
    reserva?.fecha,
    "Selecciona una fecha para la reserva.",
  );
  validarCampoObligatorio(
    reserva?.hora,
    "Selecciona una hora para la reserva.",
  );
  const modalidad = "Virtual";
  validarCampoObligatorio(
    reserva?.duracion,
    "Selecciona la duración de la reserva.",
  );

  if (reserva.total === undefined || reserva.total === null) {
    throw new Error("No se pudo calcular el total de la reserva.");
  }

  await addDoc(collection(db, "reservas"), {
    usuarioId: usuario.uid,
    correoUsuario: usuario.email,
    tutorId: reserva.tutorId,
    tutor: reserva.tutor,
    curso: reserva.curso,
    fecha: reserva.fecha,
    hora: reserva.hora,
    modalidad,
    duracion: reserva.duracion,
    total: reserva.total,
    metodoPago: reserva.metodoPago || "pendiente",
    estadoPago: reserva.estadoPago || "pendiente",
    plataformaClase: reserva.plataformaClase || "",
    enlaceClase: reserva.enlaceClase || "",
    estadoClase: reserva.estadoClase || "pendiente",
    estado: "pendiente",
    creadoEn: serverTimestamp(),
  });
}

export async function obtenerMisSesiones() {
  const usuario = auth.currentUser;

  if (!usuario) {
    return [];
  }

  const consulta = query(
    collection(db, "reservas"),
    where("usuarioId", "==", usuario.uid),
  );

  const resultado = await getDocs(consulta);

  return resultado.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

/* ============================= */
/* POSTULACIONES DE TUTORES */
/* ============================= */

export async function obtenerPostulacionTutorPorUid(uid) {
  const consulta = query(
    collection(db, "postulacionesTutores"),
    where("uid", "==", uid),
    limit(1),
  );

  const resultado = await getDocs(consulta);

  if (resultado.empty) {
    return null;
  }

  const documento = resultado.docs[0];

  return {
    id: documento.id,
    ...documento.data(),
  };
}

export async function guardarPostulacionTutor(postulacion) {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para postular como tutor.",
  );

  const tutorActivo = await obtenerTutorActivoActual();

  if (tutorActivo) {
    throw new Error("Ya eres tutor aprobado. No necesitas volver a postular.");
  }

  const postulacionExistente = await obtenerPostulacionTutorPorUid(usuario.uid);

  if (postulacionExistente) {
    throw new Error("Ya tienes una postulación registrada.");
  }

  validarCampoObligatorio(
    postulacion?.nombre,
    "Ingresa tu nombre para postular.",
  );
  validarCampoObligatorio(
    postulacion?.correo,
    "Ingresa tu correo para postular.",
  );
  validarCampoObligatorio(
    postulacion?.telefono,
    "Ingresa tu teléfono para postular.",
  );
  validarCampoObligatorio(
    postulacion?.cursos,
    "Ingresa los cursos que puedes enseñar.",
  );
  validarCampoObligatorio(
    postulacion?.nivel,
    "Selecciona el nivel que puedes enseñar.",
  );
  validarCampoObligatorio(
    postulacion?.disponibilidad,
    "Ingresa tu disponibilidad general.",
  );
  validarCampoObligatorio(
    postulacion?.experiencia,
    "Describe brevemente tu experiencia.",
  );

  const telefono = validarCelularPeruOpcional(postulacion.telefono, "celular");
  const cvUrl = validarUrlOpcional(postulacion.cvUrl, "enlace de CV");

  await addDoc(collection(db, "postulacionesTutores"), {
    uid: usuario.uid,
    correoUsuario: usuario.email,
    nombre: postulacion.nombre.trim(),
    correo: postulacion.correo.trim(),
    telefono,
    cursos: postulacion.cursos.trim(),
    nivel: postulacion.nivel.trim(),
    disponibilidad: postulacion.disponibilidad.trim(),
    experiencia: postulacion.experiencia.trim(),
    modalidad: "Virtual",
    cvUrl,
    cvTipo: cvUrl ? obtenerCvTipo(cvUrl) : "",
    cvActualizadoEn: cvUrl ? serverTimestamp() : null,
    estado: "pendiente",
    fechaPostulacion: serverTimestamp(),
  });
}

/* ============================= */
/* ADMIN - POSTULACIONES TUTORES */
/* ============================= */
export async function obtenerPostulacionesTutores() {
  asegurarAdmin();

  const resultado = await getDocs(collection(db, "postulacionesTutores"));

  return resultado.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function aprobarPostulacionTutor(postulacion) {
  asegurarAdmin();
  if (!postulacion?.id || !postulacion?.uid) {
    throw new Error(
      "La postulación no tiene datos suficientes para aprobarse.",
    );
  }

  const postulacionRef = doc(db, "postulacionesTutores", postulacion.id);
  const tutorRef = doc(db, "tutores", postulacion.uid);

  const consultaUsuario = query(
    collection(db, "usuarios"),
    where("usuarioId", "==", postulacion.uid),
    limit(1),
  );

  const resultadoUsuario = await getDocs(consultaUsuario);

  const usuarioRef = resultadoUsuario.empty
    ? null
    : doc(db, "usuarios", resultadoUsuario.docs[0].id);

  await runTransaction(db, async (transaction) => {
    const postulacionSnap = await transaction.get(postulacionRef);

    if (!postulacionSnap.exists()) {
      throw new Error("La postulación ya no existe.");
    }

    const datosPostulacion = postulacionSnap.data();

    const estadoActual = String(datosPostulacion.estado || "pendiente")
      .toLowerCase()
      .trim();

    if (estadoActual !== "pendiente") {
      throw new Error("Esta postulación ya fue revisada.");
    }

    transaction.set(
      tutorRef,
      {
        uid: datosPostulacion.uid,
        nombre: datosPostulacion.nombre || "",
        correo: datosPostulacion.correo || datosPostulacion.correoUsuario || "",
        correoUsuario:
          datosPostulacion.correoUsuario || datosPostulacion.correo || "",
        telefono: datosPostulacion.telefono || "",
        cursos: datosPostulacion.cursos || "",
        nivel: datosPostulacion.nivel || "",
        disponibilidad: datosPostulacion.disponibilidad || "",
        descripcion: datosPostulacion.experiencia || "",
        modalidad: "Virtual",
        cvUrl: datosPostulacion.cvUrl || "",
        cvTipo: datosPostulacion.cvTipo || "",
        estado: "activo",
        estadoPublico: "activo",
        perfilCompleto: false,
        precio: 25,
        rating: "4.8",
        fechaAprobacion: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      },
      { merge: true },
    );

    transaction.update(postulacionRef, {
      estado: "aprobado",
      fechaRevision: serverTimestamp(),
    });

    if (usuarioRef) {
      transaction.update(usuarioRef, {
        rol: "tutor",
        actualizadoEn: serverTimestamp(),
      });
    }
  });
}

export async function rechazarPostulacionTutor(postulacionId) {
  asegurarAdmin();
  if (!postulacionId) {
    throw new Error("No se encontró la postulación para rechazar.");
  }

  const postulacionRef = doc(db, "postulacionesTutores", postulacionId);

  await runTransaction(db, async (transaction) => {
    const postulacionSnap = await transaction.get(postulacionRef);

    if (!postulacionSnap.exists()) {
      throw new Error("La postulación ya no existe.");
    }

    const datosPostulacion = postulacionSnap.data();

    const estadoActual = String(datosPostulacion.estado || "pendiente")
      .toLowerCase()
      .trim();

    if (estadoActual !== "pendiente") {
      throw new Error("Esta postulación ya fue revisada.");
    }

    transaction.update(postulacionRef, {
      estado: "rechazado",
      fechaRevision: serverTimestamp(),
    });
  });
}

/* ============================= */
/* TUTORES ACTIVOS */
/* ============================= */

function formatearFechaCorta(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha || ""))) return "";

  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
}

function formatearResumenDisponibilidad(disponibilidad) {
  const ahora = new Date();
  const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
  const bloques = Array.isArray(disponibilidad?.bloques)
    ? disponibilidad.bloques
        .filter((bloque) => {
          return (
            bloque?.activo !== false &&
            bloque.fecha &&
            bloque.fecha >= hoy &&
            bloque.horaInicio &&
            bloque.horaFin
          );
        })
        .sort((a, b) => {
          if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
          return a.horaInicio.localeCompare(b.horaInicio);
        })
    : [];

  if (!bloques.length) {
    return "Este tutor aún no registró horarios.";
  }

  const bloque = bloques[0];
  const fechaTexto = formatearFechaCorta(bloque.fecha);
  const diaTexto = bloque.dia || "";

  return `${diaTexto}${fechaTexto ? ` ${fechaTexto}` : ""} · ${bloque.horaInicio} - ${bloque.horaFin}`;
}

export async function obtenerTutoresActivos() {
  const consulta = query(
    collection(db, "tutores"),
    where("estado", "==", "activo"),
  );

  const resultado = await getDocs(consulta);

  const tutores = resultado.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }))
    .filter((tutor) => {
      const estadoPublico = tutor.estadoPublico || "activo";

      return estadoPublico === "activo" && tutor.perfilCompleto === true;
    });

  const tutoresConDisponibilidad = await Promise.all(
    tutores.map(async (tutor) => {
      try {
        const disponibilidad = await obtenerDisponibilidadPorTutorId(
          tutor.id || tutor.uid || tutor.tutorId,
        );

        return {
          ...tutor,
          disponibilidadReal: disponibilidad,
          disponibilidadResumen: formatearResumenDisponibilidad(disponibilidad),
        };
      } catch (error) {
        console.error("Error al cargar disponibilidad del tutor:", error);
        return {
          ...tutor,
          disponibilidadReal: null,
          disponibilidadResumen: "Este tutor aún no registró horarios.",
        };
      }
    }),
  );

  return tutoresConDisponibilidad;
}
/* ============================= */
/* PANEL DEL TUTOR */
/* ============================= */

export async function obtenerTutorActivoActual() {
  const usuario = auth.currentUser;

  if (!usuario) {
    return null;
  }

  const consulta = query(
    collection(db, "tutores"),
    where("uid", "==", usuario.uid),
    where("estado", "==", "activo"),
    limit(1),
  );

  const resultado = await getDocs(consulta);

  if (resultado.empty) {
    return null;
  }

  const documento = resultado.docs[0];

  return {
    id: documento.id,
    ...documento.data(),
  };
}

export async function obtenerReservasDelTutor() {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para ver tus reservas como tutor.",
  );

  const tutorActivo = await obtenerTutorActivoActual();

  if (!tutorActivo) {
    throw new Error("Solo un tutor activo puede ver reservas de tutor.");
  }

  const consulta = query(
    collection(db, "reservas"),
    where("tutorId", "==", usuario.uid),
  );

  const resultado = await getDocs(consulta);

  return resultado.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function actualizarEstadoReserva(reservaId, nuevoEstado) {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para actualizar una reserva.",
  );

  if (!reservaId || !nuevoEstado) {
    throw new Error("Faltan datos para actualizar la reserva.");
  }

  const estadoNuevoNormalizado = normalizarEstado(nuevoEstado);

  if (!ESTADOS_RESERVA_VALIDOS.includes(estadoNuevoNormalizado)) {
    throw new Error("El estado de la reserva no es válido.");
  }

  const reservaRef = doc(db, "reservas", reservaId);

  await runTransaction(db, async (transaction) => {
    const reservaSnap = await transaction.get(reservaRef);
    const datosPagoTutorRef = doc(db, "datosPagoTutores", usuario.uid);
    const datosPagoTutorSnap =
      estadoNuevoNormalizado === "aceptada"
        ? await transaction.get(datosPagoTutorRef)
        : null;

    if (!reservaSnap.exists()) {
      throw new Error("La reserva ya no existe.");
    }

    const reserva = reservaSnap.data();

    if (reserva.tutorId !== usuario.uid) {
      throw new Error("No puedes modificar una reserva de otro tutor.");
    }

    const estadoActual = normalizarEstado(reserva.estado || "pendiente");

    const estadosFinales = [
      "finalizada",
      "rechazada",
      "cancelada_estudiante",
      "cancelada_tutor",
      "expirada",
    ];

    if (estadosFinales.includes(estadoActual)) {
      throw new Error("Esta reserva ya no tiene acciones pendientes.");
    }

    const transicionesPermitidas = {
      pendiente: ["aceptada", "rechazada", "cancelada_tutor", "expirada"],
      aceptada: ["en_curso", "cancelada_tutor"],
      en_curso: ["finalizada", "cancelada_tutor"],
    };

    const siguientesEstados = transicionesPermitidas[estadoActual] || [];

    if (!siguientesEstados.includes(estadoNuevoNormalizado)) {
      throw new Error("No se puede cambiar la reserva a ese estado.");
    }

    const datosActualizados = {
      estado: estadoNuevoNormalizado,
      actualizadoEn: serverTimestamp(),
    };

    if (estadoNuevoNormalizado === "aceptada") {
      if (!datosPagoTutorSnap?.exists()) {
        throw new Error(
          "Completa tus datos de pago antes de aceptar reservas.",
        );
      }

      const datosPagoTutor = datosPagoTutorSnap.data();
      const tieneDatosPago =
        datosPagoTutor.yape ||
        datosPagoTutor.plin ||
        datosPagoTutor.banco ||
        datosPagoTutor.numeroCuenta ||
        datosPagoTutor.cci;

      if (!tieneDatosPago || !datosPagoTutor.titular) {
        throw new Error(
          "Completa tus datos de pago antes de aceptar reservas.",
        );
      }

      datosActualizados.datosPagoTutor = {
        yape: datosPagoTutor.yape || "",
        plin: datosPagoTutor.plin || "",
        banco: datosPagoTutor.banco || "",
        numeroCuenta: datosPagoTutor.numeroCuenta || datosPagoTutor.numeroDeCuenta || "",
        cci: datosPagoTutor.cci || "",
        titular: datosPagoTutor.titular || "",
        instrucciones: datosPagoTutor.instrucciones || "",
      };
    }

    transaction.update(reservaRef, datosActualizados);
  });
}

export async function cancelarReservaEstudiante(reservaId) {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para cancelar una reserva.",
  );

  if (!reservaId) {
    throw new Error("No se encontró la reserva.");
  }

  const reservaRef = doc(db, "reservas", reservaId);

  await runTransaction(db, async (transaction) => {
    const reservaSnap = await transaction.get(reservaRef);

    if (!reservaSnap.exists()) {
      throw new Error("La reserva ya no existe.");
    }

    const reserva = reservaSnap.data();

    if (reserva.usuarioId !== usuario.uid) {
      throw new Error("No puedes cancelar una reserva que no te pertenece.");
    }

    const estadoActual = normalizarEstado(reserva.estado || "pendiente");

    if (estadoActual !== "pendiente") {
      throw new Error("Solo puedes cancelar una reserva pendiente.");
    }

    transaction.update(reservaRef, {
      estado: "cancelada_estudiante",
      canceladaPor: "estudiante",
      canceladaEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    });
  });
}

export async function registrarPagoReserva(reservaId, datosPago) {
  obtenerUsuarioAutenticado("Debes iniciar sesión para registrar un pago.");

  if (!reservaId) {
    throw new Error("No se encontró la reserva.");
  }

  const metodoPago = String(datosPago.metodoPago || "").trim();
  const montoPagado = Number(datosPago.montoPagado || 0);
  const numeroOperacion = String(datosPago.numeroOperacion || "").trim();
  const comentarioPago = String(datosPago.comentarioPago || "").trim();

  if (!metodoPago) {
    throw new Error("Selecciona el método de pago.");
  }

  if (!montoPagado || montoPagado <= 0) {
    throw new Error("Ingresa un monto pagado mayor a cero.");
  }

  if (!numeroOperacion) {
    throw new Error("Ingresa el número de operación.");
  }

  const datosActualizados = {
    estadoPago: "en_revision",
    metodoPago,
    montoPagado,
    numeroOperacion,
    comentarioPago,
    comprobanteUrl: "",
    pagoRegistradoEn: serverTimestamp(),
    pagoActualizadoEn: serverTimestamp(),
  };

  await updateDoc(doc(db, "reservas", reservaId), datosActualizados);

  return datosActualizados;
}

export async function confirmarPagoReserva(reservaId) {
  obtenerUsuarioAutenticado("Debes iniciar sesión para confirmar un pago.");

  if (!reservaId) {
    throw new Error("No se encontró la reserva.");
  }

  await updateDoc(doc(db, "reservas", reservaId), {
    estadoPago: "confirmado",
    pagoConfirmadoEn: serverTimestamp(),
    pagoActualizadoEn: serverTimestamp(),
    motivoRechazoPago: "",
  });
}

export async function rechazarPagoReserva(reservaId, motivo) {
  obtenerUsuarioAutenticado("Debes iniciar sesión para rechazar un pago.");

  if (!reservaId) {
    throw new Error("No se encontró la reserva.");
  }

  const motivoRechazoPago = String(motivo || "").trim();

  if (!motivoRechazoPago) {
    throw new Error("Ingresa el motivo del rechazo del pago.");
  }

  await updateDoc(doc(db, "reservas", reservaId), {
    estadoPago: "rechazado",
    motivoRechazoPago,
    pagoRechazadoEn: serverTimestamp(),
    pagoActualizadoEn: serverTimestamp(),
  });
}

export async function obtenerPerfilUsuarioActual() {
  const usuario = auth.currentUser;

  if (!usuario) {
    return null;
  }

  const consulta = query(
    collection(db, "usuarios"),
    where("usuarioId", "==", usuario.uid),
    limit(1),
  );

  const resultado = await getDocs(consulta);

  if (resultado.empty) {
    return null;
  }

  const documento = resultado.docs[0];

  return {
    id: documento.id,
    ...documento.data(),
  };
}

export async function actualizarPerfilTutorActual(datosPerfil) {
  obtenerUsuarioAutenticado("Debes iniciar sesión para actualizar tu perfil.");

  const tutorActivo = await obtenerTutorActivoActual();

  if (!tutorActivo) {
    throw new Error("No se encontró un perfil de tutor activo.");
  }

  if (
    !datosPerfil ||
    typeof datosPerfil !== "object" ||
    Array.isArray(datosPerfil)
  ) {
    throw new Error("Los datos del perfil no son válidos.");
  }

  const camposPermitidos = [
    "nombre",
    "correo",
    "telefono",
    "cursos",
    "nivel",
    "disponibilidad",
    "descripcion",
    "presentacion",
    "experiencia",
    "precio",
    "precioHora",
    "modalidad",
    "distrito",
    "zona",
    "fotoUrl",
    "estadoPublico",
    "perfilCompleto",
    "cvUrl",
    "cvTipo",
  ];

  const datosLimpios = {};

  camposPermitidos.forEach((campo) => {
    if (Object.prototype.hasOwnProperty.call(datosPerfil, campo)) {
      const valor = datosPerfil[campo];

      if (typeof valor === "string") {
        datosLimpios[campo] = valor.trim();
      } else {
        datosLimpios[campo] = valor;
      }
    }
  });

  if (Object.keys(datosLimpios).length === 0) {
    throw new Error("No hay datos válidos para actualizar.");
  }

  if (
    Object.prototype.hasOwnProperty.call(datosLimpios, "nombre") &&
    !datosLimpios.nombre
  ) {
    throw new Error("El nombre del tutor no puede estar vacío.");
  }

  if (
    Object.prototype.hasOwnProperty.call(datosLimpios, "cursos") &&
    !datosLimpios.cursos
  ) {
    throw new Error("Debes ingresar al menos un curso.");
  }

  if (
    Object.prototype.hasOwnProperty.call(datosLimpios, "presentacion") &&
    !datosLimpios.presentacion
  ) {
    throw new Error("La presentación del tutor no puede estar vacía.");
  }

  if (
    Object.prototype.hasOwnProperty.call(datosLimpios, "experiencia") &&
    !datosLimpios.experiencia
  ) {
    throw new Error("La experiencia del tutor no puede estar vacía.");
  }

  if (
    Object.prototype.hasOwnProperty.call(datosLimpios, "descripcion") &&
    !datosLimpios.descripcion
  ) {
    throw new Error("La descripción del tutor no puede estar vacía.");
  }

  if (Object.prototype.hasOwnProperty.call(datosLimpios, "precioHora")) {
    const precioHora = Number(datosLimpios.precioHora);

    if (!Number.isFinite(precioHora) || precioHora <= 0) {
      throw new Error(
        "El precio por hora debe ser un número válido mayor a cero.",
      );
    }

    datosLimpios.precioHora = precioHora;
    datosLimpios.precio = precioHora;
  }

  if (Object.prototype.hasOwnProperty.call(datosLimpios, "precio")) {
    const precio = Number(datosLimpios.precio);

    if (!Number.isFinite(precio) || precio <= 0) {
      throw new Error("El precio debe ser un número válido mayor a cero.");
    }

    datosLimpios.precio = precio;
  }

  if (Object.prototype.hasOwnProperty.call(datosLimpios, "telefono")) {
    datosLimpios.telefono = validarCelularPeruOpcional(
      datosLimpios.telefono,
      "celular",
    );
  }

  if (Object.prototype.hasOwnProperty.call(datosLimpios, "modalidad")) {
    datosLimpios.modalidad = "Virtual";
  }

  if (Object.prototype.hasOwnProperty.call(datosLimpios, "cvUrl")) {
    datosLimpios.cvUrl = validarUrlOpcional(datosLimpios.cvUrl, "enlace de CV");
    datosLimpios.cvTipo = datosLimpios.cvUrl
      ? obtenerCvTipo(datosLimpios.cvUrl)
      : "";
    datosLimpios.cvActualizadoEn = datosLimpios.cvUrl
      ? serverTimestamp()
      : null;
  }

  if (Object.prototype.hasOwnProperty.call(datosLimpios, "estadoPublico")) {
    const estadoPublico = normalizarEstado(datosLimpios.estadoPublico);

    const estadosPublicosPermitidos = [
      "activo",
      "pausado",
      "oculto",
      "inactivo",
    ];

    if (!estadosPublicosPermitidos.includes(estadoPublico)) {
      throw new Error("El estado público del tutor no es válido.");
    }

    datosLimpios.estadoPublico = estadoPublico;
  }

  if (Object.prototype.hasOwnProperty.call(datosLimpios, "experiencia")) {
    datosLimpios.descripcion = datosLimpios.experiencia;
  }

  if (Object.prototype.hasOwnProperty.call(datosLimpios, "distrito")) {
    datosLimpios.zona = datosLimpios.distrito;
  }

  const tutorRef = doc(db, "tutores", tutorActivo.id);

  await updateDoc(tutorRef, {
    ...datosLimpios,
    actualizadoEn: serverTimestamp(),
  });

  return {
    ...tutorActivo,
    ...datosLimpios,
  };
}

export async function obtenerDisponibilidadTutorActual() {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para ver tu disponibilidad.");
  }

  const tutorActivo = await obtenerTutorActivoActual();

  if (!tutorActivo) {
    throw new Error("Solo un tutor activo puede ver su disponibilidad.");
  }

  const disponibilidadRef = doc(db, "disponibilidadTutores", usuario.uid);
  const disponibilidadSnap = await getDoc(disponibilidadRef);

  if (disponibilidadSnap.exists()) {
    return {
      id: disponibilidadSnap.id,
      ...disponibilidadSnap.data(),
    };
  }

  const consulta = query(
    collection(db, "disponibilidadTutores"),
    where("uid", "==", usuario.uid),
    limit(1),
  );

  const resultado = await getDocs(consulta);

  if (resultado.empty) {
    return {
      tutorId: tutorActivo.id,
      uid: usuario.uid,
      bloques: [],
    };
  }

  const documento = resultado.docs[0];

  return {
    id: documento.id,
    ...documento.data(),
  };
}

export async function guardarDisponibilidadTutorActual(bloques) {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para guardar tu disponibilidad.",
  );

  const tutorActivo = await obtenerTutorActivoActual();

  if (!tutorActivo) {
    throw new Error("Solo un tutor activo puede guardar disponibilidad.");
  }

  if (!Array.isArray(bloques)) {
    throw new Error("La disponibilidad debe tener una lista de horarios.");
  }

  if (bloques.length === 0) {
    throw new Error("Agrega al menos un horario válido.");
  }

  const diasPermitidos = [
    "lunes",
    "martes",
    "miercoles",
    "miércoles",
    "jueves",
    "viernes",
    "sabado",
    "sábado",
    "domingo",
  ];
  const nombresDiasDisponibilidad = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
  };
  const diasPorFecha = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];

  const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;
  const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;
  const obtenerFechaLocal = () => {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, "0");
    const day = String(hoy.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  const normalizarDiaDisponibilidad = (dia) =>
    String(dia || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  const obtenerDiaPorFecha = (fecha) => {
    if (!formatoFecha.test(fecha)) return "";

    const [year, month, day] = fecha.split("-").map(Number);
    const fechaLocal = new Date(year, month - 1, day);

    if (
      fechaLocal.getFullYear() !== year ||
      fechaLocal.getMonth() !== month - 1 ||
      fechaLocal.getDate() !== day
    ) {
      return "";
    }

    return diasPorFecha[fechaLocal.getDay()] || "";
  };

  const clavesBloques = new Set();
  const bloquesLimpios = bloques.map((bloque, index) => {
    if (!bloque || typeof bloque !== "object" || Array.isArray(bloque)) {
      throw new Error(`El bloque ${index + 1} no es válido.`);
    }

    const fecha = String(bloque.fecha || "").trim();
    const diaFecha = obtenerDiaPorFecha(fecha);
    const dia = normalizarDiaDisponibilidad(bloque.dia || diaFecha);
    const horaInicio = String(bloque.horaInicio || "").trim();
    const horaFin = String(bloque.horaFin || "").trim();

    if (!diaFecha) {
      throw new Error(`La fecha del bloque ${index + 1} no es válida.`);
    }

    if (fecha < obtenerFechaLocal()) {
      throw new Error("La fecha disponible no puede ser anterior a hoy.");
    }

    if (!diasPermitidos.includes(dia)) {
      throw new Error(`El día del bloque ${index + 1} no es válido.`);
    }

    if (dia !== diaFecha) {
      throw new Error(
        `El día del bloque ${index + 1} no coincide con la fecha.`,
      );
    }

    if (!formatoHora.test(horaInicio)) {
      throw new Error(
        `La hora de inicio del bloque ${index + 1} no es válida.`,
      );
    }

    if (!formatoHora.test(horaFin)) {
      throw new Error(`La hora de fin del bloque ${index + 1} no es válida.`);
    }

    if (horaInicio >= horaFin) {
      throw new Error(
        `La hora de inicio debe ser menor que la hora de fin en el bloque ${
          index + 1
        }.`,
      );
    }

    const claveBloque = `${fecha}|${horaInicio}|${horaFin}`;

    if (clavesBloques.has(claveBloque)) {
      throw new Error("Ya agregaste ese horario.");
    }

    clavesBloques.add(claveBloque);

    return {
      fecha,
      dia: nombresDiasDisponibilidad[dia] || dia,
      horaInicio,
      horaFin,
      activo: bloque.activo !== false,
    };
  });

  const datosDisponibilidad = {
    uid: usuario.uid,
    tutorId: tutorActivo.id,
    tutorNombre: tutorActivo.nombre || "",
    bloques: bloquesLimpios,
    actualizadoEn: serverTimestamp(),
  };

  await setDoc(
    doc(db, "disponibilidadTutores", usuario.uid),
    {
      ...datosDisponibilidad,
      creadoEn: serverTimestamp(),
    },
    { merge: true },
  );

  return {
    id: usuario.uid,
    ...datosDisponibilidad,
  };
}

export async function obtenerDisponibilidadPorTutorId(tutorId) {
  if (!tutorId) {
    return null;
  }

  const disponibilidadSnap = await getDoc(
    doc(db, "disponibilidadTutores", tutorId),
  );

  if (disponibilidadSnap.exists()) {
    return {
      id: disponibilidadSnap.id,
      ...disponibilidadSnap.data(),
    };
  }

  const consulta = query(
    collection(db, "disponibilidadTutores"),
    where("tutorId", "==", tutorId),
  );

  const resultado = await getDocs(consulta);

  if (resultado.empty) {
    return null;
  }

  const documentos = resultado.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));

  const disponibilidadConHorario =
    documentos.find(
      (documento) =>
        documento.id === tutorId &&
        Array.isArray(documento.bloques) &&
        documento.bloques.length > 0,
    ) ||
    documentos.find(
      (documento) =>
        documento.uid === tutorId &&
        Array.isArray(documento.bloques) &&
        documento.bloques.length > 0,
    ) ||
    documentos.find(
      (documento) =>
        Array.isArray(documento.bloques) && documento.bloques.length > 0,
    ) ||
    documentos[0];

  return disponibilidadConHorario || null;
}
export async function obtenerReservasOcupadasPorTutorFecha(tutorId, fecha) {
  if (!tutorId || !fecha) {
    return [];
  }

  const consulta = query(
    collection(db, "reservas"),
    where("tutorId", "==", tutorId),
  );

  const resultado = await getDocs(consulta);

  const estadosQueOcupan = ["pendiente", "aceptada", "en_curso"];

  return resultado.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }))
    .filter((reserva) => {
      const estado = String(reserva.estado || "").toLowerCase();

      return reserva.fecha === fecha && estadosQueOcupan.includes(estado);
    });
}

export async function guardarTutorFavorito(tutor) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para guardar favoritos.");
  }

  const tutorId = tutor.id || tutor.uid || tutor.tutorId;

  if (!tutorId) {
    throw new Error("No se encontró el ID del tutor.");
  }

  const favoritoId = `${usuario.uid}_${tutorId}`;

  const favorito = {
    usuarioId: usuario.uid,
    tutorId,
    nombre: tutor.nombre || "Tutor",
    cursos: tutor.cursos || "",
    nivel: tutor.nivel || "",
    modalidad: tutor.modalidad || "",
    distrito: tutor.distrito || tutor.zona || "",
    precioHora: Number(tutor.precioHora || tutor.precio || 25),
    descripcion: tutor.descripcion || tutor.presentacion || "",
    disponibilidad: tutor.disponibilidad || "",
    rating: tutor.rating || tutor.calificacion || "",
    estaEnLinea: tutor.estaEnLinea === true,
    creadoEn: serverTimestamp(),
  };

  await setDoc(doc(db, "favoritos", favoritoId), favorito, { merge: true });

  return favorito;
}

export async function obtenerMisFavoritos() {
  const usuario = auth.currentUser;

  if (!usuario) {
    return [];
  }

  const consulta = query(
    collection(db, "favoritos"),
    where("usuarioId", "==", usuario.uid),
  );

  const resultado = await getDocs(consulta);

  return resultado.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function eliminarTutorFavorito(tutorId) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para eliminar favoritos.");
  }

  if (!tutorId) {
    throw new Error("No se encontró el ID del tutor.");
  }

  const favoritoId = `${usuario.uid}_${tutorId}`;

  await deleteDoc(doc(db, "favoritos", favoritoId));

  return true;
}
export async function actualizarPerfilUsuarioActual(datosPerfil) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para actualizar tu perfil.");
  }

  const perfilActualizado = {
    ...datosPerfil,
    uid: usuario.uid,
    correo: usuario.email || datosPerfil.correo || "",
    actualizadoEn: serverTimestamp(),
  };

  await setDoc(doc(db, "usuarios", usuario.uid), perfilActualizado, {
    merge: true,
  });

  return perfilActualizado;
}
export async function actualizarEnlaceClaseReserva(reservaId, datosClase) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para actualizar la clase.");
  }

  if (!reservaId) {
    throw new Error("No se encontró la reserva.");
  }

  const plataformaClase = String(datosClase.plataformaClase || "").trim();
  const enlaceClase = String(datosClase.enlaceClase || "").trim();

  if (!plataformaClase) {
    throw new Error("Selecciona la plataforma de la clase.");
  }

  if (!enlaceClase) {
    throw new Error("Ingresa el enlace de la clase.");
  }

  if (!/^https?:\/\//i.test(enlaceClase)) {
    throw new Error(
      "El enlace de la clase debe empezar con http:// o https://.",
    );
  }

  const datosActualizados = {
    plataformaClase,
    enlaceClase,
    estadoClase: "programada",
    actualizadoEn: serverTimestamp(),
  };

  await updateDoc(doc(db, "reservas", reservaId), datosActualizados);

  return datosActualizados;
}

export async function actualizarDatosPagoTutor(datosPago) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para actualizar tus datos de pago.");
  }

  const numeroCuentaAnterior =
    datosPago.numeroCuenta ||
    datosPago.numeroDeCuenta ||
    datosPago.cuenta ||
    datosPago.cuentaBanco ||
    datosPago.bancoCuenta ||
    "";
  const cciAnterior = datosPago.cci || datosPago.pagoCci || "";

  const datosPagoLimpios = {
    uid: usuario.uid,
    yape: validarCelularPeruOpcional(datosPago.yape, "Yape"),
    plin: validarCelularPeruOpcional(datosPago.plin, "Plin"),
    banco: limpiarTextoSeguro(datosPago.banco).slice(0, 60),
    numeroCuenta: validarNumeroCuentaOpcional(numeroCuentaAnterior),
    cci: validarCciOpcional(cciAnterior),
    titular: limpiarTextoSeguro(datosPago.titular).slice(0, 120),
    instrucciones: limpiarTextoSeguro(datosPago.instrucciones).slice(0, 250),
    actualizadoEn: serverTimestamp(),
  };

  const tieneBilletera = Boolean(datosPagoLimpios.yape || datosPagoLimpios.plin);
  const tieneCuentaBancaria = Boolean(
    datosPagoLimpios.numeroCuenta || datosPagoLimpios.cci,
  );

  if (!tieneBilletera && !tieneCuentaBancaria) {
    throw new Error("Agrega al menos un método de pago: Yape, Plin o cuenta bancaria.");
  }

  if (tieneCuentaBancaria && !datosPagoLimpios.banco) {
    throw new Error("Para usar una cuenta bancaria, ingresa el nombre del banco.");
  }

  if (!datosPagoLimpios.titular) {
    throw new Error("Ingresa el nombre del titular del pago.");
  }

  if (datosPagoLimpios.banco.length > 60) {
    throw new Error("El banco no debe superar 60 caracteres.");
  }

  await setDoc(doc(db, "datosPagoTutores", usuario.uid), datosPagoLimpios, {
    merge: true,
  });

  return datosPagoLimpios;
}

export async function obtenerMisDatosPagoTutor() {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para ver tus datos de pago.");
  }

  const referencia = doc(db, "datosPagoTutores", usuario.uid);
  const documento = await getDoc(referencia);

  if (!documento.exists()) {
    return null;
  }

  return {
    id: documento.id,
    ...documento.data(),
  };
}

export async function obtenerReservasParaChat() {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para ver tus chats.",
  );

  const consultas = [
    query(collection(db, "reservas"), where("usuarioId", "==", usuario.uid)),
    query(collection(db, "reservas"), where("tutorId", "==", usuario.uid)),
  ];

  const resultados = await Promise.all(
    consultas.map((consulta) => getDocs(consulta)),
  );
  const reservas = new Map();

  resultados.forEach((resultado) => {
    resultado.docs.forEach((documento) => {
      const data = documento.data();
      const estado = normalizarEstado(data.estado);

      if (
        ![
          "rechazada",
          "cancelada_estudiante",
          "cancelada_tutor",
          "expirada",
        ].includes(estado)
      ) {
        reservas.set(documento.id, {
          id: documento.id,
          ...data,
        });
      }
    });
  });

  return [...reservas.values()];
}

function obtenerNombreEstudianteReserva(reserva) {
  return limpiarTextoSeguro(
    reserva?.estudianteNombre ||
      reserva?.nombreEstudiante ||
      reserva?.nombreUsuario ||
      reserva?.correoUsuario ||
      "Estudiante",
  );
}

function obtenerNombreTutorReserva(reserva) {
  return limpiarTextoSeguro(
    reserva?.tutorNombre || reserva?.tutor || reserva?.nombreTutor || "Tutor",
  );
}

function validarReservaParaChat(reserva) {
  const reservaId = limpiarTextoSeguro(reserva?.id || reserva?.reservaId);
  const estudianteId = limpiarTextoSeguro(
    reserva?.estudianteId || reserva?.usuarioId,
  );
  const tutorId = limpiarTextoSeguro(reserva?.tutorId);
  const estudianteNombre = obtenerNombreEstudianteReserva(reserva);
  const tutorNombre = obtenerNombreTutorReserva(reserva);

  if (!reservaId) {
    throw new Error("Primero necesitas una reserva para iniciar un chat.");
  }

  if (!estudianteId || !tutorId || !estudianteNombre || !tutorNombre) {
    throw new Error(
      "La reserva no tiene los datos necesarios para iniciar el chat.",
    );
  }

  return {
    reservaId,
    estudianteId,
    tutorId,
    estudianteNombre,
    tutorNombre,
  };
}

function obtenerParticipantesChat(chat) {
  const participantes = Array.isArray(chat?.participantes)
    ? chat.participantes.filter(Boolean)
    : [];
  const estudianteId = limpiarTextoSeguro(chat?.estudianteId);
  const tutorId = limpiarTextoSeguro(chat?.tutorId);

  [estudianteId, tutorId].forEach((participanteId) => {
    if (participanteId && !participantes.includes(participanteId)) {
      participantes.push(participanteId);
    }
  });

  return participantes;
}

function usuarioParticipaEnChat(chat, usuarioId) {
  return obtenerParticipantesChat(chat).includes(usuarioId);
}

function chatEstaNoLeido(chat, usuarioId) {
  const ultimoAutorId = limpiarTextoSeguro(chat?.ultimoAutorId);
  const leidosPor = chat?.leidosPor || {};
  const leidoPorUsuario = Array.isArray(leidosPor)
    ? leidosPor.includes(usuarioId)
    : Object.prototype.hasOwnProperty.call(leidosPor, usuarioId);

  return Boolean(
    ultimoAutorId && ultimoAutorId !== usuarioId && !leidoPorUsuario,
  );
}

function prepararChatParaUsuario(chat, usuarioId) {
  return {
    ...chat,
    participantes: obtenerParticipantesChat(chat),
    noLeido: chatEstaNoLeido(chat, usuarioId),
  };
}

export async function crearOObtenerChatDesdeReserva(reserva) {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para abrir el chat.",
  );

  const datosReserva = validarReservaParaChat(reserva);

  if (!datosReserva.reservaId) {
    throw new Error("No se encontró la reserva para crear el chat.");
  }

  if (
    datosReserva.estudianteId !== usuario.uid &&
    datosReserva.tutorId !== usuario.uid
  ) {
    throw new Error(
      "No puedes abrir un chat de una reserva que no te pertenece.",
    );
  }

  const chatId = datosReserva.reservaId;
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);
  const datosChat = {
    estudianteId: datosReserva.estudianteId,
    estudianteNombre: datosReserva.estudianteNombre,
    tutorId: datosReserva.tutorId,
    tutorNombre: datosReserva.tutorNombre,
    reservaId: datosReserva.reservaId,
    curso: reserva.curso || "",
    participantes: [datosReserva.estudianteId, datosReserva.tutorId],
    actualizadoEn: serverTimestamp(),
  };

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      ...datosChat,
      ultimoMensaje: "",
      creadoEn: serverTimestamp(),
      leidosPor: {},
    });
  } else {
    await setDoc(chatRef, datosChat, { merge: true });
  }

  return {
    id: chatId,
    ...datosChat,
    ultimoMensaje: chatSnap.exists() ? chatSnap.data().ultimoMensaje || "" : "",
    ultimoAutorId: chatSnap.exists() ? chatSnap.data().ultimoAutorId || "" : "",
    leidosPor: chatSnap.exists() ? chatSnap.data().leidosPor || {} : {},
  };
}

export async function asegurarChatReserva(reserva) {
  return crearOObtenerChatDesdeReserva(reserva);
}

export async function obtenerMisChats() {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para ver tus chats.",
  );

  const consultas = [
    query(
      collection(db, "chats"),
      where("participantes", "array-contains", usuario.uid),
    ),
    query(collection(db, "chats"), where("estudianteId", "==", usuario.uid)),
    query(collection(db, "chats"), where("tutorId", "==", usuario.uid)),
  ];

  const resultados = await Promise.allSettled(
    consultas.map((consulta) => getDocs(consulta)),
  );
  const consultasExitosas = resultados.filter(
    (resultado) => resultado.status === "fulfilled",
  );

  if (!consultasExitosas.length) {
    throw resultados[0].reason;
  }

  const chats = new Map();

  consultasExitosas.forEach((resultado) => {
    resultado.value.docs.forEach((documento) => {
      const chat = documento.data();
      chats.set(documento.id, {
        ...prepararChatParaUsuario(
          {
            id: documento.id,
            ...chat,
          },
          usuario.uid,
        ),
      });
    });
  });

  return [...chats.values()].sort((a, b) => {
    if (a.noLeido !== b.noLeido) {
      return a.noLeido ? -1 : 1;
    }

    const fechaA = a.actualizadoEn?.toMillis ? a.actualizadoEn.toMillis() : 0;
    const fechaB = b.actualizadoEn?.toMillis ? b.actualizadoEn.toMillis() : 0;
    return fechaB - fechaA;
  });
}

async function obtenerRolChatActual(usuario) {
  const consulta = query(
    collection(db, "usuarios"),
    where("usuarioId", "==", usuario.uid),
    limit(1),
  );
  const resultado = await getDocs(consulta);

  if (!resultado.empty) {
    const rol = normalizarEstado(resultado.docs[0].data().rol);

    if (["estudiante", "tutor"].includes(rol)) {
      return rol;
    }
  }

  const usuarioSnap = await getDoc(doc(db, "usuarios", usuario.uid));

  if (usuarioSnap.exists()) {
    const rol = normalizarEstado(usuarioSnap.data().rol);

    if (["estudiante", "tutor"].includes(rol)) {
      return rol;
    }
  }

  const tutorActivo = await obtenerTutorActivoActual();

  if (tutorActivo) {
    return "tutor";
  }

  const reservas = await obtenerReservasParaChat();

  if (reservas.some((reserva) => reserva.tutorId === usuario.uid)) {
    return "tutor";
  }

  if (
    reservas.some(
      (reserva) =>
        reserva.usuarioId === usuario.uid ||
        reserva.estudianteId === usuario.uid,
    )
  ) {
    return "estudiante";
  }

  return "";
}

export async function obtenerResumenChats() {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para ver tus chats.",
  );

  const rol = await obtenerRolChatActual(usuario);

  if (!["estudiante", "tutor"].includes(rol)) {
    throw new Error("No se pudo detectar tu rol para cargar el chat.");
  }

  const reservas = await obtenerReservasParaChat();
  const chatsDesdeReservas = await Promise.allSettled(
    reservas.map((reserva) => crearOObtenerChatDesdeReserva(reserva)),
  );
  const chatsPreparados = new Map();

  chatsDesdeReservas.forEach((resultado) => {
    if (resultado.status === "fulfilled") {
      chatsPreparados.set(resultado.value.id, resultado.value);
      return;
    }

    console.error(
      "No se pudo preparar un chat desde una reserva:",
      resultado.reason,
    );
  });

  const chatsExistentes = await obtenerMisChats();

  chatsExistentes.forEach((chat) => {
    chatsPreparados.set(chat.id, chat);
  });

  const chats = [...chatsPreparados.values()]
    .map((chat) => prepararChatParaUsuario(chat, usuario.uid))
    .sort((a, b) => {
      if (a.noLeido !== b.noLeido) {
        return a.noLeido ? -1 : 1;
      }

      const fechaA = a.actualizadoEn?.toMillis ? a.actualizadoEn.toMillis() : 0;
      const fechaB = b.actualizadoEn?.toMillis ? b.actualizadoEn.toMillis() : 0;
      return fechaB - fechaA;
    });

  return {
    usuarioId: usuario.uid,
    rol,
    chats,
    totalNoLeidos: chats.filter((chat) => chat.noLeido).length,
    tieneReservas: reservas.length > 0,
  };
}

export async function obtenerMensajesChat(chatId) {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para ver los mensajes.",
  );

  if (!chatId) {
    throw new Error("No se encontró el chat.");
  }

  const chatSnap = await getDoc(doc(db, "chats", chatId));

  if (!chatSnap.exists()) {
    throw new Error("El chat ya no existe.");
  }

  const chat = chatSnap.data();

  if (!usuarioParticipaEnChat(chat, usuario.uid)) {
    throw new Error("No tienes permiso para ver este chat.");
  }

  const participantes = obtenerParticipantesChat(chat);

  if (!Array.isArray(chat.participantes) && participantes.length) {
    await setDoc(doc(db, "chats", chatId), { participantes }, { merge: true });
  }

  const consulta = query(
    collection(db, "chats", chatId, "mensajes"),
    orderBy("fecha", "asc"),
  );
  const resultado = await getDocs(consulta);

  return resultado.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function enviarMensajeChat(chatId, texto) {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para enviar mensajes.",
  );
  const mensaje = limpiarTextoSeguro(texto);

  if (!chatId) {
    throw new Error("No se encontró el chat.");
  }

  if (!mensaje) {
    throw new Error("Escribe un mensaje antes de enviarlo.");
  }

  if (mensaje.length > 500) {
    throw new Error("El mensaje no debe superar 500 caracteres.");
  }

  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    throw new Error("El chat ya no existe.");
  }

  const chat = chatSnap.data();

  if (!usuarioParticipaEnChat(chat, usuario.uid)) {
    throw new Error("No tienes permiso para enviar mensajes en este chat.");
  }

  const autorRol = chat.tutorId === usuario.uid ? "tutor" : "estudiante";
  const participantes = obtenerParticipantesChat(chat);

  await addDoc(collection(db, "chats", chatId, "mensajes"), {
    texto: mensaje,
    autorId: usuario.uid,
    autorRol,
    fecha: serverTimestamp(),
    leido: false,
  });

  await updateDoc(
    chatRef,
    {
      ultimoMensaje: mensaje,
      ultimoAutorId: usuario.uid,
      actualizadoEn: serverTimestamp(),
      participantes,
      leidosPor: {
        [usuario.uid]: serverTimestamp(),
      },
    },
  );
}

export async function marcarChatLeido(chatId) {
  const usuario = obtenerUsuarioAutenticado(
    "Debes iniciar sesión para marcar mensajes como leídos.",
  );

  if (!chatId) return;

  await setDoc(
    doc(db, "chats", chatId),
    {
      leidosPor: {
        [usuario.uid]: serverTimestamp(),
      },
    },
    { merge: true },
  );
}
