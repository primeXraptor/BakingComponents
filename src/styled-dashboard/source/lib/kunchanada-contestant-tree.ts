import {
  findKunchanadaCategory,
  findKunchanadaSubcategory,
  KUNCHANADA_CATEGORIES,
  type KunchanadaContestant,
} from "./kunchanada-contestants";

export interface ContestantTreeGroup {
  id: string;
  label: string;
  subcategories: { id: string; label: string; contestants: KunchanadaContestant[] }[];
}

/** Include every saved submission, including categories retired from the form. */
export function groupContestantsForTree(
  contestants: KunchanadaContestant[],
): ContestantTreeGroup[] {
  const groups = new Map<string, ContestantTreeGroup>();
  for (const contestant of contestants) {
    let group = groups.get(contestant.category);
    if (!group) {
      group = {
        id: contestant.category,
        label: findKunchanadaCategory(contestant.category)?.label ?? contestant.category,
        subcategories: [],
      };
      groups.set(contestant.category, group);
    }
    let subcategory = group.subcategories.find((item) => item.id === contestant.subcategory);
    if (!subcategory) {
      subcategory = {
        id: contestant.subcategory,
        label:
          findKunchanadaSubcategory(contestant.category, contestant.subcategory)?.label ??
          contestant.subcategory,
        contestants: [],
      };
      group.subcategories.push(subcategory);
    }
    subcategory.contestants.push(contestant);
  }
  const order = (id: string) => {
    const index = KUNCHANADA_CATEGORIES.findIndex((category) => category.id === id);
    return index < 0 ? KUNCHANADA_CATEGORIES.length : index;
  };
  for (const group of groups.values()) {
    for (const subcategory of group.subcategories) {
      subcategory.contestants.sort(
        (a, b) =>
          a.slot_number - b.slot_number || a.contestant_name.localeCompare(b.contestant_name),
      );
    }
    group.subcategories.sort((a, b) => a.label.localeCompare(b.label));
  }
  return [...groups.values()].sort(
    (a, b) => order(a.id) - order(b.id) || a.label.localeCompare(b.label),
  );
}
