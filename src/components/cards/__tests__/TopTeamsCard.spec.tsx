import { render, screen } from '@testing-library/react';
import TopTeamsCard from '@/components/cards/TopTeamsCard';

describe('TopTeamsCard', () => {
  it('renderiza título e linhas', () => {
    render(<TopTeamsCard />);
    expect(screen.getByText('Classificação dos Times')).toBeInTheDocument();
    // Deve renderizar pelo menos 3 linhas dos times
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(3);
  });
});


