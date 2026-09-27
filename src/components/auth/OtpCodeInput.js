import React, { useCallback, useEffect, useRef } from "react";

const DIGIT_COUNT = 6;

/**
 * Segmented OTP code input with active-cell focus ring.
 * value: string of digits (max length = length)
 */
const OtpCodeInput = ({
  value = "",
  onChange,
  length = DIGIT_COUNT,
  disabled = false,
  autoFocus = true,
  idPrefix = "otp",
}) => {
  const inputsRef = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const emit = useCallback(
    (next) => {
      const cleaned = next.replace(/\D/g, "").slice(0, length);
      onChange?.(cleaned);
    },
    [length, onChange],
  );

  const focusAt = (index) => {
    const el = inputsRef.current[index];
    if (el) el.focus();
  };

  const handleChange = (index, raw) => {
    const cleaned = raw.replace(/\D/g, "");
    // Mobile SMS/email autofill often dumps the full code into one cell
    if (cleaned.length > 1) {
      const code = cleaned.slice(0, length);
      emit(code);
      focusAt(Math.min(code.length, length) - 1);
      return;
    }
    const digit = cleaned.slice(-1);
    const next = digits.map((d, i) => (i === index ? digit : d)).join("");
    emit(next.replace(/\s/g, ""));
    if (digit && index < length - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        const next = digits.map((d, i) => (i === index ? "" : d)).join("");
        emit(next);
      } else if (index > 0) {
        focusAt(index - 1);
        const next = digits.map((d, i) => (i === index - 1 ? "" : d)).join("");
        emit(next);
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    emit(pasted);
    focusAt(Math.min(pasted.length, length - 1));
  };

  return (
    <div
      className="flex justify-center gap-2 sm:gap-3"
      role="group"
      aria-label={`${length}-digit verification code`}
    >
      {digits.map((digit, index) => (
        <input
          key={`${idPrefix}-${index}`}
          id={`${idPrefix}-${index}`}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={index === 0 ? length : 1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={
            "w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-josefin " +
            "border border-gray-300 rounded-xl outline-none bg-white " +
            "transition-[border-color,box-shadow] duration-150 " +
            "focus:ring-2 focus:ring-[#01B0F1] focus:border-[#01B0F1] " +
            "disabled:bg-gray-50 disabled:cursor-not-allowed"
          }
        />
      ))}
    </div>
  );
};

/**
 * 60s resend countdown. Calls onExpire when it hits 0.
 * Reset by changing `resetKey` (e.g. increment after successful resend).
 */
export function useResendCountdown(seconds = 60, resetKey = 0) {
  const [remaining, setRemaining] = React.useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const id = window.setTimeout(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  return {
    remaining,
    canResend: remaining <= 0,
    label:
      remaining > 0
        ? `Resend in ${remaining}s`
        : "Resend Verification Code",
  };
}

export default OtpCodeInput;
