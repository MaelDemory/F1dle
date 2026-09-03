export interface RaceResultDriver {
    driverId: string;
    permanentNumber?: string;
    code?: string;
    givenName: string;
    familyName: string;
    nationality: string;
}

export interface RaceResultConstructor {
    constructorId: string;
    name: string;
    nationality: string;
}

export interface RaceResult {
    position: string;
    positionText: string;
    number: string;
    points: string;
    Driver: RaceResultDriver;
    Constructor: RaceResultConstructor;
    grid: string;
    laps: string;
    status: string;
    Time?: { millis: string; time: string };
    FastestLap?: { rank: string; lap: string; Time: { time: string }; AverageSpeed?: { units: string; speed: string } };
}

export interface RaceCircuit {
    circuitId: string;
    circuitName: string;
    Location: {
        lat: string;
        long: string;
        locality: string;
        country: string;
    };
}

export interface Race {
    season: string;
    round: string;
    raceName: string;
    date: string;
    time?: string;
    Circuit: RaceCircuit;
    Results: RaceResult[];
}
