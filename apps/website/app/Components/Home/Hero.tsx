import Image from "next/image";
import { Button } from "../../../components/ui/button";

// import { FcGoogle } from "react-icons/fc";
// import { FaGithub } from "react-icons/fa";
// import { CgFigma } from "react-icons/cg";
// import { SiLangchain } from "react-icons/si";

import Link from "next/link";
import { appRoutes } from "@/lib/app-routes";

const Hero = () => {
  return (
    <main className="pt-8 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        <section className="relative">
          <div className="relative overflow-hidden rounded-xl bg-[#d1e5f4] min-h-[600px] px-12 py-20 md:px-20">
            <div className="relative z-10 max-w-xl space-y-8">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-black">
                Turn messy sources into{" "}
                <span className="text-black">cited decisions.</span>
              </h1>

              <p className="max-w-lg text-lg md:text-xl leading-relaxed opacity-90 text-black/80">
                Ingest URLs &amp; files, run traceable LangGraph workflows, and
                publish with confidence. The intelligent workspace built for
                deep analysis.
              </p>

              <div className="flex items-center gap-4 pt-4">
                <Link href={appRoutes.dashboard}>
                  <button className="rounded-full bg-black px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform duration-150 hover:scale-95">
                    Get Started
                  </button>
                </Link>

                <Link href={appRoutes.dashboard}>
                  <Button
                    variant="outline"
                    className="rounded-full border border-black/20 bg-[#d1e5f4] px-8 py-7 text-lg font-semibold"
                  >
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Floating dashboard image */}
            <div className="pointer-events-none absolute -right-16 md:-right-24 -bottom-10 md:-bottom-15 w-[90%] md:w-[58%]">
              <div className="rotate-[-4deg] rounded-[2rem] border border-black/5 bg-white p-4 shadow-2xl">
                <Image
                  src="/hero.png"
                  alt="Data dashboard interface"
                  width={1200}
                  height={800}
                  priority
                  className="h-auto w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>

          {/* Logos */}
          {/* <div className="mt-12 flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale transition-all duration-500 hover:grayscale-0"> */}
          {/*   <div className="flex items-center gap-2"> */}
          {/*     <FcGoogle */}
          {/*       className="h-8 w-8" */}
          {/*       strokeWidth={2} */}
          {/*       aria-hidden="true" */}
          {/*     /> */}
          {/*     <span className="text-xl font-bold">Google</span> */}
          {/*   </div> */}
          {/**/}
          {/*   <div className="flex items-center gap-2"> */}
          {/*     <FaGithub */}
          {/*       className="h-8 w-8" */}
          {/*       strokeWidth={2} */}
          {/*       aria-hidden="true" */}
          {/*     /> */}
          {/*     <span className="text-xl font-bold">GitHub</span> */}
          {/*   </div> */}
          {/**/}
          {/*   <div className="flex items-center gap-2"> */}
          {/*     <CgFigma className="h-8 w-8" strokeWidth={1} aria-hidden="true" /> */}
          {/*     <span className="text-xl font-bold">Figma</span> */}
          {/*   </div> */}
          {/*   <div className="flex items-center gap-2"> */}
          {/*     <SiLangchain */}
          {/*       className="h-12 w-12" */}
          {/*       aria-hidden="true" */}
          {/*     /> */}
          {/*     <span className="text-xl font-bold">Langchain</span> */}
          {/*   </div> */}
          {/* </div> */}
        </section>
      </div>
    </main>
  );
};

export default Hero;
