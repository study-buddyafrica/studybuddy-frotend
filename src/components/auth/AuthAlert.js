import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaExclamationCircle,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";

const VARIANT_STYLES = {
  error: {
    box: "bg-red-50 border-red-200 text-red-800",
    icon: "text-red-500",
    Icon: FaExclamationCircle,
  },
  info: {
    box: "bg-sky-50 border-[#01B0F1]/40 text-[#015575]",
    icon: "text-[#01B0F1]",
    Icon: FaInfoCircle,
  },
  success: {
    box: "bg-green-50 border-green-200 text-green-800",
    icon: "text-green-600",
    Icon: FaCheckCircle,
  },
};

/**
 * Infer a recovery CTA from common auth error copy.
 * Returns { label, to } or null.
 */
export function inferAuthRecoveryAction(message = "") {
  const lower = String(message).toLowerCase();
  if (
    (lower.includes("already exists") || lower.includes("already registered")) &&
    lower.includes("email")
  ) {
    return { label: "Log in instead", to: "/login" };
  }
  if (
    lower.includes("no account") ||
    lower.includes("not found") ||
    lower.includes("does not exist")
  ) {
    return { label: "Create an account", to: "/signup" };
  }
  if (
    lower.includes("not verified") ||
    lower.includes("verify your email") ||
    lower.includes("email verification")
  ) {
    return { label: "Resend verification", to: "/signup" };
  }
  return null;
}

/**
 * Structured alert banner: icon, message, optional CTA, dismiss, retry.
 */
const AuthAlert = ({
  message,
  variant = "error",
  onDismiss,
  onRetry,
  action,
  className = "",
}) => {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.error;
  const { Icon } = styles;

  const resolvedAction = useMemo(() => {
    if (action === null) return null;
    if (action) return action;
    if (variant === "error") return inferAuthRecoveryAction(message);
    return null;
  }, [action, message, variant]);

  if (!message) return null;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`border rounded-xl p-3 ${styles.box} ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 w-4 h-4 shrink-0 ${styles.icon}`}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="font-josefin text-sm leading-relaxed">{message}</p>
          {(resolvedAction || onRetry) && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {resolvedAction?.to ? (
                <Link
                  to={resolvedAction.to}
                  className="font-josefin text-sm font-semibold underline underline-offset-2 hover:opacity-80"
                >
                  {resolvedAction.label}
                </Link>
              ) : null}
              {resolvedAction?.onClick ? (
                <button
                  type="button"
                  onClick={resolvedAction.onClick}
                  className="font-josefin text-sm font-semibold underline underline-offset-2 hover:opacity-80"
                >
                  {resolvedAction.label}
                </button>
              ) : null}
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="font-josefin text-sm font-semibold underline underline-offset-2 hover:opacity-80"
                >
                  Try again
                </button>
              ) : null}
            </div>
          )}
        </div>
        {onDismiss ? (
          <button
            type="button"
            aria-label="Dismiss alert"
            onClick={onDismiss}
            className="shrink-0 p-1 rounded-md hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01B0F1]"
          >
            <FaTimes className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default AuthAlert;
