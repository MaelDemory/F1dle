import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'fr';

const STORAGE_KEY = 'f1dle-language';

type TranslationTree = {
    common: {
        close: string;
        help: string;
        playAgain: string;
        attempts: string;
        victory: string;
        language: string;
        newRound: string;
        guess: string;
        retry: string;
        navigation: {
            home: string;
            game: string;
            gameClassic: string;
            gameByTeams: string;
            fillTheGrid: string;
            higherLower: string;
            constructorGrid: string;
            connections: string;
            drivers: string;
            results: string;
        };
    };
    welcome: {
        tagline: string;
        driverPool: string;
        badge: string;
        title: string;
        description: string;
        ctaHint: string;
        classicTitle: string;
        classicDescription: string;
        byTeamsTitle: string;
        byTeamsDescription: string;
        fillTheGridTitle: string;
        fillTheGridDescription: string;
        higherLowerTitle: string;
        higherLowerDescription: string;
        constructorGridTitle: string;
        constructorGridDescription: string;
        connectionsTitle: string;
        connectionsDescription: string;
        boardTitle: string;
        boardLogic: string;
        boardLabels: {
            driver: string;
            team: string;
            nation: string;
            points: string;
            entries: string;
            wins: string;
            titles: string;
        };
        green: string;
        greenDescription: string;
        red: string;
        redDescription: string;
        neutral: string;
        neutralDescription: string;
    };
    theme: {
        light: string;
        dark: string;
        system: string;
        label: string;
    };
    game: {
        mode: string;
        title: string;
        loading: string;
        modeCurrent: string;
        modeAllTime: string;
        allTimeMode: string;
        allTimeTitle: string;
        allTimeLoading: string;
        helpTitle: string;
        helpGoal: string;
        helpGoalDescription: string;
        helpGreen: string;
        helpGreenDescription: string;
        helpRed: string;
        helpRedDescription: string;
        helpRules: string;
        helpRule1: string;
        helpRule2: string;
        helpRule3: string;
        helpRule4: string;
        helpRule5: string;
    };
    search: {
        panel: string;
        roundComplete: string;
        nextDriver: string;
        findDriver: string;
        placeholder: string;
        duplicateGuess: string;
        invalidGuess: string;
        chooseDriver: string;
        outOfAttempts: string;
        hiddenDriverWas: string;
        youFound: string;
        perfectRead: string;
        resetBoard: string;
        invalidGuessTitle: string;
        dataErrorTitle: string;
        dataErrorDescription: string;
        resultGrid: string;
        raceControlBoard: string;
        sixRows: string;
        labels: {
            driver: string;
            team: string;
            teams: string;
            nation: string;
            points: string;
            entries: string;
            seasons: string;
            wins: string;
            titles: string;
        };
        modalTitle: string;
        modalDescription: string;
    };
    guessByTeams: {
        title: string;
        mode: string;
        loading: string;
        modeCurrent: string;
        modeAllTime: string;
        currentTitle: string;
        currentMode: string;
        allTimeTitle: string;
        allTimeMode: string;
        winnersOnlyHint: string;
        emptyPool: string;
        placeholder: string;
        teamsClue: string;
        wrongGuess: string;
        previousGuesses: string;
        noWinsDriver: string;
    };
    fillTheGrid: {
        title: string;
        mode: string;
        loading: string;
        placeholder: string;
        currentYear: string;
        found: string;
        wrong: string;
        hint: string;
        skip: string;
        hintModalTitle: string;
        scoreFound: string;
        scoreHints: string;
        scoreSkips: string;
        scoreErrors: string;
        gameComplete: string;
        gameCompleteDescription: string;
        resetGame: string;
        constructor: string;
        winsThisSeason: string;
        pointsThisSeason: string;
        careerStats: string;
    };
    higherLower: {
        title: string;
        mode: string;
        loading: string;
        higher: string;
        lower: string;
        streak: string;
        bestStreak: string;
        gameOver: string;
        finalStreak: string;
        newGame: string;
        stats: {
            totalWins: string;
            totalPoints: string;
            championships: string;
            seasonsActive: string;
            firstSeason: string;
            lastSeason: string;
            careerPoints: string;
            entries: string;
            wins: string;
            titles: string;
            poles: string;
            fastestLaps: string;
            podiums: string;
        };
    };
    constructorGrid: {
        title: string;
        mode: string;
        loading: string;
        placeholder: string;
        currentYear: string;
        found: string;
        wrong: string;
        hint: string;
        skip: string;
        hintModalTitle: string;
        scoreFound: string;
        scoreHints: string;
        scoreSkips: string;
        scoreErrors: string;
        gameComplete: string;
        gameCompleteDescription: string;
        resetGame: string;
        driverChampion: string;
        winsThisSeason: string;
        pointsThisSeason: string;
        constructorPlaceholder: string;
    };
    connections: {
        title: string;
        mode: string;
        loading: string;
        mistakes: string;
        groupsFound: string;
        selectItems: string;
        submit: string;
        shuffle: string;
        deselectAll: string;
        alreadyGuessed: string;
        oneAway: string;
        correctGroup: string;
        gameComplete: string;
        gameCompleteDescription: string;
        newGame: string;
        perfect: string;
        oneMistake: string;
        multipleMistakes: string;
        difficulty: {
            easy: string;
            medium: string;
            hard: string;
        };
    };
    actions: {
        startGrid: string;
    };
    drivers: {
        title: string;
        loadingLabel: string;
        subtitle: string;
        searchLabel: string;
        searchPlaceholder: string;
        loadingError: string;
        totalDrivers: string;
        teams: string;
        champions: string;
        emptyState: string;
        wins: string;
        titles: string;
        number: string;
        entries: string;
        firstEntry: string;
        points: string;
        currentGridTab: string;
        allTimeTab: string;
        allTimeSubtitle: string;
        nationalities: string;
        seasons: string;
        lastTeam: string;
        decadeFilter: string;
        nationalityFilter: string;
        worldChampionsOnly: string;
        raceWinnersOnly: string;
        loadingHistory: string;
        loadingProgress: string;
        allDecades: string;
        allNationalities: string;
        lastSeason: string;
        sortBy: string;
        teamHistory: string;
        resetFilters: string;
    };
    results: {
        title: string;
        subtitle: string;
        selectYear: string;
        totalRaces: string;
        differentWinners: string;
        circuits: string;
        position: string;
        driver: string;
        team: string;
        grid: string;
        laps: string;
        time: string;
        status: string;
        points: string;
        winner: string;
        round: string;
        noResults: string;
        loadingError: string;
        fastestLap: string;
        season: string;
    };
};

