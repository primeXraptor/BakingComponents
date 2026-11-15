"use client";
import {KunchanadaExportButton} from './KunchanadaExportButton';
import {KunchanadaPersonalAlertsManager,type AdminPersonalAlert} from './KunchanadaPersonalAlertsManager';
import {KunchanadaCalendarManager} from './KunchanadaCalendarManager';
import {KunchanadaRegistrationControls} from './KunchanadaRegistrationControls';
import {Badge} from '../base/badges/badges';
import {AdminCheckbox,AdminEmpty,AdminField,AdminPanel,AdminPdfFields,AdminSaveButton,AdminSelect} from './AdminFormUI';
import {KUNCHANADA_CATEGORIES,KUNCHANADA_CONTESTANT_LIMIT,isKunchanadaContestantSlotAllowed} from '../../lib/kunchanada-contestants';
import type {KunchanadaCalendarEvent} from '../../lib/kunchanada-calendar';
import {useAdminActions} from '../../../runtime/admin';
type Row = Record<string, unknown>;

function value(row: Row | undefined, key: string) {
  const field = row?.[key];
  return field === null || field === undefined ? "" : String(field);
}

function bool(row: Row | undefined, key: string, fallback = false) {
  const field = row?.[key];
  return field === null || field === undefined ? fallback : Boolean(field);
}

function localDateTime(raw: unknown) {
  if (!raw) return "";
  const date = new Date(String(raw));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(" ", "T");
}

function readableDate(raw: unknown) {
  if (!raw) return "No date";
  const date = new Date(String(raw));
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString("en-LK", { dateStyle: "medium", timeZone: "Asia/Colombo" });
}

function contestantCategoryLabel(categoryId: string) {
  return KUNCHANADA_CATEGORIES.find((category) => category.id === categoryId)?.label ?? categoryId;
}

function contestantSubcategoryLabel(categoryId: string, subcategoryId: string) {
  return (
    KUNCHANADA_CATEGORIES.find((category) => category.id === categoryId)?.subcategories.find(
      (subcategory) => subcategory.id === subcategoryId,
    )?.label ?? subcategoryId
  );
}

