import { render, screen } from '@testing-library/react';
import App from './App';

test('renders list of countries', () => {
  render(<App />);
  const listElement = screen.getByText(/Total countries: \d/i);
  expect(listElement).toBeInTheDocument();
});
