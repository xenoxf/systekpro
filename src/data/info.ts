// src/data/info.ts
// Fuente única de verdad de los datos de contacto de Sistek Pro.
// Todo lo que muestre o enlazque teléfono/WhatsApp debe consumir estas
// constantes; nunca escribir el número a mano en un componente o página.
const telefono = "3018218345";

export const datosEmpresa = {
  direccionCompleta: "Calle 41, Cra 31 #00, Cali, Valle del Cauca",
  direccion: "Calle 41, Cra 31 #00, Cali",
  // Solo los 10 dígitos, tal como lo espera el backend y los placeholders.
  telefono,
  // Formato internacional sin separadores (E.164): tel:, JSON-LD, wa.me.
  telefonoIntl: `+57${telefono}`,
  // Presentación legible para texto visible y aria-labels.
  telefonoDisplay: `+57 ${telefono.slice(0, 3)} ${telefono.slice(3, 6)} ${telefono.slice(6)}`,
  // Número para enlaces wa.me.
  waNumber: `57${telefono}`,
  empresa: "Sistek Pro",
};
