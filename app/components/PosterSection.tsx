import Image from "next/image";

export default function PosterSection() {
  return (
    <section
      id="poster"
      className="mt-24 border-t border-white/10 pt-20"
    >
      {/* Heading */}
      <div className="mb-10">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/30">
          Research Poster
        </p>

        <h2 className="max-w-4xl text-4xl font-medium tracking-[-0.045em] text-white md:text-6xl">
          The project at a glance.
        </h2>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45 md:text-base">
          A visual summary of the SmartBay computer vision project, covering
          data annotation, model development, ecological monitoring and the
          wider research workflow.
        </p>
      </div>

      {/* Poster container */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">

        {/* Poster image */}
        <a
          href="/logos/poster.jpg"
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className="relative bg-black/20 p-3 md:p-6">
            <Image
              src="/logos/poster.jpg"
              alt="SmartBay computer vision research poster"
              width={1800}
              height={1273}
              className="h-auto w-full rounded-2xl object-contain transition-transform duration-500 group-hover:scale-[1.005]"
            />

            {/* Hover overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
              <div className="rounded-full border border-white/20 bg-black/60 px-5 py-2.5 text-sm text-white backdrop-blur-md">
                View full size ↗
              </div>
            </div>
          </div>
        </a>

        {/* Bottom information */}
        <div className="flex flex-col gap-6 border-t border-white/10 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-lg font-medium text-white">
              SmartBay Research Poster
            </p>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/35">
              Open the poster in full resolution to explore the project
              methodology, model development and research outcomes.
            </p>
          </div>

          <a
            href="/logos/poster.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-all duration-200 hover:bg-white/90"
          >
            View full poster
            <span className="ml-2">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}