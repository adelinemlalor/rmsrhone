import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  AgendaItem,
  ChecklistItem,
  Comment,
  ItemLink,
  SavedPlace,
  Traveler,
  Trip,
  TripDocument,
} from "./travel";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function unwrap<T>(promise: PromiseLike<{ data: unknown; error: unknown }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw error as Error;
  return data as T;
}

export function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: () =>
      unwrap<Trip[]>(
        supabase.from("trips").select("*").order("start_date", { ascending: true }) as any,
      ),
  });
}

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: () =>
      unwrap<Trip>(supabase.from("trips").select("*").eq("id", tripId).single() as any),
  });
}

export function useTravelers(tripId: string) {
  return useQuery({
    queryKey: ["travelers", tripId],
    queryFn: () =>
      unwrap<Traveler[]>(
        supabase
          .from("trip_travelers")
          .select("*")
          .eq("trip_id", tripId)
          .order("created_at") as any,
      ),
  });
}

export function useAgenda(tripId: string) {
  return useQuery({
    queryKey: ["agenda", tripId],
    queryFn: () =>
      unwrap<AgendaItem[]>(
        supabase
          .from("agenda_items")
          .select("*")
          .eq("trip_id", tripId)
          .order("day_date", { ascending: true, nullsFirst: false })
          .order("start_time", { ascending: true, nullsFirst: false })
          .order("sort_order") as any,
      ),
  });
}

export function useSavedPlaces(tripId: string) {
  return useQuery({
    queryKey: ["places", tripId],
    queryFn: () =>
      unwrap<SavedPlace[]>(
        supabase.from("saved_places").select("*").eq("trip_id", tripId).order("created_at") as any,
      ),
  });
}

export function useAllSavedPlaces() {
  return useQuery({
    queryKey: ["places-all"],
    queryFn: () =>
      unwrap<SavedPlace[]>(
        supabase.from("saved_places").select("*").order("created_at", { ascending: false }) as any,
      ),
  });
}

export function useDocuments(tripId: string) {
  return useQuery({
    queryKey: ["documents", tripId],
    queryFn: () =>
      unwrap<TripDocument[]>(
        supabase
          .from("documents")
          .select("*")
          .eq("trip_id", tripId)
          .order("created_at", { ascending: false }) as any,
      ),
  });
}

export function useChecklist(tripId: string) {
  return useQuery({
    queryKey: ["checklist", tripId],
    queryFn: () =>
      unwrap<ChecklistItem[]>(
        supabase
          .from("checklist_items")
          .select("*")
          .eq("trip_id", tripId)
          .order("sort_order") as any,
      ),
  });
}

export function useItemLinks(tripId: string, itemId: string | null) {
  return useQuery({
    queryKey: ["links", itemId],
    enabled: !!itemId,
    queryFn: () =>
      unwrap<ItemLink[]>(
        supabase.from("item_links").select("*").eq("agenda_item_id", itemId!) as any,
      ),
  });
}

export function useComments(itemId: string | null) {
  return useQuery({
    queryKey: ["comments", itemId],
    enabled: !!itemId,
    queryFn: () =>
      unwrap<Comment[]>(
        supabase
          .from("comments")
          .select("*")
          .eq("agenda_item_id", itemId!)
          .order("created_at") as any,
      ),
  });
}

/* ---------------- mutations ---------------- */

export function useTripInvalidation(tripId: string) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["agenda", tripId] });
    void qc.invalidateQueries({ queryKey: ["places", tripId] });
    void qc.invalidateQueries({ queryKey: ["trip", tripId] });
    void qc.invalidateQueries({ queryKey: ["travelers", tripId] });
    void qc.invalidateQueries({ queryKey: ["documents", tripId] });
    void qc.invalidateQueries({ queryKey: ["checklist", tripId] });
    void qc.invalidateQueries({ queryKey: ["trips"] });
  };
}

export function useSaveAgendaItem(tripId: string) {
  const invalidate = useTripInvalidation(tripId);
  return useMutation({
    mutationFn: async (patch: Partial<AgendaItem> & { id?: string }) => {
      if (patch.id) {
        const { id, ...rest } = patch;
        return unwrap<AgendaItem>(
          supabase.from("agenda_items").update(rest as any).eq("id", id).select().single() as any,
        );
      }
      return unwrap<AgendaItem>(
        supabase
          .from("agenda_items")
          .insert({ ...(patch as any), trip_id: tripId })
          .select()
          .single() as any,
      );
    },
    onSuccess: invalidate,
  });
}

export function useDeleteAgendaItem(tripId: string) {
  const invalidate = useTripInvalidation(tripId);
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<null>(supabase.from("agenda_items").delete().eq("id", id) as any),
    onSuccess: invalidate,
  });
}

export function useSavePlace(tripId: string) {
  const invalidate = useTripInvalidation(tripId);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<SavedPlace> & { id?: string }) => {
      if (patch.id) {
        const { id, ...rest } = patch;
        return unwrap<SavedPlace>(
          supabase.from("saved_places").update(rest as any).eq("id", id).select().single() as any,
        );
      }
      return unwrap<SavedPlace>(
        supabase
          .from("saved_places")
          .insert({ ...(patch as any), trip_id: tripId })
          .select()
          .single() as any,
      );
    },
    onSuccess: () => {
      invalidate();
      void qc.invalidateQueries({ queryKey: ["places-all"] });
    },
  });
}

