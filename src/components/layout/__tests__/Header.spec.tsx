import { render, screen } from '@testing-library/react';
import Header from '@/components/layout/Header';

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signOut: jest.fn(),
}));

describe('Header', () => {
  it('exibe quick actions', () => {
    render(<Header />);
    expect(screen.getByLabelText('Comunicação')).toBeInTheDocument();
    expect(screen.getByLabelText('Sugestões')).toBeInTheDocument();
    expect(screen.getByText(/ENTRAR OU CADASTRE-SE/i)).toBeInTheDocument();
  });
});


