import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ApiData } from './types/api';

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'nextjs-api-inspector-sidebar';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'info':
          vscode.window.showInformationMessage(data.message);
          break;
        case 'error':
          vscode.window.showErrorMessage(data.message);
          break;
        case 'request-api-key':
          this._promptForApiKey();
          break;
        case 'send-test-request':
          await this._handleTestRequest(data, webviewView.webview);
          break;
        case 'run-load-test':
          await this._handleLoadTest(data, webviewView.webview);
          break;
      }
    });
  }

  private async _promptForApiKey() {
    const apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your Google Gemini API Key',
      password: true,
      placeHolder: 'AIza...',
    });

    if (apiKey) {
      const config = vscode.workspace.getConfiguration('nextjsApiInspector');
      await config.update('geminiApiKey', apiKey, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage('API Key saved successfully!');
    }
  }

  public sendApiData(apiData: ApiData) {
    if (this._view) {
      this._view.webview.postMessage({
        type: 'api-data-update',
        data: apiData,
      });
    }
  }

  public sendError(error: string) {
    if (this._view) {
      this._view.webview.postMessage({
        type: 'error',
        message: error,
      });
    }
  }

  public sendLoading(isLoading: boolean) {
    if (this._view) {
      this._view.webview.postMessage({
        type: 'loading',
        isLoading,
      });
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get the path to the built React app
    const distPath = path.join(this._extensionUri.fsPath, 'dist', 'webview');
    const indexPath = path.join(distPath, 'index.html');

    // Check if the built React app exists
    if (!fs.existsSync(indexPath)) {
      return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NextJS API Inspector</title>
        </head>
        <body>
          <div style="padding: 20px; font-family: system-ui;">
            <h3>Build Error</h3>
            <p>The webview UI has not been built yet.</p>
            <p>Please run: <code>npm run build:webview</code></p>
          </div>
        </body>
        </html>`;
    }

    // Read the HTML file
    let html = fs.readFileSync(indexPath, 'utf-8');

    // Get base URI for the webview
    const baseUri = webview.asWebviewUri(vscode.Uri.file(distPath));

    // Replace relative paths with webview URIs
    html = html.replace(
      /(href|src)="\/([^"]*)"/g,
      (match, attr, filePath) => {
        const uri = webview.asWebviewUri(vscode.Uri.file(path.join(distPath, filePath)));
        return `${attr}="${uri}"`;
      }
    );

    // Add CSP meta tag
    const cspSource = webview.cspSource;
    html = html.replace(
      '<head>',
      `<head>
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src ${cspSource} 'unsafe-inline'; font-src ${cspSource}; img-src ${cspSource} https: data:;">`
    );

    return html;
  }

  private async _handleTestRequest(data: any, webview: vscode.Webview) {
    console.log('[Test Request] Received request:', { method: data.method, endpoint: data.endpoint });
    
    try {
      const { method, endpoint, body } = data;
      const url = `http://localhost:3000${endpoint}`;

      console.log('[Test Request] Sending to:', url);

      // Import fetch for Node.js
      const fetch = (await import('node-fetch')).default;

      const options: any = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout (increased from 10s)
      };

      // Add body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
        options.body = body;
        console.log('[Test Request] With body:', body);
      }

      const response = await fetch(url, options);
      console.log('[Test Request] Got response:', response.status, response.statusText);

      const contentType = response.headers.get('content-type');

      let responseBody;
      try {
        if (contentType?.includes('application/json')) {
          responseBody = await response.json();
        } else {
          responseBody = await response.text();
        }
      } catch (parseError) {
        console.error('[Test Request] Error parsing response body:', parseError);
        responseBody = await response.text();
      }

      // Extract headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value: string, key: string) => {
        headers[key] = value;
      });

      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
        body: responseBody,
      };

      console.log('[Test Request] Sending response back to webview:', responseData);

      // Send response back to webview
      webview.postMessage({
        type: 'test-request-response',
        response: responseData,
      });

      console.log('[Test Request] Response sent successfully');
    } catch (error) {
      console.error('[Test Request] Error occurred:', error);
      
      // Send error back to webview
      const errorResponse = {
        status: 0,
        statusText: 'Error',
        headers: {},
        body: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      console.log('[Test Request] Sending error response:', errorResponse);

      webview.postMessage({
        type: 'test-request-response',
        response: errorResponse,
      });
    }
  }

  private async _handleLoadTest(data: any, webview: vscode.Webview) {
    console.log('[Load Test] Starting load test:', data.config);
    
    try {
      const { endpoint, method, concurrency, totalRequests, body } = data.config;
      
      // Validation
      const maxConcurrency = Math.min(concurrency, 100);
      const maxRequests = Math.min(totalRequests, 1000);
      
      console.log('[Load Test] Config validated:', { maxConcurrency, maxRequests });
      
      const fetch = (await import('node-fetch')).default;
      const url = `http://localhost:3000${endpoint}`;
      
      const latencies: number[] = [];
      let successCount = 0;
      let errorCount = 0;
      const startTime = Date.now();
      
      // Batch processing to prevent blocking
      const batchSize = maxConcurrency;
      const batches = Math.ceil(maxRequests / batchSize);
      
      console.log('[Load Test] Starting execution with', batches, 'batches');
      
      for (let i = 0; i < batches; i++) {
        const batchRequests = Math.min(batchSize, maxRequests - (i * batchSize));
        const promises = [];
        
        // Create batch of concurrent requests
        for (let j = 0; j < batchRequests; j++) {
          promises.push(this._executeRequest(url, method, body, latencies));
        }
        
        // Execute batch concurrently
        const results = await Promise.allSettled(promises);
        
        // Count successes and errors
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.success) {
            successCount++;
          } else {
            errorCount++;
          }
        });
        
        // Send progress update
        const completed = Math.min((i + 1) * batchSize, maxRequests);
        const progress = (completed / maxRequests) * 100;
        
        console.log('[Load Test] Progress:', progress.toFixed(1) + '%', `(${completed}/${maxRequests})`);
        
        webview.postMessage({
          type: 'load-test-progress',
          progress,
          completed,
          total: maxRequests,
          successCount,
          errorCount,
        });
        
        // Small delay between batches to prevent overwhelming
        if (i < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      // Calculate final statistics
      const duration = Date.now() - startTime;
      const avgLatency = latencies.length > 0 
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length 
        : 0;
      const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;
      const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
      const rps = duration > 0 ? (maxRequests / duration) * 1000 : 0;
      const successRate = maxRequests > 0 ? (successCount / maxRequests) * 100 : 0;
      
      console.log('[Load Test] Completed:', {
        duration,
        avgLatency: avgLatency.toFixed(2),
        rps: rps.toFixed(2),
        successRate: successRate.toFixed(1) + '%',
      });
      
      // Send final results
      webview.postMessage({
        type: 'load-test-result',
        results: {
          totalRequests: maxRequests,
          successCount,
          errorCount,
          duration,
          avgLatency,
          minLatency,
          maxLatency,
          rps,
          successRate,
        },
      });
      
    } catch (error) {
      console.error('[Load Test] Error:', error);
      webview.postMessage({
        type: 'load-test-result',
        results: {
          totalRequests: 0,
          successCount: 0,
          errorCount: 1,
          duration: 0,
          avgLatency: 0,
          minLatency: 0,
          maxLatency: 0,
          rps: 0,
          successRate: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  private async _executeRequest(
    url: string,
    method: string,
    body: any,
    latencies: number[]
  ): Promise<{ success: boolean; status?: number; error?: any }> {
    const requestStart = Date.now();
    
    try {
      const fetch = (await import('node-fetch')).default;
      
      const options: any = {
        method,
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000, // 10 second timeout
      };
      
      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
        options.body = body;
      }
      
      const response = await fetch(url, options);
      const latency = Date.now() - requestStart;
      latencies.push(latency);
      
      return { success: response.ok, status: response.status };
    } catch (error) {
      const latency = Date.now() - requestStart;
      latencies.push(latency);
      return { success: false, error };
    }
  }
}
