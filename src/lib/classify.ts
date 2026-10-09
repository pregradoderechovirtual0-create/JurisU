import { CATEGORIES } from "./data";
import type { LegalCategoryId } from "./types";

export interface ClassificationResult {
  categoryId: LegalCategoryId;
  // 0 significa que no hubo indicadores claros y el caso requiere revisión manual
  confidence: number;
  rationale: string;
  scores: {
    categoryId: LegalCategoryId;
    score: number;
    matches: string[];
  }[];
}

// Quita mayúsculas y tildes para comparar texto
function normalizar(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

// Palabras más importantes: pesan más en el puntaje
const PALABRAS_CLAVE_FUERTES = [
  "custodia",
  "divorcio",
  "violencia",
  "despido",
  "contrato",
  "delito",
  "robo",
];

export function classifyCase(text: string): ClassificationResult {
  const normalized = normalizar(text);

  const scores = CATEGORIES.map((category) => {
    let score = 0;
    const matches: string[] = [];

    for (const keyword of category.keywords) {
      const cleanKeyword = normalizar(keyword);

      if (normalized.includes(cleanKeyword)) {
        matches.push(keyword);
        score += PALABRAS_CLAVE_FUERTES.includes(keyword) ? 3 : 1;
      }
    }

    return {
      categoryId: category.id,
      score,
      matches,
    };
  }).sort((a, b) => b.score - a.score);

  const best = scores[0];
  const second = scores[1];

  let confidence = 0;

  if (best.score > 0) {
    confidence = Math.min(
      0.95,
      0.5 + (best.score - (second?.score ?? 0)) * 0.15,
    );
  }

  return {
    categoryId: best.categoryId,
    confidence,
    rationale:
      best.score > 0
        ? `Detectado por: ${best.matches.join(", ")}`
        : "No se encontraron indicadores claros. Requiere revisión manual.",
    scores,
  };
}