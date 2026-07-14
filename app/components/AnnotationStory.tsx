"use client";

import { useMemo, useState } from "react";

const DATASET_ONE_ANNOTATIONS = 7030;
const DATASET_TWO_ANNOTATIONS = 1157;
const DATASET_ONE_FRAMES = 363;
const DATASET_TWO_FRAMES = 384;

const TOTAL_ANNOTATIONS =
  DATASET_ONE_ANNOTATIONS + DATASET_TWO_ANNOTATIONS;

const TOTAL_FRAMES = DATASET_ONE_FRAMES + DATASET_TWO_FRAMES;

const ANNOTATIONS_PER_FISH = 25;

type SchoolFish = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  delay: number;
};

type FishMarkProps = Omit<SchoolFish, "id">;

function seededValue(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * CSS values are rounded before rendering so that the server-rendered
 * style attributes and browser-normalized client values remain identical.
 */
function round(value: number, decimalPlaces = 4): number {
  const multiplier = 10 ** decimalPlaces;
  return Math.round(value * multiplier) / multiplier;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IE").format(value);
}

function createSchool(totalFishSymbols: number): SchoolFish[] {
  return Array.from({ length: totalFishSymbols }, (_, index) => {
    const horizontalSeed = seededValue(index * 17 + 1);
    const verticalSeed = seededValue(index * 23 + 2);
    const centreBias = Math.sin(horizontalSeed * Math.PI);

    return {
      id: index,
      x: round(4 + horizontalSeed * 92),
      y: round(8 + verticalSeed * 84),
      size: round(7 + seededValue(index * 31 + 3) * 5),
      rotation: round(-18 + seededValue(index * 41 + 4) * 36),
      opacity: round(0.48 + centreBias * 0.46, 5),
      delay: round(seededValue(index * 53 + 5) * 220),
    };
  });
}

export default function AnnotationStory() {
  const [annotationPercentage, setAnnotationPercentage] = useState(1);

  const totalFishSymbols = Math.ceil(
    TOTAL_ANNOTATIONS / ANNOTATIONS_PER_FISH
  );

  const school = useMemo(
    () => createSchool(totalFishSymbols),
    [totalFishSymbols]
  );

  const visibleAnnotations = Math.round(
    TOTAL_ANNOTATIONS * (annotationPercentage / 100)
  );

  const visibleFishSymbols = Math.max(
    1,
    Math.ceil(visibleAnnotations / ANNOTATIONS_PER_FISH)
  );

  const annotationsPerPercentage = TOTAL_ANNOTATIONS / 100;
  const annotationsPerFrame = TOTAL_ANNOTATIONS / TOTAL_FRAMES;

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-950">
      <div className="border-b border-neutral-800 px-5 py-5 md:px-7">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
          Learning the bay
        </p>

        <h2 className="mt-2 text-2xl font-medium tracking-tight text-white md:text-3xl">
          Building the training school
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Move through the annotation process and watch the training school
          grow.
        </p>
      </div>

      <div className="p-5 md:p-7">
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-black">
          <div className="flex flex-col gap-4 border-b border-neutral-900 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                Manual annotation progress
              </p>

              <div className="mt-2 flex items-end gap-3">
                <p className="text-4xl font-medium tracking-tighter text-white md:text-5xl">
                  {formatNumber(visibleAnnotations)}
                </p>

                <p className="pb-1 text-sm text-neutral-500">
                  of {formatNumber(TOTAL_ANNOTATIONS)}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-medium tracking-tight text-white">
                {annotationPercentage}%
              </p>

              <p className="mt-1 text-xs text-neutral-600">
                ≈ {annotationsPerPercentage.toFixed(1)} annotations per
                percentage point
              </p>
            </div>
          </div>

          <div className="relative h-64 overflow-hidden md:h-72">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,116,144,0.24),transparent_68%)]" />

            <div className="absolute inset-x-0 top-1/3 h-px bg-white/[0.025]" />

            <div className="absolute inset-x-0 top-2/3 h-px bg-white/[0.025]" />

            {school.slice(0, visibleFishSymbols).map((fish) => (
              <FishMark
                key={fish.id}
                x={fish.x}
                y={fish.y}
                size={fish.size}
                rotation={fish.rotation}
                opacity={fish.opacity}
                delay={fish.delay}
              />
            ))}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <div className="pointer-events-none absolute bottom-4 left-5">
              <p className="text-xs text-neutral-600">
                1 fish symbol ≈ {ANNOTATIONS_PER_FISH} annotations
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-900 px-5 py-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-neutral-600">1%</span>

              <span className="text-sm font-medium text-white">
                {annotationPercentage}%
              </span>

              <span className="text-xs text-neutral-600">100%</span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-200"
                  style={{
                    width: `${annotationPercentage}%`,
                  }}
                />
              </div>

              <input
                type="range"
                min={1}
                max={100}
                step={1}
                value={annotationPercentage}
                onChange={(event) => {
                  setAnnotationPercentage(Number(event.currentTarget.value));
                }}
                aria-label="Manual annotation percentage"
                className="relative z-10 block h-4 w-full cursor-pointer appearance-none bg-transparent accent-white"
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <DataCard
                label="Annotations shown"
                value={formatNumber(visibleAnnotations)}
              />

              <DataCard
                label="Fish symbols"
                value={formatNumber(visibleFishSymbols)}
              />

              <DataCard
                label="Annotations per frame"
                value={annotationsPerFrame.toFixed(1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-neutral-900">
            <DatasetStat
              label="Dataset one"
              annotations={DATASET_ONE_ANNOTATIONS}
              frames={DATASET_ONE_FRAMES}
            />

            <DatasetStat
              label="Dataset two"
              annotations={DATASET_TWO_ANNOTATIONS}
              frames={DATASET_TWO_FRAMES}
              border
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FishMark({
  x,
  y,
  size,
  rotation,
  opacity,
  delay,
}: FishMarkProps) {
  const width = round(size * 1.8);

  return (
    <svg
      viewBox="0 0 30 16"
      aria-hidden="true"
      focusable="false"
      className="absolute text-sky-200 transition-all duration-300"
      style={{
        left: `${x.toFixed(4)}%`,
        top: `${y.toFixed(4)}%`,
        width: `${width.toFixed(4)}px`,
        height: `${size.toFixed(4)}px`,
        opacity: opacity.toFixed(5),
        transform: `translate(-50%, -50%) rotate(${rotation.toFixed(4)}deg)`,

        // Avoid animation shorthand because browsers expand and normalize it.
        animationName: "annotationFishAppear",
        animationDuration: "320ms",
        animationTimingFunction: "ease-out",
        animationDelay: `${delay.toFixed(4)}ms`,
        animationIterationCount: "1",
        animationDirection: "normal",
        animationFillMode: "both",
        animationPlayState: "running",
      }}
    >
      <ellipse
        cx="17"
        cy="8"
        rx="9"
        ry="5"
        fill="currentColor"
      />

      <path
        d="M8 8 1 2v12Z"
        fill="currentColor"
      />

      <circle
        cx="21"
        cy="7"
        r="1"
        fill="#020617"
      />
    </svg>
  );
}

function DataCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">
        {label}
      </p>

      <p className="mt-1 text-lg font-medium text-white">
        {value}
      </p>
    </div>
  );
}

function DatasetStat({
  label,
  annotations,
  frames,
  border = false,
}: {
  label: string;
  annotations: number;
  frames: number;
  border?: boolean;
}) {
  return (
    <div
      className={`p-4 ${
        border ? "border-l border-neutral-900" : ""
      }`}
    >
      <p className="text-xs text-neutral-600">
        {label}
      </p>

      <p className="mt-1 text-lg font-medium text-white">
        {formatNumber(annotations)}
      </p>

      <p className="mt-1 text-xs text-neutral-600">
        {frames} source frames
      </p>
    </div>
  );
}