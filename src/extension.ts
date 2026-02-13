import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { initializeAI, analyzeCode } from './services/aiService';

let sidebarProvider: SidebarProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('NextJS API Inspector extension is now active!');

  // Initialize the sidebar provider
  sidebarProvider = new SidebarProvider(context.extensionUri);

  // Register the webview provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );


  // Get API key from configuration (with backward compatibility)
  const config = vscode.workspace.getConfiguration('nextjsApiInspector');
  let apiKey = config.get<string>('apiKey');
  
  // Backward compatibility: check for old geminiApiKey setting
  if (!apiKey) {
    apiKey = config.get<string>('geminiApiKey');
  }

  if (apiKey) {
    try {
      initializeAI(apiKey);
      console.log('AI service initialized successfully');
    } catch (error) {
      console.error('Error initializing AI service:', error);
    }
  } else {
    vscode.window.showWarningMessage(
      'NextJS API Inspector: Please configure your AI provider in the Configuration tab',
      'Open Configuration'
    ).then((selection) => {
      if (selection === 'Open Configuration') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'nextjsApiInspector');
      }
    });
  }

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      // Check if any AI configuration changed
      if (
        e.affectsConfiguration('nextjsApiInspector.apiKey') ||
        e.affectsConfiguration('nextjsApiInspector.geminiApiKey') ||
        e.affectsConfiguration('nextjsApiInspector.provider')
      ) {
        const config = vscode.workspace.getConfiguration('nextjsApiInspector');
        let newApiKey = config.get<string>('apiKey');
        
        // Backward compatibility
        if (!newApiKey) {
          newApiKey = config.get<string>('geminiApiKey');
        }
        
        if (newApiKey) {
          initializeAI(newApiKey);
          console.log('NextJS API Inspector: AI configuration updated');
        }
      }
    })
  );


  // Listen for text document saves
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      // Check if the file is a Next.js route file
      if (isNextJsRouteFile(document)) {
        await handleRouteFileSave(document);
      }
    })
  );

  // Register command to manually trigger analysis
  context.subscriptions.push(
    vscode.commands.registerCommand('nextjsApiInspector.analyzeCurrentFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor && isNextJsRouteFile(editor.document)) {
        await handleRouteFileSave(editor.document);
      } else {
        vscode.window.showWarningMessage('Please open a Next.js route file (route.ts or route.js)');
      }
    })
  );
}

function isNextJsRouteFile(document: vscode.TextDocument): boolean {
  const fileName = document.fileName;
  
  // Check if file is route.ts or route.js
  if (fileName.endsWith('route.ts') || fileName.endsWith('route.js')) {
    return true;
  }

  // Also check for app directory structure (Next.js 13+ App Router)
  if ((fileName.includes('\\app\\') || fileName.includes('/app/')) && 
      (fileName.endsWith('.ts') || fileName.endsWith('.js'))) {
    return true;
  }

  return false;
}

async function handleRouteFileSave(document: vscode.TextDocument) {
  const config = vscode.workspace.getConfiguration('nextjsApiInspector');
  const apiKey = config.get<string>('geminiApiKey');

  if (!apiKey) {
    vscode.window.showWarningMessage(
      'NextJS API Inspector: API key not configured',
      'Set API Key'
    ).then((selection) => {
      if (selection === 'Set API Key') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'nextjsApiInspector.geminiApiKey');
      }
    });
    return;
  }

  try {
    // Show loading state
    sidebarProvider.sendLoading(true);

    // Get the code content
    const code = document.getText();

    // Show progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Analyzing API route...',
        cancellable: false,
      },
      async () => {
        try {
          // Analisis kode dengan AI
          const apiData = await analyzeCode(code);

          if (apiData) {
            // Send the analyzed data to the webview
            sidebarProvider.sendApiData(apiData);
            const methods = apiData.endpoints.map(e => e.method).join(', ');
            vscode.window.showInformationMessage(
              `API route analyzed: ${methods} ${apiData.endpoint}`
            );
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          sidebarProvider.sendError(`Analysis failed: ${errorMessage}`);
          vscode.window.showErrorMessage(`NextJS API Inspector: ${errorMessage}`);
        } finally {
          sidebarProvider.sendLoading(false);
        }
      }
    );
  } catch (error) {
    console.error('Error handling route file save:', error);
    sidebarProvider.sendLoading(false);
  }
}

export function deactivate() {
  console.log('NextJS API Inspector extension is now deactivated');
}
