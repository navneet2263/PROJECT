"use client";

import { useEffect, useState, useMemo } from "react";
import CalculatorLayout from "@/components/CalculatorLayout";
import ReservoirInputs, { defaultReservoirState, ReservoirState } from "@/components/ReservoirInputs";
import WellboreInputs, { defaultWellboreState, WellboreState } from "@/components/WellboreInputs";
import FluidInputs, { defaultFluidState, FluidState } from "@/components/FluidInputs";
import OperatingPointCard from "@/components/OperatingPointCard";
import SensitivityPanel, { SensitivityVariable } from "@/components/SensitivityPanel";
import GraphPanel from "@/components/GraphPanel";
import ArtificialLiftRecommendation from "@/components/ArtificialLiftRecommendation";
import DataQualityChecker from "@/components/DataQualityChecker";
import WellPerformanceDashboard from "@/components/WellPerformanceDashboard";
import ProductionDiagnosis from "@/components/ProductionDiagnosis";
import TubingOptimization from "@/components/TubingOptimization";
import { SharedSimulationState, useSimulationState } from "@/components/SimulationStateProvider";


import { generateLinearIPR, generateVogelIPR, generateFetkovichIPR } from "@/lib/ipr";
import { generateVLPcurve, VLPInputs } from "@/lib/vlp";
import { solveNodalPoint } from "@/lib/nodal";
import { diagnoseProduction } from "@/lib/productionDiagnosis";
import { recommendArtificialLift, LiftInputs } from "@/lib/artificialLift";
import {
    calculatePressureDrawdown,
    calculateProductionEfficiency,
    calculateProductivityIndex,
} from "@/lib/wellPerformanceDashboard";

