import React from 'react';
import { X } from 'lucide-react';
import { TeamRecord } from '../../api/f1dleApi';
import { DriverDetail } from '../../drivers/detail';
import { Badge, Button, Modal, StatCard } from '../ui';

type DriverDetailCardProps = {
    detail: DriverDetail;
    /** Logos for the team-history list; the header logo travels in `detail`. */
    teamLogos: Map<string, TeamRecord>;
    labels: {
        eyebrow: string;
        teamHistory: string;
        close: string;
    };
    onClose: () => void;
};

const getTeamInitials = (name: string) =>
    name
        .split(/[\s\-/]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

/**
 * Parameters
 *   detail — the normalised driver record. teamLogos — name-keyed team records
 *   for the history list. labels — translated headings. onClose — dismissal.
 * What it does
 *   Presents one driver's full record in a single modal: identity, the headline
 *   figures as stat tiles, the remaining fields as label/value rows, and the
 *   team history when the record has one.
 *
 *   It deliberately opens no further modal. The team history used to live in its
 *   own dialog, and reaching it from here would stack two — which the modality
 *   guidance warns against, since the second hides the context of the first.
 *   Sections with no data are omitted rather than rendered empty.
 * Output
 *   The detail modal.
 */
export const DriverDetailCard = ({
    detail,
    teamLogos,
    labels,
    onClose
}: DriverDetailCardProps) => {
    const history = [...detail.teamsHistory].reverse();

    return (
        <Modal open onClose={onClose} size="lg" className="max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                    {detail.logo && (
                        <img
                            src={`data:${detail.logo.mime};base64,${detail.logo.src}`}
                            alt=""
                            className="mt-1 h-10 w-10 shrink-0 object-contain"
                        />
                    )}
                    <div className="min-w-0">
                        <p className="text-caption font-medium uppercase tracking-wide text-tertiary">
                            {labels.eyebrow}
                        </p>
                        <h2 className="mt-1.5 text-title2 text-foreground">{detail.fullName}</h2>
                        <p className="mt-1 text-footnote text-secondary">
                            {detail.team ? `${detail.team} · ` : ''}
                            {detail.nationality}
                        </p>
                        {(detail.number || detail.code) && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {detail.number && <Badge>#{detail.number}</Badge>}
                                {detail.code && <Badge tone="neutral">{detail.code}</Badge>}
                            </div>
                        )}
                    </div>
                </div>
                <Button variant="secondary" size="sm" onClick={onClose} aria-label={labels.close}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {detail.headline.map((entry) => (
                    <StatCard key={entry.key} label={entry.label} value={entry.value} />
                ))}
            </div>

            {detail.facts.length > 0 && (
                <dl className="mt-6 divide-y divide-border border-t border-border">
                    {detail.facts.map((entry) => (
                        <div key={entry.key} className="flex items-baseline justify-between gap-4 py-2.5">
                            <dt className="text-footnote text-tertiary">{entry.label}</dt>
                            <dd className="text-footnote font-semibold text-foreground">{entry.value}</dd>
                        </div>
                    ))}
                </dl>
            )}

            {history.length > 0 && (
                <section className="mt-6">
                    <p className="text-caption font-medium uppercase tracking-wide text-tertiary">
                        {labels.teamHistory}
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {history.map((teamName, index) => {
                            const record = teamLogos.get(teamName);

                            return (
                                <li key={`${teamName}-${index}`}>
                                    <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface-raised px-2.5 py-1.5">
                                        {record?.logo_base64 ? (
                                            <img
                                                src={`data:${record.logo_mime_type};base64,${record.logo_base64}`}
                                                alt=""
                                                className="h-4 w-4 object-contain"
                                            />
                                        ) : (
                                            <span
                                                aria-hidden="true"
                                                className="text-caption font-semibold text-tertiary"
                                            >
                                                {getTeamInitials(teamName)}
                                            </span>
                                        )}
                                        <span className="text-footnote font-medium text-foreground">
                                            {teamName}
                                        </span>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </Modal>
    );
};
