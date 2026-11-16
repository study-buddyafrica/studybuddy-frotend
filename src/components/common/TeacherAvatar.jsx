import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';

/**
 * Extract 1-2 letter initials from a teacher's full name,
 * stripping common academic and honorific prefixes.
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '';
  const cleaned = name
    .replace(/^(dr|prof|mr|mrs|ms)\.\s+/i, '')
    .replace(/^(dr|prof|mr|mrs|ms)\s+/i, '')
    .trim();
  if (!cleaned) return '';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Resilient avatar component for StudyBuddy teacher cards and profile modals (BUG-007).
 * Preserves valid remote image URLs until they fail, then seamlessly switches to a clean
 * local icon + initials fallback without broken image frames or external CDN dependencies.
 */
const TeacherAvatar = ({
  src,
  alt = 'Teacher',
  className = '',
  fallbackClassName = '',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = getInitials(alt);
  const isCard = Boolean(className && className.includes('h-48'));
  const initialsSizeClass = isCard ? 'w-16 h-16 text-xl mb-1' : 'w-14 h-14 text-lg';

  // Treat null/empty or legacy external placeholder CDNs as fallback directly
  const isPlaceholderCdn = typeof src === 'string' && src.includes('via.placeholder.com');
  const shouldShowFallback = !src || isPlaceholderCdn || hasError;

  if (shouldShowFallback) {
    return (
      <div
        role="img"
        aria-label={alt}
        data-testid="teacher-avatar-fallback"
        className={`bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-blue-600 select-none relative overflow-hidden border border-blue-100 ${className} ${fallbackClassName}`}
      >
        <div
          data-testid="teacher-avatar-initials"
          className={`${initialsSizeClass} rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 font-bold border border-blue-50`}
        >
          {initials || <FaUser className="text-xl text-blue-400" />}
        </div>
        {isCard && (
          <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
            Teacher
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      data-testid="teacher-avatar-img"
      className={className}
      onError={(e) => {
        e.currentTarget.onerror = null;
        setHasError(true);
      }}
    />
  );
};

export default TeacherAvatar;
