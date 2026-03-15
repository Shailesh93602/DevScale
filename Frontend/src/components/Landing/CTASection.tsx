import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { ctaLinks, companyInfo } from '@/constants';
import { CustomLink } from '@/components/ui/custom-link';

const CTASection: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: { user: { isAuthenticated: boolean } }) =>
      state?.user?.isAuthenticated,
  );

  return (
    <section className="relative z-10 bg-gradient-to-r from-cta-from via-cta-via to-cta-to py-20">
      <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-primary2 blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4">
        <motion.h2
          className="mb-6 text-center text-4xl font-extrabold text-foreground md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Ready to Transform Your <br />
          <span className="text-primary">Engineering Journey?</span>
        </motion.h2>
        <motion.p
          className="mx-auto mb-10 max-w-2xl text-center text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Join thousands of engineering students who are already using{' '}
          {companyInfo.name}
          to accelerate their learning, prepare for placements, and build a
          successful career.
        </motion.p>
        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <CustomLink
            variant="default"
            size="lg"
            href={isAuthenticated ? '/dashboard' : ctaLinks.getStarted.href}
            className="rounded-full px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl"
          >
            {isAuthenticated ? 'Go to Dashboard' : ctaLinks.getStarted.name}
          </CustomLink>
          <CustomLink
            href={ctaLinks.learnMore.href}
            className="flex items-center rounded-full border border-border bg-card/80 px-6 py-4 text-lg font-medium text-foreground no-underline backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card/90"
          >
            {ctaLinks.learnMore.name}
            <svg
              className="ml-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </CustomLink>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
