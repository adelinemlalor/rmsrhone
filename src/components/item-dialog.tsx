import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAddComment,
  useComments,
  useDeleteAgendaItem,
  useDeleteLink,
  useDeleteDocument,
  useDocuments,
  useUploadDocument,
  documentUrl,
  useItemLinks,
  useSaveAgendaItem,
  useSaveLink,
  useImageUrl,
  normalizeImageUrl,
  uploadItemPhoto,

} from "@/lib/data";
import {
  STATUSES,
  type AgendaItem,
  type Traveler,
} from "@/lib/travel";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ConfirmDelete } from "@/components/confirm-dialog";

const field =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[14px] outline-none focus:border-brand";
const label = "mb-1 block text-[11px] font-bold tracking-wide text-ink/45 uppercase";

export type ItemDraft = Partial<AgendaItem> & { id?: string };

const SECTIONS = ["Details", "Notes"] as const;

export function ItemDialog({
  tripId,
  travelers,
  draft,
  currency,
  authorName,
  authorId,
  onClose,
  onDeleted,
}: {
  tripId: string;
  travelers: Traveler[];
  draft: ItemDraft | null;
  currency: string;
  authorName: string;
  authorId: string | null;
  onClose: () => void;
  /** Called after the plan is deleted (e.g. to leave its detail page). */
  onDeleted?: () => void;
}) {
  const save = useSaveAgendaItem(tripId);
  const remove = useDeleteAgendaItem(tripId);
  const [tab, setTab] = useState<(typeof SECTIONS)[number]>("Details");
  const [form, setForm] = useState<ItemDraft>({});
  const itemId = draft?.id ?? null;
  const { data: links } = useItemLinks(tripId, itemId);
  const { data: comments } = useComments(itemId);
  const addComment = useAddComment(tripId, itemId ?? "");
  const saveLink = useSaveLink();
  const { data: docs } = useDocuments(tripId);
  const uploadDoc = useUploadDocument(tripId);
  const removeDoc = useDeleteDocument(tripId);
  const itemDocs = itemId ? (docs ?? []).filter((d) => d.agenda_item_id === itemId) : [];
  const deleteLink = useDeleteLink(itemId ?? "");
  const [commentText, setCommentText] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [timeMode, setTimeMode] = useState<"times" | "duration">("times");
  const [pendingLinks, setPendingLinks] = useState<{ label: string; url: string }[]>([]);
  const [pendingDocs, setPendingDocs] = useState<{ name: string; file: File }[]>([]);
  const photoPreview = useImageUrl(form.image_url);

  useEffect(() => {
    if (draft) {
      setForm({ ...draft });
      setTab("Details");
      setPendingLinks([]);
      setPendingDocs([]);
      setTimeMode(
        typeof draft.details?.["duration_minutes"] === "number" ? "duration" : "times",
      );
    }
  }, [draft]);

  if (!draft) return null;

  const set = <K extends keyof AgendaItem>(key: K, value: AgendaItem[K] | null) =>
    setForm((f) => ({ ...f, [key]: value }));

  const durationMinutes =
    typeof form.details?.["duration_minutes"] === "number"
      ? (form.details["duration_minutes"] as number)
      : null;

  const setDuration = (mins: number | null) =>
    setForm((f) => ({
      ...f,
      details: { ...(f.details ?? {}), duration_minutes: mins },
    }));

  const toggleName = (key: "participants" | "split_between", name: string) => {
    const current = (form[key] as string[] | undefined) ?? [];
    set(
      key,
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
    );
  };

  async function submit() {
    if (!form.title?.trim()) {
      toast.error("Give this plan a title");
      return;
    }
    try {
      const details = { ...(form.details ?? {}) };
      let endTime = form.end_time ?? null;
      if (timeMode === "duration") {
        const mins = durationMinutes;
        if (mins && form.start_time) {
          const startMins =
            Number(form.start_time.slice(0, 2)) * 60 + Number(form.start_time.slice(3, 5));
          const endMins = (startMins + mins) % 1440;
          endTime = `${String(Math.floor(endMins / 60)).padStart(2, "0")}:${String(
            endMins % 60,
          ).padStart(2, "0")}`;
        } else {
          endTime = null;
        }
        details["duration_minutes"] = mins ?? undefined;
      } else {
        delete details["duration_minutes"];
      }
      const saved = await save.mutateAsync({
        ...form,
        end_time: endTime,
        details,
        title: form.title.trim(),
        category: form.category ?? "Activity",
        status: form.status ?? "Idea",
        currency: form.currency ?? currency,
      });
      if (!form.id && saved?.id) {
        for (const l of pendingLinks) {
          try {
            await saveLink.mutateAsync({
              trip_id: tripId,
              label: l.label,
              url: l.url,
              agenda_item_id: saved.id,
            });
          } catch {
            toast.error(`Link "${l.label}" could not be attached`);
          }
        }
        for (const d of pendingDocs) {
          try {
            await uploadDoc.mutateAsync({
              file: d.file,
              category: "Other",
              agendaItemId: saved.id,
              uploadedBy: authorId,
            });
          } catch {
            toast.error(`File "${d.name}" could not be attached`);
          }
        }
      }
      toast.success(form.id ? "Plan updated" : "Plan added");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-y-auto rounded-[26px] border-border bg-cream p-0 sm:max-w-[680px]">
        <DialogHeader className="border-b border-border px-6 pt-6 pb-4">
          <DialogTitle className="font-display text-[22px] font-extrabold tracking-tight">
            {form.id ? "Edit plan" : "Add a plan"}
          </DialogTitle>
          {form.id ? (
            <Link
              to="/trips/$tripId/plans/$planId"
              params={{ tripId, planId: form.id }}
              onClick={onClose}
              className="w-fit text-[12px] font-bold text-brand"
            >
              Open full page →
            </Link>
          ) : null}
        </DialogHeader>

        <div className="flex flex-wrap gap-2 border-b border-border px-6 py-3">
          {SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTab(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-bold",
                tab === s ? "bg-ink text-cream" : "text-ink/50 hover:text-ink",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-4 px-6 py-5">
          {tab === "Details" ? (
            <>
              <div>
                <label className={label} htmlFor="i-title">
                  Title
                </label>
                <input
                  id="i-title"
                  value={form.title ?? ""}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Dinner at Aprazível"
                  className={field}
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className={cn(label, "mb-0")}>Timing</span>
                  <div className="flex gap-1 rounded-full border border-border bg-white/60 p-0.5">
                    {(
                      [
                        ["times", "Start & end"],
                        ["duration", "Total time"],
                      ] as const
                    ).map(([mode, text]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTimeMode(mode)}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-bold",
                          timeMode === mode ? "bg-ink text-cream" : "text-ink/50",
                        )}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={label} htmlFor="i-date">
                      Date
                    </label>
                    <input
                      id="i-date"
                      type="date"
                      value={form.day_date ?? ""}
                      onChange={(e) => set("day_date", e.target.value || null)}
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor="i-start">
                      Start
                    </label>
                    <input
                      id="i-start"
                      type="time"
                      value={(form.start_time ?? "").slice(0, 5)}
                      onChange={(e) => set("start_time", e.target.value || null)}
                      className={field}
                    />
                  </div>
                  {timeMode === "times" ? (
                    <div>
                      <label className={label} htmlFor="i-end">
                        End
                      </label>
                      <input
                        id="i-end"
                        type="time"
                        value={(form.end_time ?? "").slice(0, 5)}
                        onChange={(e) => set("end_time", e.target.value || null)}
                        className={field}
                      />
                    </div>
                  ) : (
                    <div>
                      <span className={label}>Duration</span>
                      <div className="flex items-center gap-2">
                        <input
                          aria-label="Hours"
                          type="number"
                          min={0}
                          max={48}
                          placeholder="0"
                          value={durationMinutes ? Math.floor(durationMinutes / 60) : ""}
                          onChange={(e) => {
                            const h = e.target.value === "" ? 0 : Number(e.target.value);
                            const m = (durationMinutes ?? 0) % 60;
                            setDuration(h + m > 0 ? h * 60 + m : null);
                          }}
                          className={field}
                        />
                        <span className="text-[12px] font-bold text-ink/45">hr</span>
                        <input
                          aria-label="Minutes"
                          type="number"
                          min={0}
                          max={59}
                          step={5}
                          placeholder="0"
                          value={durationMinutes ? durationMinutes % 60 : ""}
                          onChange={(e) => {
                            const m = e.target.value === "" ? 0 : Number(e.target.value);
                            const h = Math.floor((durationMinutes ?? 0) / 60);
                            setDuration(h + m > 0 ? h * 60 + m : null);
                          }}
                          className={field}
                        />
                        <span className="text-[12px] font-bold text-ink/45">min</span>
                      </div>
                    </div>
                  )}
                </div>
                {timeMode === "duration" ? (
                  <p className="mt-1.5 text-[11px] text-ink/40">
                    No exact end time needed — if you set a start, we'll work out the end from
                    the duration.
                  </p>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="i-loc">
                    Location
                  </label>
                  <input
                    id="i-loc"
                    value={form.location_name ?? ""}
                    onChange={(e) => set("location_name", e.target.value || null)}
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="i-addr">
                    Address
                  </label>
                  <input
                    id="i-addr"
                    value={form.address ?? ""}
                    onChange={(e) => set("address", e.target.value || null)}
                    className={field}
                  />
                </div>
              </div>
              <div>
                <span className={label}>Photo</span>
                <div className="flex flex-wrap items-center gap-3">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt=""
                      className="size-20 rounded-xl border border-border object-cover"
                    />
                  ) : (
                    <div className="grid size-20 place-items-center rounded-xl border border-dashed border-border text-[11px] text-ink/35">
                      None
                    </div>
                  )}
                  <div className="min-w-[220px] flex-1 space-y-2">
                    <input
                      value={form.image_url?.startsWith("storage:") ? "" : (form.image_url ?? "")}
                      onChange={(e) => set("image_url", e.target.value || null)}
                      onBlur={(e) => set("image_url", normalizeImageUrl(e.target.value))}
                      placeholder="Paste a direct image link (ends in .jpg/.png) or upload"
                      className={field}
                      disabled={uploading}
                    />
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      A Google search or article link won't display — right-click the image
                      itself and choose “Copy image address”, or upload a file below.
                    </p>

                    <div className="flex items-center gap-3 text-[12px] font-bold">
                      <label className="cursor-pointer text-brand">
                        {uploading ? "Uploading…" : "Upload photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploading(true);
                            try {
                              set("image_url", await uploadItemPhoto(tripId, file));
                            } catch (err) {
                              toast.error(
                                err instanceof Error ? err.message : "Upload failed",
                              );
                            } finally {
                              setUploading(false);
                            }
                          }}
                        />
                      </label>
                      {form.image_url ? (
                        <button
                          type="button"
                          onClick={() => set("image_url", null)}
                          className="text-ink/45"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className={label} htmlFor="i-desc">
                  Description
                </label>
                <textarea
                  id="i-desc"
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(e) => set("description", e.target.value || null)}
                  className={field}
                />
              </div>
            </>
          ) : null}

          {tab === "Details" ? (
            <>
              <div>
                <span className={label}>Status</span>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("status", s)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                        form.status === s
                          ? "border-ink bg-ink text-cream"
                          : "border-border bg-white/70 text-ink/55",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="i-conf">
                    Confirmation number
                  </label>
                  <input
                    id="i-conf"
                    value={form.confirmation_number ?? ""}
                    onChange={(e) => set("confirmation_number", e.target.value || null)}
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="i-provider">
                    Booked through
                  </label>
                  <input
                    id="i-provider"
                    value={form.booking_provider ?? ""}
                    onChange={(e) => set("booking_provider", e.target.value || null)}
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="i-resname">
                    Reservation name
                  </label>
                  <input
                    id="i-resname"
                    value={form.reservation_name ?? ""}
                    onChange={(e) => set("reservation_name", e.target.value || null)}
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="i-phone">
                    Contact phone
                  </label>
                  <input
                    id="i-phone"
                    value={form.contact_phone ?? ""}
                    onChange={(e) => set("contact_phone", e.target.value || null)}
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="i-cancel">
                    Cancellation deadline
                  </label>
                  <input
                    id="i-cancel"
                    type="date"
                    value={(form.cancellation_deadline ?? "").slice(0, 10)}
                    onChange={(e) => set("cancellation_deadline", e.target.value || null)}
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="i-url">
                    Booking URL
                  </label>
                  <input
                    id="i-url"
                    value={form.booking_url ?? ""}
                    onChange={(e) => set("booking_url", e.target.value || null)}
                    className={field}
                  />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="i-policy">
                  Cancellation policy
                </label>
                <textarea
                  id="i-policy"
                  rows={2}
                  value={form.cancellation_policy ?? ""}
                  onChange={(e) => set("cancellation_policy", e.target.value || null)}
                  className={field}
                />
              </div>

            </>
          ) : null}

          {tab === "Details" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="i-est">
                  Estimated cost
                </label>
                <input
                  id="i-est"
                  type="number"
                  step="0.01"
                  value={form.cost_estimated ?? ""}
                  onChange={(e) =>
                    set("cost_estimated", e.target.value ? Number(e.target.value) : null)
                  }
                  className={field}
                />
              </div>
              <div>
                <label className={label} htmlFor="i-act">
                  Actual cost
                </label>
                <input
                  id="i-act"
                  type="number"
                  step="0.01"
                  value={form.cost_actual ?? ""}
                  onChange={(e) =>
                    set("cost_actual", e.target.value ? Number(e.target.value) : null)
                  }
                  className={field}
                />
              </div>
              <div>
                <label className={label} htmlFor="i-paidby">
                  Paid by
                </label>
                <select
                  id="i-paidby"
                  value={form.paid_by ?? ""}
                  onChange={(e) => set("paid_by", e.target.value || null)}
                  className={field}
                >
                  <option value="">—</option>
                  {travelers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-[13px] font-semibold">
                  <input
                    type="checkbox"
                    checked={!!form.paid}
                    onChange={(e) => set("paid", e.target.checked)}
                  />
                  Paid
                </label>
                <label className="flex items-center gap-2 text-[13px] font-semibold">
                  <input
                    type="checkbox"
                    checked={!!form.shared_expense}
                    onChange={(e) => set("shared_expense", e.target.checked)}
                  />
                  Shared expense
                </label>
              </div>
              <div className="sm:col-span-2">
                <span className={label}>Split between</span>
                <div className="flex flex-wrap gap-1.5">
                  {travelers.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleName("split_between", t.name)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                        (form.split_between ?? []).includes(t.name)
                          ? "border-ink bg-ink text-cream"
                          : "border-border bg-white/70 text-ink/55",
                      )}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {tab === "Details" ? (
            <div>
              <span className={label}>Who's going</span>
              <div className="flex flex-wrap gap-1.5">
                {travelers.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleName("participants", t.name)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12px] font-bold",
                      (form.participants ?? []).includes(t.name)
                        ? "border-ink bg-ink text-cream"
                        : "border-border bg-white/70 text-ink/55",
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {itemId ? (
                <div className="mt-6">
                  <span className={label}>Comments</span>
                  <ul className="space-y-2">
                    {(comments ?? []).map((c) => (
                      <li key={c.id} className="rounded-2xl bg-white/70 px-4 py-3">
                        <p className="text-[12px] font-bold text-ink/50">{c.author_name}</p>
                        <p className="text-[13px]">{c.body}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment…"
                      className={field}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!commentText.trim()) return;
                        addComment.mutate(
                          { body: commentText.trim(), author_name: authorName, author_id: authorId },
                          { onSuccess: () => setCommentText("") },
                        );
                      }}
                      className="rounded-full bg-ink px-4 py-2 text-[12px] font-bold text-cream"
                    >
                      Post
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === "Notes" ? (
            <div className="space-y-4">
              <div>
                <label className={label} htmlFor="i-notes">
                  Notes
                </label>
                <textarea
                  id="i-notes"
                  rows={8}
                  value={form.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value || null)}
                  className={field}
                />
              </div>

              <div className="rounded-2xl border border-border bg-white/60 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={label}>Links</p>
                  {!itemId ? (
                    <p className="text-[11px] text-ink/40">Attached when you save this plan</p>
                  ) : null}
                </div>
                <ul className="space-y-1.5">
                  {(links ?? []).map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3">
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-[13px] font-semibold text-brand underline"
                      >
                        {l.label}
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteLink.mutate(l.id)}
                        className="text-[12px] font-bold text-ink/40"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                  {pendingLinks.map((l, i) => (
                    <li key={`pending-${i}`} className="flex items-center justify-between gap-3">
                      <span className="truncate text-[13px] font-semibold text-brand underline">
                        {l.label}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingLinks((list) => list.filter((_, j) => j !== i))
                        }
                        className="text-[12px] font-bold text-ink/40"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                  {(links ?? []).length === 0 && pendingLinks.length === 0 ? (
                    <li className="text-[13px] text-ink/45">
                      No links yet — add one below.
                    </li>
                  ) : null}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    placeholder="Label"
                    className={cn(field, "max-w-[150px]")}
                  />
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://…"
                    className={cn(field, "max-w-[240px]")}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!linkLabel.trim() || !linkUrl.trim()) return;
                      if (!itemId) {
                        setPendingLinks((list) => [
                          ...list,
                          { label: linkLabel.trim(), url: linkUrl.trim() },
                        ]);
                        setLinkLabel("");
                        setLinkUrl("");
                        return;
                      }
                      saveLink.mutate(
                        {
                          trip_id: tripId,
                          label: linkLabel.trim(),
                          url: linkUrl.trim(),
                          agenda_item_id: itemId,
                        },
                        {
                          onSuccess: () => {
                            setLinkLabel("");
                            setLinkUrl("");
                          },
                        },
                      );
                    }}
                    className="rounded-full bg-ink px-4 py-2 text-[12px] font-bold text-cream"
                  >
                    Add link
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white/60 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className={label}>Documents</p>
                  {!itemId ? (
                    <p className="text-[11px] text-ink/40">Attached when you save this plan</p>
                  ) : null}
                </div>
                {itemDocs.length === 0 && pendingDocs.length === 0 ? (
                  <p className="text-[13px] text-ink/45">
                    No files yet — attach a ticket, voucher or confirmation.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {itemDocs.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={async () => {
                            const url =
                              d.external_url ??
                              (d.file_path ? await documentUrl(d.file_path) : null);
                            if (url) window.open(url, "_blank", "noopener");
                            else toast.error("File unavailable");
                          }}
                          className="truncate text-left text-[13px] font-semibold text-brand underline"
                        >
                          {d.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDoc.mutate(d)}
                          className="shrink-0 text-[12px] font-bold text-ink/40"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                    {pendingDocs.map((d, i) => (
                      <li key={`pending-doc-${i}`} className="flex items-center justify-between gap-3">
                        <span className="truncate text-[13px] font-semibold text-brand underline">
                          {d.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingDocs((list) => list.filter((_, j) => j !== i))
                          }
                          className="shrink-0 text-[12px] font-bold text-ink/40"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <label className="mt-3 block cursor-pointer rounded-xl border border-dashed border-ink/20 bg-cream/60 px-4 py-4 text-center text-[13px] font-semibold text-ink/50">
                  {uploadDoc.isPending ? "Uploading…" : "Upload a document"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      if (!itemId) {
                        setPendingDocs((list) => [...list, { name: file.name, file }]);
                        return;
                      }
                      void (async () => {
                        try {
                          await uploadDoc.mutateAsync({
                            file,
                            category: "Other",
                            agendaItemId: itemId,
                            uploadedBy: authorId,
                          });
                          toast.success("Uploaded");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Upload failed");
                        }
                      })();
                    }}
                  />
                </label>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          {form.id ? (
            <ConfirmDelete
              title="Delete this plan?"
              description={`"${form.title ?? "This plan"}" will be permanently removed from the trip. This can't be undone.`}
              onConfirm={async () => {
                await remove.mutateAsync(form.id!);
                toast.success("Plan deleted");
                onClose();
                onDeleted?.();
              }}
            >
              <button type="button" className="text-[13px] font-bold text-destructive">
                Delete
              </button>
            </ConfirmDelete>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2.5 text-[13px] font-bold text-ink/60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={save.isPending}
              className="rounded-full bg-brand px-5 py-2.5 text-[13px] font-bold text-cream disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : "Save plan"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
