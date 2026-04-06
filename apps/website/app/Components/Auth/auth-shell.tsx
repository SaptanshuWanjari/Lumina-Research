import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BsGithub, BsGoogle } from "react-icons/bs";

import NavBar from "@/app/Components/Navigation/NavBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthVariant = "login" | "signup";

type AuthShellProps = {
  variant: AuthVariant;
};

export default function AuthShell({ variant }: AuthShellProps) {
  const isLogin = variant === "login";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] ">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.95),transparent_45%),radial-gradient(circle_at_100%_20%,rgba(217,229,241,0.9),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.9),transparent_45%)]" />

      <div className="relative mx-auto w-full p-2 shadow-[0_25px_80px_-45px_rgba(10,16,26,0.45)] backdrop-blur-xl">
        <NavBar />

        <section className="grid min-h-[720px] grid-cols-1 items-center gap-10 px-3 py-8 lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:py-14">
          <div className="relative">
            <Card className="mx-auto w-full max-w-[470px] gap-0 rounded-[38px] border border-white/85 bg-white/88 py-0 shadow-[0_18px_70px_-38px_rgba(15,27,48,0.4)]">
              <CardHeader className="px-6 pb-0 pt-6 sm:px-10 sm:pt-10">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#edf1f7] text-slate-600">
                  <Sparkles className="size-5" />
                </span>
                <CardTitle className="mt-6 text-4xl font-bold tracking-tight text-slate-900">
                  {isLogin ? "Welcome back" : "Create account"}
                </CardTitle>
                <p className="mt-2 text-base text-slate-500">
                  {isLogin
                    ? "Precision intelligence for the modern workspace."
                    : "Set up your workspace for modern research intelligence."}
                </p>
              </CardHeader>

              <CardContent className="px-6 pb-0 pt-8 sm:px-10">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 cursor-pointer rounded-full border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                  >
                    <BsGoogle size={18} />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 cursor-pointer rounded-full border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-900"
                  >
                    <BsGithub size={18} />
                    GitHub
                  </Button>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Or use email
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <form className="mt-8 space-y-5">
                  {!isLogin && (
                    <div>
                      <Label
                        htmlFor="full-name"
                        className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                      >
                        Full name
                      </Label>
                      <Input
                        id="full-name"
                        type="text"
                        placeholder="Jane Doe"
                        className="mt-2 h-12 rounded-full border-slate-200 bg-[#f5f7fb] px-5 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-0"
                      />
                    </div>
                  )}

                  <div>
                    <Label
                      htmlFor="work-email"
                      className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                    >
                      Work email
                    </Label>
                    <Input
                      id="work-email"
                      type="email"
                      placeholder="name@company.com"
                      className="mt-2 h-12 rounded-full border-slate-200 bg-[#f5f7fb] px-5 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-0"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="password"
                      className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      className="mt-2 h-12 rounded-full border-slate-200 bg-[#f5f7fb] px-5 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-0"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full bg-[#040912] text-sm font-medium text-white hover:bg-[#111a29]"
                  >
                    {isLogin ? "Continue with Email" : "Create Account"}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="block px-6 pb-6 pt-8 sm:px-10 sm:pb-10">
                <p className="text-center text-sm text-slate-500">
                  {isLogin ? "Don't have a workspace? " : "Already have an account? "}
                  <Link
                    href={isLogin ? "/signup" : "/login"}
                    className="font-semibold underline text-slate-900"
                  >
                    {isLogin ? "Create one" : "Sign in"}
                  </Link>
                </p>

                <div className="mt-10 flex items-center justify-center gap-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  <Link href="#" className='cursor-pointer hover:underline'>Privacy</Link>
                  <Link href="#" className='cursor-pointer hover:underline'>Terms</Link>
                  <Link href="#" className='cursor-pointer hover:underline'>Status</Link>
                </div>  
              </CardFooter>
            </Card>
          </div>

          <div className="relative mx-auto hidden w-full max-w-145 lg:block">
            <div className="absolute -right-5 top-6 size-28 rounded-full border border-slate-300/70" />

            <div className="relative rounded-[42px] border border-[#1f2a3b] bg-[radial-gradient(circle_at_50%_35%,#162940_0%,#090e16_58%,#05080f_100%)] p-10 text-white shadow-[0_40px_100px_-60px_rgba(4,12,24,0.8)]">
              <div className="mx-auto mt-8 flex size-24 items-center justify-center rounded-full border border-white/30 bg-white/8 text-3xl font-semibold">
                ⦿
              </div>

              <p className="mt-10 text-center text-xs font-semibold tracking-[0.34em] text-slate-300">
                ANALYST INSIGHT
              </p>
              <h2 className="mt-4 text-balance text-center text-5xl font-semibold leading-[1.02] tracking-tight">
                Augmenting the future of financial research.
              </h2>
              <p className="mx-auto mt-6 max-w-md text-center text-base text-slate-300/90">
                Decode market sentiment and quantitative data with intelligence
                in real-time.
              </p>
            </div>

            <div className="absolute -bottom-8 -left-10 w-60 rounded-3xl border border-[#d2deec] bg-[#d9e7f5]/95 p-5 text-slate-700 shadow-[0_30px_60px_-45px_rgba(20,45,74,0.9)] backdrop-blur">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                <Sparkles className="size-3.5" />
                Metric
              </div>
              <p className="mt-3 text-xl font-semibold text-slate-800">
                99.8% Accuracy
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-slate-400/35">
                <div className="h-full w-[92%] rounded-full bg-slate-600" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
