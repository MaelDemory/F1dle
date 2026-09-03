import React from 'react';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './theme/ThemeContext';
import App from './App';

test('renders the welcome page', () => {
  render(
    <ThemeProvider>
      <LanguageProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
  expect(screen.getByRole('heading', { level: 1, name: /f1dle/i })).toBeInTheDocument();
});
