import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { documentUrl, useDeleteDocument, useDocuments, useUploadDocument } from "@/lib/data";
import { EmptyState, Panel, SectionLabel } from "@/components/bits";
import { DOC_CATEGORIES } from "@/lib/travel";

export const Route = createFileRoute("/_authenticated/trips/$tripId/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Wayfarer" },
      { name: "description", content: "Tickets, passes and confirmations attached to this trip." },
      { property: "og:title", content: "Documents — Wayfarer" },
      {
        property: "og:description",
        content: "Tickets, passes and confirmations attached to this trip.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const { tripId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: docs } = useDocuments(tripId);
  const upload = useUploadDocument(tripId);
  const remove = useDeleteDocument(tripId);
  const [category, setCategory] = useState(DOC_CATEGORIES[0] ?? "Other");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div>
        {(docs ?? []).length === 0 ? (
          <EmptyState
            title="No documents yet"
            description="Upload boarding passes, hotel confirmations and tickets so they're with you offline."
          />
        ) : (
          <ul className="space-y-3">
            {(docs ?? []).map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-[22px] border border-border bg-white/70 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-[0.14em] text-ink/40 uppercase">
                    {d.category}
                  </p>
                  <p className="truncate font-display text-[15px] font-bold">{d.name}</p>
                </div>
                <div className="flex shrink-0 gap-3 text-[12px] font-bold">
                  <button
                    type="button"
                    onClick={async () => {
                      const url = d.external_url ?? (d.file_path ? await documentUrl(d.file_path) : null);
                      if (url) window.open(url, "_blank", "noopener");
                      else toast.error("File unavailable");
                    }}
                    className="text-brand"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => remove.mutate(d)}
                    className="text-ink/40"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Panel className="h-fit">
        <SectionLabel>Upload</SectionLabel>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-[14px]"
        >
          {DOC_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="mt-3 block cursor-pointer rounded-2xl border border-dashed border-ink/20 bg-cream/60 px-4 py-8 text-center text-[13px] font-semibold text-ink/50">
          {upload.isPending ? "Uploading…" : "Choose a file"}
          <input
            type="file"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                await upload.mutateAsync({
                  file,
                  category,
                  agendaItemId: null,
                  uploadedBy: user.id,
                });
                toast.success("Uploaded");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Upload failed");
              }
              e.target.value = "";
            }}
          />
        </label>
      </Panel>
    </div>
  );
}
