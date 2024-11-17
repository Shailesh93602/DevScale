import React, { useRef } from "react";
import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  if (!isOpen) return null;

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClickOutside}
    >
      <div
        className="bg-gray-900 rounded-lg shadow-lg w-full max-w-lg h-full max-h-[90vh] overflow-y-auto relative"
        ref={modalRef}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 z-999">
          <h2 className="text-lg font-semibold text-black dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
