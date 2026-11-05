import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";
import { chooseTour, placeBubble, TOUR_SEEN_KEY, type Box, type TourStep } from "@/lib/tour";

/** The first visible element for a tour target (desktop and mobile navs both carry the attribute). */
function findTarget(target: string): HTMLElement | null {
  const all = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

/** The "?" button in the top bar. Shows a dot until the tour has been taken once. */
export function TourButton() {
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [seen, setSeen] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      setSeen(localStorage.getItem(TOUR_SEEN_KEY) === "1");
    } catch {
      /* storage blocked: leave the dot off */
    }
  }, []);

  function close() {
    setSteps(null);
    setSeen(true);
    try {
      localStorage.setItem(TOUR_SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    buttonRef.current?.focus();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        data-tour="help"
        onClick={() => setSteps(chooseTour((t) => findTarget(t) !== null))}
        title="What's on this page? Take a quick tour"
        aria-label="Take a tour of this page"
        className="relative grid size-9 place-items-center rounded-full border border-border text-ink/60 transition-colors hover:text-ink"
      >
        <CircleHelp className="size-[18px]" />
        {!seen ? (
          <span aria-hidden className="absolute -top-0.5 -right-0.5 flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
          </span>
        ) : null}
      </button>
      {steps && steps.length > 0 ? <GuidedTour steps={steps} onClose={close} /> : null}
    </>
  );
}

function GuidedTour({ steps, onClose }: { steps: TourStep[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const step = steps[index]!;
  const last = index === steps.length - 1;

  const measure = useCallback(() => {
    const el = findTarget(step.target);
    if (!el) return setBox(null);
    const r = el.getBoundingClientRect();
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step.target]);

  // Bring the target into view, then measure it; re-measure on scroll and resize.
  useEffect(() => {
    findTarget(step.target)?.scrollIntoView({ block: "center", inline: "nearest" });
    measure();
    let frame = 0;
    const onMove = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [step.target, measure]);

  // Place the bubble once we know its size.
  useLayoutEffect(() => {
    const b = bubbleRef.current;
    if (!b || !box) return;
    const p = placeBubble(
      box,
      { width: b.offsetWidth, height: b.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
    );
    setPos({ top: p.top, left: p.left });
  }, [box, index]);

  useEffect(() => {
    nextRef.current?.focus();
  }, [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, steps.length - 1));
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, steps.length]);

  const pad = 6;
  return createPortal(
    <div className="fixed inset-0 z-[60]">
      {/* Blocks clicks on the page while the tour is open; dims everything except the target. */}
      <div className="absolute inset-0" />
      {box ? (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-2xl ring-2 ring-brand transition-all duration-200 motion-reduce:transition-none"
          style={{
            top: box.top - pad,
            left: box.left - pad,
            width: box.width + pad * 2,
            height: box.height + pad * 2,
            boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.45)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/45" />
      )}

      <div
        ref={bubbleRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className="fixed w-[min(340px,calc(100vw-24px))] rounded-[22px] border border-border bg-cream p-5 text-ink shadow-xl"
        style={
          pos
            ? { top: pos.top, left: pos.left }
            : { top: "50%", left: "50%", transform: "translate(-50%,-50%)" }
        }
      >
        <p className="text-[11px] font-bold tracking-[0.14em] text-ink/45 uppercase">
          Step {index + 1} of {steps.length}
        </p>
        <h2
          id="tour-title"
          className="font-display mt-1 text-[20px] leading-tight font-extrabold tracking-tight"
        >
          {step.title}
        </h2>
        <p id="tour-body" className="mt-2 text-[13px] leading-relaxed text-ink/70">
          {step.body}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] font-bold text-ink/50 hover:text-ink"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => setIndex((i) => i - 1)}
                className="rounded-full border border-border px-4 py-2 text-[12px] font-bold text-ink/70"
              >
                Back
              </button>
            ) : null}
            <button
              ref={nextRef}
              type="button"
              onClick={() => (last ? onClose() : setIndex((i) => i + 1))}
              className="rounded-full bg-brand px-4 py-2 text-[12px] font-bold text-cream"
            >
              {last ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
