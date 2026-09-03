import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Confetti } from '../components';
import { useLanguage } from '../i18n/LanguageContext';
import { spring, springFast } from '../lib/motion';
import { cn } from '../lib/utils';
import { Badge, Button, Card, PageHeader, PageShell, WinPanel } from '../components/ui';
import { Shuffle, RotateCcw, Lightbulb, Trophy } from 'lucide-react';

/* ──────────────────────────────────────────────
   Puzzle Data — 8 curated F1 connection puzzles
   Each has 4 categories × 4 items = 16 unique items
   ────────────────────────────────────────────── */

interface Category {
    title: string;
    items: string[];
    difficulty: number; // 1=easiest (yellow), 2, 3, 4=hardest (purple)
}

interface Puzzle {
    id: number;
    difficulty: 'easy' | 'medium' | 'hard';
    categories: Category[];
}

const PUZZLES: Puzzle[] = [
    {
        id: 1,
        difficulty: 'easy',
        categories: [
            { title: 'Ferrari World Champions', items: ['Michael Schumacher', 'Niki Lauda', 'Kimi Räikkönen', 'Alberto Ascari'], difficulty: 1 },
            { title: '4+ World Championships', items: ['Lewis Hamilton', 'Juan Manuel Fangio', 'Alain Prost', 'Sebastian Vettel'], difficulty: 2 },
            { title: 'Brazilian F1 Drivers', items: ['Ayrton Senna', 'Nelson Piquet', 'Emerson Fittipaldi', 'Felipe Massa'], difficulty: 3 },
            { title: 'Current F1 Teams (2025)', items: ['Mercedes', 'Red Bull', 'Ferrari', 'McLaren'], difficulty: 4 },
        ],
    },
    {
        id: 2,
        difficulty: 'easy',
        categories: [
            { title: 'Drivers with 50+ Wins', items: ['Lewis Hamilton', 'Michael Schumacher', 'Max Verstappen', 'Sebastian Vettel'], difficulty: 1 },
            { title: 'Legendary F1 Circuits', items: ['Monaco', 'Monza', 'Silverstone', 'Spa-Francorchamps'], difficulty: 2 },
            { title: 'French F1 Drivers', items: ['Alain Prost', 'René Arnoux', 'Jean Alesi', 'Pierre Gasly'], difficulty: 3 },
            { title: 'F1 Engine Manufacturers', items: ['Ferrari', 'Mercedes', 'Renault', 'Honda'], difficulty: 4 },
        ],
    },
    {
        id: 3,
        difficulty: 'medium',
        categories: [
            { title: 'McLaren World Champions', items: ['Ayrton Senna', 'Mika Häkkinen', 'Lewis Hamilton', 'Emerson Fittipaldi'], difficulty: 1 },
            { title: 'Street Circuits', items: ['Monaco', 'Singapore', 'Baku', 'Las Vegas'], difficulty: 2 },
            { title: 'Teams that became Mercedes', items: ['Tyrrell', 'BAR', 'Honda', 'Brawn GP'], difficulty: 3 },
            { title: 'World Champions who won at 40+', items: ['Juan Manuel Fangio', 'Jack Brabham', 'Graham Hill', 'Nigel Mansell'], difficulty: 4 },
        ],
    },
    {
        id: 4,
        difficulty: 'medium',
        categories: [
            { title: 'Drivers who raced for Ferrari', items: ['Fernando Alonso', 'Jean Alesi', 'Rubens Barrichello', 'Felipe Massa'], difficulty: 1 },
            { title: 'Williams World Champions', items: ['Alan Jones', 'Keke Rosberg', 'Nigel Mansell', 'Damon Hill'], difficulty: 2 },
            { title: 'Finnish F1 Drivers', items: ['Mika Häkkinen', 'Kimi Räikkönen', 'Valtteri Bottas', 'Heikki Kovalainen'], difficulty: 3 },
            { title: 'Red Bull Junior Graduates', items: ['Max Verstappen', 'Sebastian Vettel', 'Daniel Ricciardo', 'Carlos Sainz'], difficulty: 4 },
        ],
    },
    {
        id: 5,
        difficulty: 'hard',
        categories: [
            { title: 'Champions who won with Ferrari', items: ['Alberto Ascari', 'Juan Manuel Fangio', 'Mike Hawthorn', 'Phil Hill'], difficulty: 1 },
            { title: 'German F1 race winners', items: ['Michael Schumacher', 'Sebastian Vettel', 'Nico Rosberg', 'Heinz-Harald Frentzen'], difficulty: 2 },
            { title: 'Drivers who also won the Indy 500', items: ['Emerson Fittipaldi', 'Jacques Villeneuve', 'Mario Andretti', 'Graham Hill'], difficulty: 3 },
            { title: 'Teams that used Renault engines', items: ['Williams', 'Red Bull', 'Benetton', 'Lotus'], difficulty: 4 },
        ],
    },
    {
        id: 6,
        difficulty: 'easy',
        categories: [
            { title: 'Red Bull F1 Drivers', items: ['Max Verstappen', 'Daniel Ricciardo', 'Mark Webber', 'David Coulthard'], difficulty: 1 },
            { title: 'French F1 race winners', items: ['Alain Prost', 'René Arnoux', 'Jean Alesi', 'Patrick Tambay'], difficulty: 2 },
            { title: 'Teams with 8+ Constructors Titles', items: ['Ferrari', 'Williams', 'McLaren', 'Mercedes'], difficulty: 3 },
            { title: 'F1 Rain Masters', items: ['Ayrton Senna', 'Michael Schumacher', 'Jackie Stewart', 'Jenson Button'], difficulty: 4 },
        ],
    },
    {
        id: 7,
        difficulty: 'medium',
        categories: [
            { title: 'Lotus World Champions', items: ['Jim Clark', 'Jochen Rindt', 'Emerson Fittipaldi', 'Mario Andretti'], difficulty: 1 },
            { title: 'Italian F1 Circuits', items: ['Monza', 'Imola', 'Mugello', 'Pescara'], difficulty: 2 },
            { title: 'Drivers who also won Le Mans', items: ['Graham Hill', 'Fernando Alonso', 'Phil Hill', 'Mike Hawthorn'], difficulty: 3 },
            { title: 'Constructors from the 1970s', items: ['Lotus', 'Tyrrell', 'Brabham', 'Shadow'], difficulty: 4 },
        ],
    },
    {
        id: 8,
        difficulty: 'hard',
        categories: [
            { title: 'World Champions who died before 40', items: ['Jochen Rindt', 'Ayrton Senna', 'Jim Clark', 'Mike Hawthorn'], difficulty: 1 },
            { title: 'Champions with a single title', items: ['Nico Rosberg', 'Jenson Button', 'Mario Andretti', 'Jacques Villeneuve'], difficulty: 2 },
            { title: 'Drivers with 200+ race starts', items: ['Rubens Barrichello', 'Fernando Alonso', 'Kimi Räikkönen', 'Nelson Piquet'], difficulty: 3 },
            { title: 'F1 Teams that no longer exist', items: ['Lotus', 'Tyrrell', 'Brabham', 'Minardi'], difficulty: 4 },
        ],
    },
];

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