export const translations: Record<Language, TranslationTree> = {
    en: {
        common: {
            close: 'Close',
            help: 'Help',
            playAgain: 'Play again',
            attempts: 'Attempts',
            victory: 'Victory',
            language: 'Language',
            newRound: 'New round',
            guess: 'Guess',
            retry: 'Retry',
            navigation: {
                home: 'Home',
                game: 'Play',
                gameClassic: 'Classic',
                gameByTeams: 'By Teams',
                fillTheGrid: 'Fill the Grid',
                higherLower: 'Higher/Lower',
                constructorGrid: 'Constructors',
                connections: 'Connections',
                drivers: 'Drivers',
                results: 'Results'
            }
        },
        welcome: {
            tagline: 'Formula One guessing game',
            driverPool: 'Driver pool',
            badge: 'Six tries. One driver.',
            title: 'Guess the hidden F1 driver like a real Wordle run.',
            description: 'Pick a driver, submit a guess, and read the grid. Green means exact match, red means the info is wrong and arrows help you adjust stats.',
            ctaHint: 'Inspired by Wordle, tuned for paddock nerds.',
            classicTitle: 'Classic',
            classicDescription: 'Guess the driver from their stats: team, nationality, wins, titles and more.',
            byTeamsTitle: 'By Teams',
            byTeamsDescription: 'Identify the driver from the teams they raced for throughout their career.',
            fillTheGridTitle: 'Fill the Grid',
            fillTheGridDescription: 'Name the F1 World Champion for every season, from 2025 back to 1950.',
            higherLowerTitle: 'Higher/Lower',
            higherLowerDescription: 'Compare two drivers stats and guess higher or lower. Chain your streak.',
            constructorGridTitle: 'Constructor Grid',
            constructorGridDescription: 'Name every F1 Constructor Champion from the first season to today.',
            connectionsTitle: 'Connections',
            connectionsDescription: 'Find groups of four items that share a common F1 link.',
            boardTitle: 'How the board reads',
            boardLogic: 'Wordle logic',
            boardLabels: {
                driver: 'Driver',
                team: 'Team',
                nation: 'Nation',
                points: 'Points',
                entries: 'Entries',
                wins: 'Wins',
                titles: 'Titles'
            },
            green: 'Green',
            greenDescription: 'Exact match with the hidden driver.',
            red: 'Red',
            redDescription: 'Wrong information. For numbers, follow the arrow.',
            neutral: 'Neutral',
            neutralDescription: 'The driver name stays neutral on every row.'
        },
        theme: {
            light: 'Light',
            dark: 'Dark',
            system: 'System',
            label: 'Appearance'
        },
        game: {
            mode: 'Race engineer mode',
            title: 'Build the right driver in six guesses.',
            loading: 'Building today\'s grid',
            modeCurrent: 'Current grid',
            modeAllTime: 'All Time',
            allTimeMode: 'All Time mode',
            allTimeTitle: 'Find any driver since 1950, in six guesses.',
            allTimeLoading: 'Drawing from every driver since 1950',
            helpTitle: 'How the game works',
            helpGoal: 'Goal',
            helpGoalDescription: 'Find the hidden F1 driver in six guesses.',
            helpGreen: 'Green tile',
            helpGreenDescription: 'The category exactly matches the hidden driver.',
            helpRed: 'Red tile',
            helpRedDescription: 'The category is wrong. Numeric arrows show whether to go higher or lower.',
            helpRules: 'Rules',
            helpRule1: 'Pick a driver from the autocomplete list or type the full name and submit.',
            helpRule2: 'The driver name tile always stays neutral.',
            helpRule3: 'Every category except the driver name is color-coded after each guess.',
            helpRule4: 'When you solve the board, the victory reveal triggers after the last flip animation.',
            helpRule5: 'Switch to All Time to play every driver since 1950. That board compares shared teams and seasons raced instead of the current team and entries.'
        },
        search: {
            panel: 'Search bar',
            roundComplete: 'Round complete',
            nextDriver: 'Submit your next driver',
            findDriver: 'Find a driver',
            placeholder: 'Type a driver surname or full name',
            duplicateGuess: 'You already played that driver. Try a different guess.',
            invalidGuess: 'Pick a driver from the suggestion list before submitting.',
            chooseDriver: 'Choose a driver and read the board after each submission.',
            outOfAttempts: 'Out of attempts',
            hiddenDriverWas: 'The hidden driver was',
            youFound: 'You found',
            perfectRead: 'Perfect read. Start another round and chase a cleaner solve.',
            resetBoard: 'Reset the board and try to decode the next one faster.',
            invalidGuessTitle: 'Invalid guess',
            dataErrorTitle: 'Data unavailable',
            dataErrorDescription: 'The drivers could not be loaded from the API. Check the backend connection and try again.',
            resultGrid: 'Result grid',
            raceControlBoard: 'Race control board',
            sixRows: 'Six rows max',
            labels: {
                driver: 'Driver',
                team: 'Team',
                teams: 'Teams',
                nation: 'Nation',
                points: 'Points',
                entries: 'Entries',
                seasons: 'Seasons',
                wins: 'Wins',
                titles: 'Titles'
            },
            modalTitle: 'You got it',
            modalDescription: 'The board is solved. Confetti is on. Launch another round when you want a new target.'
        },
        guessByTeams: {
            modeCurrent: 'Current grid',
            modeAllTime: 'All Time',
            currentTitle: 'Guess a driver on the current grid from their teams.',
            currentMode: 'Current grid',
            allTimeTitle: 'Guess a race winner from their teams.',
            allTimeMode: 'All Time',
            winnersOnlyHint: 'The hidden driver has at least one race win.',
            emptyPool: 'No driver available for this board.',
            title: 'Guess the driver from their teams.',
            mode: 'Teams mode',
            loading: 'Loading a winning driver',
            placeholder: 'Type a driver name',
            teamsClue: 'This driver raced for these teams',
            wrongGuess: 'Wrong driver. Try again!',
            previousGuesses: 'Previous guesses',
            noWinsDriver: 'This driver has no wins.'
        },
        fillTheGrid: {
            title: 'Name every F1 World Champion.',
            mode: 'Fill the Grid',
            loading: 'Loading champions data',
            placeholder: 'Type a driver name',
            currentYear: 'World Champion',
            found: 'Correct! Moving to the next year.',
            wrong: 'Wrong driver. Try again!',
            hint: 'Hint',
            skip: 'Skip',
            hintModalTitle: 'Champion revealed',
            scoreFound: 'Found',
            scoreHints: 'Hints',
            scoreSkips: 'Skips',
            scoreErrors: 'Errors',
            gameComplete: 'Grid complete!',
            gameCompleteDescription: 'You went through all F1 seasons from 2025 to 1950.',
            resetGame: 'Start over',
            constructor: 'Constructor',
            winsThisSeason: 'Wins that season',
            pointsThisSeason: 'Points that season',
            careerStats: 'Career stats'
        },
        higherLower: {
            title: 'Higher or Lower?',
            mode: 'Stat Duel',
            loading: 'Shuffling the paddock',
            higher: 'Higher',
            lower: 'Lower',
            streak: 'Streak',
            bestStreak: 'Best',
            gameOver: 'Game Over',
            finalStreak: 'Final streak',
            newGame: 'New Duel',
            stats: {
                totalWins: 'Wins',
                totalPoints: 'Points',
                championships: 'Titles',
                seasonsActive: 'Seasons',
                firstSeason: 'First season',
                lastSeason: 'Last season',
                careerPoints: 'Career points',
                entries: 'Entries',
                wins: 'Wins',
                titles: 'Titles',
                poles: 'Poles',
                fastestLaps: 'Fastest laps',
                podiums: 'Podiums',
            },
        },
        constructorGrid: {
            title: 'Name every Constructor Champion.',
            mode: 'Constructor Grid',
            loading: 'Loading constructors',
            placeholder: 'Type a constructor name',
            currentYear: 'Constructor Champion',
            found: 'Correct! Moving to the next year.',
            wrong: 'Wrong constructor. Try again!',
            hint: 'Hint',
            skip: 'Skip',
            hintModalTitle: 'Champion revealed',
            scoreFound: 'Found',
            scoreHints: 'Hints',
            scoreSkips: 'Skips',
            scoreErrors: 'Errors',
            gameComplete: 'Grid complete!',
            gameCompleteDescription: 'You went through all F1 constructors championship seasons.',
            resetGame: 'Start over',
            driverChampion: 'Driver champion',
            winsThisSeason: 'Wins that season',
            pointsThisSeason: 'Points that season',
            constructorPlaceholder: 'Type a constructor name',
        },
        connections: {
            title: 'Find the F1 connections.',
            mode: 'Connections',
            loading: 'Loading puzzle',
            mistakes: 'Mistakes',
            groupsFound: 'Groups found',
            selectItems: 'Select four items that share a connection.',
            submit: 'Submit',
            shuffle: 'Shuffle',
            deselectAll: 'Deselect all',
            alreadyGuessed: 'Already guessed',
            oneAway: 'One away...',
            correctGroup: 'Correct!',
            gameComplete: 'Puzzle complete!',
            gameCompleteDescription: 'You found all four connections.',
            newGame: 'New puzzle',
            perfect: 'Perfect! No mistakes.',
            oneMistake: 'One mistake.',
            multipleMistakes: 'mistakes.',
            difficulty: {
                easy: 'Easy',
                medium: 'Medium',
                hard: 'Hard',
            },
        },
        actions: {
            startGrid: 'Start the grid'
        },
        drivers: {
            title: 'Drivers',
            loadingLabel: 'Loading drivers',
            subtitle: 'Explore the full paddock and compare the field before jumping back into the grid.',
            searchLabel: 'Search the grid',
            searchPlaceholder: 'Search by driver, team, or nationality',
            loadingError: 'The drivers list could not be loaded from the API.',
            totalDrivers: 'Total drivers',
            teams: 'Teams',
            champions: 'World champions',
            emptyState: 'No driver matches this search yet.',
            wins: 'Wins',
            titles: 'Titles',
            number: 'Number',
            entries: 'Entries',
            firstEntry: 'First entry',
            points: 'Career points',
            currentGridTab: 'Current grid',
            allTimeTab: 'All time',
            allTimeSubtitle: 'Every driver who ever raced in Formula 1, from 1950 to today.',
            nationalities: 'Nationalities',
            seasons: 'Seasons',
            lastTeam: 'Last team',
            decadeFilter: 'Decade',
            nationalityFilter: 'Nationality',
            worldChampionsOnly: 'Champions',
            raceWinnersOnly: 'Winners',
            loadingHistory: 'Loading F1 history',
            loadingProgress: 'seasons loaded',
            allDecades: 'All decades',
            allNationalities: 'All nationalities',
            lastSeason: 'Last season',
            sortBy: 'Sort by',
            teamHistory: 'Career teams',
            resetFilters: 'Clear filters'
        },
        results: {
            title: 'Race Results',
            subtitle: 'Browse every Grand Prix result season by season.',
            selectYear: 'Season',
            totalRaces: 'Races',
            differentWinners: 'Winners',
            circuits: 'Circuits',
            position: 'Pos',
            driver: 'Driver',
            team: 'Team',
            grid: 'Grid',
            laps: 'Laps',
            time: 'Time',
            status: 'Status',
            points: 'Pts',
            winner: 'Winner',
            round: 'Round',
            noResults: 'No results available for this season.',
            loadingError: 'Race results could not be loaded.',
            fastestLap: 'Fastest lap',
            season: 'Season'
        }
    },
    fr: {
        common: {
            close: 'Fermer',
            help: 'Aide',
            playAgain: 'Rejouer',
            attempts: 'Essais',
            victory: 'Victoire',
            language: 'Langue',
            newRound: 'Nouvelle manche',
            guess: 'Valider',
            retry: 'Réessayer',
            navigation: {
                home: 'Accueil',
                game: 'Jouer',
                gameClassic: 'Classique',
                gameByTeams: 'Par écuries',
                fillTheGrid: 'Remplir la grille',
                higherLower: 'Plus/Moins',
                constructorGrid: 'Constructeurs',
                connections: 'Connexions',
                drivers: 'Pilotes',
                results: 'Résultats'
            }
        },
        welcome: {
            tagline: 'Jeu de devinette Formule 1',
            driverPool: 'Liste des pilotes',
            badge: 'Six essais. Un pilote.',
            title: 'Devine le pilote de F1 en fonction de ses stats.',
            description: 'Choisis un pilote, valide ta tentative et analyse les statistiques. Le vert indique une correspondance exacte, le rouge une information incorrecte, et les flèches t\'aident pour les stats.',
            ctaHint: 'Inspiré de Wordle, pensé pour la F1.',
            classicTitle: 'Classique',
            classicDescription: 'Devine le pilote grâce à ses stats : équipe, nationalité, victoires, titres et plus.',
            byTeamsTitle: 'Par écuries',
            byTeamsDescription: 'Identifie le pilote à partir des écuries pour lesquelles il a couru.',
            fillTheGridTitle: 'Remplir la grille',
            fillTheGridDescription: 'Nomme le Champion du Monde F1 pour chaque saison, de 2025 jusqu\'en 1950.',
            higherLowerTitle: 'Plus/Moins',
            higherLowerDescription: 'Compare les stats de deux pilotes et devine plus haut ou plus bas. Fais grimper ta série.',
            constructorGridTitle: 'Grille Constructeurs',
            constructorGridDescription: 'Nomme chaque champion constructeur F1 depuis la première saison.',
            connectionsTitle: 'Connexions',
            connectionsDescription: 'Trouve des groupes de quatre éléments qui partagent un lien F1.',
            boardTitle: 'Comment lire la grille',
            boardLogic: 'Logique Wordle',
            boardLabels: {
                driver: 'Pilote',
                team: 'Équipe',
                nation: 'Nation',
                points: 'Points',
                entries: 'Participations',
                wins: 'Victoires',
                titles: 'Titres'
            },
            green: 'Vert',
            greenDescription: 'Correspondance exacte avec le pilote.',
            red: 'Rouge',
            redDescription: 'Information incorrecte. Pour les nombres, suis la flèche.',
            neutral: 'Neutre',
            neutralDescription: 'Le nom du pilote reste neutre sur chaque ligne.'
        },
        theme: {
            light: 'Clair',
            dark: 'Sombre',
            system: 'Système',
            label: 'Apparence'
        },
        game: {
            mode: 'Mode principal',
            title: 'Trouve le bon pilote en six essais.',
            loading: 'Récupération du pilote du jour',
            modeCurrent: 'Grille actuelle',
            modeAllTime: 'All Time',
            allTimeMode: 'Mode All Time',
            allTimeTitle: 'Trouve n\'importe quel pilote depuis 1950, en six essais.',
            allTimeLoading: 'Tirage parmi tous les pilotes depuis 1950',
            helpTitle: 'Comment fonctionne le jeu',
            helpGoal: 'Objectif',
            helpGoalDescription: 'Trouver le pilote en six essais.',
            helpGreen: 'Tuile verte',
            helpGreenDescription: 'La catégorie correspond exactement au pilote caché.',
            helpRed: 'Tuile rouge',
            helpRedDescription: 'La catégorie est incorrecte. Les flèches indiquent s\'il faut monter ou descendre pour les nombres.',
            helpRules: 'Règles',
            helpRule1: 'Choisis un pilote dans l\'autocomplétion ou saisis le nom complet puis valide.',
            helpRule2: 'La tuile du nom du pilote reste toujours neutre.',
            helpRule3: 'Toutes les catégories sauf le nom du pilote sont colorées après chaque tentative.',
            helpRule4: 'Quand tu trouves la solution, l\'animation de victoire démarre après le dernier flip.',
            helpRule5: 'Bascule sur All Time pour jouer tous les pilotes depuis 1950. Ce plateau compare les écuries en commun et les saisons courues, au lieu de l\'équipe actuelle et des participations.'
        },
        search: {
            panel: 'Barre de recherche',
            roundComplete: 'Manche terminée',
            nextDriver: 'Soumets ton prochain pilote',
            findDriver: 'Trouver un pilote',
            placeholder: 'Saisis un nom ou prénom de pilote',
            duplicateGuess: 'Tu as déjà joué ce pilote. Essaie une autre proposition.',
            invalidGuess: 'Choisis un pilote dans la liste d\'autocomplétion avant de valider.',
            chooseDriver: 'Choisis un pilote puis lis la grille après chaque tentative.',
            outOfAttempts: 'Plus d\'essais',
            hiddenDriverWas: 'Le pilote caché était',
            youFound: 'Tu as trouvé',
            perfectRead: 'Lecture parfaite. Relance une manche pour tenter une meilleure résolution.',
            resetBoard: 'Relance la grille et essaie de décoder le prochain plus vite.',
            invalidGuessTitle: 'Tentative invalide',
            dataErrorTitle: 'Données indisponibles',
            dataErrorDescription: 'Les pilotes n\'ont pas pu être chargés depuis l\'API. Vérifie la connexion avec le back puis réessaie.',
            resultGrid: 'Grille de résultat',
            raceControlBoard: 'Tableau de contrôle',
            sixRows: 'Six lignes max',
            labels: {
                driver: 'Pilote',
                team: 'Équipe',
                teams: 'Écuries',
                nation: 'Nation',
                points: 'Points',
                entries: 'Participations',
                seasons: 'Saisons',
                wins: 'Victoires',
                titles: 'Titres'
            },
            modalTitle: 'Bien joué',
            modalDescription: 'La grille est résolue. Les confettis tombent. Lance une nouvelle manche quand tu veux une autre cible.'
        },
        guessByTeams: {
            modeCurrent: 'Grille actuelle',
            modeAllTime: 'All Time',
            currentTitle: 'Devine un pilote de la grille actuelle grâce à ses écuries.',
            currentMode: 'Grille actuelle',
            allTimeTitle: 'Devine un vainqueur de Grand Prix grâce à ses écuries.',
            allTimeMode: 'All Time',
            winnersOnlyHint: 'Le pilote à trouver a au moins une victoire en course.',
            emptyPool: 'Aucun pilote disponible pour ce plateau.',
            title: 'Devine le pilote grâce à ses écuries.',
            mode: 'Mode écuries',
            loading: 'Chargement d\'un pilote vainqueur',
            placeholder: 'Saisis un nom de pilote',
            teamsClue: 'Ce pilote a couru pour ces écuries',
            wrongGuess: 'Mauvais pilote. Réessaie !',
            previousGuesses: 'Tentatives précédentes',
            noWinsDriver: 'Ce pilote n\'a aucune victoire.'
        },
        fillTheGrid: {
            title: 'Nomme chaque Champion du Monde F1.',
            mode: 'Remplir la grille',
            loading: 'Chargement des champions',
            placeholder: 'Saisis un nom de pilote',
            currentYear: 'Champion du Monde',
            found: 'Correct ! Passage à l\'année suivante.',
            wrong: 'Mauvais pilote. Réessaie !',
            hint: 'Indice',
            skip: 'Passer',
            hintModalTitle: 'Champion révélé',
            scoreFound: 'Trouvés',
            scoreHints: 'Indices',
            scoreSkips: 'Passés',
            scoreErrors: 'Erreurs',
            gameComplete: 'Grille complète !',
            gameCompleteDescription: 'Tu as parcouru toutes les saisons F1 de 2025 à 1950.',
            resetGame: 'Recommencer',
            constructor: 'Écurie',
            winsThisSeason: 'Victoires cette saison',
            pointsThisSeason: 'Points cette saison',
            careerStats: 'Stats de carrière'
        },
        higherLower: {
            title: 'Plus haut ou plus bas ?',
            mode: 'Duel de stats',
            loading: 'Préparation du paddock',
            higher: 'Plus haut',
            lower: 'Plus bas',
            streak: 'Série',
            bestStreak: 'Record',
            gameOver: 'Partie terminée',
            finalStreak: 'Série finale',
            newGame: 'Nouveau duel',
            stats: {
                totalWins: 'Victoires',
                totalPoints: 'Points',
                championships: 'Titres',
                seasonsActive: 'Saisons',
                firstSeason: '1ère saison',
                lastSeason: 'Dernière saison',
                careerPoints: 'Points en carrière',
                entries: 'Participations',
                wins: 'Victoires',
                titles: 'Titres',
                poles: 'Poles',
                fastestLaps: 'Meilleurs tours',
                podiums: 'Podiums',
            },
        },
        constructorGrid: {
            title: 'Nomme chaque champion constructeur.',
            mode: 'Grille Constructeurs',
            loading: 'Chargement des constructeurs',
            placeholder: 'Saisis un nom d\'écurie',
            currentYear: 'Champion Constructeur',
            found: 'Correct ! Passage à l\'année suivante.',
            wrong: 'Mauvaise écurie. Réessaie !',
            hint: 'Indice',
            skip: 'Passer',
            hintModalTitle: 'Champion révélé',
            scoreFound: 'Trouvés',
            scoreHints: 'Indices',
            scoreSkips: 'Passés',
            scoreErrors: 'Erreurs',
            gameComplete: 'Grille complète !',
            gameCompleteDescription: 'Tu as parcouru toutes les saisons du championnat constructeurs.',
            resetGame: 'Recommencer',
            driverChampion: 'Champion pilote',
            winsThisSeason: 'Victoires cette saison',
            pointsThisSeason: 'Points cette saison',
            constructorPlaceholder: 'Saisis un nom d\'écurie',
        },
        connections: {
            title: 'Trouve les connexions F1.',
            mode: 'Connexions',
            loading: 'Chargement du puzzle',
            mistakes: 'Erreurs',
            groupsFound: 'Groupes trouvés',
            selectItems: 'Sélectionne quatre éléments qui partagent un lien.',
            submit: 'Valider',
            shuffle: 'Mélanger',
            deselectAll: 'Désélectionner',
            alreadyGuessed: 'Déjà trouvé',
            oneAway: 'Presque...',
            correctGroup: 'Correct !',
            gameComplete: 'Puzzle terminé !',
            gameCompleteDescription: 'Tu as trouvé les quatre connexions.',
            newGame: 'Nouveau puzzle',
            perfect: 'Parfait ! Aucune erreur.',
            oneMistake: 'Une erreur.',
            multipleMistakes: 'erreurs.',
            difficulty: {
                easy: 'Facile',
                medium: 'Moyen',
                hard: 'Difficile',
            },
        },
        actions: {
            startGrid: 'Commencer la grille'
        },
        drivers: {
            title: 'Pilotes',
            loadingLabel: 'Chargement des pilotes',
            subtitle: 'Explore tout le paddock et compare la grille avant de revenir sur la partie.',
            searchLabel: 'Rechercher dans la grille',
            searchPlaceholder: 'Chercher par pilote, équipe ou nationalité',
            loadingError: 'La liste des pilotes n\'a pas pu être chargée depuis l\'API.',
            totalDrivers: 'Nombre de pilotes',
            teams: 'Équipes',
            champions: 'Champions du monde',
            emptyState: 'Aucun pilote ne correspond à cette recherche.',
            wins: 'Victoires',
            titles: 'Titres',
            number: 'Numéro',
            entries: 'Participations',
            firstEntry: 'Première saison',
            points: 'Points en carrière',
            currentGridTab: 'Grille actuelle',
            allTimeTab: 'Tous les temps',
            allTimeSubtitle: 'Tous les pilotes ayant couru en Formule 1, de 1950 à aujourd\'hui.',
            nationalities: 'Nationalités',
            seasons: 'Saisons',
            lastTeam: 'Dernière équipe',
            decadeFilter: 'Décennie',
            nationalityFilter: 'Nationalité',
            worldChampionsOnly: 'Champions',
            raceWinnersOnly: 'Vainqueurs',
            loadingHistory: 'Chargement de l\'histoire F1',
            loadingProgress: 'saisons chargées',
            allDecades: 'Toutes les décennies',
            allNationalities: 'Toutes les nationalités',
            lastSeason: 'Dernière saison',
            sortBy: 'Trier par',
            teamHistory: 'Ecuries en carrière',
            resetFilters: 'Effacer les filtres'
        },
        results: {
            title: 'Résultats des courses',
            subtitle: 'Parcours les résultats de chaque Grand Prix saison par saison.',
            selectYear: 'Saison',
            totalRaces: 'Courses',
            differentWinners: 'Vainqueurs',
            circuits: 'Circuits',
            position: 'Pos',
            driver: 'Pilote',
            team: 'Équipe',
            grid: 'Grille',
            laps: 'Tours',
            time: 'Temps',
            status: 'Statut',
            points: 'Pts',
            winner: 'Vainqueur',
            round: 'Manche',
            noResults: 'Aucun résultat disponible pour cette saison.',
            loadingError: 'Les résultats n\'ont pas pu être chargés.',
            fastestLap: 'Meilleur tour',
            season: 'Saison'
        }
    }
};

type LanguageContextValue = {
    language: Language;
    setLanguage: (language: Language) => void;
    t: TranslationTree;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') {
        return 'en';
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'fr' || stored === 'en' ? stored : 'en';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>(getInitialLanguage);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, language);
    }, [language]);

    const value = useMemo(() => ({
        language,
        setLanguage,
        t: translations[language]
    }), [language]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }

    return context;
};