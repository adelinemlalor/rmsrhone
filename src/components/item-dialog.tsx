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
  useItemLinks,
  useSaveAgendaItem,
  useSaveLink,
  useImageUrl,
  uploadItemPhoto,
} from "@/lib/data";
import {
  CATEGORIES,
  STATUSES,
  TRAVEL_MODES,
  type AgendaItem,
  type Traveler,
} from "@/lib/travel";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[14px] outline-none focus:border-brand";
const label = "mb-1 block text-[11px] font-bold tracking-wide text-ink/45 uppercase";

export type ItemDraft = Partial<AgendaItem> & { id?: string };

const SECTIONS = ["Details", "Booking", "Cost", "People", "Notes"] as const;

export function ItemDialog({
  tripId,
  travelers,
  draft,
  currency,
  authorName,
  authorId,
  onClose,
}: {
  tripId: string;
  travelers: Traveler[];
  draft: ItemDraft | null;
  currency: string;
  authorName: string;
  authorId: string | null;
  onClose: () => void;
}) {
  const save = useSaveAgendaItem(tripId);
  const remove = useDeleteAgendaItem(tripId);
  const [tab, setTab] = useState<(typeof SECTIONS)[number]>("Details");
  const [form, setForm] = useState<ItemDraft>({});
  const itemId = draft?.id ?? null;
  const { data: links } = useItemLinks(tripId, itemId);
  const { data: comments } = useComments(itemId);
  const addComment = useAddComment(tripId, itemId ?? "");
  const saveLink = useSaveLink(itemId ?? "");
  const deleteLink = useDeleteLink(itemId ?? "");
  const [commentText, setCommentText] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const photoPreview = useImageUrl(form.image_url);

  useEffect(() => {
    if (draft) {
      setForm({ ...draft });
      setTab("Details");
    }
  }, [draft]);

  if (!draft) return null;

  const set = <K extends keyof AgendaItem>(key: K, value: AgendaItem[K] | null) =>
    setForm((f) => ({ ...f, [key]: value }));

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
      await save.mutateAsync({
        ...form,
        title: form.title.trim(),
        category: form.category ?? "Activity",
        status: form.status ?? "Idea",
        currency: form.currency ?? currency,
      });
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
                <span className={label}>Category</span>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set("category", c)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                        form.category === c
                          ? "border-ink bg-ink text-cream"
                          : "border-border bg-white/70 text-ink/55",
                      )}
                    >
                      {c}
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
                      placeholder="Paste an image URL"
                      className={field}
                      disabled={uploading}
                    />
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
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={label} htmlFor="i-nextmode">
                    Travel to next
                  </label>
                  <select
                    id="i-nextmode"
                    value={form.travel_next_mode ?? ""}
                    onChange={(e) => set("travel_next_mode", e.target.value || null)}
                    className={field}
                  >
                    <option value="">—</option>
                    {TRAVEL_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label} htmlFor="i-nextmin">
                    Minutes
                  </label>
                  <input
                    id="i-nextmin"
                    type="number"
                    min="0"
                    value={form.travel_next_minutes ?? ""}
                    onChange={(e) =>
                      set("travel_next_minutes", e.target.value ? Number(e.target.value) : null)
                    }
                    className={field}
                  />
                </div>
                <div>
                  <label className={label} htmlFor="i-nextnote">
                    Note
                  </label>
                  <input
                    id="i-nextnote"
                    value={form.travel_next_note ?? ""}
                    onChange={(e) => set("travel_next_note", e.target.value || null)}
                    className={field}
                  />
                </div>
              </div>
            </>
          ) : null}

          {tab === "Booking" ? (
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

              {itemId ? (
                <div className="rounded-2xl border border-border bg-white/60 p-4">
                  <p className={label}>Links</p>
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
                        saveLink.mutate(
                          { trip_id: tripId, label: linkLabel.trim(), url: linkUrl.trim() },
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
              ) : null}
            </>
          ) : null}

          {tab === "Cost" ? (
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

          {tab === "People" ? (
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
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          {form.id ? (
            <button
              type="button"
              onClick={async () => {
                await remove.mutateAsync(form.id!);
                toast.success("Plan removed");
                onClose();
              }}
              className="text-[13px] font-bold text-destructive"
            >
              Delete
            </button>
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
