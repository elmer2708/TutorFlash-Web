import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
  doc,
  updateDoc,
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
  "rechazada",
  "realizada",
  "cancelada",
  "confirmada",
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

export function observarUsuario(callback) {
  onAuthStateChanged(auth, callback);
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
  const credencial = await signInWithEmailAndPassword(auth, correo, password);
  return credencial.user;
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
  validarCampoObligatorio(
    reserva?.modalidad,
    "Selecciona una modalidad para la reserva.",
  );
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
    modalidad: reserva.modalidad,
    duracion: reserva.duracion,
    total: reserva.total,
    metodoPago: reserva.metodoPago || "pendiente",
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

  await addDoc(collection(db, "postulacionesTutores"), {
    uid: usuario.uid,
    correoUsuario: usuario.email,
    nombre: postulacion.nombre.trim(),
    correo: postulacion.correo.trim(),
    telefono: postulacion.telefono.trim(),
    cursos: postulacion.cursos.trim(),
    nivel: postulacion.nivel.trim(),
    disponibilidad: postulacion.disponibilidad.trim(),
    experiencia: postulacion.experiencia.trim(),
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

export async function obtenerTutoresActivos() {
  const consulta = query(
    collection(db, "tutores"),
    where("estado", "==", "activo"),
  );

  const resultado = await getDocs(consulta);

  return resultado.docs
    .map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }))
    .filter((tutor) => {
      const estadoPublico = tutor.estadoPublico || "activo";

      return estadoPublico === "activo" && tutor.perfilCompleto === true;
    });
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

    if (!reservaSnap.exists()) {
      throw new Error("La reserva ya no existe.");
    }

    const reserva = reservaSnap.data();

    if (reserva.tutorId !== usuario.uid) {
      throw new Error("No puedes modificar una reserva de otro tutor.");
    }

    const estadoActual = normalizarEstado(reserva.estado || "pendiente");

    const estadosFinales = ["rechazada", "realizada", "cancelada"];

    if (estadosFinales.includes(estadoActual)) {
      throw new Error("Esta reserva ya no tiene acciones pendientes.");
    }

    const transicionesPermitidas = {
      pendiente: ["aceptada", "rechazada", "cancelada"],
      aceptada: ["realizada", "cancelada"],
      confirmada: ["realizada", "cancelada"],
    };

    const siguientesEstados = transicionesPermitidas[estadoActual] || [];

    if (!siguientesEstados.includes(estadoNuevoNormalizado)) {
      throw new Error("No se puede cambiar la reserva a ese estado.");
    }

    transaction.update(reservaRef, {
      estado: estadoNuevoNormalizado,
      actualizadoEn: serverTimestamp(),
    });
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

  const consulta = query(
    collection(db, "disponibilidadTutores"),
    where("uid", "==", usuario.uid),
    where("tutorId", "==", tutorActivo.id),
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

  const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

  const bloquesLimpios = bloques.map((bloque, index) => {
    if (!bloque || typeof bloque !== "object" || Array.isArray(bloque)) {
      throw new Error(`El bloque ${index + 1} no es válido.`);
    }

    const dia = String(bloque.dia || "")
      .toLowerCase()
      .trim();
    const horaInicio = String(bloque.horaInicio || "").trim();
    const horaFin = String(bloque.horaFin || "").trim();

    if (!diasPermitidos.includes(dia)) {
      throw new Error(`El día del bloque ${index + 1} no es válido.`);
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

    return {
      dia,
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

  const consulta = query(
    collection(db, "disponibilidadTutores"),
    where("uid", "==", usuario.uid),
    where("tutorId", "==", tutorActivo.id),
    limit(1),
  );

  const resultado = await getDocs(consulta);

  if (resultado.empty) {
    const nuevoDocumento = await addDoc(
      collection(db, "disponibilidadTutores"),
      {
        ...datosDisponibilidad,
        creadoEn: serverTimestamp(),
      },
    );

    return {
      id: nuevoDocumento.id,
      ...datosDisponibilidad,
    };
  }

  const documento = resultado.docs[0];
  const disponibilidadRef = doc(db, "disponibilidadTutores", documento.id);

  await updateDoc(disponibilidadRef, datosDisponibilidad);

  return {
    id: documento.id,
    ...datosDisponibilidad,
  };
}

export async function obtenerDisponibilidadPorTutorId(tutorId) {
  if (!tutorId) {
    return null;
  }

  const consulta = query(
    collection(db, "disponibilidadTutores"),
    where("tutorId", "==", tutorId),
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
export async function obtenerReservasOcupadasPorTutorFecha(tutorId, fecha) {
  if (!tutorId || !fecha) {
    return [];
  }

  const consulta = query(
    collection(db, "reservas"),
    where("tutorId", "==", tutorId),
  );

  const resultado = await getDocs(consulta);

  const estadosQueOcupan = ["pendiente", "aceptada", "confirmada"];

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
