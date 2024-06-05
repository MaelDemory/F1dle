import { Driver} from "../types";

const BASE_URL = "http://localhost:8000/api"

export const fetchDrivers = async (): Promise<Driver[]> => {
    const url = `${BASE_URL}/drivers`
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
};
