export type WellHealth = "Excellent" | "Moderate" | "Needs Optimization";

export interface WellPerformanceDashboardInputs {
    reservoirPressure: number;
    flowingPressure: number;
    operatingRate: number;
    maxDeliverability: number;
    naturalFlow: boolean;
    flowRegime: string;
}

export interface WellPerformanceDashboardResult {
    operatingRate: number;
    flowingPressure: number;
    reservoirPressure: number;
    pressureDrawdown: number;
    productivityIndex: number | null;
    maxDeliverability: number;
    productionEfficiency: number;
    naturalFlow: boolean;
    flowRegime: string;
    wellHealth: WellHealth;
    engineeringSummary: string[];
}

export function calculatePressureDrawdown(reservoirPressure: number, flowingPressure: number): number {
    return Math.max(reservoirPressure - flowingPressure, 0);
}

export function calculateProductivityIndex(operatingRate: number, pressureDrawdown: number): number | null {
    if (pressureDrawdown <= 0) return null;
    return operatingRate / pressureDrawdown;
}

export function calculateProductionEfficiency(operatingRate: number, maxDeliverability: number): number {
    if (maxDeliverability <= 0) return 0;
    return (operatingRate / maxDeliverability) * 100;
}

export function classifyWellHealth(productionEfficiency: number): WellHealth {
    if (productionEfficiency >= 90) return "Excellent";
    if (productionEfficiency >= 70) return "Moderate";
    return "Needs Optimization";
}

export function buildEngineeringSummary(result: Omit<WellPerformanceDashboardResult, "engineeringSummary">): string[] {
    const summary: string[] = [];

    summary.push(
        result.naturalFlow
            ? `Natural flow is sustainable under ${result.flowRegime}.`
            : "Natural flow is not sustainable at the current operating condition."
    );

    if (result.productionEfficiency >= 90) {
        summary.push("Production efficiency is excellent relative to maximum deliverability.");
    } else if (result.productionEfficiency >= 70) {
        summary.push("Production efficiency is satisfactory.");
    } else {
        summary.push("Production efficiency is below the preferred operating range.");
    }

    const drawdownRatio = result.reservoirPressure > 0
        ? (result.pressureDrawdown / result.reservoirPressure) * 100
        : 0;

    if (drawdownRatio <= 35) {
        summary.push("Pressure drawdown is within acceptable limits.");
    } else if (drawdownRatio <= 60) {
        summary.push("Pressure drawdown is elevated and should be monitored.");
    } else {
        summary.push("Pressure drawdown is high and may indicate optimization potential.");
    }

    if (result.productivityIndex === null) {
        summary.push("Productivity index is unavailable because pressure drawdown is zero.");
    } else if (result.productivityIndex >= 2) {
        summary.push("Productivity index indicates strong inflow capacity.");
    } else if (result.productivityIndex >= 0.5) {
        summary.push("Productivity index indicates moderate inflow capacity.");
    } else {
        summary.push("Productivity index indicates restricted inflow capacity.");
    }

    summary.push(`Current well condition is ${result.wellHealth}.`);

    return summary;
}

export function calculateWellPerformanceDashboard(
    inputs: WellPerformanceDashboardInputs
): WellPerformanceDashboardResult {
    const pressureDrawdown = calculatePressureDrawdown(inputs.reservoirPressure, inputs.flowingPressure);
    const productivityIndex = calculateProductivityIndex(inputs.operatingRate, pressureDrawdown);
    const productionEfficiency = calculateProductionEfficiency(inputs.operatingRate, inputs.maxDeliverability);
    const wellHealth = classifyWellHealth(productionEfficiency);

    const resultWithoutSummary: Omit<WellPerformanceDashboardResult, "engineeringSummary"> = {
        operatingRate: inputs.operatingRate,
        flowingPressure: inputs.flowingPressure,
        reservoirPressure: inputs.reservoirPressure,
        pressureDrawdown,
        productivityIndex,
        maxDeliverability: inputs.maxDeliverability,
        productionEfficiency,
        naturalFlow: inputs.naturalFlow,
        flowRegime: inputs.flowRegime,
        wellHealth,
    };

    return {
        ...resultWithoutSummary,
        engineeringSummary: buildEngineeringSummary(resultWithoutSummary),
    };
}
