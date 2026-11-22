import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App without crashing', () => {
  render(<App />);
  const element = screen.getByText(/Empowering African learners/i);
  expect(element).toBeInTheDocument();
});
