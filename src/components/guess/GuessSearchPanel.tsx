import React, { FormEvent, ReactNode } from 'react';
import { Button, Card, SearchField, SuggestionShell } from '../ui';
import { MAX_ATTEMPTS } from '../../game/timings';
import { GuessStatus, GuessStatusLine } from './GuessStatusLine';

type GuessSearchPanelProps<T> = {
    value: string;
    onValueChange: (value: string) => void;
    suggestions: T[];
    onSuggestionsFetchRequested: (params: { value: string }) => void;
    onSuggestionsClearRequested: () => void;
    onSuggestionSelected: (item: T) => void;
    onSubmit: () => void;
    getFullName: (item: T) => string;
    getSuggestionSubtitle: (item: T) => string;
    renderSuggestionBadge?: (item: T) => ReactNode;
    guessCount: number;
    isComplete: boolean;
    canSubmit: boolean;
    status: GuessStatus | null;
    labels: {
        panel: string;
        heading: string;
        findDriver: string;
        placeholder: string;
        guess: string;
        newRound: string;
        attempts: string;
    };
    onNewRound: () => void;
};

/**
 * Parameters
 *   The controlled input state, the autocomplete callbacks, the mode's display
 *   accessors, the round's progress, and pre-translated labels.
 * What it does
 *   Renders the search panel: attempt counter, autocomplete field, action
 *   buttons and the status line. It holds no game state of its own — every
 *   decision arrives as a prop, which is what makes it reusable across modes.
 * Output
 *   The search card.
 */
export function GuessSearchPanel<T>({
    value,
    onValueChange,
    suggestions,
    onSuggestionsFetchRequested,
    onSuggestionsClearRequested,
    onSuggestionSelected,
    onSubmit,
    getFullName,
    getSuggestionSubtitle,
    renderSuggestionBadge,
    guessCount,
    isComplete,
    canSubmit,
    status,
    labels,
    onNewRound
}: GuessSearchPanelProps<T>) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
    };

    const renderSuggestion = (suggestion: T) => (
        <SuggestionShell>
            <div className="min-w-0">
                <p className="truncate text-callout font-semibold text-foreground">
                    {getFullName(suggestion)}
                </p>
                <p className="mt-0.5 text-caption text-tertiary">
                    {getSuggestionSubtitle(suggestion)}
                </p>
            </div>
            {renderSuggestionBadge?.(suggestion)}
        </SuggestionShell>
    );

    return (
        <Card className="relative z-10">
            <div className="mx-auto mb-5 flex max-w-3xl items-center justify-between gap-4">
                <div>
                    <p className="text-caption font-medium uppercase tracking-wide text-tertiary">
                        {labels.panel}
                    </p>
                    <h2 className="mt-1 text-title3 text-foreground">{labels.heading}</h2>
                </div>
                <div className="shrink-0 rounded-md border border-border bg-surface-raised px-4 py-2.5 text-center">
                    <p className="text-caption font-medium uppercase tracking-wide text-tertiary">
                        {labels.attempts}
                    </p>
                    <p className="mt-0.5 text-title3 text-foreground">
                        {guessCount}/{MAX_ATTEMPTS}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-4">
                <label
                    htmlFor="search"
                    className="block text-center text-caption font-medium uppercase tracking-wide text-tertiary"
                >
                    {labels.findDriver}
                </label>
                <SearchField
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    onSuggestionSelected={(event: React.FormEvent<any>, data: { suggestion: T }) => {
                        event.preventDefault();
                        onSuggestionSelected(data.suggestion);
                    }}
                    getSuggestionValue={getFullName}
                    renderSuggestion={renderSuggestion}
                    inputProps={{
                        id: 'search',
                        placeholder: labels.placeholder,
                        value,
                        onChange: (_event: any, { newValue }: { newValue: string }) => onValueChange(newValue),
                        disabled: isComplete
                    }}
                />

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button type="submit" disabled={!canSubmit}>
                        {labels.guess}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onNewRound}>
                        {labels.newRound}
                    </Button>
                </div>
            </form>

            <GuessStatusLine status={status} />
        </Card>
    );
}
