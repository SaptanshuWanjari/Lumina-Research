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
import { LogoIcon } from "../Common/LogoIcon";

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
            <Link
              href="/"
              className="text-xl font-semibold text-slate-900 items-cenitems-center gap-2"
            >
              <LogoIcon className="inline size-6 text-slate-900" />
              Lumina Research
            </Link>
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
          <div className="relative mx-auto hidden w-full max-w-155 lg:block">
            <div className="relative overflow-hidden rounded-[20px] border border-zinc-800 bg-black px-10 py-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
              {/* Main */}
              <div className="relative z-10 mt-10">
                <h2 className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-tight text-white">
                  Research across documents, APIs, and workflows.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">
                  Connect PDFs, websites, embeddings, and automation pipelines
                  to generate structured AI research with citations and
                  retrieval.
                </p>
              </div>

              {/* Features */}
              <div className="relative z-10 mt-8 grid grid-cols-2 gap-3">
                {[
                  "Semantic Search",
                  "PDF Analysis",
                  "Agentic Research",
                  "n8n Automation",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-zinc-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
