import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AppHeader, Logo } from '../components';
import { Badge } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { staggerContainer, staggerItem, springFast } from '../lib/motion';
import { Gamepad2, Building2, Calendar, TrendingUp, Trophy, Puzzle, ArrowRight } from 'lucide-react';

export const WelcomePage = () => {
    const { t } = useLanguage();

    const gameModes = [
        { to: '/game', icon: Gamepad2, title: t.welcome.classicTitle, description: t.welcome.classicDescription },
        { to: '/guess-by-teams', icon: Building2, title: t.welcome.byTeamsTitle, description: t.welcome.byTeamsDescription },
        { to: '/fill-the-grid', icon: Calendar, title: t.welcome.fillTheGridTitle, description: t.welcome.fillTheGridDescription },
        { to: '/higher-lower', icon: TrendingUp, title: t.welcome.higherLowerTitle, description: t.welcome.higherLowerDescription },
        { to: '/constructor-grid', icon: Trophy, title: t.welcome.constructorGridTitle, description: t.welcome.constructorGridDescription },
        { to: '/connections', icon: Puzzle, title: t.welcome.connectionsTitle, description: t.welcome.connectionsDescription },
    ];

    return (
        <div className="min-h-screen">
            <AppHeader showHelpButton={true} />

            <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 pb-10 pt-24 sm:px-6">
                <motion.section
                    variants={staggerContainer(0.05)}
                    initial="hidden"
                    animate="visible"
                    className="flex w-full flex-col items-center gap-10 text-center"
                >
                    <motion.div variants={staggerItem} className="flex flex-col items-center gap-5">
                        <Logo className="h-20 w-auto sm:h-24" />

                        <div>
                            <h1 className="text-display text-foreground">F1dle</h1>
                            <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-accent" />
                        </div>

                        <p className="max-w-md text-callout text-secondary">
                            {t.welcome.tagline}
                        </p>
                    </motion.div>

                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                        {gameModes.map(({ to, icon: Icon, title, description }) => (
                            <motion.div key={to} variants={staggerItem} whileHover={{ y: -2 }} transition={springFast}>
                                <Link
                                    to={to}
                                    className="group flex h-full flex-col items-center gap-4 rounded-lg border border-border bg-surface p-6 text-center shadow-1 transition-colors hover:border-accent/40"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-raised text-secondary transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                                        <Icon className="h-6 w-6" strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-title3 text-foreground">{title}</h3>
                                        <p className="mt-2 text-footnote text-secondary">{description}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-footnote font-semibold text-accent">
                                        {t.actions.startGrid}
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-center gap-3">
                        <Badge>{t.welcome.driverPool}</Badge>
                        <Badge>{t.welcome.badge}</Badge>
                    </motion.div>
                </motion.section>
            </main>
        </div>
    );
};
