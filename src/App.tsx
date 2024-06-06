import React from 'react';
import {Game, WelcomePage} from './pages';
import Drivers from './pages/Drivers';
import {Route, Routes} from "react-router-dom";

function App() {
    return (
        <Routes>
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/game" element={<Game />} />
            <Route path="/" element={<WelcomePage />} />
        </Routes>
    );
}

export default App;