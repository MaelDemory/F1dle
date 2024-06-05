import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WelcomePage } from './pages';
import Drivers from './pages/Drivers';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/drivers" element={<Drivers />} />
            </Routes>
        </Router>
    );
}

export default App;