import { Point, solveNodalPoint } from "./nodal";
import { generateVLPcurve, VLPInputs } from "./vlp";
import { calculateProductionEfficiency } from "./wellPerformanceDashboard";

export interface TubingOptimizationResult {
    tubingSize: number;
    operatingRate: number;
    productionGain: number;
    efficiency: number;
    recommended: boolean;
}

export interface TubingOptimizationAnalysis {
    results: TubingOptimizationResult[];
    baseTubingSize: number;
    baseOperatingRate: number;
    recommendedTubingSize: number;
    expectedProductionIncrease: number;
    pressureReduction: number;
    engineeringExplanation: string;
}

export interface TubingOptimizationInputs {
    iprCurve: Point[];
    baseVlpInput: VLPInputs;
    currentOperatingRate: number;
    currentFlowingPressure: number;
    maxDeliverability: number;
}

const TUBING_SIZES = [2.375, 2.875, 3.5, 4.5] as const;

function formatTubingSize(size: number): string {
    return `${size.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")} in`;
}

function interpolatePwf(curve: Point[], targetRate: number): number | null {
    if (curve.length === 0) return null;

    for (let i = 0; i < curve.length - 1; i += 1) {
        const first = curve[i];
        const second = curve[i + 1];
        const minRate = Math.min(first.rate, second.rate);
        const maxRate = Math.max(first.rate, second.rate);

        if (targetRate >= minRate && targetRate <= maxRate) {
            if (first.rate === second.rate) return first.pwf;
            const ratio = (targetRate - first.rate) / (second.rate - first.rate);
            return first.pwf + ratio * (second.pwf - first.pwf);
        }
    }

    return null;
}

function calculatePressureReduction(inputs: TubingOptimizationInputs, recommendedTubingSize: number): number {
    const optimizedVlp = generateVLPcurve({
        ...inputs.baseVlpInput,
        tubingDiameter: recommendedTubingSize,
    });
    const optimizedPwfAtCurrentRate = interpolatePwf(optimizedVlp, inputs.currentOperatingRate);

    if (optimizedPwfAtCurrentRate === null) return 0;
    return Math.max(inputs.currentFlowingPressure - optimizedPwfAtCurrentRate, 0);
}

function buildExplanation(baseSize: number, bestSize: number, expectedIncrease: number): string {
    if (bestSize === baseSize || expectedIncrease <= 0) {
        return `The current ${formatTubingSize(baseSize)} tubing is the preferred case for the evaluated operating envelope.`;
    }

    return `Changing tubing diameter from ${formatTubingSize(baseSize)} to ${formatTubingSize(bestSize)} is expected to increase production by approximately ${expectedIncrease.toFixed(1)}%.`;
}

export function optimizeTubing(inputs: TubingOptimizationInputs): TubingOptimizationAnalysis {
    const baseTubingSize = inputs.baseVlpInput.tubingDiameter;
    const baseOperatingRate = inputs.currentOperatingRate;

    const evaluatedCases = TUBING_SIZES.map((tubingSize) => {
        const vlpCurve = generateVLPcurve({
            ...inputs.baseVlpInput,
            tubingDiameter: tubingSize,
        });
        const operatingPoint = solveNodalPoint(inputs.iprCurve, vlpCurve);
        const operatingRate = operatingPoint?.operatingRate ?? 0;

        return {
            tubingSize,
            operatingRate,
            productionGain: baseOperatingRate > 0 ? ((operatingRate - baseOperatingRate) / baseOperatingRate) * 100 : 0,
            efficiency: calculateProductionEfficiency(operatingRate, inputs.maxDeliverability),
            recommended: false,
        };
    });

    const recommendedCase = evaluatedCases.reduce((best, current) => {
        if (current.operatingRate > best.operatingRate) return current;
        if (current.operatingRate === best.operatingRate && Math.abs(current.tubingSize - baseTubingSize) < Math.abs(best.tubingSize - baseTubingSize)) {
            return current;
        }
        return best;
    }, evaluatedCases[0]);

    const results = evaluatedCases.map((result): TubingOptimizationResult => ({
        ...result,
        recommended: result.tubingSize === recommendedCase.tubingSize,
    }));

    const expectedProductionIncrease = baseOperatingRate > 0
        ? Math.max(((recommendedCase.operatingRate - baseOperatingRate) / baseOperatingRate) * 100, 0)
        : 0;
    const pressureReduction = calculatePressureReduction(inputs, recommendedCase.tubingSize);

    return {
        results,
        baseTubingSize,
        baseOperatingRate,
        recommendedTubingSize: recommendedCase.tubingSize,
        expectedProductionIncrease,
        pressureReduction,
        engineeringExplanation: buildExplanation(baseTubingSize, recommendedCase.tubingSize, expectedProductionIncrease),
    };
}
