import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import {
  authIconClass,
  authInputBaseClass,
  authInputPaddingPassword,
  authToggleClass,
} from "./authTheme";

/**
 * Password field with accessible show/hide toggle (aria-label, focus-visible).
 */
const AuthPasswordInput = React.forwardRef(function AuthPasswordInput(
  {
    icon = null,
    className = "",
    wrapperClassName = "",
    initiallyVisible = false,
    revealLabel = "Show password",
    hideLabel = "Hide password",
    disabled = false,
    ...props
  },
  ref,
) {
  const [visible, setVisible] = useState(initiallyVisible);

  return (
    <div className={`relative ${wrapperClassName}`}>
      {icon ? <span className={authIconClass}>{icon}</span> : null}
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={`${authInputBaseClass} ${authInputPaddingPassword} ${className}`.trim()}
        {...props}
      />
      <button
        type="button"
        tabIndex={0}
        aria-label={visible ? hideLabel : revealLabel}
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        className={authToggleClass}
      >
        {visible ? (
          <FaRegEyeSlash className="w-4 h-4" aria-hidden="true" />
        ) : (
          <FaRegEye className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});

export default AuthPasswordInput;
