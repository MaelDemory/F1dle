import React from 'react';
import { Button, Modal, WinPanel } from '../ui';
import { Confetti } from '../Confetti';

type VictoryDialogProps = {
    open: boolean;
    onClose: () => void;
    onPlayAgain: () => void;
    answerName: string;
    labels: {
        eyebrow: string;
        title: string;
        description: string;
        close: string;
        playAgain: string;
    };
};

/**
 * Parameters
 *   open — whether the reveal has fired. onClose / onPlayAgain — dismissal paths.
 *   answerName — the found entry. labels — pre-translated copy.
 * What it does
 *   Shows the victory modal and fires the confetti alongside it, so the two stay
 *   in step with a single piece of state.
 * Output
 *   The confetti layer and the modal.
 */
export const VictoryDialog = ({
    open,
    onClose,
    onPlayAgain,
    answerName,
    labels
}: VictoryDialogProps) => (
    <>
        <Confetti active={open} />

        <Modal open={open} onClose={onClose}>
            <WinPanel
                icon="🏁"
                eyebrow={labels.eyebrow}
                title={labels.title}
                highlight={answerName}
                description={labels.description}
                actions={
                    <>
                        <Button variant="secondary" onClick={onClose}>
                            {labels.close}
                        </Button>
                        <Button onClick={onPlayAgain}>{labels.playAgain}</Button>
                    </>
                }
            />
        </Modal>
    </>
);
