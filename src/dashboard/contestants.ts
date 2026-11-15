export const KUNCHANADA_CATEGORIES = [
  {
    id: "sinhala-announcing",
    label: "Sinhala Announcing",
    subcategories: [
      { id: "senior", label: "Senior" },
      { id: "intermediate", label: "Intermediate" },
      { id: "junior", label: "Junior" },
    ],
  },
  {
    id: "english-announcing",
    label: "English Announcing",
    subcategories: [
      { id: "senior", label: "Senior" },
      { id: "intermediate", label: "Intermediate" },
      { id: "junior", label: "Junior" },
    ],
  },
  {
    id: "tamil-announcing",
    label: "Tamil Announcing",
    subcategories: [{ id: "open", label: "Open" }],
  },
  {
    id: "sinhala-editing",
    label: "Sinhala Editing",
    subcategories: [
      { id: "senior", label: "Senior" },
      { id: "intermediate", label: "Intermediate" },
      { id: "junior", label: "Junior" },
    ],
  },
  {
    id: "english-editing",
    label: "English Editing",
    subcategories: [
      { id: "senior", label: "Senior" },
      { id: "intermediate", label: "Intermediate" },
      { id: "junior", label: "Junior" },
    ],
  },
  {
    id: "tamil-editing",
    label: "Tamil Editing",
    subcategories: [{ id: "open", label: "Open" }],
  },
  {
    id: "sports-commentary",
    label: "Sports Commentary",
    subcategories: [
      { id: "sinhala", label: "Sinhala" },
      { id: "english", label: "English" },
    ],
  },
  {
    id: "sinhala-dubbing",
    label: "Sinhala Dubbing",
    subcategories: [
      { id: "senior", label: "Senior" },
      { id: "intermediate", label: "Intermediate" },
      { id: "junior", label: "Junior" },
    ],
  },
  {
    id: "english-dubbing",
    label: "English Dubbing",
    subcategories: [
      { id: "senior", label: "Senior" },
      { id: "intermediate", label: "Intermediate" },
      { id: "junior", label: "Junior" },
    ],
  },
  {
    id: "technical",
    label: "Technical",
    subcategories: [
      { id: "sinhala", label: "Sinhala" },
      { id: "english", label: "English" },
    ],
  },
  {
    id: "photography",
    label: "Photography",
    subcategories: [
      { id: "category-1", label: "Category 1" },
      { id: "category-2", label: "Category 2" },
    ],
  },
  {
    id: "graphic-designing",
    label: "Graphic Designing",
    subcategories: [{ id: "open", label: "Open" }],
  },
  {
    id: "cartoon-drawing",
    label: "Cartoon Drawing",
    subcategories: [{ id: "open", label: "Open" }],
  },
  {
    id: "poster-drawing",
    label: "Poster Drawing",
    subcategories: [{ id: "open", label: "Open" }],
  },
  {
    id: "short-film",
    label: "Short Film",
    subcategories: [{ id: "open", label: "Open" }],
  },
  {
    id: "special-event",
    label: "Special Event",
    subcategories: [{ id: "open", label: "Open" }],
  },
  {
    id: "group-event",
    label: "Group Event",
    subcategories: [{ id: "open", label: "Open" }],
  },
] as const;

export const CONTESTANT_AGE_RANGES = {
  senior: { min: 17, max: 19 },
  intermediate: { min: 14, max: 16 },
  junior: { min: 11, max: 13 },
} as const;

export type KunchanadaCategoryId = (typeof KUNCHANADA_CATEGORIES)[number]["id"];

export const KUNCHANADA_CONTESTANT_SLOTS = [1, 2] as const;
const KUNCHANADA_SINGLE_CONTESTANT_SLOTS = [1] as const;
export type KunchanadaContestantSlot =
  (typeof KUNCHANADA_CONTESTANT_SLOTS)[number];

export interface KunchanadaContestant {
  work_submitted_at?: string | null;
  contact_number?: string | null;
  id: string;
  category: string;
  subcategory: string;
  slot_number: KunchanadaContestantSlot;
  contestant_name: string;
  date_of_birth: string;
  short_film_link: string | null;
  created_at: string;
  updated_at: string;
}

export const KUNCHANADA_CONTESTANT_LIMIT = KUNCHANADA_CATEGORIES.reduce(
  (total, category) =>
    total +
    category.subcategories.length *
      getKunchanadaContestantSlots(category.id).length,
  0,
);

export function getKunchanadaContestantSlots(
  categoryId: string,
): readonly KunchanadaContestantSlot[] {
  return categoryId === "short-film"
    ? KUNCHANADA_SINGLE_CONTESTANT_SLOTS
    : KUNCHANADA_CONTESTANT_SLOTS;
}

export function isKunchanadaContestantSlotAllowed(
  categoryId: string,
  slotNumber: number,
) {
  return getKunchanadaContestantSlots(categoryId).some(
    (allowedSlotNumber) => allowedSlotNumber === slotNumber,
  );
}

export function validateShortFilmLink(link: string) {
  const trimmedLink = link.trim();

  if (!trimmedLink) {
    return { valid: false, message: "Enter the link to the short film." };
  }

  if (trimmedLink.length > 2048) {
    return { valid: false, message: "The short film link is too long." };
  }

  try {
    const url = new URL(trimmedLink);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { valid: false, message: "Enter a valid http or https link." };
    }
  } catch {
    return { valid: false, message: "Enter a valid link to the short film." };
  }

  return { valid: true, message: null };
}

export function findKunchanadaCategory(categoryId: string) {
  return KUNCHANADA_CATEGORIES.find((category) => category.id === categoryId);
}

export function findKunchanadaSubcategory(
  categoryId: string,
  subcategoryId: string,
) {
  return findKunchanadaCategory(categoryId)?.subcategories.find(
    (subcategory) => subcategory.id === subcategoryId,
  );
}

export function calculateAge(dateOfBirth: string, referenceDate = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const birthDate = new Date(Date.UTC(year, month - 1, day));

  if (
    birthDate.getUTCFullYear() !== year ||
    birthDate.getUTCMonth() !== month - 1 ||
    birthDate.getUTCDate() !== day
  ) {
    return null;
  }

  let age = referenceDate.getUTCFullYear() - year;
  const referenceMonth = referenceDate.getUTCMonth() + 1;
  const referenceDay = referenceDate.getUTCDate();

  if (
    referenceMonth < month ||
    (referenceMonth === month && referenceDay < day)
  ) {
    age -= 1;
  }

  return age;
}

export function validateContestantAge(
  subcategoryId: string,
  dateOfBirth: string,
  referenceDate = new Date(),
) {
  const age = calculateAge(dateOfBirth, referenceDate);

  if (age === null || age < 0) {
    return { valid: false, age, message: "Enter a valid date of birth." };
  }

  const range =
    CONTESTANT_AGE_RANGES[subcategoryId as keyof typeof CONTESTANT_AGE_RANGES];

  if (!range) {
    return { valid: true, age, message: null };
  }

  if (age < range.min || age > range.max) {
    return {
      valid: false,
      age,
      message: `This category is for contestants aged ${range.min}–${range.max}. The entered contestant is ${age}.`,
    };
  }

  return { valid: true, age, message: null };
}
