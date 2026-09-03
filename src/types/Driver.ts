export interface Driver {
    id_driver: number;
    name: string;
    surname: string;
    birth_date: string;
    nationality: string;
    team: string;
    team_logo_base64?: string | null;
    team_logo_mime_type?: string | null;
    win: number;
    pole: number;
    podium: number;
    first_entry: number;
    driver_number: number;
    // The API field is plural. It was declared as `fastest_lap` and never read,
    // so the mismatch stayed invisible until the detail card needed the value.
    fastest_laps: number;
    career_points: number;
    entries: number;
    world_championship: number;
}