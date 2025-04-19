'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from 'react-icons/fa';
import {
  quickLinks,
  resourceLinks,
  footerLinks,
  socialLinks,
  contactInfo,
  companyInfo,
} from '@/constants';

// Map social media icons to their components
const getSocialIcon = (iconName: string) => {
  switch (iconName) {
    case 'FaTwitter':
      return <FaTwitter className="h-6 w-6" />;
    case 'FaLinkedin':
      return <FaLinkedin className="h-6 w-6" />;
    case 'FaGithub':
      return <FaGithub className="h-6 w-6" />;
    case 'FaDiscord':
      return <FaDiscord className="h-6 w-6" />;
    default:
      return null;
  }
};

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-border bg-accent py-12 text-card-foreground">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold">{companyInfo.name}</h3>
            <p className="mb-4 text-muted-foreground">
              {companyInfo.description}
            </p>
            <div className="flex space-x-4">
              {/* Social links */}
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={link.name}
                >
                  {getSocialIcon(link.icon)}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-muted-foreground">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Resources</h3>
            <ul className="space-y-2 text-muted-foreground">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
            <ul className="space-y-2 text-muted-foreground">
              {contactInfo.map((item, index) => (
                <li key={index}>{item.text}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom links and copyright */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="mb-4 flex flex-wrap justify-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 text-muted-foreground transition-colors hover:text-foreground ${
                  pathname === link.href ? 'text-foreground' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <p className="text-center text-muted-foreground/70">
            &copy; {currentYear} {companyInfo.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
