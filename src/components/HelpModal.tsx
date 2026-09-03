import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Modal, Card, Button } from './ui';

type HelpModalProps = {
    open: boolean;
    onClose: () => void;
};

export const HelpModal = ({ open, onClose }: HelpModalProps) => {
    const { t } = useLanguage();

    return (
        <Modal open={open} onClose={onClose} size="lg" className="max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-caption font-medium uppercase tracking-wide text-tertiary">{t.common.help}</p>
                    <h2 className="mt-1.5 text-title2 text-foreground">{t.game.helpTitle}</h2>
                </div>
                <Button variant="secondary" size="sm" onClick={onClose}>
                    {t.common.close}
                </Button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
                <Card padding="sm">
                    <p className="text-caption font-medium uppercase tracking-wide text-tertiary">{t.game.helpGoal}</p>
                    <p className="mt-2 text-footnote text-secondary">{t.game.helpGoalDescription}</p>
                </Card>
                <Card tone="success" padding="sm">
                    <p className="text-caption font-medium uppercase tracking-wide text-success">{t.game.helpGreen}</p>
                    <p className="mt-2 text-footnote text-secondary">{t.game.helpGreenDescription}</p>
                </Card>
                <Card tone="danger" padding="sm">
                    <p className="text-caption font-medium uppercase tracking-wide text-danger">{t.game.helpRed}</p>
                    <p className="mt-2 text-footnote text-secondary">{t.game.helpRedDescription}</p>
                </Card>
            </div>

            <Card padding="sm" className="mt-4">
                <p className="text-caption font-medium uppercase tracking-wide text-tertiary">{t.game.helpRules}</p>
                <ul className="mt-3 space-y-2 text-footnote text-secondary">
                    <li>{t.game.helpRule1}</li>
                    <li>{t.game.helpRule2}</li>
                    <li>{t.game.helpRule3}</li>
                    <li>{t.game.helpRule4}</li>
                    <li>{t.game.helpRule5}</li>
                </ul>
            </Card>
        </Modal>
    );
};
