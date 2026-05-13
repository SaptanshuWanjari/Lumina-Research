import Link from "next/link";
import { appRoutes } from "@/lib/app-routes";

const NavBar = () => {
  const links = [
    { name: "Dashboard", href: appRoutes.dashboard },
    { name: "Cases", href: appRoutes.cases },
    { name: "Search", href: appRoutes.search },
    { name: "Reports", href: appRoutes.reports },
  ];
  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-4">
      <div
        className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full bg-white ethereal-blur border border-white/40 shadow-sm"
      >
        <Link className="flex items-center gap-2 group" href={appRoutes.dashboard}>
          <div
            className="p-2 rounded-lg bg-surface-container-low border border-surface-variant/20 transition-all duration-300 group-hover:scale-105"
         >
            <span
              className="material-symbols-outlined text-primary text-xl leading-none block"
              data-icon="psychology"
            ></span
            >
          </div>
          <span
            className="text-sm font-extrabold tracking-tight text-inverse-surface"
          >Lumina Research</span
          >
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}

        </div>
        <Link
          href={appRoutes.cases}
          className="bg-black text-white text-[13px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
        >
          New Case
        </Link>
      </div>
    </nav>

  );
};

export default NavBar;
