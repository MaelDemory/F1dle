import React from 'react';
import {Game, WelcomePage, GuessByTeams, FillTheGrid, HigherLower, ConstructorGrid, Connections} from './pages';
import Drivers from './pages/Drivers';
import RaceResults from './pages/RaceResults';
import {Route, Routes} from "react-router-dom";

function App() {
    return (
        <Routes>
            <Route path="/results" element={<RaceResults />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/game" element={<Game />} />
            <Route path="/guess-by-teams" element={<GuessByTeams />} />
            <Route path="/fill-the-grid" element={<FillTheGrid />} />
            <Route path="/higher-lower" element={<HigherLower />} />
            <Route path="/constructor-grid" element={<ConstructorGrid />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/" element={<WelcomePage />} />
        </Routes>
    );
}

export default App;