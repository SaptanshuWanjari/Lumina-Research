import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "../../../components/ui/dialog";

// import { FcGoogle } from "react-icons/fc";
// import { FaGithub } from "react-icons/fa";
// import { CgFigma } from "react-icons/cg";
// import { SiLangchain } from "react-icons/si";

import Link from "next/link";
import { appRoutes } from "@/lib/app-routes";

const Hero = () => {
  return (
    <main className="px-6 pb-20 pt-8">
      <div className="mx-auto max-w-7xl space-y-24">
        <section className="relative">
          <div className="relative overflow-hidden rounded-xl bg-[#d1e5f4] px-6 py-16 sm:px-10 md:px-16 lg:min-h-[600px] lg:px-20 lg:py-20">
            <div className="relative z-10 max-w-xl space-y-6 text-center lg:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight leading-[1.05] text-black sm:text-5xl lg:text-7xl">
                Turn messy sources into{" "}
                <span className="text-black">cited decisions.</span>
              </h1>

              <p className="mx-auto max-w-lg text-base leading-relaxed text-black/80 sm:text-lg lg:mx-0 lg:text-xl">
                Ingest URLs &amp; files, run traceable LangGraph workflows, and
                publish with confidence. The intelligent workspace built for
                deep analysis.
              </p>

              <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link href={appRoutes.dashboard}>
                  <button className="w-full rounded-full bg-black px-8 py-4 text-base font-bold text-white shadow-lg transition-transform duration-150 hover:scale-95 sm:w-auto sm:text-lg">
                    Get Started
                  </button>
                </Link>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border border-black/20 bg-[#d1e5f4] px-8 py-7 text-base font-semibold sm:w-auto sm:text-lg"
                    >
                      View Demo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <video 
                      src="/demo.mp4" 
                      controls 
                      autoPlay 
                      className="w-full h-auto rounded-2xl"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Floating dashboard image (hidden on small screens) */}
            <div className="pointer-events-none absolute hidden lg:block -right-16 lg:-right-24 -bottom-10 lg:-bottom-15 w-[90%] lg:w-[58%]">
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
