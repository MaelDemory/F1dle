export interface HistoricalDriver {
    driverId: string;
    givenName: string;
    familyName: string;
    dateOfBirth?: string;
    nationality: string;
    permanentNumber?: string;
    code?: string;
    totalWins: number;
    totalPoints: number;
    championships: number;
    seasonsActive: number;
    firstSeason: number;
    lastSeason: number;
    lastTeam?: string;
    teamsHistory: string[];
}
