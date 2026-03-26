import React, { ReactNode, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClickOutside}
    >
      <div
        className="relative h-full max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-background shadow-lg"
        ref={modalRef}
      >
        <div className="z-999 sticky top-0 flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
