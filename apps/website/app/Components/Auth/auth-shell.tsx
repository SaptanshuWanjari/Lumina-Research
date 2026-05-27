import Link from "next/link";
import { BsGithub, BsGoogle } from "react-icons/bs";

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
import { appRoutes } from "@/lib/app-routes";

type AuthVariant = "login" | "signup";

type AuthShellProps = {
  variant: AuthVariant;
};

export default async function AuthShell({
  variant,
  searchParams,
}: AuthShellProps & {
  searchParams?: Promise<{
    error?: string | string[];
    redirectTo?: string | string[];
  }>;
}) {
  const isLogin = variant === "login";
  const params = searchParams ? await searchParams : undefined;
  const error = Array.isArray(params?.error) ? params?.error[0] : params?.error;
  const redirectTo = Array.isArray(params?.redirectTo)
    ? params?.redirectTo[0]
    : params?.redirectTo;
  const oauthLink = (provider: "google" | "github") => {
    const query = new URLSearchParams({ provider });
    if (redirectTo) {
      query.set("redirectTo", redirectTo);
    }
    return `/auth/oauth?${query.toString()}`;
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fafbfc]">
      <div className="relative mx-auto w-full">
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="text-xl font-semibold text-slate-900">
              Lumina Research
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={isLogin ? "/signup" : "/login"}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {isLogin ? "Create Account" : "Sign In"}
              </Link>
              <Link
                href={appRoutes.dashboard}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Open App
              </Link>
            </div>
          </div>
        </header>

        <section className="grid min-h-180 grid-cols-3 items-center gap-10 px-3 py-8 lg:grid-cols-[1.05fr_1fr] lg:px-10 lg:py-14">
          <div className="relative">
            <Card className="mx-auto w-full max-w-117.5 col-span-2 gap-0 rounded-[13px] border border-slate-200 bg-white py-0 shadow-lg">
              <CardHeader className="px-6 pb-0 pt-8 sm:px-10 sm:pt-10">
                <CardTitle className="text-4xl font-bold leading-tight tracking-tight text-slate-900">
                  {isLogin ? "Welcome back" : "Create account"}
                </CardTitle>
                <p className="mt-3 text-sm text-slate-600">
                  {isLogin
                    ? "Sign in to continue your local research workflow."
                    : "Create your local analyst account to save settings and runs."}
                </p>
              </CardHeader>

              <CardContent className="px-6 pb-0 pt-6 sm:px-10">
                {error ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    asChild
                    variant="outline"
                    className="h-11 cursor-pointer rounded-lg border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <a href={oauthLink("google")}>
                      <BsGoogle size={18} />
                      Google
                    </a>
                  </Button>
                  <Button
                    type="button"
                    asChild
                    variant="outline"
                    className="h-11 cursor-pointer rounded-lg border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <a href={oauthLink("github")}>
                      <BsGithub size={18} />
                      GitHub
                    </a>
                  </Button>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-medium text-slate-500">
                    Or use email
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <form
                  className="mt-6 space-y-4"
                  action={isLogin ? "/auth/login" : "/auth/signup"}
                  method="post"
                >
                  {redirectTo ? (
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                  ) : null}
                  {!isLogin && (
                    <div>
                      <Label
                        htmlFor="full-name"
                        className="text-sm font-medium text-slate-700"
                      >
                        Full name
                      </Label>
                      <Input
                        id="full-name"
                        name="fullName"
                        type="text"
                        placeholder="Jane Doe"
                        className="mt-1.5 h-11 rounded-lg border-slate-200 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                      />
                    </div>
                  )}

                  <div>
                    <Label
                      htmlFor="work-email"
                      className="text-sm font-medium text-slate-700"
                    >
                      Email
                    </Label>
                      <Input
                        id="work-email"
                        name="email"
                        type="email"
                        placeholder="name@gmail.com"
                      className="mt-1.5 h-11 rounded-lg border-slate-200 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700"
                    >
                      Password
                    </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter password"
                      className="mt-1.5 h-11 rounded-lg border-slate-200 bg-slate-50 px-4 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-lg bg-slate-900 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  >
                    {isLogin ? "Continue with Email" : "Create Account"}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="block px-6 pb-8 pt-6 sm:px-10 sm:pb-10">
                <p className="text-center text-sm text-slate-600">
                  {isLogin ? "Need an account? " : "Already have an account? "}
                  <Link
                    href={isLogin ? "/signup" : "/login"}
                    className="font-semibold text-slate-900 underline hover:text-slate-700"
                  >
                    {isLogin ? "Create one" : "Sign in"}
                  </Link>
                </p>

                <div className="mt-8 flex items-center justify-center gap-6 text-xs font-medium text-slate-500">
                  <Link
                    href="#"
                    className="cursor-pointer hover:text-slate-900 hover:underline"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="#"
                    className="cursor-pointer hover:text-slate-900 hover:underline"
                  >
                    Terms
                  </Link>
                  <Link
                    href="#"
                    className="cursor-pointer hover:text-slate-900 hover:underline"
                  >
                    Status
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="relative mx-auto hidden w-full max-w-145 lg:block">
            <div className="relative rounded-[13px] border border-slate-800 bg-slate-900 p-10 text-white shadow-xl">
              <div className="mx-auto mt-8 flex size-20 items-center justify-center rounded-full border border-white/20 bg-white/5 text-2xl font-semibold">
                ⦿
              </div>

              <p className="mt-10 text-center text-xs font-semibold tracking-widest text-slate-400">
                Analyst Insight
              </p>
              <h2 className="mt-4 text-balance text-center text-5xl font-semibold leading-tight tracking-tight">
                Augmenting the future of financial research.
              </h2>
              <p className="mx-auto mt-6 max-w-md text-center text-base leading-relaxed text-slate-300">
                Decode market sentiment and quantitative data with intelligence
                in real-time.
              </p>
            </div>

            {/* <div className="absolute -bottom-8 -left-10 w-60 rounded-xl border border-slate-200 bg-white p-5 text-slate-700 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Sparkles className="size-4" />
                Metric
              </div>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                99.8% Accuracy
              </p>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div className="h-full w-[92%] rounded-full bg-slate-900" />
              </div>
            </div> */}
          </div>
        </section>
      </div>
    </main>
  );
}
