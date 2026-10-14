import React, { useEffect } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

/**
 * FloatingToast - Viewport-anchored notification toast
 * Replaces top-of-form scrolled banners with persistent floating feedback.
 *
 * @param {string} message - Main toast message
 * @param {"success"|"error"|"info"|"warning"} variant
 * @param {() => void} onDismiss
 * @param {number} duration - Auto-dismiss timeout in ms (default: 4500)
 */
export const FloatingToast = ({
  message,
  variant = "info",
  onDismiss,
  duration = 4500,
}) => {
  useEffect(() => {
    if (!message || !onDismiss) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  const config = {
    success: {
      border: "border-emerald-500",
      bg: "bg-emerald-50/90",
      iconBg: "bg-emerald-100 text-emerald-700",
      icon: FaCheckCircle,
      title: "Success",
      titleColor: "text-emerald-900",
    },
    error: {
      border: "border-rose-500",
      bg: "bg-rose-50/90",
      iconBg: "bg-rose-100 text-rose-700",
      icon: FaExclamationCircle,
      title: "Action Required",
      titleColor: "text-rose-900",
    },
    warning: {
      border: "border-amber-500",
      bg: "bg-amber-50/90",
      iconBg: "bg-amber-100 text-amber-700",
      icon: FaExclamationTriangle,
      title: "Notice",
      titleColor: "text-amber-900",
    },
    info: {
      border: "border-[#01B0F1]",
      bg: "bg-[#EAF5FF]/90",
      iconBg: "bg-[#DEF0FF] text-[#00658C]",
      icon: FaInfoCircle,
      title: "Information",
      titleColor: "text-[#003D55]",
    },
  }[variant] || {
    border: "border-slate-300",
    bg: "bg-slate-50/90",
    iconBg: "bg-slate-200 text-slate-700",
    icon: FaInfoCircle,
    title: "Notification",
    titleColor: "text-slate-900",
  };

  const IconComponent = config.icon;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 pointer-events-auto transition-all transform animate-slideUp"
    >
      <div
        className={`backdrop-blur-md bg-white/95 border-l-4 ${config.border} border-y border-r border-slate-200/80 rounded-2xl p-4 shadow-2xl flex items-start gap-3.5`}
      >
        <div
          className={`w-9 h-9 rounded-xl ${config.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
        >
          <IconComponent className="text-base" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <p className={`font-josefin font-bold text-xs ${config.titleColor} uppercase tracking-wider`}>
            {config.title}
          </p>
          <p className="font-josefin text-xs sm:text-sm text-slate-700 mt-0.5 leading-snug">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default FloatingToast;
