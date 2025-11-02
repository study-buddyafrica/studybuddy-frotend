import axios from 'axios';

import { authService } from './authService';
import { FHOST } from '../components/constants/Functions';


const api = axios.create({
  baseURL: FHOST,
  headers: {
    'Content-Type': 'application/json',
    },
});


export class Api {
    constructor () {
        this.api = axios.create({
            baseURL: FHOST,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.api.interceptors.request.use(
            (config) => {
                const token = authService.getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    async get (url) {
        try {
            const response = await this.api.get(url);
            return response;
        } catch (error) {
            console.error('GET request failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async post (url, data) {
        try {
            const response = await this.api.post(url, data);
            return response;
        } catch (error) {
            console.error('POST request failed:', error.response?.data || error.message);
            throw error;
        }
    }
}

