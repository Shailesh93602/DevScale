import React from 'react';
import { ToastContainer, ToastPosition, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Toast = ({
  position = 'top-right',
  autoClose = 5000,
  hideProgressBar = false,
  closeOnClick = true,
  pauseOnHover = true,
  draggable = true,
  theme = 'light',
}: {
  position?: ToastPosition;
  autoClose?: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  theme?: 'light' | 'dark' | 'colored';
}) => {
  return (
    <ToastContainer
      position={position}
      autoClose={autoClose}
      hideProgressBar={hideProgressBar}
      newestOnTop={false}
      closeOnClick={closeOnClick}
      rtl={false}
      pauseOnFocusLoss
      draggable={draggable}
      pauseOnHover={pauseOnHover}
      theme={theme}
    />
  );
};

export const showToast = (
  message: string,
  type: 'success' | 'info' | 'warn' | 'error' | 'default' = 'default',
) => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'info':
      toast.info(message);
      break;
    case 'warn':
      toast.warn(message);
      break;
    case 'error':
      toast.error(message);
      break;
    default:
      toast(message);
      break;
  }
};

export default Toast;
