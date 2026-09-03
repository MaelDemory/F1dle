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
    first_entry: number;
    driver_number: number;
    fastest_lap: number;
    career_points: number;
    entries: number;
    world_championship: number;
}