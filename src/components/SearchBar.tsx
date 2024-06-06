import React, {useEffect, useState} from 'react';
import {fetchDrivers, fetchRandomDriver} from "../api/f1dleApi";
import {Driver} from "../types";
import {Typeahead} from 'react-bootstrap-typeahead';

export const SearchBar = () => {

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [driver, setDriver] = useState<Driver>({} as Driver);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [value, setValue] = useState("");

    useEffect(() => {
        fetchDrivers().then((data) => {
            setDrivers(data);
        });
    }, []);

    useEffect(() => {
        fetchRandomDriver().then((data) => {
            setDriver(data);
        });
    }, []);

    useEffect(() => {
        if (value !== "") {
            const driver = drivers.find(driver => driver.surname + ' ' + driver.name === value);
            setSelectedDriver(driver || null);
        }
    }, [value, drivers]);

    return (
        <div className="flex w-full max-w-sm items-center space-x-2">

            <form>
                <label htmlFor="search"
                       className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Type driver
                    name...</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input type="search" id="search"
                           className="block p-4 ps-10 text-sm text-gray-50 border border-gray-300 rounded-lg bg-gray-800 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-96"
                           placeholder="Type driver name..."
                           spellCheck="false"
                           required
                           autoComplete="off"
                           list="driver-names"
                           onChange={(e) => setValue(e.target.value)}
                    />
                    <datalist id="driver-names">
                        {
                            drivers.map((driver, index) => (
                                <option key={index} value={driver.surname + ' ' + driver.name}/>
                            ))
                        }

                    </datalist>
                    <button
                        className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search
                    </button>
                </div>
            </form>

            {selectedDriver && (
                <div className="mt-4">
                    <h2>{selectedDriver.name} {selectedDriver.surname}</h2>
                    <p>Numéro de pilote: {selectedDriver.driver_number}</p>
                    <p>Équipe: {selectedDriver.team}</p>
                    <p>Nationalité: {selectedDriver.nationality}</p>
                    <p>Date de naissance: {selectedDriver.birth_date}</p>
                    <p>Victoires: {selectedDriver.win}</p>
                    <p>Poles: {selectedDriver.pole}</p>
                    <p>Meilleurs tours: {selectedDriver.fastest_lap}</p>
                    <p>Points de carrière: {selectedDriver.career_points}</p>
                    <p>Participations: {selectedDriver.entries}</p>
                    <p>Championnats du monde: {selectedDriver.world_championship}</p>
                </div>
            )}

        </div>
    );
};