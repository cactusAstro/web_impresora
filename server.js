const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process"); //  MEJORA: execFile en lugar de exec (evita inyección de shell)
const net = require("net");
const http = require("http");  //  MEJORA: imports al nivel de módulo, no dentro de funciones
const https = require("https");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static(__dirname));

// ─────────────────────────────────────────────
// LOGGING básico con timestamp e IP consultada
// ─────────────────────────────────────────────
function log(mensaje) {
  const fecha = new Date().toISOString();
  console.log(`[${fecha}] ${mensaje}`);
}

// ─────────────────────────────────────────────
// VALIDACIÓN: IP válida y no privada/reservada
// ─────────────────────────────────────────────
function esIPValida(ip) {
  return net.isIP(ip) !== 0;
}

//  MEJORA: Bloquear IPs privadas y reservadas para evitar escaneo de red interna
// Ajusta esta lista si tu caso de uso requiere acceder a rangos privados
function esIPPrivadaOReservada(ip) {
  const privados = [
    /^127\./,                        // loopback
    /^10\./,                         // Clase A privada
    /^172\.(1[6-9]|2\d|3[01])\./,   // Clase B privada
    /^192\.168\./,                   // Clase C privada
    /^169\.254\./,                   // link-local
    /^::1$/,                         // loopback IPv6
    /^fc|^fd/,                       // ULA IPv6
  ];
  return privados.some(patron => patron.test(ip));
}

// ─────────────────────────────────────────────
// COMPROBACIÓN WEB: HTTP y HTTPS
// ─────────────────────────────────────────────

//  MEJORA: Comprobar también HTTPS (puerto 443), no solo HTTP
function comprobarPuerto(ip, puerto, usarHTTPS) {
  return new Promise((resolve) => {
    const modulo = usarHTTPS ? https : http;
    const req = modulo.get(
      {
        host: ip,
        port: puerto,
        path: "/",
        timeout: 2000,
        // Ignorar errores de certificado en entornos locales de impresoras
        rejectUnauthorized: false,
      },
      (res) => {
        resolve(res.statusCode > 0);
        req.destroy();
      }
    );

    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });

    req.on("error", () => {
      resolve(false);
    });
  });
}

async function comprobarWeb(ip) {
  //  MEJORA: Comprueba HTTP (80) y HTTPS (443) en paralelo
  const [respondeHTTP, respondeHTTPS] = await Promise.all([
    comprobarPuerto(ip, 80, false),
    comprobarPuerto(ip, 443, true),
  ]);
  return respondeHTTP || respondeHTTPS;
}

// ─────────────────────────────────────────────
// RUTA PING
// ─────────────────────────────────────────────
app.get("/ping", async (req, res) => {
  const ip = (req.query.ip || "").trim();

  // Log de cada consulta
  log(`Consulta ping → IP: "${ip}" desde ${req.ip}`);

  if (!esIPValida(ip)) {
    log(`IP rechazada (formato inválido): "${ip}"`);
    return res.status(400).json({
      estado: "offline",
      error: "IP no válida",
    });
  }

  // ⚠️ Bloque desactivado: red local del hospital (rango 10.x.x.x)
  // Activa esto solo si el servidor fuera público
  // if (esIPPrivadaOReservada(ip)) {
  //   log(`IP rechazada (rango privado/reservado): "${ip}"`);
  //   return res.status(400).json({
  //     estado: "offline",
  //     error: "IP en rango privado o reservado",
  //   });
  // }

  //  MEJORA: execFile con array de argumentos → no invoca shell → inmune a inyección
  const isWin = process.platform === "win32";
  const cmd = isWin ? "ping" : "ping";
  const args = isWin ? ["-n", "1", ip] : ["-c", "1", "-W", "1", ip];

  //  MEJORA: timeout consistente con -W 1 del ping (2s margen)
  execFile(cmd, args, { timeout: 4000 }, async (error, stdout, stderr) => {
    const salida = (stdout || "") + (stderr || "");

    if (!error) {
      log(`Ping OK → ${ip}`);
      //  MEJORA: No devolver la salida cruda del sistema; parsear solo lo relevante
      return res.json({
        estado: "online",
        detalle: parsearSalidaPing(salida),
      });
    }

    // Sin respuesta ICMP → intentar HTTP/HTTPS
    const respondeWeb = await comprobarWeb(ip);
    if (respondeWeb) {
      log(`Sin ICMP pero responde HTTP/HTTPS → ${ip}`);
      return res.json({
        estado: "web",
        detalle: "No responde a ICMP pero sí por HTTP o HTTPS",
      });
    }

    log(`Offline → ${ip}`);
    return res.json({
      estado: "offline",
      detalle: "No responde",
    });
  });
});

// ─────────────────────────────────────────────
// PARSEO DE PING: solo extraer tiempo y TTL
// ─────────────────────────────────────────────
//  MEJORA: No exponer salida cruda del sistema operativo al cliente
function parsearSalidaPing(salida) {
  const tiempo = salida.match(/time[=<](\d+\.?\d*)\s*ms/i);
  const ttl = salida.match(/ttl[=:](\d+)/i);

  const partes = [];
  if (tiempo) partes.push(`Tiempo: ${tiempo[1]} ms`);
  if (ttl) partes.push(`TTL: ${ttl[1]}`);

  return partes.length > 0 ? partes.join(" · ") : "Responde a ping";
}

// ─────────────────────────────────────────────
// RUTA RAÍZ
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ─────────────────────────────────────────────
// ARRANQUE
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  log(`Servidor iniciado en http://localhost:${PORT}`);
});