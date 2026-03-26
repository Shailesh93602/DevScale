'use client';

import './styles/index.css';
import { BRANDING } from '@/constants';

interface LoadersProps {
  type?: 'Spin' | 'SiteLoader';
  className?: string;
}

const Loader = ({ type, className }: LoadersProps) => {
  return (
    <>
      {type === 'SiteLoader' ? (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-all duration-500 ease-in-out ${
            className ?? ''
          }`}
        >
          <div className="relative flex h-32 w-32 items-center justify-center">
            {/* Pulsing ring from our CSS */}
            <div className="pulsing-ring"></div>

            {/* The Logo with pulse-dot from CSS */}
            <div className="loader-logo shadow-primary/40 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-2xl ring-1 ring-inset ring-white/10">
              <span className="select-none text-4xl font-black tracking-widest text-white">
                {BRANDING.name.charAt(0)}
              </span>
            </div>
          </div>

          {/* Subtle Branding Text */}
          <div className="mt-8 flex animate-pulse flex-col items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.5em] text-muted-foreground">
              {BRANDING.name}
            </span>
            <div className="via-primary/30 h-0.5 w-12 rounded-full bg-gradient-to-r from-transparent to-transparent"></div>
          </div>
        </div>
      ) : (
        <span
          className={`border-primary/20 inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-t-primary ${
            className ?? ''
          }`}
        />
      )}
    </>
  );
};

export default Loader;
