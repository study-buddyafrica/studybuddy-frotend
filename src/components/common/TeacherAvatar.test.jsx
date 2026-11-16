import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TeacherAvatar, { getInitials } from './TeacherAvatar';

describe('TeacherAvatar (BUG-007)', () => {
  describe('getInitials helper', () => {
    it('returns empty string for null, undefined, or empty name', () => {
      expect(getInitials(null)).toBe('');
      expect(getInitials(undefined)).toBe('');
      expect(getInitials('')).toBe('');
      expect(getInitials('   ')).toBe('');
    });

    it('computes 2-letter initials for single-word name', () => {
      expect(getInitials('Teacher')).toBe('TE');
      expect(getInitials('Keli')).toBe('KE');
    });

    it('computes first and last initials for multi-word name', () => {
      expect(getInitials('Jane Smith')).toBe('JS');
      expect(getInitials('John Michael Doe')).toBe('JD');
    });

    it('strips academic and honorific titles cleanly', () => {
      expect(getInitials('Dr. Jane Smith')).toBe('JS');
      expect(getInitials('Prof. John Doe')).toBe('JD');
      expect(getInitials('Mr. Alan Turing')).toBe('AT');
      expect(getInitials('Mrs. Ada Lovelace')).toBe('AL');
      expect(getInitials('Ms. Grace Hopper')).toBe('GH');
      expect(getInitials('Dr Jane Smith')).toBe('JS');
    });
  });

  describe('rendering and error fallback behavior', () => {
    it('preserves and renders <img> with valid src and alt', () => {
      render(
        <TeacherAvatar
          src="https://studybuddy.africa/media/teachers/valid-photo.jpg"
          alt="Dr. Jane Smith"
          className="w-full h-48 object-cover rounded-t-xl"
        />
      );

      const img = screen.getByTestId('teacher-avatar-img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://studybuddy.africa/media/teachers/valid-photo.jpg');
      expect(img).toHaveAttribute('alt', 'Dr. Jane Smith');
      expect(img).toHaveClass('w-full', 'h-48', 'object-cover', 'rounded-t-xl');
      expect(screen.queryByTestId('teacher-avatar-fallback')).not.toBeInTheDocument();
    });

    it('transitions to clean fallback when image onError fires (e.g. Render HTTP 404/CORB)', () => {
      render(
        <TeacherAvatar
          src="https://studybuddy-backend-6vya.onrender.com/media/profiles/hermes-avatar.png"
          alt="Jane Smith"
          className="w-full h-48 object-cover rounded-t-xl"
        />
      );

      const img = screen.getByTestId('teacher-avatar-img');
      expect(img).toBeInTheDocument();

      // Simulate browser firing onError due to 404
      fireEvent.error(img);

      // Image should be replaced by fallback
      expect(screen.queryByTestId('teacher-avatar-img')).not.toBeInTheDocument();
      const fallback = screen.getByTestId('teacher-avatar-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveAttribute('role', 'img');
      expect(fallback).toHaveAttribute('aria-label', 'Jane Smith');
      expect(fallback).toHaveClass('w-full', 'h-48', 'rounded-t-xl');

      // Initials should be displayed
      const initialsEl = screen.getByTestId('teacher-avatar-initials');
      expect(initialsEl).toHaveTextContent('JS');
    });

    it('renders fallback immediately without <img> when src is null or empty', () => {
      render(
        <TeacherAvatar
          src={null}
          alt="Dr. John Doe"
          className="w-32 h-32 rounded-xl object-cover"
        />
      );

      expect(screen.queryByTestId('teacher-avatar-img')).not.toBeInTheDocument();
      const fallback = screen.getByTestId('teacher-avatar-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveAttribute('role', 'img');
      expect(fallback).toHaveAttribute('aria-label', 'Dr. John Doe');
      expect(fallback).toHaveClass('w-32', 'h-32', 'rounded-xl');

      const initialsEl = screen.getByTestId('teacher-avatar-initials');
      expect(initialsEl).toHaveTextContent('JD');
    });

    it('intercepts legacy via.placeholder.com CDN URLs and uses local fallback instead', () => {
      render(
        <TeacherAvatar
          src="https://via.placeholder.com/150"
          alt="Sarah Connor"
          className="w-full h-48 object-cover rounded-t-xl"
        />
      );

      expect(screen.queryByTestId('teacher-avatar-img')).not.toBeInTheDocument();
      const fallback = screen.getByTestId('teacher-avatar-fallback');
      expect(fallback).toBeInTheDocument();
      expect(screen.getByTestId('teacher-avatar-initials')).toHaveTextContent('SC');
    });

    it('renders card badge indicator for card sizing (h-48)', () => {
      render(
        <TeacherAvatar
          src={null}
          alt="Jane Smith"
          className="w-full h-48 object-cover rounded-t-xl"
        />
      );

      expect(screen.getByText('Teacher')).toBeInTheDocument();
    });

    it('omits redundant card badge and preserves bounded modal integration dimensions (h-64)', () => {
      render(
        <TeacherAvatar
          src={null}
          alt="Jane Smith"
          className="w-full h-64 object-cover rounded-lg shadow-md"
          fallbackClassName="h-64"
        />
      );

      expect(screen.queryByText('Teacher')).not.toBeInTheDocument();
      const fallback = screen.getByTestId('teacher-avatar-fallback');
      expect(fallback).toHaveClass('w-full', 'h-64', 'rounded-lg', 'shadow-md');
    });

    it('preserves bounded modal image area when modal avatar encounters an onError event', () => {
      render(
        <TeacherAvatar
          src="https://studybuddy-backend-6vya.onrender.com/media/profiles/hermes-avatar.png"
          alt="Dr. Jane Smith"
          className="w-full h-64 object-cover rounded-lg shadow-md"
          fallbackClassName="h-64"
        />
      );

      const img = screen.getByTestId('teacher-avatar-img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveClass('w-full', 'h-64', 'object-cover', 'rounded-lg', 'shadow-md');

      fireEvent.error(img);

      const fallback = screen.getByTestId('teacher-avatar-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveClass('w-full', 'h-64', 'rounded-lg', 'shadow-md');
    });

    it('resets error state when src changes from broken to new valid URL', () => {
      const { rerender } = render(
        <TeacherAvatar
          src="https://studybuddy.africa/broken.png"
          alt="Teacher One"
          className="w-32 h-32 rounded-xl"
        />
      );

      const img = screen.getByTestId('teacher-avatar-img');
      fireEvent.error(img);
      expect(screen.getByTestId('teacher-avatar-fallback')).toBeInTheDocument();

      // Re-render with new valid src
      rerender(
        <TeacherAvatar
          src="https://studybuddy.africa/new-valid.png"
          alt="Teacher Two"
          className="w-32 h-32 rounded-xl"
        />
      );

      expect(screen.getByTestId('teacher-avatar-img')).toBeInTheDocument();
      expect(screen.queryByTestId('teacher-avatar-fallback')).not.toBeInTheDocument();
    });
  });
});
