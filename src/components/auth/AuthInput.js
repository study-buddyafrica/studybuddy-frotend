import React from "react";
import {
  authIconClass,
  authInputBaseClass,
  authInputPaddingLeftIcon,
  authInputPaddingPlain,
} from "./authTheme";

/**
 * Unified auth text/email input with optional leading icon and focus ring.
 */
const AuthInput = React.forwardRef(function AuthInput(
  {
    icon = null,
    className = "",
    wrapperClassName = "",
    type = "text",
    ...props
  },
  ref,
) {
  const padding = icon ? authInputPaddingLeftIcon : authInputPaddingPlain;

  return (
    <div className={`relative ${wrapperClassName}`}>
      {icon ? <span className={authIconClass}>{icon}</span> : null}
      <input
        ref={ref}
        type={type}
        className={`${authInputBaseClass} ${padding} ${className}`.trim()}
        {...props}
      />
    </div>
  );
});

export default AuthInput;
