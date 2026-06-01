import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7fa] px-6 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-6xl font-extrabold tracking-tight text-black sm:text-8xl">
          404
        </h1>
        <h2 className="text-2xl font-bold tracking-tight text-black sm:text-4xl">
          Page not found
        </h2>
        <p className="mx-auto max-w-lg text-base leading-relaxed text-black/80 sm:text-lg">
          Sorry, we couldn't find the page you're looking for. It might have
          been removed or the link might be broken.
        </p>
        <div className="pt-8">
          <Link href="/">
            <Button className="rounded-full bg-black px-8 py-6 text-base font-bold text-white shadow-lg transition-transform duration-150 hover:scale-95">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
