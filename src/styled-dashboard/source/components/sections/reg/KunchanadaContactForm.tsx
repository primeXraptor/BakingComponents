"use client";
import { useDashboardRuntime } from "../../../../runtime/context";

import {
  type FormEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, MessageChatCircle, Send01 } from "@untitledui/icons";
import { LoaderCircle, MessageSquare, Paperclip, Send, Smile } from "lucide-react";
import { Button as AriaButton, Dialog, DialogTrigger, Popover } from "react-aria-components";
import {
  composeKunchanadaMessage,
  matchingQuickResponses,
  mentionQueryAtCaret,
  type QuickResponseMention,
} from "../../../lib/kunchanada-dashboard";
import { MentionText } from "./KunchanadaQuickResponses";
import styles from "./KunchanadaMessageComposer.module.css";

const MESSAGE_EMOJIS = [
  ["😊", "Smile"],
  ["😄", "Laugh"],
  ["👍", "Thumbs up"],
  ["🙏", "Thank you"],
  ["❤️", "Heart"],
  ["🎉", "Celebrate"],
  ["👏", "Clap"],
  ["✅", "Check mark"],
  ["👋", "Wave"],
  ["🙂", "Friendly smile"],
  ["❓", "Question"],
  ["📷", "Camera"],
  ["🎤", "Microphone"],
  ["📅", "Calendar"],
  ["⭐", "Star"],
] as const;

interface ChatMessage {
  id: string;
  message: string;
  status: string;
  createdAt: string;
  adminReply: string | null;
  repliedAt: string | null;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Colombo",
});

function formatMessageDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

