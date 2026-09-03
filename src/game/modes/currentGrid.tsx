import React from 'react';
import { Driver } from '../../types';
import { Badge } from '../../components/ui';
import { compareNumber, compareText } from '../comparators';
import { GuessMode } from '../types';

/**
 * In this schema `name` holds the family name and `surname` the given name, so
 * the displayed order is deliberately surname-then-name.
 */
const getFullName = (driver: Driver) => `${driver.surname} ${driver.name}`;

/**
 * Classic mode: the current season's grid, compared on career totals.
 *
 * The seven columns and their comparisons reproduce the pre-refactor board
 * exactly — same order, same fields, same arrow semantics.
 */
export const currentGridMode: GuessMode<Driver> = {
    getId: (driver) => driver.id_driver,
    getFullName,
    // Matches the pre-refactor filter: given name, family name, or full name.
    getSearchTerms: (driver) => [driver.surname, driver.name, getFullName(driver)],
    getSuggestionSubtitle: (driver) => `${driver.team} · ${driver.nationality}`,
    renderSuggestionBadge: (driver) => <Badge>#{driver.driver_number}</Badge>,
    columns: [
        {
            key: 'driver',
            labelKey: 'driver',
            display: getFullName
        },
        {
            key: 'team',
            labelKey: 'team',
            display: (driver) => driver.team,
            compare: (guess, answer) => compareText(guess.team, answer.team)
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
            display: (driver) => `${driver.career_points}`,
            compare: (guess, answer) => compareNumber(guess.career_points, answer.career_points)
        },
        {
            key: 'entries',
            labelKey: 'entries',
            display: (driver) => `${driver.entries}`,
            compare: (guess, answer) => compareNumber(guess.entries, answer.entries)
        },
        {
            key: 'wins',
            labelKey: 'wins',
            display: (driver) => `${driver.win}`,
            compare: (guess, answer) => compareNumber(guess.win, answer.win)
        },
        {
            key: 'titles',
            labelKey: 'titles',
            display: (driver) => `${driver.world_championship}`,
            compare: (guess, answer) => compareNumber(guess.world_championship, answer.world_championship)
        }
    ]
};
