import { Driver, HistoricalDriver, Race, SeasonChampion } from "../types";

const getBaseUrl = () => {
    const configuredUrl = process.env.REACT_APP_API_URL?.trim();

    if (configuredUrl) {
        return configuredUrl.replace(/\/$/, '');
    }

    if (typeof window !== 'undefined') {
        return `${window.location.origin}/api`;
    }

    return 'http://localhost:8000/api';
};

const BASE_URL = getBaseUrl();

export const fetchDrivers = async (): Promise<Driver[]> => {
    const url = `${BASE_URL}/drivers`;
    return fetchData(url);
};

export const fetchRandomDriver = async (): Promise<Driver> => {
    const url = `${BASE_URL}/random`;
    return fetchData(url);
}

export const fetchHistoricalDrivers = async (): Promise<HistoricalDriver[]> => {
    const url = `${BASE_URL}/historical-drivers`;
    const response = await fetchData(url);
    return response?.data ?? response;
};

export const fetchRandomHistoricalWinner = async (): Promise<HistoricalDriver> => {
    const url = `${BASE_URL}/random-historical-winner`;
    return fetchData(url);
};

// Draws from the whole historical roster, with no performance threshold — unlike
// fetchRandomHistoricalWinner, which is limited to race winners.
export const fetchRandomHistoricalDriver = async (): Promise<HistoricalDriver> => {
    const url = `${BASE_URL}/random-historical-driver`;
    return fetchData(url);
};

export const fetchHistoricalWinners = async (): Promise<HistoricalDriver[]> => {
    const drivers = await fetchHistoricalDrivers();
    return drivers.filter((d) => d.totalWins >= 1);
};

/**
 * Historical records for the drivers on the current grid.
 *
 * The current season is read from the data — the highest `lastSeason` present —
 * rather than from the system clock. A clock-based year would silently return an
 * empty roster on 1 January, before the season's data has been seeded.
 *
 * Sourced from historical_drivers rather than the drivers table because only the
 * former carries `teamsHistory`, which the teams board needs as its clue.
 */
export const fetchCurrentGridHistoricalDrivers = async (): Promise<HistoricalDriver[]> => {
    const drivers = await fetchHistoricalDrivers();

    if (drivers.length === 0) {
        return [];
    }

    const currentSeason = Math.max(...drivers.map((driver) => driver.lastSeason));

    return drivers.filter((driver) => driver.lastSeason === currentSeason);
};

export const fetchSeasonChampions = async (): Promise<SeasonChampion[]> => {
    return fetchData(`${BASE_URL}/season-champions`);
};

export interface TeamRecord {
    name: string;
    logo_base64: string | null;
    logo_mime_type: string | null;
}

export const fetchTeams = async (): Promise<TeamRecord[]> => {
    const url = `${BASE_URL}/teams`;
    return fetchData(url);
};

export const fetchRaceResults = async (year: number): Promise<Race[]> => {
    // Try backend cache first
    const cached: Race[] = await fetchData(`${BASE_URL}/season-races/${year}`);
    if (cached && cached.length > 0) {
        return cached;
    }

    // Fallback: fetch directly from Ergast (for seasons not yet synced)
    const LIMIT = 100;
    let offset = 0;
    let total = 1;
    const racesMap = new Map<string, Race>();

    while (offset < total) {
        const url = `https://api.jolpi.ca/ergast/f1/${year}/results.json?limit=${LIMIT}&offset=${offset}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch race results for ${year}`);
        }

        const data = await response.json();
        const mrData = data?.MRData;
        total = Number(mrData?.total ?? 0);

        for (const race of (mrData?.RaceTable?.Races ?? []) as Race[]) {
            if (racesMap.has(race.round)) {
                racesMap.get(race.round)!.Results.push(...race.Results);
            } else {
                racesMap.set(race.round, { ...race, Results: [...race.Results] });
            }
        }

        offset += LIMIT;
    }

    return Array.from(racesMap.values()).sort((a, b) => Number(a.round) - Number(b.round));
};

export const fetchData = async (url: string): Promise<any> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        const message = data && typeof data === 'object' && 'message' in data
            ? String(data.message)
            : `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    if (data && typeof data === 'object' && 'error' in data) {
        throw new Error(String(data.error));
    }

    return data;
}