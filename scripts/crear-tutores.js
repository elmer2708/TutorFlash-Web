const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

const tutores = [
  {
    nombre: "Ana Valverde",
    email: "ana@gmail.com",
    password: "123456",
    cursos: "Matemática, Álgebra, Aritmética, Geometría",
    nivel: "Escolar",
    modalidad: "Virtual",
    precioHora: 25,
    distrito: "San Juan de Lurigancho",
    presentacion:
      "Soy tutora de Matemática y ayudo a reforzar temas paso a paso.",
    experiencia:
      "Experiencia en álgebra, aritmética, geometría y razonamiento matemático.",
  },
  {
    nombre: "Diego Ramos",
    email: "diego@gmail.com",
    password: "123456",
    cursos: "Comunicación, Lenguaje, Comprensión lectora",
    nivel: "Escolar",
    modalidad: "Virtual",
    precioHora: 22,
    distrito: "Lima",
    presentacion: "Soy tutor de Comunicación, Lenguaje y comprensión lectora.",
    experiencia: "Apoyo en lectura, redacción, ortografía y expresión oral.",
  },
  {
    nombre: "Valeria Salas",
    email: "valeria@gmail.com",
    password: "123456",
    cursos: "Inglés",
    nivel: "Escolar",
    modalidad: "Virtual",
    precioHora: 28,
    distrito: "Ate",
    presentacion: "Soy tutora de Inglés para nivel básico e intermedio.",
    experiencia:
      "Refuerzo gramática, vocabulario, pronunciación y conversación.",
  },
  {
    nombre: "Bruno Castillo",
    email: "bruno@gmail.com",
    password: "123456",
    cursos: "Física",
    nivel: "Escolar",
    modalidad: "Virtual",
    precioHora: 30,
    distrito: "Los Olivos",
    presentacion: "Soy tutor de Física y explico ejercicios de forma sencilla.",
    experiencia:
      "Experiencia en cinemática, dinámica, energía, electricidad y problemas básicos.",
  },
  {
    nombre: "Camila Torres",
    email: "camila@gmail.com",
    password: "123456",
    cursos: "Química",
    nivel: "Escolar",
    modalidad: "Virtual",
    precioHora: 30,
    distrito: "Lima",
    presentacion:
      "Soy tutora de Química para estudiantes escolares y preuniversitarios.",
    experiencia:
      "Apoyo en tabla periódica, enlaces químicos, estequiometría y química general.",
  },
  {
    nombre: "Mateo Herrera",
    email: "mateo@gmail.com",
    password: "123456",
    cursos: "Biología, Ciencia y Tecnología",
    nivel: "Escolar",
    modalidad: "Virtual",
    precioHora: 25,
    distrito: "Comas",
    presentacion: "Soy tutor de Biología y Ciencias Naturales.",
    experiencia:
      "Refuerzo temas de célula, genética, anatomía, ecología y ciencias básicas.",
  },
  {
    nombre: "Sofía Paredes",
    email: "sofia@gmail.com",
    password: "123456",
    cursos: "Historia, Geografía, Ciencias Sociales",
    nivel: "Escolar",
    modalidad: "Virtual",
    precioHora: 22,
    distrito: "Lima",
    presentacion: "Soy tutora de Historia, Geografía y Ciencias Sociales.",
    experiencia:
      "Ayudo con resúmenes, líneas de tiempo y explicación de procesos históricos.",
  },
  {
    nombre: "Ricardo Peña",
    email: "ricardo@gmail.com",
    password: "123456",
    cursos: "Educación Cívica, DPCC, Ciencias Sociales",
    nivel: "Escolar",
    modalidad: "Virtual",
    precioHora: 20,
    distrito: "Villa El Salvador",
    presentacion: "Soy tutor de Educación Cívica, DPCC y Ciencias Sociales.",
    experiencia:
      "Apoyo en ciudadanía, derechos, deberes y organización del Estado.",
  },
  {
    nombre: "Natalia Vega",
    email: "natalia@gmail.com",
    password: "123456",
    cursos: "Contabilidad, Tributación, Finanzas",
    nivel: "Técnico",
    modalidad: "Virtual",
    precioHora: 35,
    distrito: "San Juan de Lurigancho",
    presentacion:
      "Soy tutora de Contabilidad para estudiantes técnicos y universitarios.",
    experiencia:
      "Apoyo en cuentas contables, asientos, estados financieros, IGV y renta básica.",
  },
  {
    nombre: "Leonardo Cruz",
    email: "leonardo@gmail.com",
    password: "123456",
    cursos: "Excel, Ofimática, Computación",
    nivel: "Técnico",
    modalidad: "Virtual",
    precioHora: 30,
    distrito: "Lima",
    presentacion:
      "Soy tutor de Excel aplicado a tareas académicas y laborales.",
    experiencia:
      "Enseño fórmulas, tablas dinámicas, gráficos, filtros y reportes básicos.",
  },
  {
    nombre: "Daniela Quiroz",
    email: "daniela@gmail.com",
    password: "123456",
    cursos: "Programación, HTML, CSS, JavaScript",
    nivel: "Técnico",
    modalidad: "Virtual",
    precioHora: 40,
    distrito: "La Molina",
    presentacion: "Soy tutora de programación básica y desarrollo web.",
    experiencia:
      "Apoyo en HTML, CSS, JavaScript, lógica de programación y proyectos web.",
  },
  {
    nombre: "Esteban Rojas",
    email: "esteban@gmail.com",
    password: "123456",
    cursos: "Estadística, Matemática universitaria",
    nivel: "Universitario",
    modalidad: "Virtual",
    precioHora: 38,
    distrito: "Lima",
    presentacion: "Soy tutor de Estadística y Matemática universitaria básica.",
    experiencia:
      "Apoyo en tablas, gráficos, medidas estadísticas, probabilidad y ejercicios.",
  },
  {
    nombre: "Fernanda Molina",
    email: "fernanda@gmail.com",
    password: "123456",
    cursos: "Economía, Administración",
    nivel: "Universitario",
    modalidad: "Virtual",
    precioHora: 35,
    distrito: "San Miguel",
    presentacion: "Soy tutora de Economía y cursos administrativos.",
    experiencia:
      "Refuerzo oferta, demanda, costos, mercado y conceptos económicos básicos.",
  },
  {
    nombre: "Joaquín Silva",
    email: "joaquin@gmail.com",
    password: "123456",
    cursos: "Administración, Emprendimiento, Gestión empresarial",
    nivel: "Universitario",
    modalidad: "Virtual",
    precioHora: 35,
    distrito: "Lima",
    presentacion:
      "Soy tutor de Administración, emprendimiento y gestión empresarial.",
    experiencia:
      "Apoyo en planes de negocio, organización, procesos y gestión de empresas.",
  },
  {
    nombre: "Gabriela Núñez",
    email: "gabriela@gmail.com",
    password: "123456",
    cursos: "Derecho tributario, Tributación, Contabilidad",
    nivel: "Universitario",
    modalidad: "Virtual",
    precioHora: 40,
    distrito: "Lima",
    presentacion: "Soy tutora de Derecho tributario y temas contables básicos.",
    experiencia:
      "Apoyo en obligaciones tributarias, comprobantes, IGV, renta y normas básicas.",
  },
  {
    nombre: "Alonso Benites",
    email: "alonso@gmail.com",
    password: "123456",
    cursos: "Diseño gráfico, Canva, Presentaciones",
    nivel: "Técnico",
    modalidad: "Virtual",
    precioHora: 28,
    distrito: "Chorrillos",
    presentacion:
      "Soy tutor de diseño gráfico básico y presentaciones académicas.",
    experiencia:
      "Apoyo en Canva, diseño de diapositivas, colores, composición e identidad visual.",
  },
];

