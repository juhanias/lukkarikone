/**
 * Centralized API configuration
 * Defaults to localhost:3001 in development, production API otherwise
 */

const getApiBaseUrl = (): string => {
  const isDev = import.meta.env.DEV;

  if (isDev) {
    return "http://localhost:3001/api";
  }

  return "https://lukkari-api.juh.fi/api";
};

const getRealizationApiBaseUrl = (): string => {
  const isDev = import.meta.env.DEV;

  if (isDev) {
    return "http://localhost:3001";
  }

  return "https://lukkari-api.juh.fi";
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  REALIZATION_BASE_URL: getRealizationApiBaseUrl(),
};
