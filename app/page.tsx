"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { Inter } from "next/font/google";
import Papa from "papaparse";

import FishTimeExplorer from "./components/FishTimeExplorer";
import AnnotationStory from "./components/AnnotationStory";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const HERO_VIDEO_PATH = "/videos/fish_tracking2.mp4";
const TRACKING_VIDEO_PATH = "/videos/fish_tracking2.mp4";
const SMARTBAY_LOGO_PATH = "/logos/SmartBay-Brand-1.jpg";
const MARINE_INSTITUTE_LOGO_PATH = "/logos/marine-institute.jpg";

type RunConfig = {
  id: string;
  name: string;
  shortName: string;
  images: number;
  csvPath: string;
};

type MetricConfig = {
  label: string;
  column: string;
  better: "higher" | "lower";
};

type ChartRow = {
  epoch: number;
  [key: string]: number;
};

const runs: RunConfig[] = [
  {
    id: "run1",
    name: "Run 1: Dataset 1",
    shortName: "Dataset 1",
    images: 384,
    csvPath: "/results/run1.csv",
  },
  {
    id: "run2",
    name: "Run 2: Dataset 2",
    shortName: "Dataset 2",
    images: 353,
    csvPath: "/results/run2.csv",
  },
  {
    id: "run3",
    name: "Run 3: Dataset 3",
    shortName: "Dataset 3",
    images: 1192,
    csvPath: "/results/run3.csv",
  },
];

const metrics: MetricConfig[] = [
  { label: "mAP50", column: "metrics/mAP50(B)", better: "higher" },
  { label: "mAP50-95", column: "metrics/mAP50-95(B)", better: "higher" },
  { label: "Precision", column: "metrics/precision(B)", better: "higher" },
  { label: "Recall", column: "metrics/recall(B)", better: "higher" },
  { label: "Box loss", column: "train/box_loss", better: "lower" },
  { label: "Class loss", column: "train/cls_loss", better: "lower" },
  { label: "DFL loss", column: "train/dfl_loss", better: "lower" },
];

const colors: Record<string, string> = {
  run1: "#ffffff",
  run2: "#a3a3a3",
  run3: "#525252",
};