function fechaLocalMasDias(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function obtenerDiaNombre(fechaTexto) {
  const [year, month, day] = fechaTexto.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);

  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  return dias[fecha.getDay()];
}

function crearBloques() {
  const fecha1 = fechaLocalMasDias(1);
  const fecha2 = fechaLocalMasDias(2);
  const fecha3 = fechaLocalMasDias(4);

  return [
    {
      fecha: fecha1,
      dia: obtenerDiaNombre(fecha1),
      horaInicio: "16:00",
      horaFin: "18:00",
      activo: true,
    },
    {
      fecha: fecha2,
      dia: obtenerDiaNombre(fecha2),
      horaInicio: "18:00",
      horaFin: "20:00",
      activo: true,
    },
    {
      fecha: fecha3,
      dia: obtenerDiaNombre(fecha3),
      horaInicio: "09:00",
      horaFin: "11:00",
      activo: true,
    },
  ];
}

function crearDatosPago(tutor) {
  return {
    yape: "999888777",
    plin: "999888777",
    banco: "BCP",
    numeroCuenta: "1911234567890",
    cci: "00219112345678900012",
    titular: tutor.nombre,
    instrucciones:
      "Después de pagar, registra el número de operación en TutorFlash.",
  };
}

async function crearTutor(tutor) {
  let userRecord;

  try {
    userRecord = await auth.getUserByEmail(tutor.email);
    console.log("Ya existe en Auth:", tutor.email);
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }

    userRecord = await auth.createUser({
      email: tutor.email,
      password: tutor.password,
      displayName: tutor.nombre,
    });

    console.log("Creado en Auth:", tutor.email);
  }

  const uid = userRecord.uid;
  const bloques = crearBloques();
  const datosPago = crearDatosPago(tutor);

  await db.collection("usuarios").doc(uid).set(
    {
      uid,
      nombre: tutor.nombre,
      email: tutor.email,
      correo: tutor.email,
      rol: "tutor",
      estado: "activo",
      creadoEn: FieldValue.serverTimestamp(),
      actualizadoEn: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  await db
    .collection("tutores")
    .doc(uid)
    .set(
      {
        uid,
        nombre: tutor.nombre,
        correo: tutor.email,
        email: tutor.email,
        presentacion: tutor.presentacion,
        descripcion: tutor.presentacion,
        experiencia: tutor.experiencia,
        cursos: tutor.cursos,
        curso: tutor.cursos,
        nivel: tutor.nivel,
        modalidad: tutor.modalidad,
        precioHora: tutor.precioHora,
        precio: tutor.precioHora,
        disponibilidad: "Disponible esta semana",
        disponibilidadResumen: `${bloques[0].dia} ${bloques[0].fecha} · ${bloques[0].horaInicio} - ${bloques[0].horaFin}`,
        distrito: tutor.distrito,
        zona: tutor.distrito,
        estadoPublico: "activo",
        estado: "activo",
        aprobado: true,
        perfilCompleto: true,
        rol: "tutor",
        rating: "4.8",
        calificacion: "4.8",
        estaEnLinea: true,
        cvUrl: "",
        creadoEn: FieldValue.serverTimestamp(),
        actualizadoEn: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  await db
    .collection("datosPagoTutores")
    .doc(uid)
    .set(
      {
        uid,
        ...datosPago,
        actualizadoEn: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  await db.collection("disponibilidadTutores").doc(uid).set(
    {
      uid,
      tutorId: uid,
      tutorNombre: tutor.nombre,
      bloques,
      creadoEn: FieldValue.serverTimestamp(),
      actualizadoEn: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log("Tutor completo guardado:", tutor.nombre);
}

async function main() {
  console.log("Iniciando carga completa de tutores...");

  for (const tutor of tutores) {
    try {
      await crearTutor(tutor);
    } catch (error) {
      console.error("Error con", tutor.email, error.message);
    }
  }

  console.log("Carga finalizada.");
  process.exit(0);
}

main();
