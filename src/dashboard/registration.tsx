"use client";
import { useState, type FormEvent } from "react";
import {
  KUNCHANADA_CATEGORIES,
  getKunchanadaContestantSlots,
  validateContestantAge,
  validateShortFilmLink,
  type KunchanadaContestant,
} from "./contestants";
import type { ContestantInput, ContestantSlot } from "./types";
import s from "./dashboard.module.css";
export const contestantSlotKey = (slot: ContestantSlot) =>
  `${slot.category}:${slot.subcategory}:${slot.slot_number}`;
export function DashboardCategoryList({
  selectedCategory,
  onSelect,
  contestants,
}: {
  selectedCategory: string;
  onSelect: (category: string) => void;
  contestants: KunchanadaContestant[];
}) {
  return (
    <nav aria-label="Contestant categories" className={s.nav}>
      {KUNCHANADA_CATEGORIES.map((category) => {
        const total =
          category.subcategories.length *
          getKunchanadaContestantSlots(category.id).length;
        const registered = category.subcategories.reduce(
          (sum, sub) =>
            sum +
            getKunchanadaContestantSlots(category.id).filter((slot) =>
              contestants.some(
                (c) =>
                  c.category === category.id &&
                  c.subcategory === sub.id &&
                  c.slot_number === slot,
              ),
            ).length,
          0,
        );
        return (
          <button
            type="button"
            key={category.id}
            aria-pressed={selectedCategory === category.id}
            onClick={() => onSelect(category.id)}
          >
            {category.label}{" "}
            <span aria-label="remaining slots">{total - registered}</span>
          </button>
        );
      })}
    </nav>
  );
}
export function ContestantRegistrationView({
  categoryId,
  contestants,
  onOpenSlot,
  registrationEnabled = true,
  submissionsLocked = false,
  databaseReady = true,
  opensAt,
}: {
  categoryId: string;
  contestants: KunchanadaContestant[];
  onOpenSlot: (slot: ContestantSlot) => void;
  registrationEnabled?: boolean;
  submissionsLocked?: boolean;
  databaseReady?: boolean;
  opensAt?: string | null;
}) {
  const category =
    KUNCHANADA_CATEGORIES.find((c) => c.id === categoryId) ??
    KUNCHANADA_CATEGORIES[0];
  if (!registrationEnabled && !submissionsLocked)
    return (
      <section>
        <h2>Registration closed</h2>
        {opensAt && (
          <p>
            Opens{" "}
            <time dateTime={opensAt}>{new Date(opensAt).toLocaleString()}</time>
          </p>
        )}
      </section>
    );
  return (
    <section className={s.stack}>
      <h2>{category.label}</h2>
      {!databaseReady && <p role="alert">Contestant data is unavailable.</p>}
      {submissionsLocked && (
        <p>Submissions locked. Registered contestants are read only.</p>
      )}
      {[...category.subcategories]
        .sort(
          (a, b) =>
            ["junior", "intermediate", "senior"].indexOf(a.id) -
            ["junior", "intermediate", "senior"].indexOf(b.id),
        )
        .map((sub) => (
          <section key={sub.id}>
            <h3>{sub.label}</h3>
            <div className={s.grid}>
              {getKunchanadaContestantSlots(category.id).map((slotNumber) => {
                const slot = {
                  category: category.id,
                  subcategory: sub.id,
                  slot_number: slotNumber,
                };
                const contestant = contestants.find(
                  (c) => contestantSlotKey(c) === contestantSlotKey(slot),
                );
                const content = (
                  <>
                    <strong>Slot {slotNumber}</strong>
                    <span>
                      {contestant?.contestant_name ?? "Not registered"}
                    </span>
                    {contestant && (
                      <>
                        <span>{contestant.date_of_birth}</span>
                        <span>{contestant.contact_number}</span>
                        <span>
                          {contestant.work_submitted_at
                            ? "Work submitted"
                            : "Work not submitted"}
                        </span>
                      </>
                    )}
                  </>
                );
                return (
                  <div key={slotNumber}>
                    {submissionsLocked ? (
                      <div className={s.slot}>
                        {content}
                        {contestant?.short_film_link &&
                          /^https?:\/\//i.test(contestant.short_film_link) && (
                            <a
                              href={contestant.short_film_link}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View short film
                            </a>
                          )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={s.slot}
                        disabled={!databaseReady}
                        onClick={() => onOpenSlot(slot)}
                        aria-label={`${contestant ? "Edit" : "Add"} ${category.label} ${sub.label} slot ${slotNumber}`}
                      >
                        {content}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
    </section>
  );
}
export function LockedContestantsTree({
  contestants,
  databaseReady = true,
}: {
  contestants: KunchanadaContestant[];
  databaseReady?: boolean;
}) {
  return (
    <div className={s.stack}>
      {KUNCHANADA_CATEGORIES.filter((category) =>
        contestants.some((c) => c.category === category.id),
      ).map((category) => (
        <ContestantRegistrationView
          key={category.id}
          categoryId={category.id}
          contestants={contestants}
          databaseReady={databaseReady}
          submissionsLocked
          onOpenSlot={() => {}}
        />
      ))}
      {!contestants.length && (
        <p>
          {databaseReady
            ? "No registered contestants."
            : "Contestant data is unavailable."}
        </p>
      )}
    </div>
  );
}
export function ContestantEditor({
  slot,
  contestant,
  onSave,
  onSaved,
  onPendingChange,
  disabled = false,
}: {
  slot: ContestantSlot;
  contestant?: KunchanadaContestant;
  onSave: (input: ContestantInput) => Promise<KunchanadaContestant>;
  onSaved: (contestant: KunchanadaContestant) => void;
  onPendingChange?: (pending: boolean) => void;
  disabled?: boolean;
}) {
  const [name, setName] = useState(contestant?.contestant_name ?? "");
  const [birth, setBirth] = useState(contestant?.date_of_birth ?? "");
  const [phone, setPhone] = useState(contestant?.contact_number ?? "");
  const [link, setLink] = useState(contestant?.short_film_link ?? "");
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pending || disabled) return;
    const age = validateContestantAge(slot.subcategory, birth);
    const film =
      slot.category === "short-film"
        ? validateShortFilmLink(link)
        : { valid: true, message: null };
    if (name.trim().length < 2 || !age.valid || !film.valid || !phone.trim()) {
      setError(
        name.trim().length < 2
          ? "Enter the contestant’s full name."
          : !age.valid
            ? age.message!
            : !film.valid
              ? film.message!
              : "Enter a contact number.",
      );
      return;
    }
    setPending(true);
    onPendingChange?.(true);
    setError("");
    try {
      const saved = await onSave({
        ...slot,
        contestant_name: name.trim(),
        date_of_birth: birth,
        contact_number: phone.trim(),
        short_film_link: slot.category === "short-film" ? link.trim() : null,
      });
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save contestant.");
    } finally {
      setPending(false);
      onPendingChange?.(false);
    }
  }
  return (
    <form onSubmit={submit} className={s.stack}>
      <fieldset disabled={pending || disabled} className={s.stack}>
        <legend>Contestant details</legend>
        <label className={s.field}>
          Full name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={s.field}>
          Date of birth
          <input
            required
            type="date"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
          />
        </label>
        <label className={s.field}>
          Contact number
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        {slot.category === "short-film" && (
          <label className={s.field}>
            Short film link
            <input
              required
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </label>
        )}
        <button type="submit">{pending ? "Saving…" : "Save contestant"}</button>
      </fieldset>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
export function DashboardRegistrationStatus({
  coordinatorName,
  registrationEnabled,
  submissionsLocked,
  children,
}: {
  coordinatorName: string;
  registrationEnabled: boolean;
  submissionsLocked: boolean;
  children?: import("react").ReactNode;
}) {
  return (
    <section className={s.stack}>
      <h2>Registration status</h2>
      <dl className={s.fields}>
        <div>
          <dt>Registration by</dt>
          <dd>{coordinatorName}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            {submissionsLocked
              ? "Submissions locked"
              : registrationEnabled
                ? "Open"
                : "Closed"}
          </dd>
        </div>
      </dl>
      {children}
    </section>
  );
}
