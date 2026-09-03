import { useEffect, useState } from 'react';
import { fetchTeams, TeamRecord } from '../api/f1dleApi';

/**
 * Parameters
 *   None.
 * What it does
 *   Loads the team records once and indexes them by name, which is the shape
 *   every consumer actually wants — the endpoint returns a flat list, and three
 *   pages were each rebuilding the same map with their own state and effect.
 *   A failure resolves to an empty map rather than an error: logos are
 *   decoration, and a board must not be blocked by a missing badge.
 * Output
 *   A name-keyed map of team records, empty until loaded.
 */
export const useTeamLogos = (): Map<string, TeamRecord> => {
    const [teams, setTeams] = useState<Map<string, TeamRecord>>(new Map());

    useEffect(() => {
        let cancelled = false;

        fetchTeams()
            .then((list) => {
                if (cancelled) {
                    return;
                }

                setTeams(new Map(list.map((team) => [team.name, team])));
            })
            .catch(() => {
                if (!cancelled) {
                    setTeams(new Map());
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return teams;
};
