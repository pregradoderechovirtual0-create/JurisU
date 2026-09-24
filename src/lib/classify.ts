import { CATEGORIES } from "./data";
import type { LegalCategoryId } from "./types";

export interface ClassificationResult {
  categoryId: LegalCategoryId;
  confidence: number;
  rationale: string;
  scores: { categoryId: LegalCategoryId; score: number; matches: string[] }[];
}

/**
 * Clasificación automática por coincidencia de palabras clave.
 * Simula el módulo inteligente descrito en la guía inicial.
 */
export function classifyCase(text: string): ClassificationResult {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  const scores = CATEGORIES.map((category) => {
    const matches: string[] = [];
    for (const keyword of category.keywords) {
      const needle = keyword
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
      if (normalized.includes(needle)) {
        matches.push(keyword);
      }
    }
    return {
      categoryId: category.id,
      score: matches.length,
      matches,
    };
  }).sort((a, b) => b.score - a.score);

  const best = scores[0];
  const second = scores[1];
  const totalHits = scores.reduce((sum, s) => sum + s.score, 0);

  let confidence = 0.35;
  if (best.score > 0 && totalHits > 0) {
    confidence = Math.min(
      0.97,
      0.45 + best.score * 0.12 + (best.score - (second?.score ?? 0)) * 0.08,
    );
  }

  const category = CATEGORIES.find((c) => c.id === best.categoryId)!;

  let rationale: string;
  if (best.score === 0) {
    rationale =
      "No se detectaron indicadores claros. Se propone Derecho Civil como categoría por defecto para revisión administrativa.";
  } else {
    rationale = `Se detectaron términos asociados a ${category.name}: ${best.matches
      .slice(0, 4)
      .join(", ")}.`;
  }

  return {
    categoryId: best.score > 0 ? best.categoryId : "civil",
    confidence,
    rationale,
    scores,
  };
}

export function nextFolio(existingCount: number): string {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(4, "0");
  return `CJ-${year}-${seq}`;
}
