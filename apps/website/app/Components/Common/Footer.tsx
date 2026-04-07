import Link from "next/link";
const Footer = () => {
  const links = [
    {
      title: "Product",
      items: [
        { label: "Features", href: "#" },
        { label: "Integrations", href: "#" },
        { label: "Pricing", href: "#" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
    {
      title: "Legal",
      items: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-surface-container-low border-t-0 py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <span className="text-2xl font-bold tracking-tighter text-zinc-900">
            AnalystAI
          </span>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            The intelligent workspace for high-stakes financial research and
            automated reasoning.
          </p>
        </div>
        {links.map((link) => (
          <div className="space-y-4" key={link.title}>
            <h4 className="font-bold text-sm uppercase tracking-widest text-zinc-400">
              {link.title}
            </h4>
            <ul className="space-y-2 text-on-surface-variant text-sm">
              {link.items.map((item) => (
                <li key={item.label}>
                  <Link
                    className="hover:text-primary transition-colors"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant/10 text-center text-zinc-400 text-sm">
        © 2026 Lumina Research. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
