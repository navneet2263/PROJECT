import { generateLinearIPR, generateVogelIPR, generateFetkovichIPR, IPRPoint } from './ipr';
import { generateVLPcurve, VLPPoint } from './vlp';

export interface Point {
    rate: number;
    pwf: number;
}

export interface OperatingPoint {
    operatingRate: number;
    operatingPwf: number;
}

export function solveNodalPoint(iprCurve: Point[], vlpCurve: Point[]): OperatingPoint | null {
    if (iprCurve.length === 0 || vlpCurve.length === 0) return null;

    let minDiff = Infinity;
    let operatingRate = 0;
    let operatingPwf = 0;

    for (const ipr of iprCurve) {
        const rate = ipr.rate;
        const vlpPwf = interpolatePwf(vlpCurve, rate);

        if (vlpPwf !== null) {
            const diff = Math.abs(ipr.pwf - vlpPwf);
            if (diff < minDiff) {
                minDiff = diff;
                operatingRate = rate;
                operatingPwf = ipr.pwf;
            }
        }
    }

    for (const vlp of vlpCurve) {
        const rate = vlp.rate;
        const iprPwf = interpolatePwf(iprCurve, rate);

        if (iprPwf !== null) {
            const diff = Math.abs(iprPwf - vlp.pwf);
            if (diff < minDiff) {
                minDiff = diff;
                operatingRate = rate;
                operatingPwf = vlp.pwf;
            }
        }
    }

    // Only return the result if we found a reasonably close intersection
    if (minDiff === Infinity) return null;

    return { operatingRate, operatingPwf };
}

function interpolatePwf(curve: Point[], targetRate: number): number | null {
    if (curve.length === 0) return null;

    const minRate = Math.min(...curve.map(p => p.rate));
    const maxRate = Math.max(...curve.map(p => p.rate));

    if (targetRate < minRate || targetRate > maxRate) return null;

    for (let i = 0; i < curve.length - 1; i++) {
        const p1 = curve[i];
        const p2 = curve[i + 1];

        const minR = Math.min(p1.rate, p2.rate);
        const maxR = Math.max(p1.rate, p2.rate);

        if (targetRate >= minR && targetRate <= maxR) {
            if (p1.rate === p2.rate) return p1.pwf;
            const ratio = (targetRate - p1.rate) / (p2.rate - p1.rate);
            return p1.pwf + ratio * (p2.pwf - p1.pwf);
        }
    }

    return null;
}
