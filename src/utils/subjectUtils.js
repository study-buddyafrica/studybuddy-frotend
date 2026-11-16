/**
 * Subject Normalization Utilities (BUG-008)
 *
 * Provides a consistent normalization boundary for teacher and curriculum subjects
 * across the frontend application. Prevents raw backend objects (e.g. { id, name }
 * or { subject: "Math" }) from leaking '[object Object]' into the UI.
 */

/**
 * Normalizes a single subject entry into a clean, safe string label.
 * - Preserves string subjects (trimmed).
 * - For object subjects, prefers readable name fields (`name`, then `subject`, then `title`, `label`, etc.).
 * - Ignores null/undefined/empty values.
 * - Safe final fallback guaranteed NEVER to return '[object Object]'.
 *
 * @param {*} sub - Raw subject entry (string, object, number, etc.)
 * @returns {string} Normalized subject label or empty string.
 */
export const normalizeSubject = (sub) => {
  if (sub === null || sub === undefined) {
    return "";
  }

  if (typeof sub === "string") {
    const trimmed = sub.trim();
    return trimmed === "[object Object]" ? "" : trimmed;
  }

  if (typeof sub === "number") {
    return String(sub);
  }

  if (typeof sub === "object") {
    // Check candidates in order of contract preference
    const candidateFields = [
      sub.name,
      sub.subject,
      sub.title,
      sub.label,
      sub.subject_name,
      sub.name_en,
      sub.value,
    ];

    for (const candidate of candidateFields) {
      if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (trimmed.length > 0 && trimmed !== "[object Object]") {
          return trimmed;
        }
      } else if (typeof candidate === "number") {
        return String(candidate);
      } else if (candidate && typeof candidate === "object") {
        const nested = normalizeSubject(candidate);
        if (nested.length > 0) {
          return nested;
        }
      }
    }

    // Safe final fallback: never return '[object Object]'
    return "";
  }

  return "";
};

/**
 * Normalizes an array or single value of subjects into a clean array of string labels.
 * Filters out null, undefined, empty strings, and duplicates while preserving order.
 *
 * @param {Array|*} subjects - Raw subjects array or value.
 * @returns {string[]} Array of clean, normalized subject labels.
 */
export const normalizeSubjectList = (subjects) => {
  if (!subjects) {
    return [];
  }

  const rawArray = Array.isArray(subjects) ? subjects : [subjects];
  const seen = new Set();
  const result = [];

  for (const item of rawArray) {
    const label = normalizeSubject(item);
    if (label && label.length > 0 && !seen.has(label)) {
      seen.add(label);
      result.push(label);
    }
  }

  return result;
};

/**
 * Formats a subject list into a human-readable comma-separated string.
 *
 * @param {Array|*} subjects - Raw subjects array or value.
 * @param {string} [emptyFallback=""] - Fallback string if no valid subjects exist.
 * @returns {string} Formatted comma-separated subjects or fallback.
 */
export const formatSubjects = (subjects, emptyFallback = "") => {
  const list = normalizeSubjectList(subjects);
  return list.length > 0 ? list.join(", ") : emptyFallback;
};
