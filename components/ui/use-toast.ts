// This is a simplified version of the useToast hook
import { useState, useCallback } from 'react';

export interface ToastProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    setToasts((prevToasts) => [...prevToasts, { title, description, variant }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.slice(1));
    }, 3000);
  }, []);

  return { toast, toasts };
}