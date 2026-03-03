import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

test('renders navigation links', () => {
  render(<RouterProvider router={router} />);

  expect(screen.getByRole('link', { name: /Trang Chủ/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Giới Thiệu/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Liên Hệ/i })).toBeInTheDocument();
});
