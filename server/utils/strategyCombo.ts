import { StrategyType, RecommendationAction, StrategyComboConfig } from "@shared/bot";
import { AnalysisResult } from "./strategyAnalyzer";

interface CombinedAnalysisResult {
    action: RecommendationAction;
    confidence: number;
    reasoning: string[];
    individualResults: Record<StrategyType, AnalysisResult>;
}

export function combineStrategies(
    results: Record<StrategyType, AnalysisResult>,
    config: StrategyComboConfig
): CombinedAnalysisResult {
    const activeResults = config.strategies.map(s => ({
        type: s.type,
        weight: s.weight,
        result: results[s.type]
    })).filter(r => r.result !== undefined);

    if (activeResults.length === 0) {
        return {
            action: "HOLD",
            confidence: 0,
            reasoning: ["No active strategies found"],
            individualResults: results
        };
    }

    switch (config.mode) {
        case "UNANIMOUS":
            return combineUnanimous(activeResults);
        case "MAJORITY":
            return combineMajority(activeResults);
        case "WEIGHTED":
            return combineWeighted(activeResults, config.minConfidence);
        default:
            return {
                action: "HOLD",
                confidence: 0,
                reasoning: ["Invalid combination mode"],
                individualResults: results
            };
    }
}

function combineUnanimous(
    results: { type: StrategyType; weight: number; result: AnalysisResult }[]
): CombinedAnalysisResult {
    const firstAction = results[0].result.action;
    const allAgree = results.every(r => r.result.action === firstAction);

    if (!allAgree || firstAction === "HOLD") {
        return {
            action: "HOLD",
            confidence: 0,
            reasoning: ["Strategies did not unanimously agree"],
            individualResults: Object.fromEntries(results.map(r => [r.type, r.result])) as Record<StrategyType, AnalysisResult>
        };
    }

    // Average confidence
    const avgConfidence = results.reduce((sum, r) => sum + r.result.confidence, 0) / results.length;

    return {
        action: firstAction,
        confidence: avgConfidence,
        reasoning: [`All ${results.length} strategies agreed on ${firstAction}`],
        individualResults: Object.fromEntries(results.map(r => [r.type, r.result])) as Record<StrategyType, AnalysisResult>
    };
}

function combineMajority(
    results: { type: StrategyType; weight: number; result: AnalysisResult }[]
): CombinedAnalysisResult {
    const votes = {
        BUY: 0,
        SELL: 0,
        HOLD: 0
    };

    results.forEach(r => {
        votes[r.result.action]++;
    });

    const totalVotes = results.length;
    const majorityThreshold = Math.ceil(totalVotes / 2);

    let winner: RecommendationAction = "HOLD";
    if (votes.BUY > votes.SELL && votes.BUY >= majorityThreshold) winner = "BUY";
    else if (votes.SELL > votes.BUY && votes.SELL >= majorityThreshold) winner = "SELL";

    if (winner === "HOLD") {
        return {
            action: "HOLD",
            confidence: 0,
            reasoning: ["No majority consensus reached"],
            individualResults: Object.fromEntries(results.map(r => [r.type, r.result])) as Record<StrategyType, AnalysisResult>
        };
    }

    // Average confidence of the winning side
    const winningResults = results.filter(r => r.result.action === winner);
    const avgConfidence = winningResults.reduce((sum, r) => sum + r.result.confidence, 0) / winningResults.length;

    return {
        action: winner,
        confidence: avgConfidence,
        reasoning: [`Majority (${votes[winner]}/${totalVotes}) voted for ${winner}`],
        individualResults: Object.fromEntries(results.map(r => [r.type, r.result])) as Record<StrategyType, AnalysisResult>
    };
}

function combineWeighted(
    results: { type: StrategyType; weight: number; result: AnalysisResult }[],
    minConfidence: number
): CombinedAnalysisResult {
    let buyScore = 0;
    let sellScore = 0;
    let totalWeight = 0;

    results.forEach(r => {
        const normalizedWeight = r.weight / 100;
        totalWeight += normalizedWeight;

        if (r.result.action === "BUY") {
            buyScore += r.result.confidence * normalizedWeight;
        } else if (r.result.action === "SELL") {
            sellScore += r.result.confidence * normalizedWeight;
        }
    });

    // Normalize scores if total weight is not 1 (though we expect users to manage weights, we handle partials)
    // If totalWeight is 0, avoid division by zero
    if (totalWeight > 0) {
        buyScore = buyScore / totalWeight;
        sellScore = sellScore / totalWeight;
    }

    let action: RecommendationAction = "HOLD";
    let confidence = 0;

    if (buyScore > sellScore && buyScore >= minConfidence) {
        action = "BUY";
        confidence = buyScore;
    } else if (sellScore > buyScore && sellScore >= minConfidence) {
        action = "SELL";
        confidence = sellScore;
    }

    return {
        action,
        confidence,
        reasoning: [
            `Weighted Score - BUY: ${buyScore.toFixed(1)}, SELL: ${sellScore.toFixed(1)}`,
            `Threshold: ${minConfidence}`
        ],
        individualResults: Object.fromEntries(results.map(r => [r.type, r.result])) as Record<StrategyType, AnalysisResult>
    };
}
