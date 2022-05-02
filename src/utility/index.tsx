const nameExp = /^(.+), (.+)$/;
const nameQualifierExp = /^.+,.+$/;

export function unsplitName(text: string) {
  if (!nameQualifierExp.test(text)) return text;

  const matches = nameExp.exec(text);
  if (matches && matches.length > 1) return `${matches[2]} ${matches[1]}`;

  return text;
}

export function normalizeString(text: string) {
  return text
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export default {
  unsplitName,
  normalizeString,
};
