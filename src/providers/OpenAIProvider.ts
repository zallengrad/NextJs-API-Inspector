/**
 * OpenAI-Compatible Provider Implementation
 * Supports OpenAI, Azure OpenAI, and any OpenAI-compatible API
 */

import { AbstractBaseProvider } from './BaseProvider';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider extends AbstractBaseProvider {
  constructor(
    apiKey: string,
    model: string = 'gpt-4o',
    baseUrl: string = 'https://api.openai.com/v1'
  ) {
    super(apiKey, model, baseUrl);
  }

  private async makeRequest(messages: OpenAIMessage[]): Promise<OpenAIResponse> {
    const url = `${this.baseUrl}/chat/completions`;

    const requestBody: OpenAIRequest = {
      model: this.model,
      messages,
      temperature: 0.7,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    return (await response.json()) as OpenAIResponse;
  }

  async testConnection(): Promise<{
    success: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'user',
          content: 'Test connection. Reply with OK.',
        },
      ];

      const response = await this.makeRequest(messages);
      const latency = Date.now() - startTime;

      if (response.choices && response.choices.length > 0) {
        return {
          success: true,
          latency,
        };
      } else {
        return {
          success: false,
          error: 'Empty response from OpenAI',
        };
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await this.makeRequest(messages);

      if (response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      } else {
        throw new Error('No response from OpenAI');
      }
    } catch (error) {
      throw new Error(
        `OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getAvailableModels(): Promise<string[]> {
    // For OpenAI-compatible APIs, we could fetch from /v1/models
    // For now, return common models
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
    ];
  }
}
