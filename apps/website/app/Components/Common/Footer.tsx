import Link from "next/link";
import { LogoIcon } from "../Common/LogoIcon";

import { Copyright } from "lucide-react";
const Footer = () => {
  return (
    <footer className="border-t border-zinc-200/60 bg-white px-6 py-14">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
          {/* Brand */}
          <div className="max-w-sm space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <LogoIcon className="w-8 h-8 text-zinc-900 shrink-0" />

              <span className="text-xl font-black tracking-tight text-zinc-900">
                Lumina Research
              </span>
            </Link>

            <p className="text-sm leading-7 text-zinc-500">
              The intelligent workspace for deep agentic research, document
              analysis, and automated reasoning workflows.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-12 text-sm">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">
                Product
              </h3>

              <div className="space-y-3 text-zinc-500">
                <Link
                  href="/dashboard"
                  className="block hover:text-zinc-900 transition-colors"
                >
                  Dashboard
                </Link>

                <Link
                  href="/cases"
                  className="block hover:text-zinc-900 transition-colors"
                >
                  Cases
                </Link>

                <Link
                  href="/reports"
                  className="block hover:text-zinc-900 transition-colors"
                >
                  Reports
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">
                Platform
              </h3>

              <div className="space-y-3 text-zinc-500">
                <Link
                  href="/integrations"
                  className="block hover:text-zinc-900 transition-colors"
                >
                  Integrations
                </Link>

                <Link
                  href="https://github.com/SaptanshuWanjari/Lumina-Research"
                  className="block hover:text-zinc-900 transition-colors"
                >
                  Documentation
                </Link>

                <Link
                  href="/settings"
                  className="block hover:text-zinc-900 transition-colors"
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-zinc-200/60 pt-6">
          <p className="text-sm text-zinc-400 flex items-center gap-1">
            <Copyright size={19}/> 2026 Lumina Research. All rights reserved.
          </p>

          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
            Agentic Research Infrastructure
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
