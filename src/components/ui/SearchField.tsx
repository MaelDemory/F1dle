import React, { ReactNode } from 'react';
import Autosuggest, { AutosuggestPropsSingleSection } from 'react-autosuggest';
import { Search } from 'lucide-react';

// Single owner of the autosuggest CSS-class contract (styled in index.css).
const theme = {
    container: 'react-autosuggest__container',
    suggestionsContainer: 'react-autosuggest__suggestions-container',
    suggestionsContainerOpen: 'react-autosuggest__suggestions-container--open',
    suggestionsList: 'react-autosuggest__suggestions-list',
    suggestion: 'react-autosuggest__suggestion',
    suggestionHighlighted: 'react-autosuggest__suggestion--highlighted',
    input: 'react-autosuggest__input',
};

/**
 * SuggestionShell
 * Parameters
 *   children: suggestion row content
 * What it does
 *   Wraps a suggestion row in the div that the `--highlighted > div` CSS
 *   contract targets, with the shared row styling.
 * Output
 *   A styled suggestion row element.
 */
export const SuggestionShell = ({ children }: { children: ReactNode }) => (
    <div className="flex items-center justify-between gap-3 rounded-md border border-transparent px-4 py-3 text-left transition-colors">
        {children}
    </div>
);

type SearchFieldProps<T> = Omit<AutosuggestPropsSingleSection<T>, 'theme'>;

/**
 * SearchField
 * Parameters
 *   props: react-autosuggest single-section props (suggestions, callbacks, inputProps...)
 * What it does
 *   Renders the shared search input: leading search icon over the themed
 *   Autosuggest input, using the single global theme object.
 * Output
 *   The autosuggest field element.
 */
export function SearchField<T>(props: SearchFieldProps<T>) {
    return (
        <div className="relative">
            <div className="pointer-events-none absolute left-4 top-[1.4rem] z-10 -translate-y-1/2 text-tertiary">
                <Search className="h-4 w-4" strokeWidth={2} />
            </div>
            <Autosuggest {...props} theme={theme} />
        </div>
    );
}
