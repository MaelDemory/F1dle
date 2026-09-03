import React from 'react';
import { TeamRecord } from '../../api/f1dleApi';
import { Badge, Card } from '../ui';

type TeamsCluePanelProps = {
    teams: string[];
    logos: Map<string, TeamRecord>;
    label: string;
    /** Constraint on the hidden driver, when the board narrows the pool. */
    hint?: string;
};

/**
 * Parameters
 *   teams — the hidden driver's team history, which is the whole clue.
 *   logos — name-keyed team records. label — panel heading. hint — the pool's
 *   constraint, spelled out so the player is not left to infer it.
 * What it does
 *   Shows the answer's outfits as badges, with a logo when one is on record.
 *   A missing logo degrades to the name alone rather than a gap, since the badge
 *   still carries the clue.
 * Output
 *   The clue card.
 */
export const TeamsCluePanel = ({ teams, logos, label, hint }: TeamsCluePanelProps) => (
    <Card>
        <p className="text-center text-caption font-medium uppercase tracking-wide text-tertiary">
            {label}
        </p>
        {hint && <p className="mt-1.5 text-center text-footnote text-secondary">{hint}</p>}
        <div className="mb-4" />
        <div className="flex flex-wrap justify-center gap-2.5">
            {teams.map((team, index) => {
                const record = logos.get(team);

                return (
                    <Badge key={`${team}-${index}`} tone="neutral" size="md">
                        {record?.logo_base64 && (
                            <img
                                src={`data:${record.logo_mime_type};base64,${record.logo_base64}`}
                                alt=""
                                className="h-4 w-4 object-contain"
                            />
                        )}
                        <span className="font-semibold text-foreground">{team}</span>
                    </Badge>
                );
            })}
        </div>
    </Card>
);
