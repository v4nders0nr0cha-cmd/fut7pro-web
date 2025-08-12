import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Teste 1: Verificar se o jest-dom está funcionando
describe('Jest DOM Setup', () => {
  it('should have jest-dom matchers available', () => {
    const element = document.createElement('div');
    element.setAttribute('data-testid', 'test-element');
    document.body.appendChild(element);
    
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-testid', 'test-element');
  });
});

// Teste 2: Verificar se o React Testing Library está funcionando
describe('React Testing Library', () => {
  it('should render a simple div', () => {
    render(<div data-testid="simple-div">Hello World</div>);
    
    const element = screen.getByTestId('simple-div');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello World');
  });
});

// Teste 3: Verificar se os mocks estão funcionando
describe('Mocks Setup', () => {
  it('should have ResizeObserver mocked', () => {
    expect(global.ResizeObserver).toBeDefined();
    expect(typeof global.ResizeObserver).toBe('function');
  });

  it('should have IntersectionObserver mocked', () => {
    expect(global.IntersectionObserver).toBeDefined();
    expect(typeof global.IntersectionObserver).toBe('function');
  });
});

// Teste 4: Verificar se o Next.js Image está mockado
describe('Next.js Image Mock', () => {
  it('should render img element when using Next Image', () => {
    const NextImage = require('next/image').default;
    render(<NextImage src="/test.jpg" alt="Test" width={100} height={100} />);
    
    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe('IMG');
  });
});

// Teste 5: Verificar se o SWR está mockado
describe('SWR Mock', () => {
  it('should return default SWR values', () => {
    const useSWR = require('swr').default;
    const result = useSWR('test-key');
    
    expect(result).toEqual({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: expect.any(Function),
    });
  });
});