// Full class strings per difficulty so Tailwind can see them (tokens in index.css).
const DIFFICULTY_TILE_CLASSES: Record<number, string> = {
    1: 'border-difficulty-1/40 bg-difficulty-1/15 text-difficulty-1',
    2: 'border-difficulty-2/40 bg-difficulty-2/15 text-difficulty-2',
    3: 'border-difficulty-3/40 bg-difficulty-3/15 text-difficulty-3',
    4: 'border-difficulty-4/40 bg-difficulty-4/15 text-difficulty-4',
};

const DIFFICULTY_BANNER_CLASSES: Record<number, string> = {
    1: 'border-difficulty-1/50 bg-difficulty-1/20',
    2: 'border-difficulty-2/50 bg-difficulty-2/20',
    3: 'border-difficulty-3/50 bg-difficulty-3/20',
    4: 'border-difficulty-4/50 bg-difficulty-4/20',
};

const MAX_MISTAKES = 4;

interface FoundGroup {
    category: Category;
}

interface GameState {
    puzzleId: number;
    mistakes: number;
    foundGroups: FoundGroup[];
    remainingItems: string[];
}

const getShuffledItems = (puzzle: Puzzle): string[] => {
    const items = puzzle.categories.flatMap((c) => c.items);
    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
};

const initGameState = (puzzle: Puzzle): GameState => ({
    puzzleId: puzzle.id,
    mistakes: 0,
    foundGroups: [],
    remainingItems: getShuffledItems(puzzle),
});

