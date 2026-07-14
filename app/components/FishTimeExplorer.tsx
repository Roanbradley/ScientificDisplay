"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

type SpeciesKey =
  | "Trachurus_trachurus"
  | "Trisopterus_minutus"
  | "Trisopterus_luscus"
  | "Merlangius_merlangus";

type FishRow = {
  filename: string;
  datetime: string;
  date: string;
  time: string;
  hour: number;
  minute: number;
  Trachurus_trachurus: number;
  Trisopterus_minutus: number;
  Trisopterus_luscus: number;
  Merlangius_merlangus: number;
  total_fish: number;
};

type RawFishRow = Record<string, string>;

type SpeciesConfig = {
  key: SpeciesKey;
  name: string;
  scientificName: string;
  colour: string;
};

type FishDot = {
  id: string;
  species: SpeciesKey;
  colour: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  transitionDuration: number;
};

const species: SpeciesConfig[] = [
  {
    key: "Trachurus_trachurus",
    name: "Horse mackerel",
    scientificName: "Trachurus trachurus",
    colour: "#f5a623",
  },
  {
    key: "Trisopterus_minutus",
    name: "Poor cod",
    scientificName: "Trisopterus minutus",
    colour: "#22c55e",
  },
  {
    key: "Trisopterus_luscus",
    name: "Pouting",
    scientificName: "Trisopterus luscus",
    colour: "#3b82f6",
  },
  {
    key: "Merlangius_merlangus",
    name: "Whiting",
    scientificName: "Merlangius merlangus",
    colour: "#ec4899",
  },
];

