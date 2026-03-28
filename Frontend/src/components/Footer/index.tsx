'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import {
  quickLinks,
  resourceLinks,
  footerLinks,
  socialLinks,
  contactInfo,
  companyInfo,
} from '@/constants';

const getSocialIcon = (iconName: string) => {
  switch (iconName) {
    case 'FaTwitter':
      return <FaTwitter className="h-4 w-4" />;
    case 'FaLinkedin':
      return <FaLinkedin className="h-4 w-4" />;
    case 'FaGithub':
      return <FaGithub className="h-4 w-4" />;
    case 'FaDiscord':
      return <FaDiscord className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-14">
        {/* Footer Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <h3 className="gradient-text mb-3 inline-block text-base font-bold">
              {companyInfo.name}
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              {companyInfo.description}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="hover:border-primary/30 hover:bg-primary/8 flex h-11 w-11 items-center justify-center rounded-lg border border-border text-muted-foreground no-underline transition-all duration-150 hover:text-primary"
                  aria-label={link.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(link.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Resources
            </h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Contact
            </h3>
            <ul className="space-y-2">
              {contactInfo.map((item) => (
                <li key={item.id} className="text-sm text-muted-foreground">
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap justify-center gap-1 sm:justify-start">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs text-muted-foreground no-underline transition-colors hover:bg-accent hover:text-foreground',
                  pathname === link.href && 'text-foreground',
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} {companyInfo.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