export function useDeletePlace(tripId: string) {
  const invalidate = useTripInvalidation(tripId);
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<null>(supabase.from("saved_places").delete().eq("id", id) as any),
    onSuccess: invalidate,
  });
}

export function useSaveTraveler(tripId: string) {
  const invalidate = useTripInvalidation(tripId);
  return useMutation({
    mutationFn: async (patch: Partial<Traveler> & { id?: string }) => {
      if (patch.id) {
        const { id, ...rest } = patch;
        return unwrap<Traveler>(
          supabase.from("trip_travelers").update(rest as any).eq("id", id).select().single() as any,
        );
      }
      return unwrap<Traveler>(
        supabase
          .from("trip_travelers")
          .insert({ ...(patch as any), trip_id: tripId })
          .select()
          .single() as any,
      );
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTraveler(tripId: string) {
  const invalidate = useTripInvalidation(tripId);
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<null>(supabase.from("trip_travelers").delete().eq("id", id) as any),
    onSuccess: invalidate,
  });
}

export function useSaveChecklistItem(tripId: string) {
  const invalidate = useTripInvalidation(tripId);
  return useMutation({
    mutationFn: async (patch: Partial<ChecklistItem> & { id?: string }) => {
      if (patch.id) {
        const { id, ...rest } = patch;
        return unwrap<ChecklistItem>(
          supabase.from("checklist_items").update(rest as any).eq("id", id).select().single() as any,
        );
      }
      return unwrap<ChecklistItem>(
        supabase
          .from("checklist_items")
          .insert({ ...(patch as any), trip_id: tripId })
          .select()
          .single() as any,
      );
    },
    onSuccess: invalidate,
  });
}

export function useDeleteChecklistItem(tripId: string) {
  const invalidate = useTripInvalidation(tripId);
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<null>(supabase.from("checklist_items").delete().eq("id", id) as any),
    onSuccess: invalidate,
  });
}

export function useSaveTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Trip> & { id?: string }) => {
      if (patch.id) {
        const { id, ...rest } = patch;
        return unwrap<Trip>(
          supabase.from("trips").update(rest as any).eq("id", id).select().single() as any,
        );
      }
      return unwrap<Trip>(supabase.from("trips").insert(patch as any).select().single() as any);
    },
    onSuccess: (trip) => {
      void qc.invalidateQueries({ queryKey: ["trips"] });
      void qc.invalidateQueries({ queryKey: ["trip", trip.id] });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<null>(supabase.from("trips").delete().eq("id", id) as any),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useAddComment(tripId: string, itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { body: string; author_name: string; author_id: string | null }) =>
      unwrap<Comment>(
        supabase
          .from("comments")
          .insert({ ...input, trip_id: tripId, agenda_item_id: itemId } as any)
          .select()
          .single() as any,
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["comments", itemId] }),
  });
}

export function useSaveLink(itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { trip_id: string; label: string; url: string }) =>
      unwrap<ItemLink>(
        supabase
          .from("item_links")
          .insert({ ...input, agenda_item_id: itemId } as any)
          .select()
          .single() as any,
      ),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["links", itemId] }),
  });
}

export function useDeleteLink(itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap<null>(supabase.from("item_links").delete().eq("id", id) as any),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["links", itemId] }),
  });
}

export function useUploadDocument(tripId: string) {
  const invalidate = useTripInvalidation(tripId);
  return useMutation({
    mutationFn: async (input: {
      file: File;
      category: string;
      agendaItemId: string | null;
      uploadedBy: string | null;
    }) => {
      const path = `${tripId}/${crypto.randomUUID()}-${input.file.name}`;
      const { error: upErr } = await supabase.storage
        .from("trip-documents")
        .upload(path, input.file);
      if (upErr) throw upErr;
      return unwrap<TripDocument>(
        supabase
          .from("documents")
          .insert({
            trip_id: tripId,
            agenda_item_id: input.agendaItemId,
            name: input.file.name,
            category: input.category,
            file_path: path,
            mime_type: input.file.type,
            uploaded_by: input.uploadedBy,
          } as any)
          .select()
          .single() as any,
      );
    },
    onSuccess: invalidate,
  });
}

export function useDeleteDocument(tripId: string) {
  const invalidate = useTripInvalidation(tripId);
  return useMutation({
    mutationFn: async (doc: TripDocument) => {
      if (doc.file_path) {
        await supabase.storage.from("trip-documents").remove([doc.file_path]);
      }
      return unwrap<null>(supabase.from("documents").delete().eq("id", doc.id) as any);
    },
    onSuccess: invalidate,
  });
}

export async function documentUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("trip-documents").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

const STORAGE_PREFIX = "storage:";

/** Upload a photo for an agenda item; returns the value to store in image_url. */
export async function uploadItemPhoto(tripId: string, file: File): Promise<string> {
  const path = `${tripId}/photos/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("trip-documents").upload(path, file);
  if (error) throw error;
  return `${STORAGE_PREFIX}${path}`;
}

/** Resolve an image_url value (plain URL or stored file) into a displayable URL. */
export function useImageUrl(value: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!value) {
      setUrl(null);
      return;
    }
    if (!value.startsWith(STORAGE_PREFIX)) {
      setUrl(value);
      return;
    }
    void documentUrl(value.slice(STORAGE_PREFIX.length)).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [value]);
  return url;
}