function sortMessages(messages: ChatMessage[]) {
  return [...messages].sort(
    (first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
  );
}

function MessageTimelineEntry({
  sender,
  sentAt,
  content,
  isReply = false,
  connectToReply = false,
}: {
  sender: string;
  sentAt: string | null;
  content: string;
  isReply?: boolean;
  connectToReply?: boolean;
}) {
  const Icon = isReply ? MessageSquare : Send01;

  return (
    <div
      className={`relative flex gap-[16px] ${connectToReply ? "before:absolute before:bottom-[-20px] before:left-[15px] before:top-[32px] before:w-px before:bg-slate-200 dark:before:bg-slate-700" : ""}`}
    >
      <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#168bff] dark:text-sky-400">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold leading-5 text-slate-950 dark:text-slate-100">{sender}</p>
        <time
          dateTime={sentAt ?? undefined}
          className="mt-1 block text-xs leading-4 text-slate-400 dark:text-slate-400"
        >
          {formatMessageDate(sentAt)}
        </time>
        <div className="mt-2 w-fit min-w-[min(10rem,100%)] max-w-full rounded-[14px] bg-[#f4f4f6] dark:bg-slate-800 px-4 py-3 text-[13px] leading-6 text-slate-950 dark:text-slate-100">
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            <MentionText text={content} />
          </p>
        </div>
      </div>
    </div>
  );
}

function syncMessageHighlight(input: HTMLTextAreaElement | null, highlight: HTMLDivElement | null) {
  if (!input || !highlight) return;
  highlight.style.width = `${input.clientWidth}px`;
  highlight.scrollTop = input.scrollTop;
  highlight.scrollLeft = input.scrollLeft;
}

export function KunchanadaContactForm({
  coordinatorEmail,
  coordinatorName,
  inputRef,
  draft: message,
  onDraftChange: setMessage,
  onMention,
  focusRequest,
  endpoint = "/api/kunchanada/contact",
}: {
  endpoint?: "/api/kunchanada/contact" | "/api/judge/messages";
  coordinatorEmail: string | null;
  coordinatorName: string;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  draft: string;
  onDraftChange: (message: string) => void;
  onMention: (mention: QuickResponseMention, start?: number, end?: number) => void;
  focusRequest?: { caret: number } | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const {request: fetch} = useDashboardRuntime();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(coordinatorEmail));
  const [isSending, setIsSending] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLTextAreaElement>(null);
  const messageInputRef = inputRef ?? internalInputRef;
  const highlightRef = useRef<HTMLDivElement>(null);
  const [caret, setCaret] = useState(0);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [dismissedMention, setDismissedMention] = useState<string | null>(null);
  const mentionQuery = mentionQueryAtCaret(message, caret);
  const mentionOptions = mentionQuery ? matchingQuickResponses(mentionQuery.query) : [];
  const mentionKey = `${caret}:${message}`;
  const showMentions = !isSending && mentionOptions.length > 0 && dismissedMention !== mentionKey;
  const activeMentionIndex = Math.min(mentionIndex, mentionOptions.length - 1);

  function chooseMention(mention: QuickResponseMention) {
    if (!mentionQuery) return;
    onMention(mention, mentionQuery.start, caret);
    setDismissedMention(mentionKey);
  }

  // Focus after the search overlay has released its focus scope.
  useEffect(() => {
    const input = messageInputRef.current;
    if (!input || !focusRequest) return;
    input.focus({ preventScroll: true });
    input.setSelectionRange(focusRequest.caret, focusRequest.caret);
  }, [focusRequest, messageInputRef]);

  const loadMessages = useCallback(async () => {
    if (!coordinatorEmail) return;

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
      });
      const result = (await response.json()) as { messages?: ChatMessage[]; error?: string };

      if (!response.ok || !result.messages) {
        throw new Error(result.error || "Your messages could not be loaded.");
      }

      setMessages(sortMessages(result.messages));
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Your messages could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [coordinatorEmail, endpoint, fetch]);

  useEffect(() => {
    if (!coordinatorEmail) return;

    const initialLoad = window.setTimeout(() => void loadMessages(), 0);
    const interval = window.setInterval(() => void loadMessages(), 10_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadMessages();
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshWhenVisible);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshWhenVisible);
    };
  }, [coordinatorEmail, loadMessages]);

  const conversationSignature = useMemo(
    () =>
      messages
        .map((item) => `${item.id}:${item.adminReply ?? ""}:${item.repliedAt ?? ""}`)
        .join("|"),
    [messages],
  );

  useEffect(() => {
    if (!conversationSignature) return;
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [conversationSignature]);

  useLayoutEffect(() => {
    const input = messageInputRef.current;
    if (!input) return;
    let width = input.clientWidth;
    const resize = () => {
      const scrollTop = input.scrollTop;
      input.style.height = "50px";
      input.style.height = `${Math.max(50, input.scrollHeight)}px`;
      input.scrollTop = scrollTop;
      syncMessageHighlight(input, highlightRef.current);
    };
    resize();
    const observer = new ResizeObserver(() => {
      if (width !== input.clientWidth) {
        width = input.clientWidth;
        resize();
      } else syncMessageHighlight(input, highlightRef.current);
    });
    observer.observe(input);
    return () => observer.disconnect();
  }, [message, messageInputRef]);

  function insertEmoji(emoji: string) {
    const input = messageInputRef.current;
    const start = input?.selectionStart ?? message.length;
    const end = input?.selectionEnd ?? start;
    const nextMessage = message.slice(0, start) + emoji + message.slice(end);
    if (nextMessage.length > 5000) return;
    setMessage(nextMessage);
    setEmojiPickerOpen(false);
    requestAnimationFrame(() => {
      messageInputRef.current?.focus({ preventScroll: true });
      messageInputRef.current?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let trimmedMessage: string;
    try {
      trimmedMessage = composeKunchanadaMessage(message);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Enter a message.");
      return;
    }

    setError(null);
    setIsSending(true);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: ChatMessage;
        error?: string;
      };

      if (!response.ok || !result.success || !result.message) {
        throw new Error(result.error || "Your message could not be sent.");
      }

      setMessages((current) =>
        sortMessages([
          ...current.filter((item) => item.id !== result.message?.id),
          result.message as ChatMessage,
        ]),
      );
      setMessage("");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Your message could not be sent.",
      );
    } finally {
      setIsSending(false);
    }
  }

  if (!coordinatorEmail) {
    return (
      <section>
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-[var(--auth-danger-border)] bg-[var(--auth-danger-background)] p-4 text-sm leading-6 text-[var(--auth-danger-text)]"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          E-Mail error. Contact an administrator.
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 max-h-full flex-col overflow-hidden rounded-2xl border border-[var(--auth-border)]">
      <div
        aria-live="polite"
        aria-busy={isLoading}
        aria-label="Conversation with the Media Unit"
        data-lenis-prevent
        className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-6 sm:px-7"
      >
        {isLoading ? (
          <p className="flex min-h-56 items-center justify-center text-sm text-[var(--auth-muted)]">
            Loading...
          </p>
        ) : messages.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
            <MessageChatCircle className="size-8 text-[var(--auth-muted)]" aria-hidden="true" />
            <p className="mt-3 font-semibold text-[var(--auth-text)]">Start a conversation</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-[var(--auth-muted)]">
              No messages sent yet.
            </p>
          </div>
        ) : (
          <div className="space-y-[36px]">
            {messages.map((item) => (
              <div key={item.id} className="space-y-[20px]">
                <MessageTimelineEntry
                  sender={coordinatorName}
                  sentAt={item.createdAt}
                  content={item.message}
                  connectToReply={Boolean(item.adminReply)}
                />
                {item.adminReply ? (
                  <MessageTimelineEntry
                    sender="Reply from the Maliyadeva Media Unit"
                    sentAt={item.repliedAt}
                    content={item.adminReply}
                    isReply
                  />
                ) : (
                  <p className="pl-[48px] text-[11px] text-slate-400 dark:text-slate-400">
                    Awaiting reply
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={conversationEndRef} />
      </div>

      <Popover
        isOpen={showMentions}
        onOpenChange={(open) => {
          if (!open) setDismissedMention(mentionKey);
        }}
        triggerRef={messageInputRef}
        isNonModal
        placement="top start"
        offset={8}
        className={styles.mentionPopover}
      >
        <div id="message-mention-suggestions" role="listbox" aria-label="Mention suggestions">
          {mentionOptions.map((mention, index) => (
            <div
              key={mention}
              id={`message-mention-${index}`}
              role="option"
              aria-selected={index === activeMentionIndex}
              className={styles.mentionOption}
              onMouseDown={(event) => event.preventDefault()}
              onPointerMove={() => setMentionIndex(index)}
              onClick={() => chooseMention(mention)}
            >
              {mention}
            </div>
          ))}
        </div>
      </Popover>

      <form onSubmit={submitMessage} className={styles.composer} aria-label="Send a message">
        <button
          type="button"
          disabled
          aria-label="Attach a file (unavailable)"
          title="Attachments are not available"
          className={styles.iconButton}
        >
          <Paperclip aria-hidden="true" size={24} strokeWidth={1.75} />
        </button>
        <div className={styles.input}>
          <div className={styles.messageRow}>
            <div className={styles.editor}>
              {/* A zero-width marker preserves the textarea’s final blank line. */}
              <div ref={highlightRef} aria-hidden="true" className={styles.highlight}>
                <MentionText text={message} />
                {"\u200b"}
              </div>
              <textarea
                ref={messageInputRef}
                required
                aria-label="Message"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setCaret(event.target.selectionStart);
                  setMentionIndex(0);
                }}
                onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
                aria-autocomplete="list"
                aria-controls={showMentions ? "message-mention-suggestions" : undefined}
                aria-activedescendant={
                  showMentions ? `message-mention-${activeMentionIndex}` : undefined
                }
                onKeyDown={(event) => {
                  if (!showMentions || event.nativeEvent.isComposing) return;
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    setMentionIndex(
                      (activeMentionIndex +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        mentionOptions.length) %
                        mentionOptions.length,
                    );
                  } else if ((event.key === "Enter" || event.key === "Tab") && !event.shiftKey) {
                    event.preventDefault();
                    chooseMention(mentionOptions[activeMentionIndex]);
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    setDismissedMention(mentionKey);
                  }
                }}
                maxLength={5000}
                placeholder="type or @ to tag"
                disabled={isSending}
                onScroll={() => syncMessageHighlight(messageInputRef.current, highlightRef.current)}
                className={styles.textarea}
              />
            </div>
            <DialogTrigger isOpen={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <AriaButton
                type="button"
                aria-label="Choose an emoji"
                isDisabled={isSending}
                className={styles.emojiButton}
              >
                <Smile aria-hidden="true" size={24} strokeWidth={1.75} />
              </AriaButton>
              <Popover
                data-kunchanada-auth
                data-lenis-prevent
                placement="top end"
                offset={12}
                className={styles.emojiPopover}
              >
                <Dialog aria-label="Choose an emoji" className={styles.emojiGrid}>
                  {MESSAGE_EMOJIS.map(([emoji, label]) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      onClick={() => insertEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </Dialog>
              </Popover>
            </DialogTrigger>
          </div>
        </div>
        <button
          type="submit"
          aria-label={isSending ? "Sending message" : "Send message"}
          aria-busy={isSending}
          disabled={isSending}
          className={styles.iconButton}
        >
          {isSending ? (
            <LoaderCircle aria-hidden="true" size={24} className="motion-safe:animate-spin" />
          ) : (
            <Send aria-hidden="true" size={24} strokeWidth={1.75} />
          )}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="flex items-center gap-2 px-4 pb-4 text-sm font-semibold text-[var(--auth-danger-text)] sm:px-6 sm:pb-6"
        >
          <AlertCircle className="size-3" aria-hidden="true" />
          {error}
        </p>
      )}
    </section>
  );
}
