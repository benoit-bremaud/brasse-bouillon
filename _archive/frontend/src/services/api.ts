// src/services/api.ts

import Constants from 'expo-constants';
import axios from 'axios';

const API_URL = Constants.expoConfig?.extra?.API_URL;

export const api = axios.create({
  baseURL: API_URL,
});
