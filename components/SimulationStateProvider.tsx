"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ProductionDiagnosis } from "@/lib/productionDiagnosis";

export interface SharedReservoirData {
    reservoirPressure: number;
    reservoirModel: string;
    productivityIndex: number | null;
    qMax: number;
}

export interface SharedWellData {
    wellDepth: number;
    tubingDiameter: number;
    wellheadPressure: number;
    wellInclination: number;
    roughness: number;
}

export interface SharedFluidData {
    oilDensity: number;
    gasDensity: number;
    waterCut: number;
    glr: number;
    oilViscosity: number;
}

export interface SharedSimulationResults {
    operatingRate: number;
    operatingBottomholePressure: number;
    naturalFlowStatus: boolean;
    maximumDeliverability: number;
}

export interface SharedOperatingPoint {
    operatingRate: number;
    operatingPwf: number;
}

export interface SharedArtificialLiftRecommendation {
    method: string;
    score: number;
    reasons: string[];
}

export interface SharedSimulationState {
    currentWell: {
        name: string;
        updatedAt: string;
    };
    reservoirData: SharedReservoirData;
    wellData: SharedWellData;
    fluidData: SharedFluidData;
    simulationResults: SharedSimulationResults;
    operatingPoint: SharedOperatingPoint;
    productionDiagnosis: ProductionDiagnosis;
    recommendedArtificialLift: SharedArtificialLiftRecommendation | null;
    futureArtificialLiftResults: null;
    futureEconomics: null;
    futureReports: null;
}

interface SimulationStateContextValue {
    simulationState: SharedSimulationState | null;
    setSimulationState: (state: SharedSimulationState) => void;
    clearSimulationState: () => void;
}

const STORAGE_KEY = "petrocalc.currentSimulation";

const SimulationStateContext = createContext<SimulationStateContextValue | undefined>(undefined);

function readStoredSimulation(): SharedSimulationState | null {
    if (typeof window === "undefined") return null;

    const storedState = window.localStorage.getItem(STORAGE_KEY);
    if (!storedState) return null;

    try {
        return JSON.parse(storedState) as SharedSimulationState;
    } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

export function SimulationStateProvider({ children }: { children: ReactNode }) {
    const [simulationState, setSimulationStateValue] = useState<SharedSimulationState | null>(null);

    useEffect(() => {
        setSimulationStateValue(readStoredSimulation());
    }, []);

    const contextValue = useMemo<SimulationStateContextValue>(() => ({
        simulationState,
        setSimulationState: (state) => {
            setSimulationStateValue(state);
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        },
        clearSimulationState: () => {
            setSimulationStateValue(null);
            window.localStorage.removeItem(STORAGE_KEY);
        },
    }), [simulationState]);

    return (
        <SimulationStateContext.Provider value={contextValue}>
            {children}
        </SimulationStateContext.Provider>
    );
}

export function useSimulationState() {
    const context = useContext(SimulationStateContext);
    if (!context) {
        throw new Error("useSimulationState must be used within SimulationStateProvider");
    }

    return context;
}
