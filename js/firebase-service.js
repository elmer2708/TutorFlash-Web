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
  setDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export function observarUsuario(callback) {
  onAuthStateChanged(auth, callback);
}

export async function registrarUsuario(nombre, correo, password, rol) {
  const credencial = await createUserWithEmailAndPassword(
    auth,
    correo,
    password,
  );

  await addDoc(collection(db, "usuarios"), {
    usuarioId: credencial.user.uid,
    nombre,
    correo,
    rol,
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
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para guardar una reserva.");
  }

  await addDoc(collection(db, "reservas"), {
    usuarioId: usuario.uid,
    correoUsuario: usuario.email,
    tutorId: reserva.tutorId || "",
    tutor: reserva.tutor,
    curso: reserva.curso,
    fecha: reserva.fecha,
    hora: reserva.hora,
    modalidad: reserva.modalidad,
    duracion: reserva.duracion,
    total: reserva.total,
    metodoPago: reserva.metodoPago,
    estado: "Confirmada",
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
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para postular como tutor.");
  }

  const postulacionExistente = await obtenerPostulacionTutorPorUid(usuario.uid);

  if (postulacionExistente) {
    throw new Error("Ya tienes una postulación registrada.");
  }

  await addDoc(collection(db, "postulacionesTutores"), {
    uid: usuario.uid,
    correoUsuario: usuario.email,
    nombre: postulacion.nombre,
    correo: postulacion.correo,
    telefono: postulacion.telefono,
    cursos: postulacion.cursos,
    nivel: postulacion.nivel,
    disponibilidad: postulacion.disponibilidad,
    experiencia: postulacion.experiencia,
    estado: "pendiente",
    fechaPostulacion: serverTimestamp(),
  });
}

/* ============================= */
/* ADMIN - POSTULACIONES TUTORES */
/* ============================= */

export async function obtenerPostulacionesTutores() {
  const resultado = await getDocs(collection(db, "postulacionesTutores"));

  return resultado.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function aprobarPostulacionTutor(postulacion) {
  if (!postulacion.id || !postulacion.uid) {
    throw new Error(
      "La postulación no tiene datos suficientes para aprobarse.",
    );
  }

  await setDoc(
    doc(db, "tutores", postulacion.uid),
    {
      uid: postulacion.uid,
      nombre: postulacion.nombre,
      correo: postulacion.correo,
      correoUsuario: postulacion.correoUsuario || postulacion.correo,
      telefono: postulacion.telefono,
      cursos: postulacion.cursos,
      nivel: postulacion.nivel,
      disponibilidad: postulacion.disponibilidad,
      descripcion: postulacion.experiencia,
      estado: "activo",
      fechaAprobacion: serverTimestamp(),
    },
    { merge: true },
  );

  await updateDoc(doc(db, "postulacionesTutores", postulacion.id), {
    estado: "aprobado",
    fechaRevision: serverTimestamp(),
  });
}

export async function rechazarPostulacionTutor(postulacionId) {
  if (!postulacionId) {
    throw new Error("No se encontró la postulación para rechazar.");
  }

  await updateDoc(doc(db, "postulacionesTutores", postulacionId), {
    estado: "rechazado",
    fechaRevision: serverTimestamp(),
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

  return resultado.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
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
  const usuario = auth.currentUser;

  if (!usuario) {
    return [];
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
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para actualizar una reserva.");
  }

  if (!reservaId || !nuevoEstado) {
    throw new Error("Faltan datos para actualizar la reserva.");
  }

  await updateDoc(doc(db, "reservas", reservaId), {
    estado: nuevoEstado,
    actualizadoEn: serverTimestamp(),
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
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Debes iniciar sesión para actualizar tu perfil.");
  }

  const consulta = query(
    collection(db, "tutores"),
    where("uid", "==", usuario.uid),
    where("estado", "==", "activo"),
    limit(1),
  );

  const resultado = await getDocs(consulta);

  if (resultado.empty) {
    throw new Error("No se encontró un perfil de tutor activo.");
  }

  const documentoTutor = resultado.docs[0];
  const tutorRef = doc(db, "tutores", documentoTutor.id);

  await updateDoc(tutorRef, {
    ...datosPerfil,
    actualizadoEn: serverTimestamp(),
  });

  return {
    id: documentoTutor.id,
    ...documentoTutor.data(),
    ...datosPerfil,
  };
}
