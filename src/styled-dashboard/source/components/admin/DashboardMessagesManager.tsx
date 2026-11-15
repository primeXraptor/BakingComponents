"use client";
import {AdminPanel,AdminDetails,AdminEmpty,AdminSaveButton,AdminSelect,AdminTextarea} from './AdminFormUI';
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

export function MessagesManager({ messages }: { messages: Row[] }) {
  const {updateContactSubmission}=useAdminActions();
  return (
    <AdminPanel title="">
      <div className="space-y-[10px]">
        {messages.length === 0 && <AdminEmpty>mokuth nA</AdminEmpty>}
        {messages.map((message) => {
          const isSchoolConversation = Boolean(
            value(message, "kunchanada_school_auth_user_id") ||
              value(message, "kunchanada_judge_user_id"),
          );

          return (
            <AdminDetails
              key={value(message, "id")}
              title={value(message, "subject")}
              meta={`${value(message, "name")} · ${value(message, "email")} · ${readableDate(message.created_at)}`}
              badge={value(message, "status")}
            >
              <div className="rounded-xl bg-[var(--admin-panel)] p-[16px] text-sm leading-[24px] text-[var(--admin-text)] whitespace-pre-wrap">
                {value(message, "message")}
              </div>
              <form action={updateContactSubmission} className="mt-[18px] space-y-[16px]">
                <input type="hidden" name="id" value={value(message, "id")} />
                <AdminSelect
                  label="status"
                  name="status"
                  defaultValue={value(message, "status") || "new"}
                >
                  <option value="new">new</option>
                  <option value="read">baluwa</option>
                  <option value="replied">replied</option>
                  <option value="archived">del</option>
                </AdminSelect>
                <AdminTextarea
                  label={isSchoolConversation ? "Reply to sender" : "Admin notes"}
                  name="admin_notes"
                  defaultValue={value(message, "admin_notes")}
                  placeholder={
                    isSchoolConversation
                      ? "Write the Media Unit reply shown in the sender’s dashboard..."
                      : "Add an internal note..."
                  }
                  hint={
                    isSchoolConversation
                      ? "Saving a reply automatically marks this message as replied. Editing and saving it updates the reply in the sender’s chat."
                      : undefined
                  }
                />
                <AdminSaveButton>
                  {isSchoolConversation ? "Update conversation" : "Update message"}
                </AdminSaveButton>
              </form>
            </AdminDetails>
          );
        })}
      </div>
    </AdminPanel>
  );
}
