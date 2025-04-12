import React from 'react';
import { render, screen } from '@testing-library/react';
import Avatar from '../Avatar';

describe('Avatar', () => {
  it('renders the first letter of the username in uppercase', () => {
    render(<Avatar username="john" bgColor="#abcdef" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders "?" if username is empty', () => {
    render(<Avatar username="" bgColor="#abcdef" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies the correct background color', () => {
    const { container } = render(<Avatar username="a" bgColor="#123456" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveStyle({ backgroundColor: '#123456' });
  });
});
