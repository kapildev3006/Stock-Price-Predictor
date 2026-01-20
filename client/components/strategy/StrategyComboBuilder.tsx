import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Play, Layers } from "lucide-react";
import { StrategyType, StrategyComboConfig } from "@shared/bot";

const AVAILABLE_STRATEGIES: { type: StrategyType; label: string }[] = [
    { type: "RSI", label: "RSI" },
    { type: "MACD", label: "MACD" },
    { type: "EMA_CROSSOVER", label: "EMA Crossover" },
    { type: "BOLLINGER_BANDS", label: "Bollinger Bands" },
    { type: "VOLUME_SPIKE", label: "Volume Spike" },
    { type: "STOCHASTIC", label: "Stochastic" },
    { type: "ADX", label: "ADX" },
    { type: "ICHIMOKU", label: "Ichimoku Cloud" },
    { type: "FIBONACCI", label: "Fibonacci" },
    { type: "PRICE_ACTION", label: "Price Action" },
];

export default function StrategyComboBuilder() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [coinPair, setCoinPair] = useState("BTCUSDT");
    const [comboConfig, setComboConfig] = useState<StrategyComboConfig>({
        strategies: [
            { type: "RSI", weight: 50 },
            { type: "MACD", weight: 50 },
        ],
        mode: "UNANIMOUS",
        minConfidence: 60,
    });
    const [result, setResult] = useState<any>(null);

    const addStrategy = () => {
        setComboConfig({
            ...comboConfig,
            strategies: [...comboConfig.strategies, { type: "RSI", weight: 50 }],
        });
    };

    const removeStrategy = (index: number) => {
        const newStrategies = [...comboConfig.strategies];
        newStrategies.splice(index, 1);
        setComboConfig({ ...comboConfig, strategies: newStrategies });
    };

    const updateStrategy = (index: number, field: "type" | "weight", value: any) => {
        const newStrategies = [...comboConfig.strategies];
        newStrategies[index] = { ...newStrategies[index], [field]: value };
        setComboConfig({ ...comboConfig, strategies: newStrategies });
    };

    const handleAnalyze = async () => {
        if (comboConfig.strategies.length < 2) {
            toast({
                title: "Invalid Configuration",
                description: "Please select at least 2 strategies to combine.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/bot/combo-recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    coinPair,
                    comboConfig,
                    candleInterval: "4h", // Default for now
                }),
            });

            if (!response.ok) throw new Error("Failed to analyze combo");

            const data = await response.json();
            setResult(data);
            toast({
                title: "Analysis Complete",
                description: `Generated combined recommendation for ${coinPair}`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to generate recommendation",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5" />
                            Strategy Combination
                        </CardTitle>
                        <CardDescription>
                            Combine multiple strategies to create robust trading signals
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Coin Pair */}
                        <div className="space-y-2">
                            <Label>Coin Pair</Label>
                            <Input
                                value={coinPair}
                                onChange={(e) => setCoinPair(e.target.value.toUpperCase())}
                                placeholder="BTCUSDT"
                            />
                        </div>

                        {/* Combination Mode */}
                        <div className="space-y-2">
                            <Label>Combination Mode</Label>
                            <Select
                                value={comboConfig.mode}
                                onValueChange={(value: any) =>
                                    setComboConfig({ ...comboConfig, mode: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UNANIMOUS">Unanimous (All must agree)</SelectItem>
                                    <SelectItem value="MAJORITY">Majority Vote</SelectItem>
                                    <SelectItem value="WEIGHTED">Weighted Score</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {comboConfig.mode === "UNANIMOUS" && "Requires all selected strategies to generate the same signal (BUY/SELL)."}
                                {comboConfig.mode === "MAJORITY" && "Signal is determined by the majority vote of strategies."}
                                {comboConfig.mode === "WEIGHTED" && "Calculates a weighted average score based on confidence and assigned weights."}
                            </p>
                        </div>

                        {/* Strategies List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Selected Strategies</Label>
                                <Button variant="outline" size="sm" onClick={addStrategy}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Strategy
                                </Button>
                            </div>

                            {comboConfig.strategies.map((strategy, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <Select
                                            value={strategy.type}
                                            onValueChange={(value) => updateStrategy(index, "type", value)}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {AVAILABLE_STRATEGIES.map((s) => (
                                                    <SelectItem key={s.type} value={s.type}>
                                                        {s.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="ml-auto text-destructive hover:text-destructive"
                                            onClick={() => removeStrategy(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {comboConfig.mode === "WEIGHTED" && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span>Weight</span>
                                                <span>{strategy.weight}%</span>
                                            </div>
                                            <Slider
                                                value={[strategy.weight]}
                                                onValueChange={(vals) => updateStrategy(index, "weight", vals[0])}
                                                max={100}
                                                step={5}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleAnalyze}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Run Combination Analysis
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Results Panel */}
            <div className="space-y-6">
                {result ? (
                    <Card className="h-full border-primary/20">
                        <CardHeader>
                            <CardTitle>Analysis Result</CardTitle>
                            <CardDescription>Combined signal based on {comboConfig.mode} logic</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Main Signal */}
                            <div className="text-center py-6 bg-muted/30 rounded-xl">
                                <div className="text-sm text-muted-foreground mb-2">Recommendation</div>
                                <div className={`text-4xl font-bold mb-2 ${result.recommendation === "BUY" ? "text-green-500" :
                                        result.recommendation === "SELL" ? "text-red-500" :
                                            "text-yellow-500"
                                    }`}>
                                    {result.recommendation}
                                </div>
                                <div className="flex justify-center items-center gap-2">
                                    <Badge variant="outline">
                                        Confidence: {result.signalStrength.toFixed(1)}%
                                    </Badge>
                                </div>
                            </div>

                            {/* Reasoning */}
                            <div className="space-y-2">
                                <Label>Reasoning</Label>
                                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                                    {result.reasoning}
                                </div>
                            </div>

                            {/* Individual Results */}
                            <div className="space-y-3">
                                <Label>Individual Strategy Breakdown</Label>
                                <div className="space-y-2">
                                    {Object.entries(result.individualResults || {}).map(([type, res]: [string, any]) => (
                                        <div key={type} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                                            <span className="font-medium">{type}</span>
                                            <div className="flex items-center gap-3">
                                                <span className={
                                                    res.action === "BUY" ? "text-green-500 font-bold" :
                                                        res.action === "SELL" ? "text-red-500 font-bold" :
                                                            "text-yellow-500 font-bold"
                                                }>
                                                    {res.action}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    ({res.confidence.toFixed(0)}%)
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="h-full flex items-center justify-center text-center p-6 text-muted-foreground border-dashed">
                        <div>
                            <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Configure strategies and run analysis to see results</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
