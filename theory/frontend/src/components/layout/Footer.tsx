import { Link } from "react-router-dom";
import { Instagram, Mail, MessageCircle, Youtube, type LucideIcon } from "lucide-react";
import { BrandMark } from "@/components/layout/Navbar";
import { NAV_LINKS } from "@/lib/constants";
import { useSettings } from "@/lib/hooks";

export default function Footer() {
  const { data: settings } = useSettings();
  const d = settings?.data ?? {};

  const socials: { label: string; href: string; Icon: LucideIcon }[] = [
    { label: "Instagram", href: d.instagram ?? "", Icon: Instagram },
    { label: "YouTube", href: d.youtube ?? "", Icon: Youtube },
    { label: "WhatsApp", href: d.whatsapp ?? "", Icon: MessageCircle },
    { label: "Email", href: d.email ? `mailto:${d.email}` : "", Icon: Mail },
  ].filter((s) => s.href);

  return (
    <footer className="mt-20 border-t border-border/60 bg-card/40">
      <div className="tkj-stripe h-1 w-full" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandMark logoUrl={d.logo_url} />
            <span className="font-heading text-lg font-bold tracking-tight">
              TEKNISI <span className="text-red-500">TKJ</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {d.description || "Faksi Teknik Komputer dan Jaringan."}
          </p>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
            Navigasi
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="inline-block py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  data-testid={`footer-link-${l.testid}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">
            Media &amp; Kontak
          </h3>
          {socials.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  data-testid={`footer-social-${label.toLowerCase()}`}
                  className="grid size-11 place-items-center rounded-lg border border-border text-muted-foreground transition-colors duration-200 hover:border-cyan-400/50 hover:text-cyan-300"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Belum ada kontak yang dipasang.
            </p>
          )}
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Teknik Komputer &amp; Jaringan
          </p>
        </div>
      </div>

      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © 2026 Teknisi TKJ. All Rights Reserved.
      </div>
    </footer>
  );
}
