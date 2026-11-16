import {
  normalizeSubject,
  normalizeSubjectList,
  formatSubjects,
} from './subjectUtils';

describe('subjectUtils (BUG-008 regression coverage)', () => {
  describe('normalizeSubject', () => {
    it('preserves clean string subjects', () => {
      expect(normalizeSubject('Mathematics')).toBe('Mathematics');
      expect(normalizeSubject('  Science and Technology  ')).toBe('Science and Technology');
    });

    it('handles object with name field', () => {
      expect(normalizeSubject({ id: 1, name: 'Physics' })).toBe('Physics');
    });

    it('handles object with subject field', () => {
      expect(normalizeSubject({ subject: 'Chemistry' })).toBe('Chemistry');
    });

    it('handles object with title or label field', () => {
      expect(normalizeSubject({ title: 'Biology' })).toBe('Biology');
      expect(normalizeSubject({ label: 'Geography' })).toBe('Geography');
      expect(normalizeSubject({ subject_name: 'History' })).toBe('History');
    });

    it('prefers name over subject and other fields', () => {
      expect(normalizeSubject({ name: 'Primary English', subject: 'Languages' })).toBe('Primary English');
    });

    it('handles nested subject objects', () => {
      expect(normalizeSubject({ subject: { name: 'Computer Science' } })).toBe('Computer Science');
    });

    it('handles numeric subjects cleanly', () => {
      expect(normalizeSubject(101)).toBe('101');
    });

    it('returns empty string for null, undefined, and empty strings', () => {
      expect(normalizeSubject(null)).toBe('');
      expect(normalizeSubject(undefined)).toBe('');
      expect(normalizeSubject('')).toBe('');
      expect(normalizeSubject('   ')).toBe('');
    });

    it('guarantees NEVER to return [object Object]', () => {
      expect(normalizeSubject({})).toBe('');
      expect(normalizeSubject({ random_prop: 123 })).toBe('');
      expect(normalizeSubject('[object Object]')).toBe('');
      expect(normalizeSubject({ name: '[object Object]' })).toBe('');
    });
  });

  describe('normalizeSubjectList', () => {
    it('normalizes string arrays', () => {
      expect(normalizeSubjectList(['Math', 'English', 'Science'])).toEqual([
        'Math',
        'English',
        'Science',
      ]);
    });

    it('normalizes object arrays with { name }', () => {
      const raw = [{ name: 'Math' }, { name: 'English' }];
      expect(normalizeSubjectList(raw)).toEqual(['Math', 'English']);
    });

    it('normalizes object arrays with { subject }', () => {
      const raw = [{ subject: 'History' }, { subject: 'Geography' }];
      expect(normalizeSubjectList(raw)).toEqual(['History', 'Geography']);
    });

    it('normalizes mixed arrays and filters out invalid / empty elements', () => {
      const raw = [
        'Mathematics',
        { name: 'Physics' },
        null,
        '',
        { subject: 'Chemistry' },
        {},
        undefined,
        { title: 'Biology' },
        '[object Object]',
      ];
      expect(normalizeSubjectList(raw)).toEqual([
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
      ]);
    });

    it('deduplicates identical subject labels while preserving order', () => {
      const raw = ['Math', { name: 'Math' }, { subject: 'Physics' }, 'Physics'];
      expect(normalizeSubjectList(raw)).toEqual(['Math', 'Physics']);
    });

    it('handles null, undefined or empty array gracefully', () => {
      expect(normalizeSubjectList(null)).toEqual([]);
      expect(normalizeSubjectList(undefined)).toEqual([]);
      expect(normalizeSubjectList([])).toEqual([]);
    });
  });

  describe('formatSubjects', () => {
    it('formats subject list into comma-separated string', () => {
      const subjects = ['Mathematics', { name: 'Physics' }, { subject: 'Chemistry' }];
      expect(formatSubjects(subjects)).toBe('Mathematics, Physics, Chemistry');
    });

    it('returns empty string when no subjects available and no fallback provided', () => {
      expect(formatSubjects([])).toBe('');
      expect(formatSubjects(null)).toBe('');
      expect(formatSubjects([{}, null, ''])).toBe('');
    });

    it('returns custom fallback when provided and list is empty', () => {
      expect(formatSubjects([], 'Multiple Subjects')).toBe('Multiple Subjects');
      expect(formatSubjects(null, 'No subjects listed')).toBe('No subjects listed');
    });
  });

  describe('search and filter compatibility', () => {
    it('correctly matches search terms across mixed subject formats', () => {
      const teacher = {
        name: 'Jane Doe',
        subjects: [{ name: 'Pure Mathematics' }, { subject: 'Applied Physics' }],
      };
      const normalized = normalizeSubjectList(teacher.subjects);

      const searchMatchMath = normalized.some((s) => s.toLowerCase().includes('math'));
      const searchMatchPhysics = normalized.some((s) => s.toLowerCase().includes('phys'));
      const searchMatchChem = normalized.some((s) => s.toLowerCase().includes('chem'));

      expect(searchMatchMath).toBe(true);
      expect(searchMatchPhysics).toBe(true);
      expect(searchMatchChem).toBe(false);
    });

    it('correctly matches selected subject filter', () => {
      const teacher = {
        name: 'John Doe',
        subjects: [{ subject: 'Chemistry' }],
      };
      const normalized = normalizeSubjectList(teacher.subjects);
      const selectedSubject = 'Chemistry';

      const matches = normalized.some(
        (s) => s.toLowerCase() === selectedSubject.toLowerCase() || s === selectedSubject
      );
      expect(matches).toBe(true);
    });
  });

  describe('badge and card rendering', () => {
    it('renders clean badge labels for mixed teacher subjects', () => {
      const teacher = {
        name: 'Jane Doe',
        subjects: ['Mathematics', { name: 'Physics' }, { subject: 'Chemistry' }, null, {}],
      };
      const badges = normalizeSubjectList(teacher.subjects).map((sub) => ({
        badgeText: sub,
      }));

      expect(badges).toEqual([
        { badgeText: 'Mathematics' },
        { badgeText: 'Physics' },
        { badgeText: 'Chemistry' },
      ]);
      expect(formatSubjects(teacher.subjects)).toBe('Mathematics, Physics, Chemistry');
    });

    it('card rendering never produces [object Object] even with empty or malformed objects', () => {
      const teacher = {
        name: 'Teacher Without Clean Subjects',
        subjects: [{}, { unk: 1 }, null, undefined, '[object Object]'],
      };
      const formatted = formatSubjects(teacher.subjects, 'No subjects listed');
      expect(formatted).toBe('No subjects listed');
      expect(formatted).not.toContain('[object Object]');
    });
  });
});
