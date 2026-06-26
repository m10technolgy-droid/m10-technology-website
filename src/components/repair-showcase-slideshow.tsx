"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Wrench, X } from "lucide-react";

type Slide = {
  id: string;
  title: string;
  description: string | null;
  beforeUrl: string;
  afterUrl: string;
};

const AUTO_ADVANCE_MS = 3000;

export function RepairShowcaseSlideshow({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (paused || detailOpen || slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, detailOpen, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button
        key={slide.id}
        onClick={() => setDetailOpen(true)}
        className="animate-slide-fade block w-full rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-brand-red" strokeWidth={2} />
          <span className="text-sm font-semibold text-zinc-900">{slide.title}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl border border-zinc-200">
          <div className="relative aspect-square">
            <Image src={slide.beforeUrl} alt={`${slide.title} - before`} fill className="object-cover" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-white">
                Before
              </span>
            </span>
          </div>
          <div className="relative aspect-square border-l border-zinc-200">
            <Image src={slide.afterUrl} alt={`${slide.title} - after`} fill className="object-cover" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-brand-red/80 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-white">
                After
              </span>
            </span>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-zinc-400">Tap to see details</p>
      </button>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-2 top-1/3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50"
          >
            <ChevronLeft className="h-5 w-5 text-zinc-700" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-2 top-1/3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50"
          >
            <ChevronRight className="h-5 w-5 text-zinc-700" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i === index ? "bg-brand-red" : "bg-zinc-200"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-brand-red" strokeWidth={2} />
                <h3 className="text-lg font-semibold text-zinc-900">{slide.title}</h3>
              </div>
              <button
                onClick={() => setDetailOpen(false)}
                aria-label="Close"
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image src={slide.beforeUrl} alt={`${slide.title} - before`} fill className="object-cover" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-white">
                    Before
                  </span>
                </span>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Image src={slide.afterUrl} alt={`${slide.title} - after`} fill className="object-cover" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-brand-red/80 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-white">
                    After
                  </span>
                </span>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm text-zinc-600">
              {slide.description || "No additional details for this repair."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
