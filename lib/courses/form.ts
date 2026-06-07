/** Eğitim formu — her satır bir öğrenilecek madde */
export function parseLearningOutlinesText(text: string): string[] {
  return text
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function learningOutcomesToText(items: string[]): string {
  return items.join("\n");
}

export const DEFAULT_LEARNING_OUTCOMES_TEXT =
  "Temel kavram ve modeller\nUygulamalı vaka çalışmaları\nSüpervizyon oturumlarına hazırlık";
