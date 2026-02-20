import axios from 'axios';
import type { Candidate, PortfolioEntry, TickerHistory, ScreeningStats, ExitedStock } from '../types';

const api = axios.create({ baseURL: '/api' });

export const fetchDates = () =>
  api.get<string[]>('/dates').then(r => r.data);

export const fetchScreening = (date: string) =>
  api.get<Candidate[]>(`/screening/${date}`).then(r => r.data);

export const fetchPortfolio = (date: string) =>
  api.get<PortfolioEntry[]>(`/portfolio/${date}`).then(r => r.data);

export const fetchPortfolioHistory = () =>
  api.get<PortfolioEntry[]>('/portfolio/history').then(r => r.data);

export const fetchTickerHistory = (ticker: string) =>
  api.get<TickerHistory[]>(`/ticker/${ticker}`).then(r => r.data);

export const fetchStats = (date: string) =>
  api.get<ScreeningStats>(`/stats/${date}`).then(r => r.data);

export const fetchExited = (date: string) =>
  api.get<ExitedStock[]>(`/exited/${date}`).then(r => r.data);
