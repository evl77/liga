# Liga en Vivo — instalación

App web instalable (PWA) con 1ª y 2ª División: partidos por semana, directo, clasificación, TV, goles e incidencias, estadísticas, alineaciones y avisos de gol de tus favoritos. No necesita cuenta de Claude ni servidor propio: los datos vienen de la API pública de ESPN.

## 1. Publicarla (gratis, 5 minutos)

Para instalarla en el móvil tiene que estar en una dirección **https**. Lo más sencillo, con GitHub Pages:

1. Crea una cuenta gratuita en github.com (si no tienes).
2. **New repository** → nombre, p. ej. `liga` → **Public** → Create.
3. **Add file → Upload files** → arrastra TODO el contenido de esta carpeta (incluida la carpeta `.github` y `vigilante`) → Commit.
   - Si el navegador no sube la carpeta oculta `.github`, créala a mano: Add file → Create new file → nombre `.github/workflows/goles.yml` y pega su contenido.
4. **Settings → Pages** → Source: *Deploy from a branch* → Branch `main` / `(root)` → Save.
5. En 1–2 minutos estará en `https://TU-USUARIO.github.io/liga/`.

(Alternativa sin GitHub: Netlify, Cloudflare Pages o Vercel, arrastrando la carpeta.)

## 2. Instalar en el móvil

- **iPhone (Safari)**: abre la dirección → botón Compartir → *Añadir a pantalla de inicio*. Ábrela siempre desde ese icono (iOS solo permite notificaciones así, iOS 16.4 o posterior).
- **Android (Chrome)**: abre la dirección → menú ⋮ → *Instalar app* / *Añadir a pantalla de inicio*.

Después: pestaña **Favoritos** → marca tus equipos → **Activar avisos de gol**.

## 3. Cómo funcionan los avisos

- **Con la app abierta o recién minimizada**: la app consulta cada 30 s si juega un favorito y avisa de cada gol (a favor y en contra), con goleador y minuto.
- **Con la app cerrada**: los móviles congelan las webs cerradas, así que hace falta el vigilante opcional:
  1. Instala la app **ntfy** (gratis, Android/iPhone) → **+** → suscríbete al canal que aparece en Favoritos (p. ej. `liga-abc123…`).
  2. En tu repositorio de GitHub: **Settings → Secrets and variables → Actions**
     - pestaña *Secrets* → New secret: `NTFY_TOPIC` = ese canal
     - pestaña *Variables* → New variable: `FAVORITOS` = los IDs que muestra la app (p. ej. `99,123`)
  3. Pestaña **Actions** → habilita los workflows → *Vigilante de goles* → **Run workflow** para probar.
  - GitHub lo ejecuta cada ~5 minutos y, si hay partido de tus equipos, vigila cada 30 s. GitHub a veces retrasa estas ejecuciones, así que algún aviso puede llegar con unos minutos de demora. En repositorios públicos es gratis. Si el repositorio pasa 60 días sin cambios, GitHub pausa el vigilante: basta con volver a activarlo en Actions.
  - Si usas el vigilante, puedes dejar desactivados los avisos dentro de la app para no recibirlos por duplicado.

## Notas

- **TV**: se muestra la cadena que facilita ESPN cuando la tiene; como ESPN no siempre trae la de España, cada partido tiene un enlace «Dónde verlo en España».
- Las alineaciones aparecen ~1 h antes del partido; estadísticas y eventos, en directo.
- Para actualizar la app, sube los archivos nuevos al repositorio; el móvil coge la versión nueva al abrirla con conexión.
