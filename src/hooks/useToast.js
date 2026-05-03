import { useState, useCallback } from "react";

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message = "", duration = 4000) => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    removeToast,
    success: (title, message) => addToast("success", title, message),
    error: (title, message) => addToast("error", title, message),
  };
};

export default useToast;
