import { Driver} from "../types";

const BASE_URL = "http://localhost:8000/api"

export const fetchDrivers = async (): Promise<Driver[]> => {
    const url = `${BASE_URL}/drivers`
    return fetchData(url);
};

export const fetchRandomDriver = async (): Promise<Driver> => {
    const url = `${BASE_URL}/random`
    return fetchData(url);
}

export const fetchData = async (url: string): Promise<any> => {
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (Object.keys(data).includes("error")) {
                return Promise.reject(new Error(data.error));
            } else {
                return data;
            }
        })
        .catch(error => Promise.reject(new Error(error.message)));
}