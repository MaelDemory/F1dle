import React from 'react';
import { HistoricalDriver } from '../../types';
import { Badge } from '../../components/ui';
import { compareNumber, compareSet, compareText } from '../comparators';
import { GuessMode } from '../types';

const MAX_TEAMS_SHOWN = 2;

const getFullName = (driver: HistoricalDriver) => `${driver.givenName} ${driver.familyName}`;

/**
 * Parameters
 *   teams — a driver's full team history.
 * What it does
 *   Renders the history compactly enough for a board tile: the first couple of
 *   outfits, then a count of the rest. The tile shows the *guessed* driver's own
 *   teams while its colour reports the overlap with the answer, so the player
 *   reads what they picked and learns whether anything is shared.
 * Output
 *   A label such as "Ferrari, McLaren +2", or an em dash when nothing is known.
 */
const formatTeams = (teams: string[]): string => {
    if (teams.length === 0) {
        return '—';
    }

    const shown = teams.slice(0, MAX_TEAMS_SHOWN).join(', ');
    const remaining = teams.length - MAX_TEAMS_SHOWN;

    return remaining > 0 ? `${shown} +${remaining}` : shown;
};

/**
 * All Time mode: every driver since 1950, compared on career totals.
 *
 * Two columns differ from the classic board by necessity. `historical_drivers`
 * carries no race counter, so seasons active stands in for entries. And a
 * historical driver has usually raced for several outfits, which makes exact
 * equality of "last team" almost never match — the team column therefore tests
 * whether the two careers overlap at any outfit.
 */
export const allTimeMode: GuessMode<HistoricalDriver> = {
    getId: (driver) => driver.driverId,
    getFullName,
    getSearchTerms: (driver) => [driver.givenName, driver.familyName, getFullName(driver)],
    getSuggestionSubtitle: (driver) => `${driver.lastTeam ?? '—'} · ${driver.nationality}`,
    renderSuggestionBadge: (driver) => <Badge>{driver.firstSeason}–{driver.lastSeason}</Badge>,
    columns: [
        {
            key: 'driver',
            labelKey: 'driver',
            display: getFullName
        },
        {
            key: 'teams',
            labelKey: 'teams',
            display: (driver) => formatTeams(driver.teamsHistory),
            compare: (guess, answer) => compareSet(guess.teamsHistory, answer.teamsHistory)
        },
        {
            key: 'nationality',
            labelKey: 'nation',
            display: (driver) => driver.nationality,
            compare: (guess, answer) => compareText(guess.nationality, answer.nationality)
        },
        {
            key: 'points',
            labelKey: 'points',
            display: (driver) => `${driver.totalPoints}`,
            compare: (guess, answer) => compareNumber(guess.totalPoints, answer.totalPoints)
        },
        {
            key: 'seasons',
            labelKey: 'seasons',
            display: (driver) => `${driver.seasonsActive}`,
            compare: (guess, answer) => compareNumber(guess.seasonsActive, answer.seasonsActive)
        },
        {
            key: 'wins',
            labelKey: 'wins',
            display: (driver) => `${driver.totalWins}`,
            compare: (guess, answer) => compareNumber(guess.totalWins, answer.totalWins)
        },
        {
            key: 'titles',
            labelKey: 'titles',
            display: (driver) => `${driver.championships}`,
            compare: (guess, answer) => compareNumber(guess.championships, answer.championships)
        }
    ]
};
