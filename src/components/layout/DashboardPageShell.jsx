import React from "react";

/**
 * Shared chrome for student / teacher / parent app pages.
 * Matches Student Dashboard + Wallet + My account patterns.
 */
export default function DashboardPageShell({
  title,
  subtitle,
  actions = null,
  children,
  className = "",
  contentClassName = "",
}) {
  return (
    <div className={`min-h-full bg-[#F8FAFC] font-josefin ${className}`.trim()}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-lilita text-2xl tracking-tight text-[#015575] sm:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 max-w-2xl text-sm text-gray-600 sm:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
}

export function DashboardCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
