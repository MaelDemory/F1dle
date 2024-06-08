import React, {useEffect, useState} from 'react';
import {fetchDrivers, fetchRandomDriver} from "../api/f1dleApi";
import {Driver} from "../types";
import Autosuggest from "react-autosuggest";

export const SearchBar = () => {

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [value, setValue] = useState('')
    const [suggestions, setSuggestions] = useState<Driver[]>([])
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    useEffect(() => {
        fetchDrivers().then((data) => {
            setDrivers(data.sort((a, b) => b.win - a.win));
        });
    }, []);

    useEffect(() => {
        if (value !== "") {
            const driver = drivers.find(driver => driver.surname + ' ' + driver.name === value);
            setSelectedDriver(driver || null);
        }
    }, [value, drivers]);

    const getSuggestions = (value: string) => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        return inputLength === 0 ? [] : drivers.filter(driver =>
            driver.surname.toLowerCase().slice(0, inputLength) === inputValue ||
            driver.name.toLowerCase().slice(0, inputLength) === inputValue
        );
    };

    const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
        setSuggestions(getSuggestions(value));
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };

    const getSuggestionValue = (suggestion: Driver) => `${suggestion.surname} ${suggestion.name}`;

    const renderSuggestion = (suggestion: Driver) => (
        <div className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            {suggestion.surname} {suggestion.name}
        </div>
    );

    const onChange = (event: any, { newValue }: { newValue: string }) => {
        setValue(newValue);
    };

    const inputProps = {
        placeholder: 'Type a driver surname',
        value,
        onChange: onChange,
        className: "block p-4 ps-10 text-sm text-gray-50 border border-gray-300 rounded-lg bg-gray-800 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-96"
    };

    return (
        <div className="flex w-full max-w-sm items-center space-x-2">
            <label htmlFor="search"
                   className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Type driver
                name...</label>
            <form>

                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                        onSuggestionsClearRequested={onSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={inputProps}
                    />
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

    )

}
