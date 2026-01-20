import { useState, useEffect, useCallback } from "react";
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BinanceApiConfigSchema } from "@shared/validation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BinanceAccountBalance } from "@shared/binance";

export function BinanceApiConfig() {
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    balances?: BinanceAccountBalance[];
  } | null>(null);

  useEffect(() => {
    // Load saved keys from localStorage
    const savedApiKey = localStorage.getItem("binance_api_key");
    const savedSecretKey = localStorage.getItem("binance_secret_key");
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedSecretKey) setSecretKey(savedSecretKey);
    if (savedApiKey && savedSecretKey) setSaved(true);
  }, []);

  const saveKeys = useCallback(() => {
    // Validate using Zod schema
    const validationResult = BinanceApiConfigSchema.safeParse({ apiKey, secretKey });
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(e => e.message).join(", ");
      setTestResult({
        success: false,
        message: `Validation Error: ${errorMessages}`,
      });
      return;
    }

    try {
      localStorage.setItem("binance_api_key", apiKey);
      localStorage.setItem("binance_secret_key", secretKey);
      setSaved(true);
      setTestResult({
        success: true,
        message: "✅ API keys saved successfully! You can now test the connection.",
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Failed to save keys: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  }, [apiKey, secretKey]);

  const testConnection = useCallback(async () => {
    if (!apiKey || !secretKey) {
      alert("Please save your API keys first");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/binance/account", {
        headers: {
          "x-api-key": apiKey,
          "x-secret-key": secretKey,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: "✅ Connection successful! Your API keys are working.",
          balances: data.balances,
        });
      } else {
        // Provide helpful error messages
        let errorMessage = "Failed to connect to Binance API";
        
        if (data.details?.msg) {
          errorMessage = `Binance Error: ${data.details.msg}`;
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        // Add helpful hints based on common errors
        if (data.details?.msg?.includes("Invalid API-key") || data.details?.msg?.includes("API-key")) {
          errorMessage += "\n\n💡 Tip: Make sure you copied the API key correctly from Binance.";
        } else if (data.details?.msg?.includes("Signature")) {
          errorMessage += "\n\n💡 Tip: Check that your Secret Key is correct.";
        } else if (data.details?.code === -2015) {
          errorMessage += "\n\n💡 Tip: Invalid API key or incorrect permissions.";
        }
        
        setTestResult({
          success: false,
          message: errorMessage,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}\n\n💡 Tip: Check your internet connection and try again.`,
      });
    } finally {
      setTesting(false);
    }
  }, [apiKey, secretKey]);

  const clearKeys = useCallback(() => {
    localStorage.removeItem("binance_api_key");
    localStorage.removeItem("binance_secret_key");
    setApiKey("");
    setSecretKey("");
    setSaved(false);
    setTestResult(null);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Binance API Configuration
        </CardTitle>
        <CardDescription>
          Configure your Binance API keys to access account data and trading features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="text"
            placeholder="Enter your Binance API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secret-key">Secret Key</Label>
          <div className="relative">
            <Input
              id="secret-key"
              type={showSecret ? "text" : "password"}
              placeholder="Enter your Binance secret key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveKeys} className="flex-1">
            {saved ? "Update Keys" : "Save Keys"}
          </Button>
          <Button
            onClick={testConnection}
            variant="outline"
            disabled={!saved || testing}
            className="flex-1"
          >
            {testing ? "Testing..." : "Test Connection"}
          </Button>
          {saved && (
            <Button onClick={clearKeys} variant="destructive" size="icon">
              <AlertCircle className="h-4 w-4" />
            </Button>
          )}
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-lg border ${
              testResult.success
                ? "bg-green-500/10 border-green-500/20"
                : "bg-destructive/10 border-destructive/20"
            }`}
          >
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium whitespace-pre-line ${
                    testResult.success ? "text-green-500" : "text-destructive"
                  }`}
                >
                  {testResult.message}
                </p>
                {testResult.balances && testResult.balances.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Found {testResult.balances.length} assets with balance:
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {testResult.balances.slice(0, 5).map((balance) => (
                        <div
                          key={balance.asset}
                          className="text-xs flex justify-between bg-background/50 p-2 rounded"
                        >
                          <span className="font-medium">{balance.asset}</span>
                          <span>{parseFloat(balance.free).toFixed(8)}</span>
                        </div>
                      ))}
                      {testResult.balances.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          ...and {testResult.balances.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs font-medium text-blue-500 mb-2">📚 How to Get Your API Keys:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://www.binance.com/en/my/settings/api-management" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Binance API Management</a></li>
              <li>Click "Create API" and follow the security verification</li>
              <li>Give it a label (e.g., "TradeX App")</li>
              <li>Enable "Enable Reading" permission only (for safety)</li>
              <li>Copy both the API Key and Secret Key</li>
              <li>Paste them above and click "Save Keys"</li>
            </ol>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>🔒 Security Note:</strong> Your API keys are stored locally in your browser
              and never sent to our servers. Only use API keys with <strong>read-only</strong> permissions for
              safety. Never share your secret key with anyone.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
