import { convertToSI, convertFromSI } from './units';

export interface VLPInputs {
    wellDepth: number; // ft
    tubingDiameter: number; // in
    wellheadPressure: number; // psi
    oilDensity: number; // lb/ft³
    gasDensity: number; // lb/ft³
    waterCut: number; // fraction
    glr: number; // scf/STB
    roughness: number; // in
    wellInclination: number; // degrees
    rateMin: number; // STB/d
    rateMax: number; // STB/d
    steps?: number;
}

export interface VLPPoint {
    rate: number;
    pwf: number;
}

/**
 * Generate a Vertical Lift Performance (VLP) curve using a simplified
 * multiphase pressure drop estimation (homogeneous no-slip model).
 */
export function generateVLPcurve(inputs: VLPInputs): VLPPoint[] {
    const steps = inputs.steps || 50;
    const curve: VLPPoint[] = [];

    // Convert inputs to SI
    const depthM = convertToSI(inputs.wellDepth, 'ft', 'length');
    const diameterM = convertToSI(inputs.tubingDiameter, 'in', 'length');
    const whpPa = convertToSI(inputs.wellheadPressure, 'psi', 'pressure');
    const rhoOilSI = convertToSI(inputs.oilDensity, 'lb/ft³', 'density');
    const rhoGasSI = convertToSI(inputs.gasDensity, 'lb/ft³', 'density');
    const rhoWaterSI = convertToSI(62.4, 'lb/ft³', 'density'); // default water density
    const roughnessM = convertToSI(inputs.roughness, 'in', 'length');

    const g = 9.81; // m/s²
    const area = Math.PI * Math.pow(diameterM / 2, 2);

    for (let i = 0; i <= steps; i++) {
        const rateSTB = inputs.rateMin + (inputs.rateMax - inputs.rateMin) * (i / steps);

        if (rateSTB === 0) {
            // Static fluid column (no flow)
            const defaultLiquidDensity = rhoOilSI * (1 - inputs.waterCut) + rhoWaterSI * inputs.waterCut;
            const staticPwfPa = whpPa + defaultLiquidDensity * g * depthM;
            curve.push({ rate: rateSTB, pwf: convertFromSI(staticPwfPa, 'psi', 'pressure') });
            continue;
        }

        // Convert rates to SI
        const qMixLiquidM3S = convertToSI(rateSTB, 'stb/d', 'flowrate');

        // Gas rate = oil rate * GLR
        const qGasScfd = rateSTB * (1 - inputs.waterCut) * inputs.glr;
        const qGasMscfd = qGasScfd / 1000;
        const qGasM3S = convertToSI(qGasMscfd, 'MSCF/d', 'flowrate');

        const qTotalM3S = qMixLiquidM3S + qGasM3S;

        const lambdaL = qMixLiquidM3S / qTotalM3S;
        const lambdaG = qGasM3S / qTotalM3S;

        // Mixture properties (Homogeneous flow assumption)
        const liquidDensitySI = rhoOilSI * (1 - inputs.waterCut) + rhoWaterSI * inputs.waterCut;
        const rhoMixSI = liquidDensitySI * lambdaL + rhoGasSI * lambdaG;

        const velocity = qTotalM3S / area;

        // 1. Hydrostatic pressure drop (adjusted for inclination)
        const inclinationRad = inputs.wellInclination * (Math.PI / 180);
        // Only vertical depth contributes to hydrostatic pressure
        const dpHydrostatic = rhoMixSI * g * depthM * Math.cos(inclinationRad);

        // 2. Frictional pressure drop
        // Mixture viscosity (simplistic rule of thumb)
        const muLiquid = 0.001; // ~1 cP in Pa·s
        const muGas = 0.000015; // ~0.015 cP in Pa·s
        const muMix = muLiquid * lambdaL + muGas * lambdaG;

        const reynolds = (rhoMixSI * velocity * diameterM) / muMix;

        let f = 0.02; // Default to turbulent friction factor
        if (reynolds > 2100) {
            const eD = roughnessM / diameterM;
            // Swamee-Jain equation for friction factor
            const term = Math.log10(eD / 3.7 + 5.74 / Math.pow(reynolds, 0.9));
            f = 0.25 / (term * term);
        } else {
            f = 64 / Math.max(reynolds, 1); // Laminar
        }

        const dpFriction = f * (depthM / diameterM) * (rhoMixSI * velocity * velocity) / 2;

        // 3. Acceleration pressure drop
        const dpAcceleration = (rhoMixSI * velocity * velocity) / 2;

        // Total bottomhole flowing pressure
        const pwfPa = whpPa + dpHydrostatic + dpFriction + dpAcceleration;

        // Convert back to field units for output
        curve.push({
            rate: rateSTB,
            pwf: convertFromSI(pwfPa, 'psi', 'pressure')
        });
    }

    return curve;
}