export function KunchanadaManager({
  settings,
  schools,
  contestants,
  newsTags,
  calendarEvents,
  calendarReady,
  personalAlerts,
  personalAlertsReady,
}: {
  settings?: Row;
  schools: Row[];
  contestants: Row[];
  newsTags: string[];
  calendarEvents: KunchanadaCalendarEvent[];
  calendarReady: boolean;
  personalAlerts: AdminPersonalAlert[];
  personalAlertsReady: boolean;
}) {
  const {saveKunchanadaPortalSettings} = useAdminActions();
  const selectedTag =
    settings?.alerts_news_tag === undefined ? "Kunchanada" : value(settings, "alerts_news_tag");
  const tagOptions =
    selectedTag && !newsTags.includes(selectedTag) ? [selectedTag, ...newsTags] : newsTags;

  return (
    <div className="space-y-[20px]">
      <AdminPanel title="" description="">
        <form action={saveKunchanadaPortalSettings} className="space-y-[18px]">
          {settings && "school_registration_locked" in settings && (
            <input type="hidden" name="school_lock_supported" value="true" />
          )}
          <AdminCheckbox
            name="school_registration_locked"
            label="Lock school registrations"
            defaultChecked={bool(settings, "school_registration_locked")}
            disabled={!settings || !("school_registration_locked" in settings)}
            description={
              settings && "school_registration_locked" in settings
                ? "Disable the school registration page and block new school registrations."
                : "Apply the school registration lock migration to enable this option."
            }
          />
          <KunchanadaRegistrationControls
            key={`${bool(settings, "contestant_registration_enabled")}-${bool(settings, "contestant_submissions_locked")}-${bool(settings, "contestant_submissions_enabled")}`}
            enabled={bool(settings, "contestant_registration_enabled")}
            locked={bool(settings, "contestant_submissions_locked")}
            lockSupported={Boolean(settings && "contestant_submissions_locked" in settings)}
            submissionsEnabled={bool(settings, "contestant_submissions_enabled")}
            submissionsSupported={Boolean(settings && "contestant_submissions_enabled" in settings)}
          />
          <AdminField
            label="School registration opening"
            name="contestant_registration_opens_at"
            type="datetime-local"
            defaultValue={localDateTime(settings?.contestant_registration_opens_at)}
            hint=""
          />
          {settings &&
          "school_registration_closes_at" in settings &&
          "contestant_registration_closes_at" in settings ? (
            <>
              <input type="hidden" name="closing_dates_supported" value="true" />
              <AdminField
                label="School registration closing"
                name="school_registration_closes_at"
                type="datetime-local"
                defaultValue={localDateTime(settings.school_registration_closes_at)}
                hint="Sri Lanka time. Shown in the dashboard Calendar pane."
              />
            </>
          ) : (
            <p className="text-sm text-[var(--admin-muted)]">
              Apply the personal-alerts and deadlines migration to configure registration closing
              dates.
            </p>
          )}
          {settings && "contestant_registration_opening_at" in settings ? (
            <>
              <input type="hidden" name="contestant_opening_supported" value="true" />
              <AdminField
                label="Contestants registration opening"
                name="contestant_registration_opening_at"
                type="datetime-local"
                defaultValue={localDateTime(settings.contestant_registration_opening_at)}
                hint="Sri Lanka time. Shown in registration countdowns."
              />
            </>
          ) : (
            <AdminField
              label="Contestants registration opening"
              name="contestant_registration_opening_at"
              type="datetime-local"
              disabled
              hint="Apply the contestant registration opening migration to enable this new date."
            />
          )}
          {settings &&
            "school_registration_closes_at" in settings &&
            "contestant_registration_closes_at" in settings && (
              <AdminField
                label="Contestants registration closing"
                name="contestant_registration_closes_at"
                type="datetime-local"
                defaultValue={localDateTime(settings.contestant_registration_closes_at)}
                hint="Sri Lanka time. Shown in the dashboard Calendar pane."
              />
            )}
          <AdminSelect
            label="Alerts news tag"
            name="alerts_news_tag"
            disabled={!settings || !("alerts_news_tag" in settings)}
            defaultValue={selectedTag}
          >
            <option value="">No news alerts</option>
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </AdminSelect>
          <AdminPdfFields currentUrl={value(settings, "rules_pdf_url")} />
          {value(settings, "rules_pdf_url") && (
            <a
              href={value(settings, "rules_pdf_url")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex cursor-pointer text-sm font-semibold text-[var(--admin-accent)] hover:underline"
            >
              pffff
            </a>
          )}
          <div>
            <AdminSaveButton>save karapiya</AdminSaveButton>
          </div>
        </form>
      </AdminPanel>

      <KunchanadaPersonalAlertsManager
        schools={schools
          .map((school) => ({
            authUserId: value(school, "auth_user_id"),
            schoolCode: value(school, "school_code"),
            schoolName: value(school, "school_name"),
          }))
          .filter((school) => school.authUserId)}
        alerts={personalAlerts}
        ready={personalAlertsReady}
      />

      <KunchanadaCalendarManager events={calendarEvents} ready={calendarReady} />

      <AdminPanel title="Data" description="">
        <KunchanadaExportButton />
        {schools.length === 0 ? (
          <AdminEmpty>Nothing</AdminEmpty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)]">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-[var(--admin-bg)] text-xs tracking-[0.08em] text-[var(--admin-muted)]">
                <tr>
                  <th scope="col" className="px-[16px] py-[13px] font-bold">
                    school
                  </th>
                  <th scope="col" className="px-[16px] py-[13px] font-bold">
                    coordinator
                  </th>
                  <th scope="col" className="px-[16px] py-[13px] font-bold">
                    MIC
                  </th>
                  <th scope="col" className="px-[16px] py-[13px] font-bold">
                    registration date
                  </th>
                  <th scope="col" className="px-[16px] py-[13px] font-bold">
                    keeyak innawada
                  </th>
                </tr>
              </thead>
              {schools.map((school) => {
                const schoolAuthUserId = value(school, "auth_user_id");
                const schoolContestants = contestants.filter(
                  (contestant) =>
                    value(contestant, "school_auth_user_id") === schoolAuthUserId &&
                    isKunchanadaContestantSlotAllowed(
                      value(contestant, "category"),
                      Number(contestant.slot_number),
                    ),
                );

                return (
                  <tbody
                    key={value(school, "school_code")}
                    className="border-t border-[var(--admin-border)] text-[var(--admin-text)]"
                  >
                    <tr className="align-top">
                      <td className="px-[16px] py-[16px]">
                        <p className="font-bold text-[var(--admin-heading)]">
                          {value(school, "school_name")}
                        </p>
                        <p className="mt-1 text-xs text-[var(--admin-heading)]">
                          {value(school, "school_code")}
                        </p>
                        <p className="mt-1 max-w-[250px] text-xs text-[var(--admin-heading)]">
                          {value(school, "school_address") || "No address"}
                        </p>
                        {schoolAuthUserId && <KunchanadaExportButton school={schoolAuthUserId} />}
                      </td>
                      <td className="px-[16px] py-[16px]">
                        <p className="font-semibold text-[var(--admin-heading)]">
                          {value(school, "coordinator_name")}
                        </p>
                        <a
                          className="mt-1 block text-xs text-[var(--admin-heading)] underline"
                          href={`mailto:${value(school, "coordinator_email")}`}
                        >
                          {value(school, "coordinator_email") || "No email"}
                        </a>
                        <a
                          className="mt-1 block text-xs text-[var(--admin-heading)] underline"
                          href={`tel:${value(school, "coordinator_phone")}`}
                        >
                          {value(school, "coordinator_phone") || "No phone"}
                        </a>
                      </td>
                      <td className="px-[16px] py-[16px]">
                        <p className="font-semibold text-[var(--admin-heading)]">
                          {value(school, "mic_name") || "Not provided"}
                        </p>
                        <a
                          className="mt-1 block text-xs text-[var(--admin-heading)] underline"
                          href={`tel:${value(school, "mic_phone")}`}
                        >
                          {value(school, "mic_phone") || "No phone"}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-[16px] py-[16px] text-xs text-[var(--admin-muted)]">
                        {readableDate(school.created_at)}
                      </td>
                      <td className="px-[16px] py-[16px]">
                        <Badge type="color" color="brand" size="sm">
                          {schoolContestants.length} / {KUNCHANADA_CONTESTANT_LIMIT}
                        </Badge>
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={5}
                        className="border-t border-[var(--admin-border)] bg-[var(--admin-bg)] px-[16px] py-[12px]"
                      >
                        <details>
                          <summary className="cursor-pointer text-xs font-bold tracking-[0.08em] text-[var(--admin-accent)]">
                            Contestants
                          </summary>
                          <div className="mt-[14px] overflow-x-auto rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)]">
                            {schoolContestants.length === 0 ? (
                              <p className="px-[14px] py-[18px] text-sm text-[var(--admin-muted)]">
                                no registraions
                              </p>
                            ) : (
                              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                                <thead className="text-xs tracking-[0.08em] text-[var(--admin-muted)]">
                                  <tr>
                                    <th scope="col" className="px-[14px] py-[11px] font-bold">
                                      name
                                    </th>
                                    <th scope="col" className="px-[14px] py-[11px] font-bold">
                                      category
                                    </th>
                                    <th scope="col" className="px-[14px] py-[11px] font-bold">
                                      sub
                                    </th>
                                    <th scope="col" className="px-[14px] py-[11px] font-bold">
                                      DOB
                                    </th>
                                    <th scope="col" className="px-[14px] py-[11px] font-bold">
                                      Contact Number
                                    </th>
                                    <th scope="col" className="px-[14px] py-[11px] font-bold">
                                      short film
                                    </th>
                                    <th scope="col" className="px-[14px] py-[11px] font-bold">
                                      date
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {schoolContestants.map((contestant) => (
                                    <tr
                                      key={value(contestant, "id")}
                                      className="border-t border-[var(--admin-border)]"
                                    >
                                      <td className="px-[14px] py-[12px] font-semibold text-[var(--admin-heading)]">
                                        {value(contestant, "contestant_name")}
                                      </td>
                                      <td className="px-[14px] py-[12px]">
                                        {contestantCategoryLabel(value(contestant, "category"))}
                                      </td>
                                      <td className="px-[14px] py-[12px]">
                                        {contestantSubcategoryLabel(
                                          value(contestant, "category"),
                                          value(contestant, "subcategory"),
                                        )}
                                      </td>
                                      <td className="whitespace-nowrap px-[14px] py-[12px]">
                                        {readableDate(contestant.date_of_birth)}
                                      </td>
                                      <td className="px-[14px] py-[12px]">
                                        {value(contestant, "contact_number") || "—"}
                                      </td>
                                      <td className="px-[14px] py-[12px]">
                                        {value(contestant, "short_film_link") ? (
                                          <a
                                            href={value(contestant, "short_film_link")}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-semibold text-[var(--admin-accent)] hover:underline"
                                          >
                                            view film
                                          </a>
                                        ) : (
                                          <span className="text-[var(--admin-muted)]">—</span>
                                        )}
                                      </td>
                                      <td className="whitespace-nowrap px-[14px] py-[12px]">
                                        {readableDate(contestant.created_at)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </details>
                      </td>
                    </tr>
                  </tbody>
                );
              })}
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
