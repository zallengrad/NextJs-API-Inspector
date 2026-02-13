/**
 * Provider Factory
 * Creates the appropriate provider instance based on configuration
 */

import { BaseProvider } from './BaseProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { ProviderConfig } from '../types/configuration';

export class ProviderFactory {
  /**
   * Create a provider instance based on configuration
   */
  static createProvider(config: ProviderConfig): BaseProvider {
    const { provider, apiKey, model, baseUrl } = config;

    switch (provider) {
      case 'gemini':
        return new GeminiProvider(apiKey, model);

      case 'openai':
        return new OpenAIProvider(
          apiKey,
          model,
          baseUrl || 'https://api.openai.com/v1'
        );

      case 'custom':
        if (!baseUrl) {
          throw new Error('Base URL is required for custom provider');
        }
        return new OpenAIProvider(apiKey, model, baseUrl);

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Test connection for a given configuration
   */
  static async testConnection(config: ProviderConfig): Promise<{
    success: boolean;
    latency?: number;
    error?: string;
  }> {
    try {
      const provider = this.createProvider(config);
      return await provider.testConnection();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
