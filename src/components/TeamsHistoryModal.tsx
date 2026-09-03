import React from 'react';
import { X } from 'lucide-react';
import { TeamRecord } from '../api/f1dleApi';
import { useLanguage } from '../i18n/LanguageContext';
import { Modal, Button } from './ui';

type Props = {
    driverName: string;
    teamsHistory: string[];
    teamRecords: Map<string, TeamRecord>;
    onClose: () => void;
};

const getTeamInitials = (name: string) =>
    name
        .split(/[\s\-/]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

export const TeamsHistoryModal = ({ driverName, teamsHistory, teamRecords, onClose }: Props) => {
    const { t } = useLanguage();

    const reversed = [...teamsHistory].reverse();

    return (
        <Modal open onClose={onClose} size="lg" className="max-h-[calc(100vh-3rem)] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-caption font-medium uppercase tracking-wide text-tertiary">
                        {t.drivers.teamHistory}
                    </p>
                    <h2 className="mt-1.5 text-title2 text-foreground">{driverName}</h2>
                </div>
                <Button variant="secondary" size="sm" onClick={onClose} aria-label={t.common.close}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Team list */}
            <ul className="mt-6">
                {reversed.map((teamName, index) => {
                    const record = teamRecords.get(teamName);
                    const logoSrc = record?.logo_base64 && record?.logo_mime_type
                        ? `data:${record.logo_mime_type};base64,${record.logo_base64}`
                        : null;

                    return (
                        <li
                            key={teamName + index}
                            className="flex items-center gap-3 border-b border-border py-3 last:border-b-0"
                        >
                            {/* Logo ou placeholder */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-raised p-1">
                                {logoSrc ? (
                                    <img
                                        src={logoSrc}
                                        alt={teamName}
                                        className="h-8 w-8 object-contain"
                                    />
                                ) : (
                                    <span className="text-caption font-semibold text-tertiary">
                                        {getTeamInitials(teamName)}
                                    </span>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-callout font-semibold text-foreground">
                                    {teamName}
                                </p>
                                {index === 0 && (
                                    <p className="text-footnote text-tertiary">
                                        {t.drivers.lastTeam}
                                    </p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Modal>
    );
};