export default function WellPerformancePage() {
    const { setSimulationState } = useSimulationState();
    const [resData, setResData] = useState<ReservoirState>(defaultReservoirState);
    const [wellData, setWellData] = useState<WellboreState>(defaultWellboreState);
    const [fluidData, setFluidData] = useState<FluidState>(defaultFluidState);

    const [sensVar, setSensVar] = useState<SensitivityVariable>("None");
    const [sensVals, setSensVals] = useState<[number, number, number]>([2.375, 2.875, 3.5]);

    const [isCalculated, setIsCalculated] = useState(false);

    // Calculated state snapshot when user hits "Run Simulation"
    const [snapshot, setSnapshot] = useState<{
        res: ReservoirState;
        well: WellboreState;
        fluid: FluidState;
        sVar: SensitivityVariable;
        sVals: [number, number, number];
    } | null>(null);

    const handleRunSimulation = () => {
        setSnapshot({
            res: { ...resData },
            well: { ...wellData },
            fluid: { ...fluidData },
            sVar: sensVar,
            sVals: [...sensVals]
        });
        setIsCalculated(true);
    };

    const handleSensVarChange = (v: SensitivityVariable) => {
        setSensVar(v);
        if (v === "Tubing Size") setSensVals([2.375, 2.875, 3.5]);
        if (v === "GLR") setSensVals([200, 400, 800]);
        if (v === "WHP") setSensVals([100, 200, 400]);
    };

    const qMaxEstimate = snapshot?.res.model === "Linear"
        ? snapshot.res.reservoirPressure * snapshot.res.j * 1.5
        : snapshot?.res.qMax || 5000;

    const iprCurve = useMemo(() => {
        if (!snapshot) return [];
        switch (snapshot.res.model) {
            case "Linear":
                return generateLinearIPR(snapshot.res.reservoirPressure, snapshot.res.j, 50);
            case "Fetkovich":
                return generateFetkovichIPR(snapshot.res.reservoirPressure, snapshot.res.qMax, snapshot.res.n, 50);
            case "Vogel":
            default:
                return generateVogelIPR(snapshot.res.reservoirPressure, snapshot.res.qMax, 50);
        }
    }, [snapshot]);

    const baseVlpInput: VLPInputs | null = useMemo(() => {
        if (!snapshot) return null;
        return {
            wellDepth: snapshot.well.wellDepth,
            tubingDiameter: snapshot.well.tubingDiameter,
            wellheadPressure: snapshot.well.wellheadPressure,
            oilDensity: snapshot.fluid.oilDensity,
            gasDensity: snapshot.fluid.gasDensity,
            waterCut: snapshot.fluid.waterCut,
            glr: snapshot.fluid.gasLiquidRatio,
            roughness: snapshot.well.roughness,
            wellInclination: snapshot.well.wellInclination,
            rateMin: 0,
            rateMax: Math.max(qMaxEstimate, 1000),
            steps: 50
        };
    }, [snapshot, qMaxEstimate]);

    const vlpCurve = useMemo(() => {
        if (!baseVlpInput) return [];
        return generateVLPcurve(baseVlpInput);
    }, [baseVlpInput]);

    const sensitivityCurves = useMemo(() => {
        if (!snapshot || !baseVlpInput || snapshot.sVar === "None") return [];
        return snapshot.sVals.map(val => {
            const vlpInput = { ...baseVlpInput };
            if (snapshot.sVar === "Tubing Size") vlpInput.tubingDiameter = val;
            if (snapshot.sVar === "GLR") vlpInput.glr = val;
            if (snapshot.sVar === "WHP") vlpInput.wellheadPressure = val;
            return generateVLPcurve(vlpInput);
        });
    }, [snapshot, baseVlpInput]);

    const op = useMemo(() => {
        if (iprCurve.length === 0 || vlpCurve.length === 0) return null;
        return solveNodalPoint(iprCurve, vlpCurve);
    }, [iprCurve, vlpCurve]);

    const diagnosisInputs = useMemo(() => {
        if (!snapshot || op === null) return null;

        return {
            reservoirPressure: snapshot.res.reservoirPressure,
            initialReservoirPressure: snapshot.res.initialReservoirPressure,
            flowingPressure: op.operatingPwf,
            operatingRate: op.operatingRate,
            maxDeliverability: qMaxEstimate,
            wellDepth: snapshot.well.wellDepth,
            wellInclination: snapshot.well.wellInclination,
            wellheadPressure: snapshot.well.wellheadPressure,
            tubingDiameter: snapshot.well.tubingDiameter,
            oilDensity: snapshot.fluid.oilDensity,
            waterCut: snapshot.fluid.waterCut,
            skinFactor: snapshot.res.skinFactor,
            drainageRadius: snapshot.res.drainageRadius,
            wellboreRadius: snapshot.res.wellboreRadius,
        };
    }, [snapshot, op, qMaxEstimate]);

    const productionDiagnosis = useMemo(() => {
        if (!diagnosisInputs) return null;
        return diagnoseProduction(diagnosisInputs);
    }, [diagnosisInputs]);

    const artificialLiftInputs = useMemo<LiftInputs | null>(() => {
        if (!snapshot) return null;

        return {
            depth: snapshot.well.wellDepth,
            ratePotential: qMaxEstimate,
            gasFraction: Math.min(1.0, Math.max(0.0, snapshot.fluid.gasLiquidRatio / 1000)),
            viscosity: snapshot.res.oilViscosity || 2.0,
            deviation: Math.max(0, 90 - snapshot.well.wellInclination),
            sandProduction: false,
        };
    }, [snapshot, qMaxEstimate]);

    const artificialLiftResult = useMemo(() => {
        if (!artificialLiftInputs) return null;
        return recommendArtificialLift(artificialLiftInputs);
    }, [artificialLiftInputs]);

    const recommendedArtificialLift = artificialLiftResult?.recommended
        ? {
            method: artificialLiftResult.recommended.method,
            score: artificialLiftResult.recommended.score,
            reasons: artificialLiftResult.recommended.reasons,
        }
        : null;

    const pressureDrawdown = op && snapshot
        ? calculatePressureDrawdown(snapshot.res.reservoirPressure, op.operatingPwf)
        : 0;
    const productivityIndex = op
        ? calculateProductivityIndex(op.operatingRate, pressureDrawdown)
        : null;
    const productionEfficiency = op
        ? calculateProductionEfficiency(op.operatingRate, qMaxEstimate)
        : 0;
    const showArtificialLiftAction = Boolean(
        productionDiagnosis
        && recommendedArtificialLift
        && (productionDiagnosis.primaryBottleneck === "Hydrostatic Head" || productionEfficiency < 70)
    );

    const sharedSimulationState = useMemo<SharedSimulationState | null>(() => {
        if (!snapshot || op === null || !productionDiagnosis) return null;

        return {
            currentWell: {
                name: "Well Performance Simulation",
                updatedAt: new Date().toISOString(),
            },
            reservoirData: {
                reservoirPressure: snapshot.res.reservoirPressure,
                reservoirModel: snapshot.res.model,
                productivityIndex,
                qMax: qMaxEstimate,
            },
            wellData: {
                wellDepth: snapshot.well.wellDepth,
                tubingDiameter: snapshot.well.tubingDiameter,
                wellheadPressure: snapshot.well.wellheadPressure,
                wellInclination: snapshot.well.wellInclination,
                roughness: snapshot.well.roughness,
            },
            fluidData: {
                oilDensity: snapshot.fluid.oilDensity,
                gasDensity: snapshot.fluid.gasDensity,
                waterCut: snapshot.fluid.waterCut,
                glr: snapshot.fluid.gasLiquidRatio,
                oilViscosity: snapshot.res.oilViscosity,
            },
            simulationResults: {
                operatingRate: op.operatingRate,
                operatingBottomholePressure: op.operatingPwf,
                naturalFlowStatus: true,
                maximumDeliverability: qMaxEstimate,
            },
            operatingPoint: {
                operatingRate: op.operatingRate,
                operatingPwf: op.operatingPwf,
            },
            productionDiagnosis,
            recommendedArtificialLift,
            futureArtificialLiftResults: null,
            futureEconomics: null,
            futureReports: null,
        };
    }, [snapshot, op, productionDiagnosis, productivityIndex, qMaxEstimate, recommendedArtificialLift]);

    useEffect(() => {
        if (sharedSimulationState) {
            setSimulationState(sharedSimulationState);
        }
    }, [sharedSimulationState, setSimulationState]);

    return (
        <CalculatorLayout
            title="Well Performance Simulator"
            description="Nodal analysis combining Inflow Performance Relationship (IPR) and Vertical Lift Performance (VLP) to determine the operating point."
            sectionLabel="Production"
            sectionHref="/production"
        >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="flex flex-col gap-6 lg:col-span-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
                    <ReservoirInputs data={resData} onChange={(u) => setResData({ ...resData, ...u })} />
                    <WellboreInputs data={wellData} onChange={(u) => setWellData({ ...wellData, ...u })} />
                    <FluidInputs data={fluidData} onChange={(u) => setFluidData({ ...fluidData, ...u })} />

                    <button
                        onClick={handleRunSimulation}
                        className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-surface"
                    >
                        Run Simulation
                    </button>

                    <DataQualityChecker res={resData} well={wellData} fluid={fluidData} />

                </div>

                <div className="flex flex-col gap-6 lg:col-span-8">
                    {isCalculated ? (
                        <>
                            <GraphPanel
                                iprData={iprCurve}
                                vlpData={vlpCurve}
                                operatingPoint={op}
                                sensitivityCurves={sensitivityCurves.map((sc, idx) => ({
                                    data: sc,
                                    name: `${snapshot?.sVar} = ${snapshot!.sVals[idx]}`,
                                    color: idx === 0 ? "#10b981" : idx === 1 ? "#f59e0b" : "#ef4444"
                                }))}
                            />
                            {op !== null && snapshot && baseVlpInput && productionDiagnosis ? (
                                <>
                                    <WellPerformanceDashboard
                                        reservoirPressure={snapshot.res.reservoirPressure}
                                        flowingPressure={op.operatingPwf}
                                        operatingRate={op.operatingRate}
                                        maxDeliverability={qMaxEstimate}
                                        naturalFlow={true}
                                        flowRegime="Natural IPR/VLP intersection"
                                    />
                                    <ProductionDiagnosis
                                        diagnosis={productionDiagnosis}
                                        artificialLiftRecommendation={recommendedArtificialLift}
                                        showArtificialLiftAction={showArtificialLiftAction}
                                    />
                                    <TubingOptimization
                                        iprCurve={iprCurve}
                                        baseVlpInput={baseVlpInput}
                                        currentOperatingRate={op.operatingRate}
                                        currentFlowingPressure={op.operatingPwf}
                                        maxDeliverability={qMaxEstimate}
                                    />
                                    <OperatingPointCard
                                        operatingRate={op.operatingRate}
                                        operatingPwf={op.operatingPwf}
                                    />
                                </>
                            ) : (
                                snapshot && (
                                    <ArtificialLiftRecommendation
                                        initialInputs={{
                                            depth: snapshot.well.wellDepth,
                                            ratePotential: qMaxEstimate,
                                            gasFraction: Math.min(1.0, Math.max(0.0, snapshot.fluid.gasLiquidRatio / 1000)),
                                            viscosity: snapshot.res.oilViscosity || 2.0,
                                            deviation: Math.max(0, 90 - snapshot.well.wellInclination),
                                            sandProduction: false
                                        }}
                                    />
                                )
                            )}

                            <SensitivityPanel
                                variable={sensVar}
                                onVariableChange={handleSensVarChange}
                                values={sensVals}
                                onValuesChange={setSensVals}
                            />
                        </>
                    ) : (
                        <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-muted">
                            <div className="mb-4 rounded-full bg-surface-elevated p-4 shadow-sm">
                                <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-slate-800 dark:text-slate-200">Simulation Not Started</h3>
                            <p className="max-w-md text-sm">
                                Enter your reservoir, wellbore, and fluid parameters on the left, then click <strong>Run Simulation</strong> to compute the operating point and view the nodal analysis curves.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </CalculatorLayout>
    );
}
