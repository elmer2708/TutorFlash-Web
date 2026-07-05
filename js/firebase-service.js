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
