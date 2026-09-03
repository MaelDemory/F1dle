import React from 'react';
import { HistoricalDriver } from '../../types';
import { Badge } from '../../components/ui';
import { GuessIdentity } from '../types';

const getFullName = (driver: HistoricalDriver) => `${driver.givenName} ${driver.familyName}`;

/**
 * Parameters
 *   winsLabel — the translated word for "wins", used in the suggestion subtitle.
 * What it does
 *   Builds the identity for the teams board. It is a factory rather than a
 *   constant because this board's suggestion subtitle contains a translated
 *   word, unlike the grid modes whose subtitles are pure data.
 *
 *   There are no columns here: the board reveals a guess as simply right or
 *   wrong, the only clue being the answer's team history.
 * Output
 *   A GuessIdentity for historical drivers.
 */
export const byTeamsIdentity = (winsLabel: string): GuessIdentity<HistoricalDriver> => ({
    getId: (driver) => driver.driverId,
    getFullName,
    getSearchTerms: (driver) => [driver.familyName, driver.givenName, getFullName(driver)],
    getSuggestionSubtitle: (driver) => `${driver.nationality} · ${driver.totalWins} ${winsLabel}`,
    renderSuggestionBadge: (driver) =>
        driver.lastTeam ? (
            <Badge tone="neutral" className="shrink-0">
                {driver.lastTeam}
            </Badge>
        ) : null
});