function parseNumber(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatTime(row: FishRow): string {
  return `${String(row.hour).padStart(2, "0")}:${String(
    row.minute
  ).padStart(2, "0")}`;
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function seededValue(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createFishDots(
  row: FishRow,
  frameIndex: number,
  activityLevel: number
): FishDot[] {
  const dots: FishDot[] = [];

  species.forEach((item, speciesIndex) => {
    const count = Math.max(0, Math.round(row[item.key]));

    for (let fishIndex = 0; fishIndex < count; fishIndex += 1) {
      const id = `${item.key}-${fishIndex}`;
      const seed = hashString(id) + speciesIndex * 10000;

      const baseX = 5 + seededValue(seed + 1) * 90;
      const baseY = 8 + seededValue(seed + 2) * 84;

      const phase = seededValue(seed + 3) * Math.PI * 2;
      const verticalPhase = seededValue(seed + 4) * Math.PI * 2;

      const horizontalMovement = 2.5 + activityLevel * 5;
      const verticalMovement = 1.5 + activityLevel * 3;

      const x =
        baseX +
        Math.sin(frameIndex * 0.52 + phase) * horizontalMovement;

      const y =
        baseY +
        Math.cos(frameIndex * 0.38 + verticalPhase) *
          verticalMovement;

      dots.push({
        id,
        species: item.key,
        colour: item.colour,
        x: clamp(x, 2.5, 97.5),
        y: clamp(y, 5, 95),
        size: 8.5 + seededValue(seed + 5) * 3,
        opacity: 0.78 + seededValue(seed + 6) * 0.22,
        transitionDuration: 500 + seededValue(seed + 7) * 450,
      });
    }
  });

  return dots;
}

function getSkyBackground(hour: number, minute: number): string {
  const decimalHour = hour + minute / 60;

  if (decimalHour >= 4 && decimalHour < 5.5) {
    return `
      linear-gradient(
        180deg,
        #101a34 0%,
        #182744 35%,
        #2d304d 68%,
        #211a28 100%
      )
    `;
  }

  if (decimalHour >= 5.5 && decimalHour < 7.5) {
    return `
      linear-gradient(
        180deg,
        #687faa 0%,
        #bd6d72 33%,
        #ef8a59 68%,
        #ffc274 100%
      )
    `;
  }

  if (decimalHour >= 7.5 && decimalHour < 10) {
    return `
      linear-gradient(
        180deg,
        #7fd1ff 0%,
        #5aaceb 43%,
        #3478bd 72%,
        #194475 100%
      )
    `;
  }

  if (decimalHour >= 10 && decimalHour < 15.5) {
    return `
      linear-gradient(
        180deg,
        #70cefa 0%,
        #4597dd 42%,
        #276bb5 72%,
        #123c71 100%
      )
    `;
  }

  if (decimalHour >= 15.5 && decimalHour < 17.5) {
    return `
      linear-gradient(
        180deg,
        #79bcef 0%,
        #6095d4 42%,
        #486fa8 72%,
        #273f69 100%
      )
    `;
  }

  if (decimalHour >= 17.5 && decimalHour < 20) {
    return `
      linear-gradient(
        180deg,
        #7869a8 0%,
        #be5d77 34%,
        #ee7650 68%,
        #ffae64 100%
      )
    `;
  }

  if (decimalHour >= 20 && decimalHour < 21.5) {
    return `
      linear-gradient(
        180deg,
        #344d7e 0%,
        #263861 40%,
        #182541 72%,
        #0a1226 100%
      )
    `;
  }

  return `
    linear-gradient(
      180deg,
      #081126 0%,
      #0a1429 40%,
      #060c18 72%,
      #02040a 100%
    )
  `;
}

function getSkyPosition(hour: number, minute: number) {
  const decimalHour = hour + minute / 60;

  if (decimalHour >= 6 && decimalHour < 20) {
    const progress = (decimalHour - 6) / 14;

    return {
      isDay: true,
      x: 8 + progress * 84,
      y: 77 - Math.sin(progress * Math.PI) * 60,
    };
  }

  const hoursSinceMoonrise =
    decimalHour >= 20 ? decimalHour - 20 : decimalHour + 4;

  const progress = hoursSinceMoonrise / 10;

  return {
    isDay: false,
    x: 8 + progress * 84,
    y: 77 - Math.sin(progress * Math.PI) * 60,
  };
}

export default function FishTimeExplorer() {
  const [rows, setRows] = useState<FishRow[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadFishData() {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(
          "/data/fish_counts_with_timestamps.csv"
        );

        if (!response.ok) {
          throw new Error(
            `Could not load fish data. Server returned ${response.status}.`
          );
        }

        const csvText = await response.text();

        const parsed = Papa.parse<RawFishRow>(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        const cleanedRows: FishRow[] = parsed.data
          .map((row) => ({
            filename: row.filename ?? "",
            datetime: row.datetime ?? "",
            date: row.date ?? "",
            time: row.time ?? "",
            hour: parseNumber(row.hour),
            minute: parseNumber(row.minute),
            Trachurus_trachurus: parseNumber(
              row.Trachurus_trachurus
            ),
            Trisopterus_minutus: parseNumber(
              row.Trisopterus_minutus
            ),
            Trisopterus_luscus: parseNumber(
              row.Trisopterus_luscus
            ),
            Merlangius_merlangus: parseNumber(
              row.Merlangius_merlangus
            ),
            total_fish: parseNumber(row.total_fish),
          }))
          .filter((row) => row.date && row.time)
          .sort((first, second) =>
            `${first.date} ${first.time}`.localeCompare(
              `${second.date} ${second.time}`
            )
          );

        if (cleanedRows.length === 0) {
          throw new Error("No usable fish records were found.");
        }

        setRows(cleanedRows);
        setSelectedIndex(0);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFishData();
  }, []);

  useEffect(() => {
    if (!isPlaying || rows.length === 0) return;

    const interval = window.setInterval(() => {
      setSelectedIndex((currentIndex) => {
        if (currentIndex >= rows.length - 1) {
          setIsPlaying(false);
          return currentIndex;
        }

        return currentIndex + 1;
      });
    }, 900);

    return () => window.clearInterval(interval);
  }, [isPlaying, rows.length]);

  const currentRow = rows[selectedIndex];
  const previousRow =
    selectedIndex > 0 ? rows[selectedIndex - 1] : undefined;

  const maximumFishCount = useMemo(() => {
    return Math.max(...rows.map((row) => row.total_fish), 1);
  }, [rows]);

  const activityLevel = currentRow
    ? currentRow.total_fish / maximumFishCount
    : 0;

  const fishDots = useMemo(() => {
    if (!currentRow) return [];

    return createFishDots(
      currentRow,
      selectedIndex,
      activityLevel
    );
  }, [currentRow, selectedIndex, activityLevel]);

  function moveBackward() {
    setIsPlaying(false);
    setSelectedIndex((index) => Math.max(0, index - 1));
  }

  function moveForward() {
    setIsPlaying(false);
    setSelectedIndex((index) =>
      Math.min(rows.length - 1, index + 1)
    );
  }

  function togglePlayback() {
    if (selectedIndex >= rows.length - 1) {
      setSelectedIndex(0);
      setIsPlaying(true);
      return;
    }

    setIsPlaying((playing) => !playing);
  }

  if (loading) {
    return (
      <section className="mt-6 rounded-[2rem] border border-neutral-800 bg-neutral-950 p-6 text-center">
        <p className="text-sm text-neutral-500">
          Loading fish activity...
        </p>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className="mt-6 rounded-[2rem] border border-red-950 bg-neutral-950 p-6">
        <p className="font-medium text-red-400">
          Fish data could not be loaded
        </p>

        <p className="mt-2 text-sm text-neutral-500">
          {loadError}
        </p>
      </section>
    );
  }

  if (!currentRow) return null;

  const previousTotal =
    previousRow?.total_fish ?? currentRow.total_fish;

  const fishChange =
    currentRow.total_fish - previousTotal;

  const fishChangePercent =
    previousTotal > 0
      ? (fishChange / previousTotal) * 100
      : fishChange > 0
        ? 100
        : 0;

  const speciesPercentages = species.map((item) => ({
    ...item,
    count: currentRow[item.key],
    percentage:
      currentRow.total_fish > 0
        ? (currentRow[item.key] / currentRow.total_fish) * 100
        : 0,
  }));

  const skyBackground = getSkyBackground(
    currentRow.hour,
    currentRow.minute
  );

  const timelineProgress =
    rows.length > 1
      ? (selectedIndex / (rows.length - 1)) * 100
      : 0;

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-950">
      <div className="border-b border-neutral-800 px-5 py-5 md:px-7">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
          SmartBay activity timeline
        </p>

        <h2 className="mt-2 text-2xl font-medium tracking-tight text-white md:text-3xl">
          Fish through time
        </h2>
      </div>

      <div
        className="transition-[background] duration-700"
        style={{ background: skyBackground }}
      >
        <SkyScene
          hour={currentRow.hour}
          minute={currentRow.minute}
          time={formatTime(currentRow)}
          date={formatDate(currentRow.date)}
        />

        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-2 px-5 pb-4">
          {species.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-2"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.colour }}
              />

              <p className="text-xs text-white/70">
                {item.name}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15 px-5 py-5 md:px-7">
          <div className="mx-auto grid max-w-5xl gap-3 md:grid-cols-[0.8fr_1.6fr_0.8fr]">
            <div className="rounded-2xl border border-white/15 bg-black/15 p-4 text-center backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">
                Total fish
              </p>

              <p className="mt-2 text-5xl font-medium tracking-tighter text-white">
                {currentRow.total_fish}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/15 p-4 backdrop-blur-sm">
              <p className="text-center text-[10px] uppercase tracking-[0.28em] text-white/50">
                Species composition
              </p>

              <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
                {speciesPercentages.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: item.colour,
                          }}
                        />

                        <span className="truncate text-xs text-white/70">
                          {item.name}
                        </span>
                      </div>

                      <span className="text-sm font-medium text-white">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.colour,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/15 p-4 text-center backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">
                30 min change
              </p>

              <p className="mt-2 text-4xl font-medium tracking-tighter text-white">
                {fishChange > 0 ? "+" : ""}
                {fishChange}
              </p>

              <p
                className={`mt-1 text-sm font-medium ${
                  fishChange > 0
                    ? "text-emerald-300"
                    : fishChange < 0
                      ? "text-red-300"
                      : "text-white/50"
                }`}
              >
                {fishChangePercent > 0 ? "+" : ""}
                {fishChangePercent.toFixed(1)}%
              </p>

              <p className="mt-2 text-[10px] uppercase tracking-wide text-white/35">
                Previous observation
              </p>
            </div>
          </div>

          <div className="mx-auto mt-4 max-w-4xl">
            <div className="mb-2 flex items-center justify-between text-xs text-white/50">
              <span>
                {rows[0] ? formatTime(rows[0]) : ""}
              </span>

              <span className="font-medium text-white">
                {formatTime(currentRow)}
              </span>

              <span>
                {rows[rows.length - 1]
                  ? formatTime(rows[rows.length - 1])
                  : ""}
              </span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-white transition-all duration-150"
                  style={{
                    width: `${timelineProgress}%`,
                  }}
                />
              </div>

              <input
                type="range"
                min={0}
                max={Math.max(rows.length - 1, 0)}
                value={selectedIndex}
                step={1}
                onChange={(event) => {
                  setIsPlaying(false);
                  setSelectedIndex(Number(event.target.value));
                }}
                aria-label="Select fish observation time"
                className="relative z-10 block h-3 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-white"
              />
            </div>
          </div>

          <div className="mx-auto mt-4 max-w-4xl">
            <div
              className="relative h-36 overflow-hidden rounded-2xl border border-white/15 backdrop-blur-sm transition-all duration-700 md:h-40"
              style={{
                background: `rgba(0, 0, 0, ${
                  0.12 + activityLevel * 0.1
                })`,
                boxShadow: `inset 0 0 ${
                  18 + activityLevel * 35
                }px rgba(255, 255, 255, ${
                  0.01 + activityLevel * 0.035
                })`,
              }}
            >
              {fishDots.length > 0 ? (
                fishDots.map((dot) => (
                  <span
                    key={dot.id}
                    className="absolute rounded-full"
                    style={{
                      left: `${dot.x}%`,
                      top: `${dot.y}%`,
                      width: `${dot.size}px`,
                      height: `${dot.size}px`,
                      opacity: dot.opacity,
                      backgroundColor: dot.colour,
                      transform: "translate(-50%, -50%)",
                      boxShadow: `0 0 ${
                        7 + activityLevel * 8
                      }px ${dot.colour}45`,
                      transitionProperty:
                        "left, top, opacity, transform",
                      transitionDuration: `${dot.transitionDuration}ms`,
                      transitionTimingFunction:
                        "cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                    title={
                      species.find(
                        (item) => item.key === dot.species
                      )?.name
                    }
                  />
                ))
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-white/50">
                    No fish detected during this observation.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={moveBackward}
              disabled={selectedIndex === 0}
              className="rounded-full border border-white/20 bg-black/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={togglePlayback}
              className="min-w-24 rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button
              type="button"
              onClick={moveForward}
              disabled={selectedIndex === rows.length - 1}
              className="rounded-full border border-white/20 bg-black/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-white/40">
            Observation {selectedIndex + 1} of {rows.length}
          </p>
        </div>
      </div>
    </section>
  );
}

function SkyScene({
  hour,
  minute,
  time,
  date,
}: {
  hour: number;
  minute: number;
  time: string;
  date: string;
}) {
  const sky = getSkyPosition(hour, minute);

  return (
    <div className="relative mx-auto h-52 w-full max-w-5xl overflow-hidden md:h-60">
      <div
        key={`glow-${sky.isDay ? "sun" : "moon"}`}
        className="absolute rounded-full blur-[90px]"
        style={{
          left: `${sky.x}%`,
          top: `${sky.y}%`,
          width: sky.isDay ? 220 : 170,
          height: sky.isDay ? 220 : 170,
          background: sky.isDay
            ? "rgba(255, 189, 88, 0.26)"
            : "rgba(184, 211, 255, 0.12)",
          transform: "translate(-50%, -50%)",
          transition:
            "left 500ms ease-out, top 500ms ease-out",
        }}
      />

      <div
        key={sky.isDay ? "sun" : "moon"}
        className="absolute"
        style={{
          left: `${sky.x}%`,
          top: `${sky.y}%`,
          transform: "translate(-50%, -50%)",
          transition:
            "left 500ms ease-out, top 500ms ease-out",
        }}
      >
        <CelestialSymbol isDay={sky.isDay} />
      </div>

      <div className="absolute inset-x-0 bottom-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
          {sky.isDay ? "Day" : "Night"}
        </p>

        <p className="mt-1 text-3xl font-medium tracking-tighter text-white md:text-4xl">
          {time}
        </p>

        <p className="mt-1 text-xs text-white/55">
          {date}
        </p>
      </div>
    </div>
  );
}

function CelestialSymbol({ isDay }: { isDay: boolean }) {
  if (isDay) {
    return (
      <div className="relative flex h-24 w-24 items-center justify-center md:h-28 md:w-28">
        <div className="absolute inset-[15%] rounded-full bg-amber-300/25 blur-2xl" />

        <svg
          viewBox="0 0 120 120"
          className="relative h-full w-full"
          aria-label="Sun"
        >
          <g
            fill="none"
            stroke="#ffd56a"
            strokeLinecap="round"
            strokeWidth="4"
          >
            <path d="M60 5v15" />
            <path d="M60 100v15" />
            <path d="M5 60h15" />
            <path d="M100 60h15" />
            <path d="M21 21l11 11" />
            <path d="M88 88l11 11" />
            <path d="M99 21L88 32" />
            <path d="M32 88L21 99" />
          </g>

          <circle
            cx="60"
            cy="60"
            r="34"
            fill="url(#sunGradient)"
          />

          <defs>
            <radialGradient id="sunGradient">
              <stop offset="0%" stopColor="#fff1a6" />
              <stop offset="55%" stopColor="#ffc44f" />
              <stop offset="100%" stopColor="#f08b1c" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div className="relative flex h-24 w-24 items-center justify-center md:h-28 md:w-28">
      <div className="absolute inset-[15%] rounded-full bg-white/10 blur-2xl" />

      <svg
        viewBox="0 0 120 120"
        className="relative h-full w-full"
        aria-label="Moon"
      >
        <circle
          cx="60"
          cy="60"
          r="38"
          fill="url(#moonGradient)"
        />

        <circle
          cx="76"
          cy="47"
          r="37"
          fill="#081126"
        />

        <defs>
          <radialGradient id="moonGradient">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="75%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#aeb8c5" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}