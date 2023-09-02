interface IParams {
    [key: string]: string;
}

interface IPayload {
    [key: string]: any;
}

export default class Fetcher {
    static async get(url: string, params: IParams) {
        const urlParams = new URLSearchParams(params);
        return fetch(url + '?' + urlParams.toString());
    }

    static async post(url: string, payload: IPayload) {
        return fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
        });
    }
}
