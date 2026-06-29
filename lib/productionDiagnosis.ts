export type ProductionBottleneck =
    | "Reservoir Pressure"
    | "Hydrostatic Head"
    | "Tubing Friction"
    | "Surface Back Pressure"
    | "Formation Damage";

export interface ProductionDiagnosis {
    reservoirLoss: number;
    hydrostaticLoss: number;
    frictionLoss: number;
    surfaceBackPressure: number;
    skinImpact: number;
    totalLoss: number;
    primaryBottleneck: ProductionBottleneck;
    recommendations: string;
}

export interface ProductionDiagnosisInputs {
    reservoirPressure: number;
    initialReservoirPressure: number;
    flowingPressure: number;
    operatingRate: number;
    maxDeliverability: number;
    wellDepth: number;
    wellInclination: number;
    wellheadPressure: number;
    tubingDiameter: number;
    oilDensity: number;
    waterCut: number;
    skinFactor: number;
    drainageRadius: number;
    wellboreRadius: number;
}

function calculateMixtureLiquidDensity(oilDensity: number, waterCut: number): number {
    const boundedWaterCut = Math.min(1, Math.max(0, waterCut));
    return oilDensity * (1 - boundedWaterCut) + 62.4 * boundedWaterCut;
}

function calculateHydrostaticLoss(inputs: ProductionDiagnosisInputs): number {
    const verticalDepth = inputs.wellDepth * Math.sin((inputs.wellInclination * Math.PI) / 180);
    const liquidGradientPsiPerFt = calculateMixtureLiquidDensity(inputs.oilDensity, inputs.waterCut) / 144;
    return Math.max(verticalDepth * liquidGradientPsiPerFt, 0);
}

function calculateReservoirPressureLoss(inputs: ProductionDiagnosisInputs): number {
    const depletionLoss = Math.max(inputs.initialReservoirPressure - inputs.reservoirPressure, 0);
    const deliverabilityGap = inputs.maxDeliverability > 0
        ? Math.max(1 - inputs.operatingRate / inputs.maxDeliverability, 0) * inputs.reservoirPressure * 0.15
        : 0;

    return Math.max(depletionLoss, deliverabilityGap);
}

function calculateSkinImpact(inputs: ProductionDiagnosisInputs): number {
    if (inputs.skinFactor <= 0 || inputs.drainageRadius <= inputs.wellboreRadius) return 0;

    const drawdown = Math.max(inputs.reservoirPressure - inputs.flowingPressure, 0);
    const radialFlowTerm = Math.log(inputs.drainageRadius / inputs.wellboreRadius);
    const skinFraction = inputs.skinFactor / Math.max(radialFlowTerm + inputs.skinFactor, 1);

    return drawdown * Math.min(Math.max(skinFraction, 0), 1);
}

function calculateFrictionLoss(inputs: ProductionDiagnosisInputs, hydrostaticLoss: number): number {
    // The VLP curve returns flowing bottomhole pressure, so the remaining lift pressure
    // after hydrostatic head and wellhead pressure is treated as tubing friction.
    const liftPressure = Math.max(inputs.flowingPressure - inputs.wellheadPressure, 0);
    const residualLiftLoss = Math.max(liftPressure - hydrostaticLoss, 0);
    const tubingRestrictionFactor = inputs.tubingDiameter > 0 ? 2.875 / inputs.tubingDiameter : 1;

    return residualLiftLoss * Math.max(tubingRestrictionFactor, 0.25);
}

function determinePrimaryBottleneck(losses: Record<ProductionBottleneck, number>): ProductionBottleneck {
    return Object.entries(losses).reduce<ProductionBottleneck>((current, [bottleneck, loss]) => {
        return loss > losses[current] ? (bottleneck as ProductionBottleneck) : current;
    }, "Reservoir Pressure");
}

function buildRecommendations(primaryBottleneck: ProductionBottleneck, inputs: ProductionDiagnosisInputs): string {
    if (primaryBottleneck === "Surface Back Pressure") {
        return "Reduce wellhead pressure where facility constraints allow and review flowline or choke restrictions.";
    }

    if (primaryBottleneck === "Tubing Friction") {
        return "Increase tubing diameter or reduce high-rate friction losses through tubing optimization.";
    }

    if (primaryBottleneck === "Hydrostatic Head") {
        return "Evaluate artificial lift or gas lift support to reduce effective liquid column loading.";
    }

    if (primaryBottleneck === "Formation Damage") {
        return inputs.skinFactor > 5
            ? "Consider stimulation, cleanup, or damage remediation because the skin factor is high."
            : "Review near-wellbore condition and confirm skin factor with well test data.";
    }

    return "Review reservoir pressure support, drawdown strategy, and artificial lift timing to improve deliverability.";
}

export function diagnoseProduction(inputs: ProductionDiagnosisInputs): ProductionDiagnosis {
    const reservoirLoss = calculateReservoirPressureLoss(inputs);
    const hydrostaticLoss = calculateHydrostaticLoss(inputs);
    const frictionLoss = calculateFrictionLoss(inputs, hydrostaticLoss);
    const surfaceBackPressure = Math.max(inputs.wellheadPressure, 0);
    const skinImpact = calculateSkinImpact(inputs);

    const losses: Record<ProductionBottleneck, number> = {
        "Reservoir Pressure": reservoirLoss,
        "Hydrostatic Head": hydrostaticLoss,
        "Tubing Friction": frictionLoss,
        "Surface Back Pressure": surfaceBackPressure,
        "Formation Damage": skinImpact,
    };

    const primaryBottleneck = determinePrimaryBottleneck(losses);
    const totalLoss = reservoirLoss + hydrostaticLoss + frictionLoss + surfaceBackPressure + skinImpact;

    return {
        reservoirLoss,
        hydrostaticLoss,
        frictionLoss,
        surfaceBackPressure,
        skinImpact,
        totalLoss,
        primaryBottleneck,
        recommendations: buildRecommendations(primaryBottleneck, inputs),
    };
}