export default function Home() {
  const [selectedMetric, setSelectedMetric] = useState<MetricConfig>(metrics[0]);
  const [dataByRun, setDataByRun] = useState<Record<string, ChartRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [resultsError, setResultsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCsvs() {
      try {
        setResultsError(null);
        const loaded: Record<string, ChartRow[]> = {};

        for (const run of runs) {
          const response = await fetch(run.csvPath);

          if (!response.ok) {
            throw new Error(
              `Could not load ${run.csvPath}. Status: ${response.status}`,
            );
          }

          const text = await response.text();
          const parsed = Papa.parse<Record<string, string>>(text, {
            header: true,
            skipEmptyLines: true,
          });

          loaded[run.id] = parsed.data
            .map((row) => {
              const cleanRow: ChartRow = {
                epoch: Number(row.epoch),
              };

              for (const metric of metrics) {
                cleanRow[metric.column] = Number(row[metric.column]);
              }

              return cleanRow;
            })
            .filter((row) => Number.isFinite(row.epoch));
        }

        if (!cancelled) {
          setDataByRun(loaded);
        }
      } catch (error) {
        console.error("Failed to load model results:", error);

        if (!cancelled) {
          setResultsError(
            error instanceof Error
              ? error.message
              : "The model results could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCsvs();

    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    const maxEpoch = Math.max(
      ...Object.values(dataByRun).flatMap((rows) =>
        rows.map((row) => row.epoch),
      ),
      0,
    );

    return Array.from({ length: maxEpoch + 1 }, (_, epoch) => {
      const row: ChartRow = { epoch };

      for (const run of runs) {
        const epochRow = dataByRun[run.id]?.find(
          (result) => result.epoch === epoch,
        );

        row[run.id] = epochRow?.[selectedMetric.column] ?? Number.NaN;
      }

      return row;
    }).filter((row) =>
      Object.entries(row).some(
        ([key, value]) => key !== "epoch" && Number.isFinite(value),
      ),
    );
  }, [dataByRun, selectedMetric]);

  const bestPoints = useMemo(() => {
    return runs
      .map((run) => {
        const rows = dataByRun[run.id] ?? [];

        if (!rows.length) return null;

        const validRows = rows.filter((row) =>
          Number.isFinite(row[selectedMetric.column]),
        );

        if (!validRows.length) return null;

        const best = validRows.reduce((bestRow, currentRow) => {
          const currentValue = currentRow[selectedMetric.column];
          const bestValue = bestRow[selectedMetric.column];

          if (selectedMetric.better === "higher") {
            return currentValue > bestValue ? currentRow : bestRow;
          }

          return currentValue < bestValue ? currentRow : bestRow;
        }, validRows[0]);

        return {
          run,
          epoch: best.epoch,
          value: best[selectedMetric.column],
        };
      })
      .filter(Boolean) as {
      run: RunConfig;
      epoch: number;
      value: number;
    }[];
  }, [dataByRun, selectedMetric]);

  const overallBest = useMemo(() => {
    if (!bestPoints.length) return null;

    return bestPoints.reduce((best, current) => {
      if (selectedMetric.better === "higher") {
        return current.value > best.value ? current : best;
      }

      return current.value < best.value ? current : best;
    }, bestPoints[0]);
  }, [bestPoints, selectedMetric]);

  const totalImages = runs.reduce((sum, run) => sum + run.images, 0);

  function scrollToResults() {
    document.getElementById("results")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main className={`${inter.className} min-h-screen bg-[#050706] text-white`}>
      <LandingHero onExplore={scrollToResults} />

      <section
        id="results"
        className="scroll-mt-0 bg-[#050706] px-4 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <header className="mb-12 border-b border-white/10 pb-10">
            <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/35">
                  Model performance
                </p>

                <h2 className="max-w-4xl text-4xl font-medium tracking-[-0.045em] text-white md:text-6xl">
                  Measuring underwater species identification
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45 md:text-base">
                  Comparing YOLO11x performance across datasets and training
                  epochs to evaluate precision, recall, and detection quality.
                </p>
              </div>

              <div className="flex shrink-0 gap-10 text-sm">
                <div>
                  <p className="text-white/35">Runs</p>
                  <p className="mt-1 text-lg font-medium">{runs.length}</p>
                </div>

                <div>
                  <p className="text-white/35">Images</p>
                  <p className="mt-1 text-lg font-medium">
                    {totalImages.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {loading ? (
            <ResultsLoadingState />
          ) : resultsError ? (
            <ResultsErrorState message={resultsError} />
          ) : (
            <>
              <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard label="Metric" value={selectedMetric.label} />
                <StatCard
                  label="Best run"
                  value={overallBest?.run.shortName ?? "—"}
                />
                <StatCard
                  label="Best value"
                  value={overallBest ? overallBest.value.toFixed(3) : "—"}
                />
                <StatCard
                  label="Images"
                  value={totalImages.toLocaleString()}
                />
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {metrics.map((metric) => {
                  const active = selectedMetric.column === metric.column;

                  return (
                    <button
                      key={metric.column}
                      type="button"
                      onClick={() => setSelectedMetric(metric)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "border-white bg-white text-black"
                          : "border-white/10 bg-white/[0.025] text-white/45 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {metric.label}
                    </button>
                  );
                })}
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-4 md:p-7">
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/30">
                    Training analysis
                  </p>

                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <h3 className="text-2xl font-medium tracking-tight">
                      {selectedMetric.label}
                    </h3>

                    <p className="text-sm text-white/35">
                      Markers indicate each run&apos;s strongest result
                    </p>
                  </div>
                </div>

                <div className="h-[440px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 24, right: 24, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#ffffff12"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="epoch"
                        stroke="#ffffff40"
                        tick={{ fill: "#ffffff55", fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: "#ffffff18" }}
                      />

                      <YAxis
                        stroke="#ffffff40"
                        tick={{ fill: "#ffffff55", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        domain={
                          selectedMetric.better === "higher"
                            ? [0, 1]
                            : ["auto", "auto"]
                        }
                      />

                      <Tooltip
                        contentStyle={{
                          background: "rgba(8, 10, 9, 0.96)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "14px",
                          color: "#ffffff",
                          boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
                        }}
                        labelStyle={{ color: "#ffffff" }}
                        itemStyle={{ color: "#ffffff" }}
                      />

                      <Legend
                        wrapperStyle={{
                          color: "#ffffff70",
                          fontSize: "12px",
                        }}
                      />

                      {runs.map((run) => (
                        <Line
                          key={run.id}
                          type="monotone"
                          dataKey={run.id}
                          name={`${run.shortName} (${run.images} images)`}
                          stroke={colors[run.id]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                          connectNulls
                        />
                      ))}

                      {bestPoints.map(({ run, epoch, value }) => (
                        <ReferenceDot
                          key={`${run.id}-${selectedMetric.column}`}
                          x={epoch}
                          y={value}
                          r={5}
                          fill={colors[run.id]}
                          stroke="#050706"
                          strokeWidth={2}
                          label={{
                            value: value.toFixed(3),
                            position: "top",
                            fill: "#ffffff99",
                            fontSize: 11,
                          }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {bestPoints.map(({ run, epoch, value }) => (
                  <div
                    key={run.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/40">{run.name}</p>
                      <span className="h-2 w-2 rounded-full bg-white/60" />
                    </div>

                    <p className="mt-5 text-3xl font-medium tracking-tight">
                      {value.toFixed(3)}
                    </p>

                    <p className="mt-2 text-sm text-white/40">
                      Best {selectedMetric.label} at epoch {epoch}
                    </p>

                    <div className="mt-5 border-t border-white/10 pt-4 text-xs text-white/30">
                      {run.images} training images
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <AnnotationStory />
          <TrackingSection />

          <div id="explorer" className="scroll-mt-24">
            <FishTimeExplorer />
          </div>

          <BrandFooter />
        </div>
      </section>
    </main>
  );
}

function LandingHero({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#07110f]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={HERO_VIDEO_PATH} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/10 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/5 to-black/20" />
      <div className="pointer-events-none absolute left-1/2 top-[35%] h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-cyan-100/10 blur-[140px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-4 py-3 shadow-2xl shadow-black/10 backdrop-blur-xl sm:px-5">
          <a
            href="#"
            className="flex min-w-0 items-center gap-3"
            aria-label="SmartBay home"
          >
            

            <span className="hidden h-5 w-px bg-white/15 sm:block" />

            
          </a>

          <div className="hidden items-center gap-8 text-sm text-white/65 md:flex">
            <button
              type="button"
              onClick={onExplore}
              className="transition hover:text-white"
            >
              Research
            </button>

            <a href="#tracking" className="transition hover:text-white">
              Tracking
            </a>

            <a href="#explorer" className="transition hover:text-white">
              Explorer
            </a>
          </div>

          <button
            type="button"
            onClick={onExplore}
            className="shrink-0 rounded-full border border-white/15 bg-white px-4 py-2 text-xs font-medium text-black transition hover:scale-[1.02] hover:bg-white/90 sm:text-sm"
          >
            View project
          </button>
        </nav>

        <div className="flex flex-1 items-center py-20 sm:py-28">
          <div className="max-w-5xl">
            

            <h1 className="max-w-5xl text-balance text-5xl font-medium leading-[0.97] tracking-[-0.055em] text-white sm:text-7xl lg:text-[96px]">
              Seeing beneath
              <span className="block text-white/55">the surface.</span>
            </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
  Applying machine learning to underwater video to identify, track,
  and better understand marine populations.
</p>

{/* Branding */}
<div className="mt-10 flex flex-wrap items-center gap-8">
  <Image
    src="/logos/SmartBay-Brand-1.jpg"
    alt="SmartBay"
    width={150}
    height={45}
    className="h-9 w-auto object-contain opacity-90 transition hover:opacity-100"
    priority
  />

  <div className="h-8 w-px bg-white/15" />

  <Image
    src="/logos/marine-institute.jpg"
    alt="Marine Institute"
    width={180}
    height={45}
    className="h-9 w-auto object-contain opacity-80 transition hover:opacity-100"
    priority
  />

  <div className="hidden h-8 w-px bg-white/15 lg:block" />

  <div className="hidden lg:block">
    <p className="text-xs uppercase tracking-[0.25em] text-white/35">
    Project by
    </p>
    <p className="mt-1 text-sm font-medium text-white/80">
      Roan Bradley
    </p>
  </div>
</div>

<div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"></div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onExplore}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition duration-300 hover:scale-[1.02] hover:bg-white/90"
              >
                Explore the research
                <ArrowDownRightIcon />
              </button>

              <div className="flex items-center gap-3 px-2 py-2 text-sm text-white/55">
                <span className="h-px w-8 bg-white/25" />
                YOLO-based species detection
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pb-3">
          <button
            type="button"
            onClick={onExplore}
            className="group hidden items-center gap-3 text-sm text-white/60 transition hover:text-white sm:flex"
          >
            Scroll to explore

            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-md transition group-hover:translate-y-1">
              <ArrowDownIcon />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

function TrackingSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    function checkVideoReady() {
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        setVideoReady(true);
        setVideoError(false);
      }
    }

    checkVideoReady();

    const timeout = window.setTimeout(() => {
      checkVideoReady();
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  function handleVideoReady() {
    setVideoReady(true);
    setVideoError(false);
  }

  function handleVideoError(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;

    console.error(
      "Tracking video failed to load:",
      {
        error: video.error,
        networkState: video.networkState,
        readyState: video.readyState,
        currentSrc: video.currentSrc,
      },
      TRACKING_VIDEO_PATH,
    );

    setVideoReady(false);
    setVideoPlaying(false);
    setVideoError(true);
  }

  async function toggleVideo() {
    const video = videoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.error("Could not control tracking video:", error);
    }
  }

  return (
    <section
      id="tracking"
      className="mt-8 scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.025] p-4 md:p-7"
    >
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/30">
            Live detection
          </p>

          <h2 className="max-w-3xl text-2xl font-medium tracking-tight text-white md:text-4xl">
            Real-time fish detection and tracking
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
            Investigating how object detection and tracking can support marine
            monitoring in dynamic underwater environments.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          Tracking demonstration
        </span>
      </div>

      <div className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#080b0a]">
        {!videoReady && !videoError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#080b0a]">
            <div className="flex items-center gap-3 text-sm text-white/40">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white/60" />
              Loading tracking video
            </div>
          </div>
        )}

        {videoError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#080b0a] px-6 text-center">
            <div>
              <p className="text-base font-medium text-white">
                The tracking video could not be loaded
              </p>

              <p className="mt-2 max-w-lg text-sm leading-6 text-white/40">
                Confirm that the file exists at{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/70">
                  public/videos/fish_tracking2.mp4
                </code>
                . The filename and capitalization must match exactly.
              </p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          controls
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedMetadata={handleVideoReady}
          onLoadedData={handleVideoReady}
          onCanPlay={handleVideoReady}
          onCanPlayThrough={handleVideoReady}
          onPlaying={() => {
            setVideoReady(true);
            setVideoPlaying(true);
          }}
          onWaiting={() => setVideoPlaying(false)}
          onPause={() => setVideoPlaying(false)}
          onEnded={() => setVideoPlaying(false)}
          onError={handleVideoError}
        >
          <source src={TRACKING_VIDEO_PATH} type="video/mp4" />
          Your browser does not support HTML video.
        </video>

        {videoReady && !videoPlaying && (
          <button
            type="button"
            onClick={toggleVideo}
            aria-label="Play tracking video"
            className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-black/60"
          >
            <PlayIcon />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
        <p>Object detection and multi-frame tracking demonstration</p>
        <p>Source: underwater monitoring footage</p>
      </div>
    </section>
  );
}

function BrandFooter() {
  return (
    <>
      <div className="mt-24 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />

      <footer className="py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <LogoImage
              src={SMARTBAY_LOGO_PATH}
              alt="SmartBay"
              width={150}
              height={50}
              className="h-9 w-auto object-contain sm:h-10"
            />

            <div className="hidden h-10 w-px bg-white/10 sm:block" />

            <LogoImage
              src={MARINE_INSTITUTE_LOGO_PATH}
              alt="Marine Institute"
              width={170}
              height={55}
              className="h-9 w-auto object-contain sm:h-10"
            />
          </div>

          <div className="max-w-lg">
            <p className="text-sm font-medium text-white">
              SmartBay Marine Population Monitoring
            </p>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Applying computer vision and machine learning to underwater
              imagery for marine species identification, tracking, and
              population analysis.
            </p>
          </div>

          <div className="text-left lg:text-right">
            <p className="text-sm text-white/60">Designed &amp; developed by</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-white">
              Roan Bradley
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/30">
              © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

function LogoImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-sm font-semibold tracking-tight text-white">
        {alt}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

function ResultsLoadingState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]">
      <div className="flex items-center gap-3 text-sm text-white/40">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white/60" />
        Loading model results
      </div>
    </div>
  );
}

function ResultsErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-red-400/20 bg-red-400/[0.04] px-6 text-center">
      <div>
        <p className="font-medium text-white">
          The model results could not be loaded
        </p>

        <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
          {message}
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p className="mt-3 truncate text-xl font-medium tracking-tight text-white md:text-2xl">
        {value}
      </p>
    </div>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5V19M12 19L6.5 13.5M12 19L17.5 13.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDownRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 7H17V17M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="ml-0.5 h-6 w-6"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.5 6.5V17.5L17 12L8.5 6.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}