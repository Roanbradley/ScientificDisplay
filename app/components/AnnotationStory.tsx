"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DATASET_ONE_ANNOTATIONS = 7030;
const DATASET_TWO_ANNOTATIONS = 1157;

const DATASET_ONE_FRAMES = 363;
const DATASET_TWO_FRAMES = 384;

const TOTAL_ANNOTATIONS =
  DATASET_ONE_ANNOTATIONS + DATASET_TWO_ANNOTATIONS;

const ANNOTATIONS_PER_FISH = 1;
const MIN_PERCENTAGE = 1;
const MAX_PERCENTAGE = 100;
const ANNOTATIONS_PER_PERCENT = TOTAL_ANNOTATIONS / 100;

type SchoolFish = {
  x: number;
  y: number;
  rotation: number;
  opacity: number;
};

function seededValue(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IE").format(value);
}

export default function AnnotationStory() {
  const [annotationPercentage, setAnnotationPercentage] =
    useState(100);

  const visibleAnnotations = Math.round(
    (TOTAL_ANNOTATIONS * annotationPercentage) / 100
  );

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-neutral-800 bg-neutral-950">
      <div className="border-b border-neutral-800 px-5 py-5 md:px-7">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-600">
          Behind the Data
        </p>

        <h2 className="mt-2 text-2xl font-medium tracking-tight text-white md:text-3xl">
          Building the training dataset
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Every small blue dot below represents one manually created annotation.
          Use the slider to reveal between 1% and 100% of all 8,187
          annotations.
        </p>
      </div>

      <div className="p-5 md:p-7">
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-black">
          <div className="flex items-end justify-between gap-4 border-b border-neutral-900 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-600">
                Annotation school
              </p>

              <p className="mt-1 text-3xl font-medium tracking-tight text-white">
                {formatNumber(visibleAnnotations)}
                <span className="ml-2 text-base font-normal text-neutral-600">
                  of {formatNumber(TOTAL_ANNOTATIONS)}
                </span>
              </p>
            </div>

            <p className="text-right text-xs leading-5 text-neutral-600">
              One fish symbol
              <br />
              = {ANNOTATIONS_PER_FISH} annotation
            </p>
          </div>

          <FishCanvas visibleAnnotations={visibleAnnotations} />

          <div className="border-t border-neutral-900 px-5 py-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <label
                  htmlFor="annotation-percentage"
                  className="text-xs uppercase tracking-[0.25em] text-neutral-600"
                >
                  Manual annotation shown
                </label>

                <p className="mt-1 text-2xl font-medium text-white">
                  {annotationPercentage}%
                </p>
              </div>

              <p className="max-w-xs text-right text-xs leading-5 text-neutral-600">
                Each 1% adds about{" "}
                {ANNOTATIONS_PER_PERCENT.toFixed(2)} fish, rounded to
                the nearest whole annotation.
              </p>
            </div>

            <input
              id="annotation-percentage"
              type="range"
              min={MIN_PERCENTAGE}
              max={MAX_PERCENTAGE}
              step={1}
              value={annotationPercentage}
              onChange={(event) =>
                setAnnotationPercentage(Number(event.target.value))
              }
              aria-valuetext={`${annotationPercentage}%: ${formatNumber(
                visibleAnnotations
              )} annotations`}
              className="mt-5 h-2 w-full cursor-pointer touch-pan-x accent-sky-300"
            />

            <div className="mt-2 flex justify-between text-xs text-neutral-700">
              <span>1%</span>
              <span>50%</span>
              <span>100%</span>
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

function FishCanvas({
  visibleAnnotations,
}: {
  visibleAnnotations: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  /*
   * A jittered grid prevents thousands of fish from landing directly
   * on top of one another. Every item still represents one annotation.
   */
  const school = useMemo<SchoolFish[]>(() => {
    const targetAspectRatio = 1.45;
    const columns = Math.ceil(
      Math.sqrt(TOTAL_ANNOTATIONS * targetAspectRatio)
    );
    const rows = Math.ceil(TOTAL_ANNOTATIONS / columns);

    return Array.from(
      { length: TOTAL_ANNOTATIONS },
      (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);

        const jitterX =
          (seededValue(index * 17 + 1) - 0.5) * 0.56;
        const jitterY =
          (seededValue(index * 23 + 2) - 0.5) * 0.56;

        return {
          x: (column + 0.5 + jitterX) / columns,
          y: (row + 0.5 + jitterY) / rows,
          rotation:
            -0.32 + seededValue(index * 41 + 4) * 0.64,
          opacity:
            0.5 + seededValue(index * 53 + 5) * 0.42,
        };
      }
    );
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas) return;

    function resizeCanvas() {
      const width = container.clientWidth;
      const height = container.clientHeight;

      /*
       * Capping DPR avoids creating an unnecessarily huge canvas on
       * high-density phones while remaining sharp.
       */
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      sizeRef.current = { width, height };

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      context?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      const context = canvas.getContext("2d");
      const { width, height } = sizeRef.current;

      if (!context || width === 0 || height === 0) return;

      context.clearRect(0, 0, width, height);

      const gradient = context.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.65
      );

      gradient.addColorStop(0, "rgba(28, 79, 110, 0.20)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.fillStyle = "rgba(255, 255, 255, 0.03)";
      context.fillRect(0, Math.round(height / 2), width, 1);

      /*
       * The grid determines the maximum fish size, ensuring each fish
       * retains a visible mark even when all 8,187 are drawn.
       */
      const targetAspectRatio = 1.45;
      const columns = Math.ceil(
        Math.sqrt(TOTAL_ANNOTATIONS * targetAspectRatio)
      );
      const rows = Math.ceil(TOTAL_ANNOTATIONS / columns);
      const cellWidth = width / columns;
      const cellHeight = height / rows;

      const fishWidth = Math.max(
        1.5,
        Math.min(4.2, cellWidth * 0.76)
      );
      const fishHeight = Math.max(
        0.9,
        Math.min(2.2, cellHeight * 0.5)
      );

      for (let index = 0; index < visibleAnnotations; index += 1) {
        const fish = school[index];
        const x = fish.x * width;
        const y = fish.y * height;

        context.save();
        context.translate(x, y);
        context.rotate(fish.rotation);
        context.globalAlpha = fish.opacity;
        context.fillStyle = "rgb(186, 230, 253)";

        // Body
        context.beginPath();
        context.ellipse(
          fishWidth * 0.1,
          0,
          fishWidth * 0.36,
          fishHeight * 0.48,
          0,
          0,
          Math.PI * 2
        );
        context.fill();

        // Tail
        context.beginPath();
        context.moveTo(-fishWidth * 0.22, 0);
        context.lineTo(-fishWidth * 0.5, -fishHeight * 0.48);
        context.lineTo(-fishWidth * 0.5, fishHeight * 0.48);
        context.closePath();
        context.fill();

        context.restore();
      }

      const fade = context.createLinearGradient(
        0,
        height - 64,
        0,
        height
      );
      fade.addColorStop(0, "rgba(0, 0, 0, 0)");
      fade.addColorStop(1, "rgba(0, 0, 0, 0.7)");
      context.globalAlpha = 1;
      context.fillStyle = fade;
      context.fillRect(0, height - 64, width, 64);
    });

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [school, visibleAnnotations]);

  return (
    <div
      ref={containerRef}
      className="relative h-72 overflow-hidden md:h-96"
    >
      <canvas
        ref={canvasRef}
        aria-label={`${formatNumber(
          visibleAnnotations
        )} fish annotations displayed`}
        role="img"
        className="absolute inset-0 block"
      />
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
      <p className="text-xs text-neutral-600">{label}</p>

      <p className="mt-1 text-lg font-medium text-white">
        {formatNumber(annotations)}
      </p>

      <p className="mt-1 text-xs text-neutral-600">
        {frames} source frames
      </p>
    </div>
  );
}