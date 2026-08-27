"use client";

const modelResults = [
  {
    name: "Model A",
    subtitle: "Original external imagery",
    map50: 0.2297,
  },
  {
    name: "Model B",
    subtitle: "100% SmartBay augmented",
    map50: 0.3178,
  },
  {
    name: "Model C",
    subtitle: "50% original / 50% augmented",
    map50: 0.1480,
  },
];

const ablationResults = [
  {
    name: "Hardware",
    drop: 46.1,
    map50: 0.1713,
    metrics: "Brightness, contrast, RGB balance, saturation",
  },
  {
    name: "Image Quality",
    drop: 25.8,
    map50: 0.2359,
    metrics: "Sharpness, noise",
  },
  {
    name: "Water",
    drop: 20.2,
    map50: 0.2536,
    metrics: "Attenuation, haze, backscatter",
  },
  {
    name: "Environment",
    drop: 14.6,
    map50: 0.2714,
    metrics: "Particle density",
  },
];

export default function AugmentationExperiment() {
  const maxMap50 = Math.max(...modelResults.map((item) => item.map50));
  const maxDrop = Math.max(...ablationResults.map((item) => item.drop));

  return (
    <section
      id="augmentation"
      className="mt-24 scroll-mt-24 border-t border-white/10 pt-20"
    >
      {/* HEADER */}
      <div className="mb-12">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/30">
          Domain augmentation experiment
        </p>

        <h2 className="max-w-4xl text-4xl font-medium tracking-[-0.045em] text-white md:text-6xl">
          Can external fish imagery be adapted to SmartBay conditions?
        </h2>

        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/45 md:text-base">
          A controlled experiment used 96 annotated external{" "}
          <em>Trachurus trachurus</em> training images and evaluated each model
          against the same 100 annotated SmartBay test frames.
        </p>
      </div>

      {/* HEADLINE RESULT */}
      <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Strongest result
            </p>

            <h3 className="mt-3 text-3xl font-medium tracking-tight text-white md:text-4xl">
              Full SmartBay augmentation performed best
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
              Model B was trained entirely on SmartBay-profile augmented
              versions of the external imagery and achieved the strongest
              performance on real SmartBay footage.
            </p>
          </div>

          <div className="shrink-0 lg:text-right">
            <p className="text-5xl font-medium tracking-[-0.05em] text-white md:text-6xl">
              +38.4%
            </p>

            <p className="mt-2 text-sm text-white/35">
              relative improvement in mAP50
            </p>

            <p className="mt-1 text-xs text-white/25">
              0.2297 → 0.3178
            </p>
          </div>
        </div>
      </div>

      {/* A / B / C */}
      <div className="mb-16">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Training comparison
            </p>

            <h3 className="mt-2 text-2xl font-medium tracking-tight text-white md:text-3xl">
              Original vs augmented training
            </h3>
          </div>

          <p className="text-sm text-white/30">
            Headline metric: mAP50 on real SmartBay imagery
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {modelResults.map((result) => {
            const width = (result.map50 / maxMap50) * 100;
            const best = result.name === "Model B";

            return (
              <div
                key={result.name}
                className={`rounded-3xl border p-6 ${
                  best
                    ? "border-white/25 bg-white/[0.07]"
                    : "border-white/10 bg-white/[0.025]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">
                    {result.name}
                  </p>

                  {best && (
                    <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                      Best
                    </span>
                  )}
                </div>

                <p className="mt-2 min-h-10 text-sm leading-5 text-white/35">
                  {result.subtitle}
                </p>

                <p className="mt-7 text-4xl font-medium tracking-tight text-white">
                  {result.map50.toFixed(4)}
                </p>

                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/25">
                  mAP50
                </p>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-white/70"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ABLATION */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 md:p-8">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-white/30">
            Ablation analysis
          </p>

          <h3 className="mt-2 text-2xl font-medium tracking-tight text-white md:text-4xl">
            Which augmentation layers mattered most?
          </h3>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/40">
            Each layer was removed individually from the full Model B pipeline.
            A larger fall in mAP50 means performance deteriorated more when that
            layer was removed.
          </p>
        </div>

        <div className="space-y-8">
          {ablationResults.map((layer, index) => {
            const width = (layer.drop / maxDrop) * 100;

            return (
              <div
                key={layer.name}
                className="grid gap-4 border-b border-white/[0.07] pb-8 last:border-b-0 last:pb-0 md:grid-cols-[190px_1fr_120px]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/20">
                      0{index + 1}
                    </span>

                    <p className="font-medium text-white">
                      {layer.name}
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-white/30">
                    {layer.metrics}
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-white/65"
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-white/25">
                    <span>mAP50 after removal: {layer.map50.toFixed(4)}</span>
                    <span>Full model: 0.3178</span>
                  </div>
                </div>

                <div className="md:text-right">
                  <p className="text-2xl font-medium tracking-tight text-white">
                    −{layer.drop}%
                  </p>

                  <p className="mt-1 text-xs text-white/25">
                    relative mAP50
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LAYER EXPLANATION */}
      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <LayerCard
          title="Hardware"
          text="Brightness, contrast, RGB balance and saturation."
        />

        <LayerCard
          title="Image Quality"
          text="Sharpness and image noise."
        />

        <LayerCard
          title="Water"
          text="Attenuation, haze and backscatter."
        />

        <LayerCard
          title="Environment"
          text="Suspended particle density."
        />
      </div>

      {/* CONCLUSION */}
      <div className="mt-12 border-l border-white/20 pl-6 md:pl-8">
        <p className="text-xs uppercase tracking-[0.25em] text-white/30">
          Main finding
        </p>

        <p className="mt-3 max-w-4xl text-xl leading-9 text-white/80 md:text-2xl">
          Fully augmenting the external imagery produced the strongest transfer
          to SmartBay footage. Removing the{" "}
          <span className="font-medium text-white">Hardware layer</span> caused
          the largest performance loss, followed by image quality, water and
          environment.
        </p>

        <p className="mt-5 max-w-3xl text-sm leading-6 text-white/30">
          Small-scale proof of concept using one target species and a limited
          external training dataset. The results indicate useful trends rather
          than definitive causal effects.
        </p>
      </div>
    </section>
  );
}

function LayerCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-sm font-medium text-white">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-white/35">
        {text}
      </p>
    </div>
  );
}