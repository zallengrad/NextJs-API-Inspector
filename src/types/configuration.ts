/**
 * Configuration types for multi-provider AI support
 */

export type AIProvider = 'gemini' | 'openai' | 'custom';

export interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string; // For custom OpenAI-compatible endpoints
}

export interface ConfigurationState extends ProviderConfig {
  // Additional runtime state if needed
}

// Message types for webview communication
export interface SaveConfigurationMessage {
  type: 'saveConfiguration';
  config: ProviderConfig;
}

export interface LoadConfigurationMessage {
  type: 'loadConfiguration';
}

export interface TestConnectionMessage {
  type: 'testConnection';
  config: ProviderConfig;
}

export interface ConfigurationResponseMessage {
  type: 'configurationLoaded';
  config: ProviderConfig;
}

export interface TestConnectionResponseMessage {
  type: 'testConnectionResponse';
  success: boolean;
  latency?: number;
  error?: string;
}

export type ConfigurationMessage =
  | SaveConfigurationMessage
  | LoadConfigurationMessage
  | TestConnectionMessage;

export type ConfigurationResponseMessageType =
  | ConfigurationResponseMessage
  | TestConnectionResponseMessage;
