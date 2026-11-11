# Pregúntale al FCOM — despliegue en Netlify

Airline Ready by From The Cockpit

## Contenido
- `index.html` — la app completa (ES/EN). Procesa los PDF en el navegador y los guarda solo en ese dispositivo.
- `netlify/functions/ask.mjs` — función que llama a Claude con tu clave (la clave nunca llega al navegador).
- `netlify.toml` — configuración.

## Pasos
1. Crea una clave en https://console.anthropic.com (Settings → API Keys).
2. Sube esta carpeta a un repositorio de GitHub y conéctalo en Netlify (Add new site → Import an existing project),
   o desde la terminal, dentro de la carpeta: `npx netlify-cli deploy --prod`.
   Nota: arrastrar la carpeta a Netlify Drop publica solo la página; la función de respuestas necesita GitHub o la CLI.
3. En Netlify → Site configuration → Environment variables, agrega:
   - `ANTHROPIC_API_KEY` = tu clave
   - (opcional) `ANTHROPIC_MODEL` = modelo a usar (por defecto `claude-sonnet-5-5`)
   - (recomendado) `ALLOWED_ORIGIN` = la URL de tu sitio, p. ej. `https://preguntale-al-fcom.netlify.app`
4. Vuelve a desplegar (Deploys → Trigger deploy).

## Uso
Abre la Biblioteca, carga tu FCOM/FCTM/QRH vigentes (PDF, TXT o MD) y pregunta.
Cada respuesta cita el pasaje exacto; las citas que no coinciden palabra por palabra se eliminan.

## Costos y seguridad
Cada pregunta consume tokens de tu cuenta de Anthropic (los pasajes se envían en la consulta).
Pon un límite de gasto en la consola de Anthropic y usa `ALLOWED_ORIGIN` para que solo tu sitio use la función.
