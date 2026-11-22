// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

jest.mock('lucide-react', () => {
  const React = require('react');
  return new Proxy({}, {
    get: (_, iconName) => {
      const IconMock = (props) => React.createElement('span', { 'data-testid': `icon-${iconName}`, ...props });
      IconMock.displayName = String(iconName);
      return IconMock;
    }
  });
});
