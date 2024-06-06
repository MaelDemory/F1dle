import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WelcomePage } from './pages';
import Drivers from './pages/Drivers';

function App() {
    return (
        <Routes>
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/" element={<WelcomePage />} />
        </Routes>
    );
}

export default App;