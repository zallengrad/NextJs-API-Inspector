/**
 * Default configurations and metadata for each AI provider
 */

import { ProviderMetadata, ProviderConfig } from '../types/configuration';

export const PROVIDER_METADATA: Record<string, ProviderMetadata> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s most capable AI model',
    defaultModel: 'gemini-2.5-flash',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      'gemini-2.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-2.0-flash-exp',
    ],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI GPT models (ChatGPT)',
    defaultModel: 'gpt-4o',
    defaultBaseUrl: 'https://api.openai.com/v1',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
    ],
  },
  custom: {
    id: 'custom',
    name: 'Custom (OpenAI Compatible)',
    description: 'Any OpenAI-compatible API endpoint',
    defaultModel: 'gpt-3.5-turbo',
    defaultBaseUrl: 'https://api.openai.com/v1',
    apiKeyUrl: '',
    models: [
      'gpt-4o',
      'gpt-3.5-turbo',
      'custom-model',
    ],
  },
};

export const DEFAULT_CONFIGS: Record<string, Partial<ProviderConfig>> = {
  gemini: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    baseUrl: undefined,
  },
  openai: {
    provider: 'openai',
    model: 'gpt-4o',
    baseUrl: 'https://api.openai.com/v1',
  },
  custom: {
    provider: 'custom',
    model: 'gpt-3.5-turbo',
    baseUrl: 'https://api.openai.com/v1',
  },
};

export function getProviderMetadata(provider: string): ProviderMetadata {
  return PROVIDER_METADATA[provider] || PROVIDER_METADATA.gemini;
}

export function getDefaultConfig(provider: string): Partial<ProviderConfig> {
  return DEFAULT_CONFIGS[provider] || DEFAULT_CONFIGS.gemini;
}