export const Connections = () => {
    const { t } = useLanguage();
    const [puzzle, setPuzzle] = useState<Puzzle>(PUZZLES[0]);
    const [gameState, setGameState] = useState<GameState>(() => initGameState(PUZZLES[0]));
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [shakeItems, setShakeItems] = useState<string[]>([]);
    const [revealingGroup, setRevealingGroup] = useState<FoundGroup | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const allCategories = puzzle.categories;
    const isGameOver = gameState.mistakes >= MAX_MISTAKES;
    const gameEnded = isComplete || isGameOver;

    // Load random puzzle
    const pickPuzzle = useCallback(() => {
        const idx = Math.floor(Math.random() * PUZZLES.length);
        const p = PUZZLES[idx];
        setPuzzle(p);
        setGameState(initGameState(p));
        setSelectedItems([]);
        setShakeItems([]);
        setRevealingGroup(null);
        setIsComplete(false);
        setShowConfetti(false);
    }, []);

    const handleItemClick = (item: string) => {
        if (gameEnded || revealingGroup) return;
        // Don't select items from found groups
        const foundItem = gameState.foundGroups.some((g) => g.category.items.includes(item));
        if (foundItem) return;

        setShakeItems([]);

        setSelectedItems((prev) => {
            if (prev.includes(item)) {
                return prev.filter((i) => i !== item);
            }
            if (prev.length >= 4) return prev;
            return [...prev, item];
        });
    };

    const handleSubmit = () => {
        if (selectedItems.length !== 4 || gameEnded || revealingGroup) return;

        // Check if the 4 selected items match any unfound category
        const matchedCategory = allCategories.find((cat) => {
            if (gameState.foundGroups.some((g) => g.category.title === cat.title)) return false;
            const catSet = new Set(cat.items);
            return selectedItems.length === 4 && selectedItems.every((item) => catSet.has(item));
        });

        if (matchedCategory) {
            // Correct!
            const newGroup: FoundGroup = { category: matchedCategory };

            setRevealingGroup(newGroup);
            setTimeout(() => {
                setGameState((prev) => ({
                    ...prev,
                    foundGroups: [...prev.foundGroups, newGroup],
                    remainingItems: prev.remainingItems.filter((item) => !matchedCategory.items.includes(item)),
                }));
                setSelectedItems([]);
                setRevealingGroup(null);

                // Check if puzzle complete
                const newFoundCount = gameState.foundGroups.length + 1;
                if (newFoundCount >= 4) {
                    setTimeout(() => {
                        setIsComplete(true);
                        setShowConfetti(true);
                    }, 300);
                }
            }, 800);
        } else {
            // Check "one away"
            let isOneAway = false;
            for (const cat of allCategories) {
                if (gameState.foundGroups.some((g) => g.category.title === cat.title)) continue;
                const catSet = new Set(cat.items);
                const matchCount = selectedItems.filter((item) => catSet.has(item)).length;
                if (matchCount === 3) {
                    isOneAway = true;
                    break;
                }
            }

            setShakeItems([...selectedItems]);
            setGameState((prev) => ({ ...prev, mistakes: prev.mistakes + 1 }));

            setTimeout(() => {
                setShakeItems([]);
                if (gameState.mistakes + 1 >= MAX_MISTAKES && !isOneAway) {
                    // Reveal remaining groups on game over
                }
            }, 600);
        }
    };

    const handleShuffle = () => {
        if (gameEnded || revealingGroup) return;
        setSelectedItems([]);
        setGameState((prev) => ({
            ...prev,
            remainingItems: getShuffledItems(puzzle),
        }));
    };

    const handleDeselectAll = () => {
        setSelectedItems([]);
        setShakeItems([]);
    };

    /**
     * getTileClasses
     * Parameters
     *   item: the grid item label
     * What it does
     *   Resolves the token classes for a tile: reveal tint wins, then shake
     *   (danger), then selection (accent), then the neutral surface state.
     * Output
     *   A Tailwind class string for the tile's border/background/text.
     */
    const getTileClasses = (item: string): string => {
        if (revealingGroup && revealingGroup.category.items.includes(item)) {
            return DIFFICULTY_TILE_CLASSES[revealingGroup.category.difficulty];
        }
        if (selectedItems.includes(item)) {
            if (shakeItems.includes(item)) {
                return 'border-danger/50 bg-danger/10 text-foreground';
            }
            return 'border-accent/60 bg-accent/10 text-foreground';
        }
        return 'border-border bg-surface text-foreground hover:bg-surface-raised';
    };

    const mistakesDots = useMemo(() => {
        return Array.from({ length: MAX_MISTAKES }, (_, i) => (
            <span
                key={i}
                className={cn(
                    'inline-block h-2.5 w-2.5 rounded-full transition-colors',
                    i < gameState.mistakes ? 'bg-danger' : 'bg-border'
                )}
            />
        ));
    }, [gameState.mistakes]);

    return (
        <PageShell width="sm">
            <Confetti active={showConfetti} />
            <PageHeader title={t.connections.title} subtitle={t.connections.mode} />

            {/* Top bar */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-caption font-medium uppercase tracking-wide text-tertiary">{t.connections.mistakes}</span>
                    <div className="flex gap-1.5">{mistakesDots}</div>
                </div>
                <Badge tone="neutral">
                    {puzzle.difficulty === 'easy' ? t.connections.difficulty.easy : puzzle.difficulty === 'medium' ? t.connections.difficulty.medium : t.connections.difficulty.hard}
                </Badge>
            </div>

            {/* Found groups */}
            {gameState.foundGroups.length > 0 && (
                <div className="mb-4 space-y-2">
                    {gameState.foundGroups.map((group) => (
                        <motion.div
                            key={group.category.title}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={spring}
                            className={cn(
                                'rounded-lg border px-4 py-3 text-center',
                                DIFFICULTY_BANNER_CLASSES[group.category.difficulty]
                            )}
                        >
                            <p className="text-caption font-semibold uppercase tracking-wide text-foreground">{group.category.title}</p>
                            <p className="mt-1 text-footnote text-secondary">{group.category.items.join(', ')}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Game over reveal */}
            {isGameOver && !isComplete && (
                <Card padding="lg" className="mb-4 text-center">
                    <p className="text-caption font-medium uppercase tracking-wide text-danger">{t.higherLower.gameOver}</p>
                    <p className="mt-2 text-footnote text-secondary">The remaining groups were:</p>
                    <div className="mt-4 space-y-2">
                        {allCategories
                            .filter((c) => !gameState.foundGroups.some((g) => g.category.title === c.title))
                            .map((cat) => (
                                <div
                                    key={cat.title}
                                    className={cn('rounded-md border px-3 py-2', DIFFICULTY_BANNER_CLASSES[cat.difficulty])}
                                >
                                    <p className="text-caption font-semibold text-foreground">{cat.title}</p>
                                    <p className="mt-0.5 text-caption text-secondary">{cat.items.join(', ')}</p>
                                </div>
                            ))}
                    </div>
                    <Button className="mt-6" onClick={pickPuzzle}>
                        <RotateCcw className="h-4 w-4" />
                        {t.connections.newGame}
                    </Button>
                </Card>
            )}

            {/* Complete screen */}
            {isComplete && (
                <Card padding="lg" className="mb-4">
                    <WinPanel
                        tone="success"
                        icon={<Trophy className="h-7 w-7 text-success" />}
                        title={t.connections.gameComplete}
                        description={
                            gameState.mistakes === 0
                                ? t.connections.perfect
                                : `${gameState.mistakes} ${t.connections.multipleMistakes}`
                        }
                        actions={
                            <Button onClick={pickPuzzle}>
                                <RotateCcw className="h-4 w-4" />
                                {t.connections.newGame}
                            </Button>
                        }
                    />
                </Card>
            )}

            {/* Item grid */}
            {!isGameOver && !isComplete && (
                <>
                    <p className="mb-3 text-center text-caption font-medium uppercase tracking-wide text-tertiary">
                        {t.connections.selectItems}
                    </p>

                    <div className="mb-4 grid grid-cols-4 gap-2">
                        {gameState.remainingItems.map((item) => {
                            const isSelected = selectedItems.includes(item);
                            const isShaking = shakeItems.includes(item);

                            return (
                                <motion.button
                                    key={item}
                                    layout
                                    type="button"
                                    onClick={() => handleItemClick(item)}
                                    disabled={!!revealingGroup}
                                    animate={{ scale: isSelected ? 1.03 : 1 }}
                                    whileTap={revealingGroup ? undefined : { scale: 0.97 }}
                                    transition={{ ...spring, scale: springFast }}
                                    className={cn(
                                        'flex items-center justify-center rounded-md border px-1.5 py-3 text-center text-caption font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                                        getTileClasses(item),
                                        isShaking && 'animate-[shake_0.5s_ease-in-out]',
                                        revealingGroup ? 'cursor-default' : 'cursor-pointer'
                                    )}
                                >
                                    {item}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button variant="secondary" size="sm" onClick={handleShuffle} disabled={!!revealingGroup}>
                            <Shuffle className="h-3.5 w-3.5" />
                            {t.connections.shuffle}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDeselectAll} disabled={selectedItems.length === 0 || !!revealingGroup}>
                            {t.connections.deselectAll}
                        </Button>
                        <Button size="sm" onClick={handleSubmit} disabled={selectedItems.length !== 4 || !!revealingGroup || gameEnded}>
                            <Lightbulb className="h-3.5 w-3.5" />
                            {t.connections.submit}
                        </Button>
                    </div>

                    {/* Status messages (fixed height to avoid layout jump) */}
                    <div className="mt-3 h-5 text-center">
                        {selectedItems.length > 0 && selectedItems.length < 4 && (
                            <p className="text-caption text-tertiary">{selectedItems.length}/4 selected</p>
                        )}
                    </div>

                    {/* New puzzle */}
                    <div className="mt-4 text-center">
                        <Button variant="ghost" size="sm" onClick={pickPuzzle}>
                            {t.connections.newGame}
                        </Button>
                    </div>
                </>
            )}
        </PageShell>
    );
};
