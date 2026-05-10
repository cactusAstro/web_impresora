# 🖨️ Panel de Gestión de Impresoras

## 📁 Archivos del proyecto

```
tu-carpeta/
├── index_mejorado_v2.html        ← El panel
├── server.js                      ← Servidor Node (hace los pings reales)
├── impresoras_con_serial.js       ← Datos de las impresoras
├── manifest.json                  ← Para PWA
├── service-worker.js              ← Para PWA
├── INICIAR_SERVIDOR.bat           ← Doble click para arrancar (Windows)
├── INICIAR_SERVIDOR.command       ← Doble click para arrancar (Mac)
└── README.md                      ← Este archivo
```

---

## 🚀 Cómo arrancar el panel

### Primera vez (solo una vez)

1. **Instalar Node.js** desde https://nodejs.org (versión LTS)
2. Asegúrate de que todos los archivos están en la **misma carpeta**

### Cada vez que quieras usar el panel

#### 🪟 En Windows
1. **Doble click** en `INICIAR_SERVIDOR.bat`
2. Se abrirá una ventana negra → no la cierres
3. Abre `index_mejorado_v2.html` en el navegador
4. ✅ Listo, los pings funcionan

#### 🍎 En Mac
1. La primera vez, abre Terminal y ejecuta:
   ```
   chmod +x INICIAR_SERVIDOR.command
   ```
2. **Doble click** en `INICIAR_SERVIDOR.command`
3. Se abrirá una ventana de Terminal → no la cierres
4. Abre `index_mejorado_v2.html` en el navegador
5. ✅ Listo

---

## 🔍 ¿No funciona el ping?

### Comprueba que el servidor está corriendo

Abre esta URL en el navegador:
```
http://localhost:3000/ping?ip=8.8.8.8
```

- Si te responde con JSON `{"estado":"online",...}` → ✅ Servidor OK
- Si dice "no se puede conectar" → ❌ El servidor NO está corriendo

### Si el servidor está en otra IP

Si tu servidor Node está en otro PC de la red (por ejemplo `192.168.1.50:3000`):
1. Abre el panel
2. Pulsa el botón **⚙️** (configuración) arriba a la derecha
3. Cambia "Servidor de ping" a `http://192.168.1.50:3000`
4. Guarda

---

## ✨ Funcionalidades del panel

- 🔍 **Búsqueda inteligente** multi-palabra ("HP planta 2")
- ⭐ **Favoritos** que se guardan en el navegador
- 🏓 **Ping en tiempo real** a las impresoras
- 📱 **QR codes** para acceder al panel web desde el móvil
- 📊 **Histórico de pings** con uptime
- 📝 **Notas** por impresora
- 📤 **Importar y exportar** CSV/JSON
- 💾 **Backup completo** de todos los datos
- 🗂️ **Vista tabla** o **vista tarjetas**
- 🌙 **Modo oscuro/claro**
- 📋 **Logs de actividad**
- ✅ **Multi-selección** y acciones en lote
- 👥 **3 roles**: Administrador / Técnico / Lector
- 📱 **Instalable como app** (PWA)
- 🖨️ **Modo imprimir** optimizado

---

## ⌨️ Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl+F` | Enfocar búsqueda |
| `Ctrl+S` | Exportar CSV |
| `Ctrl+N` | Nueva impresora |
| `Ctrl+P` | Imprimir |
| `ESC` | Cerrar modal o limpiar filtros |

---

## 🆘 Solución de problemas

### "Node.js no se reconoce"
Instala Node.js desde https://nodejs.org y reinicia el ordenador.

### "Cannot find module 'express'"
En la carpeta del proyecto, abre terminal/CMD y ejecuta:
```
npm install express cors
```

### El banner rojo dice "servidor no disponible"
El servidor Node no está corriendo. Ejecuta `INICIAR_SERVIDOR.bat` (Windows) o `INICIAR_SERVIDOR.command` (Mac).

### Las impresoras salen siempre offline
- Verifica que la IP es correcta (botón ✏️ en cada fila)
- Algunas impresoras bloquean ICMP pero responden por web → saldrán como 🔵 Web
- Si la red bloquea ping, no hay solución desde la app
