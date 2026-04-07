import Image from "next/image";
import { Cloud, Code2, Terminal } from "lucide-react";
import { Button } from "../../../components/ui/button";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { CgFigma } from "react-icons/cg";
import { SiStripe } from "react-icons/si";
import Link from "next/link";
import { appRoutes } from "@/lib/mock-app";

const Hero = () => {
  return (
    <main className="pt-8 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-24">
        <section className="relative">
          <div className="bg-secondary-container bg-[#d1e5f4] rounded-xl p-12 md:p-20 overflow-hidden relative min-h-[600px] flex flex-col justify-center">
            <div className="max-w-2xl relative z-10 space-y-8">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1]">
                Turn messy sources into
                <span className="text-primary-dim">cited decisions.</span>
              </h1>
              <p className="text-lg md:text-xl text-on-secondary-container leading-relaxed opacity-90 max-w-xl">
                Ingest URLs &amp; files, run traceable LangGraph workflows, and
                publish with confidence. The intelligent workspace built for
                deep analysis.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Link href={appRoutes.dashboard}>
                  <button className="bg-black text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:scale-95 transition-transform duration-150">
                    Get Started
                  </button>
                </Link>
                <Link href={appRoutes.dashboard}>
                  <Button
                    variant="outline"
                    className="px-8 py-7 border rounded-full text-lg font-semibold text-primary bg-[#d1e5f4]"
                  >
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute -right-20 bottom-0 md:bottom-12 w-full md:w-3/5 pointer-events-none translate-y-12">
              <div className="bg-white rounded-4xl ambient-glow p-4 rotate-[-4deg] translate-y-8 translate-x-4 border border-outline-variant/10">
                <Image
                  height={400}
                  width={600}
                  alt="Data dashboard interface"
                  className="rounded-lg shadow-sm"
                  data-alt="Modern high-fidelity SaaS dashboard interface showing complex financial charts and AI analysis nodes in soft pastel tones"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVEtKBsnnssrJfTcfAilMCTKbqwgd37xP9tUc5A2Xs1KbTHKxatQVPSQfzbFW0Uizw83XWzRiD8VjjYb4lGOyDMFz_t4dGux16GAA-xo090VQtn2eMssC_a67avg-878QJgVKl5hfhFCkYBcfyMrAeSw0YBIVXqvNivWbbNmEmS4OlZ6M9iUD0KqEPUdY4dUT-LwBaYybTGlDxOhe18riJUxl54G3ORPb5DDeuzNqRFHAdA_favSDq7NgEKfLbrXI7J8uPk43NbXW0"
                />
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <FcGoogle
                className="h-8 w-8"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="font-bold text-xl">Google</span>
            </div>
            <div className="flex items-center gap-2">
              <FaGithub
                className="h-8 w-8"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="font-bold text-xl">GitHub</span>
            </div>
            <div className="flex items-center gap-2">
              <CgFigma className="h-8 w-8" strokeWidth={2} aria-hidden="true" />
              <span className="font-bold text-xl">Figma</span>
            </div>
            <div className="flex items-center gap-2">
              <SiStripe className="h-8 w-8" strokeWidth={2} aria-hidden="true" />
              <span className="font-bold text-xl">Stripe</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Hero;
