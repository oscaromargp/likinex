import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThemeInitializer from '../ThemeInitializer';

describe('ThemeInitializer', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('theme-light');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders null (no DOM output)', () => {
    const { container } = render(<ThemeInitializer />);
    expect(container.innerHTML).toBe('');
  });

  it('adds theme-light class when light theme', () => {
    localStorage.setItem('likinex_theme', 'light');
    render(<ThemeInitializer />);
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
  });

  it('does not add theme-light class when dark theme', () => {
    localStorage.setItem('likinex_theme', 'dark');
    render(<ThemeInitializer />);
    expect(document.documentElement.classList.contains('theme-light')).toBe(false);
  });

  it('detects system preference for light mode', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
      })),
    });

    localStorage.setItem('likinex_theme', 'system');
    render(<ThemeInitializer />);
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
  });
});
