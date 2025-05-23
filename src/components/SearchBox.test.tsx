import { render, screen, fireEvent } from '@testing-library/react';
import SearchBox from './SearchBox'; // Adjust path if needed

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SearchBox', () => {
  beforeEach(() => {
    // Clear mock call history before each test
    mockPush.mockClear();
  });

  test('renders input and button', () => {
    render(<SearchBox />);
    expect(screen.getByPlaceholderText('Search articles...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🔍/i })).toBeInTheDocument();
  });

  test('updates input value on change', () => {
    render(<SearchBox />);
    const inputElement = screen.getByPlaceholderText('Search articles...') as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: 'test query' } });
    expect(inputElement.value).toBe('test query');
  });

  test('calls router.push on submit with correct query', () => {
    render(<SearchBox />);
    const inputElement = screen.getByPlaceholderText('Search articles...') as HTMLInputElement;
    const buttonElement = screen.getByRole('button', { name: /🔍/i });

    fireEvent.change(inputElement, { target: { value: 'hello world' } });
    fireEvent.click(buttonElement);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/search?q=hello%20world');
  });

  test('calls router.push and clears input on submit with correct query', () => {
    render(<SearchBox />);
    const inputElement = screen.getByPlaceholderText('Search articles...') as HTMLInputElement;
    const buttonElement = screen.getByRole('button', { name: /🔍/i });

    fireEvent.change(inputElement, { target: { value: '  another query  ' } }); // With spaces
    fireEvent.click(buttonElement);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/search?q=another%20query'); // Query is trimmed
    expect(inputElement.value).toBe(''); // Input is cleared
  });
  
  test('does not call router.push if query is empty', () => {
    render(<SearchBox />);
    const buttonElement = screen.getByRole('button', { name: /🔍/i });
    fireEvent.click(buttonElement); // Submit with empty input
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('does not call router.push if query consists only of spaces', () => {
    render(<SearchBox />);
    const inputElement = screen.getByPlaceholderText('Search articles...') as HTMLInputElement;
    const buttonElement = screen.getByRole('button', { name: /🔍/i });

    fireEvent.change(inputElement, { target: { value: '   ' } }); // Input with only spaces
    fireEvent.click(buttonElement);
    
    expect(mockPush).not.toHaveBeenCalled();
  });
});
