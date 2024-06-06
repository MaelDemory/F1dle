import React, {useEffect, useState} from "react";
import {Driver} from "../types";
import {fetchRandomDriver} from "../api/f1dleApi";
import {Logo, SearchBar} from "../components";

export const Game = () => {
    const [driver, setDriver] = useState<Driver>({} as Driver);

    useEffect(() => {
        fetchRandomDriver().then((data) => {
            setDriver(data);
        });
    }, []);

    return (
        <div className="bg-slate-950 text-white min-h-screen max-w-full font-sans flex flex-col items-center">
            <div className="w-full flex justify-center mt-10 mb-60">
                <Logo/>
            </div>
            <div className="content-center">
                <SearchBar/>
            </div>
        </div>
    )

}