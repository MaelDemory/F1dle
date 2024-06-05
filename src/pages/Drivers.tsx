import React, { useEffect, useState } from 'react';
import { fetchDrivers } from '../api/f1dleApi';
import { Driver } from '../types';

const Drivers = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);

    useEffect(() => {
        fetchDrivers().then((data) => {
            setDrivers(data.sort((a, b) => b.win - a.win));
        });
    }, []);

    return (
        <div className="bg-slate-950 text-white min-h-screen max-w-full font-sans flex items-center justify-center">
            <div
                className="w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700 mt-2 mb-2">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Drivers</h5>
                </div>
                <div className="flow-root">
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">

                        {drivers.map((driver, index) => (

                            <li className="py-3 sm:py-4">
                                <div className="flex items-center">
                                    <div className="flex-1 min-w-0 ms-4">
                                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                            {driver.surname} {driver.name}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                            {driver.nationality}
                                        </p>
                                    </div>
                                    <div
                                        className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                        {driver.win}
                                    </div>
                                </div>
                            </li>
                        ))}

                    </ul>
                </div>
            </div>
        </div>


    );
}

export default Drivers;