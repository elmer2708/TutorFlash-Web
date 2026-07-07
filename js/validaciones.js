export function validarCelularPeru(valor, campo = "celular") {
  const limpio = String(valor || "").replace(/\s+/g, "");

  if (!/^9\d{8}$/.test(limpio)) {
    throw new Error(`El ${campo} debe tener 9 dígitos y empezar con 9.`);
  }

  return limpio;
}

export function validarMontoPositivo(valor, campo = "monto") {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero <= 0) {
    throw new Error(`El ${campo} debe ser mayor a cero.`);
  }

  return numero;
}

export function validarNumeroOperacion(valor) {
  const texto = String(valor || "").trim();

  if (!/^[a-zA-Z0-9-]{5,30}$/.test(texto)) {
    throw new Error(
      "El número de operación debe tener entre 5 y 30 caracteres, solo letras, números o guiones.",
    );
  }

  return texto;
}

export function validarEnlaceClase(valor) {
  const enlace = String(valor || "").trim();

  if (/\s/.test(enlace) || !/^https?:\/\//i.test(enlace)) {
    throw new Error(
      "El enlace debe empezar con http:// o https:// y no tener espacios.",
    );
  }

  return enlace;
}

export function limitarTexto(valor, maximo, campo = "texto") {
  const texto = String(valor || "").trim();

  if (texto.length > maximo) {
    throw new Error(`El ${campo} no debe superar ${maximo} caracteres.`);
  }

  return texto;
}
