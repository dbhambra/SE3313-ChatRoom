import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UsernameModal from '../UsernameModal';

describe('UsernameModal', () => {
  it('renders without crashing', () => {
    render(<UsernameModal onSubmit={jest.fn()} error={false} />);
    expect(screen.getByText(/Enter Your Username/i)).toBeInTheDocument();
  });

  it('submits the entered username', () => {
    const mockSubmit = jest.fn();
    render(<UsernameModal onSubmit={mockSubmit} error={false} />);

    const input = screen.getByPlaceholderText(/Your name/i);
    const button = screen.getByRole('button', { name: /Join Chat/i });

    fireEvent.change(input, { target: { value: '  testuser  ' } });
    fireEvent.click(button);

    expect(mockSubmit).toHaveBeenCalledWith('testuser');
  });

  it('does not submit empty input', () => {
    const mockSubmit = jest.fn();
    render(<UsernameModal onSubmit={mockSubmit} error={false} />);

    const button = screen.getByRole('button', { name: /Join Chat/i });
    fireEvent.click(button);

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('shows error message if username is taken', () => {
    render(<UsernameModal onSubmit={jest.fn()} error={true} />);
    expect(screen.getByText(/username is already taken/i)).toBeInTheDocument();
  });
});
