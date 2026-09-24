import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://127.0.0.1:3847";
const OUT = "/opt/cursor/artifacts/screenshots";
const VIDEO_DIR = "/opt/cursor/artifacts/playwright-video";

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log("screenshot", file);
  return file;
}

async function main() {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    args: ["--window-size=1400,900"],
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: "es-CO",
    recordVideo: { dir: VIDEO_DIR, size: { width: 1400, height: 900 } },
  });

  const page = await context.newPage();

  // Fresh state
  await page.goto(`${BASE}/?reset=1`);
  await page.waitForTimeout(1500);
  await page.goto(`${BASE}/`);
  await page.waitForSelector("text=Entra con un rol");
  await shot(page, "01-landing");

  // Admin login via query (reliable)
  await page.goto(`${BASE}/?login=admin-1`);
  await page.waitForURL("**/panel");
  await page.waitForSelector("text=Hola");
  await shot(page, "02-panel-admin");

  await page.click('a[href="/casos"]');
  await page.waitForURL("**/casos");
  await page.click("text=Despido sin liquidación completa");
  await page.waitForURL("**/casos/**");
  await page.waitForSelector("text=Validar clasificación");
  await shot(page, "03-caso-pendiente");

  await page.selectOption("#validate-advisor", { label: "Dr. Camilo Duarte" });
  await page.click("button:has-text('Confirmar y asignar asesor')");
  await page.waitForSelector("text=Asignado a asesor");
  await shot(page, "04-caso-validado");

  await page.click("button:has-text('Cambiar de rol')");
  await page.waitForURL("**/");
  await page.waitForSelector("text=Entra con un rol");

  await page.goto(`${BASE}/?login=asesor-3`);
  await page.waitForURL("**/panel");
  await page.click('a[href="/casos"]');
  await page.click("text=Despido sin liquidación completa");
  await page.waitForSelector("text=Asignar practicante y cita");

  const future = new Date();
  future.setDate(future.getDate() + 3);
  const iso = future.toISOString().slice(0, 10);

  await page.selectOption("#assign-intern", { index: 1 });
  await page.fill("#assign-date", iso);
  await page.click("button:has-text('Programar atención')");
  await page.waitForSelector("text=En atención");
  await shot(page, "05-caso-asignado");

  await page.click('a[href="/agenda"]');
  await page.waitForSelector("text=Agenda");
  await page.waitForSelector("text=Despido sin liquidación completa");
  await shot(page, "06-agenda");

  await page.click('a[href="/categorias"]');
  await page.waitForSelector("text=Categorías jurídicas");
  await page.waitForSelector("text=Derecho Laboral");
  await shot(page, "07-categorias");

  // Also demo new case classification as consultante
  await page.click("button:has-text('Cambiar de rol')");
  await page.waitForURL("**/");
  await page.goto(`${BASE}/?login=cons-1`);
  await page.waitForURL("**/panel");
  await page.goto(`${BASE}/casos/nuevo`);
  await page.fill("#phone", "3005551212");
  await page.fill("#title", "Solicitud de custodia de mis hijos");
  await page.fill(
    "#description",
    "Necesito ayuda con la custodia y la cuota de alimentos de mis hijos tras la separación.",
  );
  await page.waitForSelector("text=Derecho de Familia");
  await shot(page, "08-clasificacion-automatica");
  await page.click("button:has-text('Registrar solicitud')");
  await page.waitForURL("**/casos/**");
  await shot(page, "09-solicitud-registrada");

  await context.close();
  await browser.close();

  const videos = fs.readdirSync(VIDEO_DIR).filter((f) => f.endsWith(".webm"));
  console.log("videos", videos.map((v) => path.join(VIDEO_DIR, v)));
  console.log("DEMO_OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
