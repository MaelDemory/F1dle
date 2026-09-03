import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Gamepad2, Home, Menu, X, Trophy, ChevronDown, Building2, Calendar, TrendingUp, Puzzle } from 'lucide-react';
import { LanguageSwitch } from './LanguageSwitch';
import { ThemeSwitch } from './ThemeSwitch';
import { HelpModal } from './HelpModal';
import { useLanguage } from '../i18n/LanguageContext';
import { useScrollEdge } from '../hooks/useScrollEdge';
import { springFast } from '../lib/motion';
import { cn } from '../lib/utils';

const DriverHelmetIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
        <path d="M4 14a8 8 0 0 1 16 0v2.5a1.5 1.5 0 0 1-1.5 1.5H16l-1.2 2H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 14.5h9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M7 18H5.5A1.5 1.5 0 0 1 4 16.5V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.5 9.5h3.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
);

type AppHeaderProps = {
    showHelpButton?: boolean;
    actions?: ReactNode;
};

export const AppHeader = ({ showHelpButton = true, actions }: AppHeaderProps) => {
    const location = useLocation();
    const { t } = useLanguage();
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [playDropdownOpen, setPlayDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const scrolled = useScrollEdge();

    const isGamePage = ['/game', '/guess-by-teams', '/fill-the-grid', '/higher-lower', '/constructor-grid', '/connections'].includes(location.pathname);

    const playSubItems = [
        { to: '/game', label: t.common.navigation.gameClassic, icon: <Gamepad2 className="h-3.5 w-3.5" strokeWidth={2} /> },
        { to: '/guess-by-teams', label: t.common.navigation.gameByTeams, icon: <Building2 className="h-3.5 w-3.5" strokeWidth={2} /> },
        { to: '/fill-the-grid', label: t.common.navigation.fillTheGrid, icon: <Calendar className="h-3.5 w-3.5" strokeWidth={2} /> },
        { to: '/higher-lower', label: t.common.navigation.higherLower, icon: <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} /> },
        { to: '/constructor-grid', label: t.common.navigation.constructorGrid, icon: <Trophy className="h-3.5 w-3.5" strokeWidth={2} /> },
        { to: '/connections', label: t.common.navigation.connections, icon: <Puzzle className="h-3.5 w-3.5" strokeWidth={2} /> }
    ];

    const navItems = [
        { to: '/drivers', label: t.common.navigation.drivers, icon: <DriverHelmetIcon /> },
        { to: '/results', label: t.common.navigation.results, icon: <Trophy className="h-4 w-4" strokeWidth={2} /> }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setPlayDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinkClass = (isActive: boolean) =>
        cn(
            'relative flex items-center gap-2 rounded-sm px-3.5 py-2 text-footnote font-medium transition-colors',
            isActive ? 'text-foreground' : 'text-secondary hover:text-foreground'
        );

    const activeIndicator = (
        <motion.span
            layoutId="nav-active-indicator"
            transition={springFast}
            className="absolute bottom-0 left-3.5 right-3.5 h-0.5 rounded-full bg-accent"
        />
    );

    return (
        <>
            <HelpModal open={showHelpModal} onClose={() => setShowHelpModal(false)} />

            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-30 transition-[background-color,border-color,box-shadow] duration-200',
                    'border-b backdrop-blur-xl backdrop-saturate-150',
                    scrolled ? 'border-border/50 bg-background/70' : 'border-transparent bg-transparent backdrop-blur-none'
                )}
            >
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    {/* Left — Brand */}
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent">
                            <span className="text-caption font-bold text-accent-foreground">F1</span>
                        </div>
                        <span className="text-body font-semibold text-foreground">F1dle</span>
                    </Link>

                    {/* Center — Nav (desktop) */}
                    <nav className="hidden items-center gap-1 sm:flex">
                        <Link to="/" className={navLinkClass(location.pathname === '/')}>
                            <Home className="h-4 w-4" strokeWidth={2} />
                            {t.common.navigation.home}
                            {location.pathname === '/' && activeIndicator}
                        </Link>

                        {/* Play dropdown */}
                        <div ref={dropdownRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setPlayDropdownOpen(!playDropdownOpen)}
                                className={navLinkClass(isGamePage)}
                            >
                                <Gamepad2 className="h-4 w-4" strokeWidth={2} />
                                {t.common.navigation.game}
                                <ChevronDown className={cn('h-3 w-3 transition-transform', playDropdownOpen && 'rotate-180')} />
                                {isGamePage && activeIndicator}
                            </button>

                            <AnimatePresence>
                                {playDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={springFast}
                                        style={{ transformOrigin: 'top left' }}
                                        className="absolute left-0 top-full mt-2 w-52 rounded-md border border-border bg-surface/85 py-1.5 shadow-2 backdrop-blur-2xl"
                                    >
                                        {playSubItems.map((item) => {
                                            const isActive = location.pathname === item.to;

                                            return (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    onClick={() => setPlayDropdownOpen(false)}
                                                    className={cn(
                                                        'flex items-center gap-2.5 px-4 py-2.5 text-footnote font-medium transition-colors',
                                                        isActive
                                                            ? 'text-accent'
                                                            : 'text-secondary hover:bg-surface-raised hover:text-foreground'
                                                    )}
                                                >
                                                    {item.icon}
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {navItems.map((item) => {
                            const isActive = location.pathname === item.to;

                            return (
                                <Link key={item.to} to={item.to} className={navLinkClass(isActive)}>
                                    {item.icon}
                                    {item.label}
                                    {isActive && activeIndicator}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right — Actions (desktop) */}
                    <div className="hidden items-center gap-3 sm:flex">
                        {actions}
                        <LanguageSwitch />
                        <ThemeSwitch />
                        {showHelpButton && (
                            <button
                                type="button"
                                onClick={() => setShowHelpModal(true)}
                                aria-label={t.common.help}
                                className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-footnote font-semibold text-secondary transition-colors hover:bg-surface-raised hover:text-foreground"
                            >
                                ?
                            </button>
                        )}
                    </div>

                    {/* Mobile — Hamburger */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                        className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-secondary transition-colors hover:text-foreground sm:hidden"
                    >
                        {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={springFast}
                            className="overflow-hidden border-t border-border/50 bg-background/85 backdrop-blur-2xl sm:hidden"
                        >
                            <nav className="flex flex-col gap-0.5 px-4 pb-4 pt-3">
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-callout font-medium transition-colors',
                                        location.pathname === '/' ? 'bg-surface-raised text-foreground' : 'text-secondary hover:text-foreground'
                                    )}
                                >
                                    <Home className="h-4 w-4" strokeWidth={2} />
                                    {t.common.navigation.home}
                                </Link>

                                <div className="flex items-center gap-3 px-3 py-2.5 text-caption font-medium uppercase tracking-wide text-tertiary">
                                    <Gamepad2 className="h-4 w-4" strokeWidth={2} />
                                    {t.common.navigation.game}
                                </div>
                                {playSubItems.map((item) => {
                                    const isActive = location.pathname === item.to;

                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 rounded-md py-2 pl-10 pr-3 text-callout font-medium transition-colors',
                                                isActive ? 'bg-surface-raised text-foreground' : 'text-secondary hover:text-foreground'
                                            )}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    );
                                })}

                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.to;

                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 rounded-md px-3 py-2.5 text-callout font-medium transition-colors',
                                                isActive ? 'bg-surface-raised text-foreground' : 'text-secondary hover:text-foreground'
                                            )}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <div className="mx-4 mb-4 flex items-center gap-3 border-t border-border/50 pt-3">
                                <LanguageSwitch />
                                <ThemeSwitch />
                                {showHelpButton && (
                                    <button
                                        type="button"
                                        onClick={() => { setShowHelpModal(true); setMobileMenuOpen(false); }}
                                        className="rounded-sm border border-border px-3 py-2 text-footnote font-medium text-secondary transition-colors hover:text-foreground"
                                    >
                                        {t.common.help}
                                    </button>
                                )}
                                {actions}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
};
