/**
 * Frontend configuration types (mirrors backend types)
 */

export type AIProvider = 'gemini' | 'openai' | 'custom';

export interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface ConfigurationState extends ProviderConfig {
  // UI-specific state
  isSaving?: boolean;
  isTesting?: boolean;
  testResult?: TestConnectionResult;
}

export interface TestConnectionResult {
  success: boolean;
  latency?: number;
  error?: string;
}

// Provider metadata for UI display
export interface ProviderMetadata {
  id: AIProvider;
  name: string;
  description: string;
  defaultModel: string;
  defaultBaseUrl?: string;
  apiKeyUrl: string; // URL to get API key
  models: string[]; // Available models
}
