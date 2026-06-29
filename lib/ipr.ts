import {
    linearIPR,
    vogelIPR,
    fetkovichIPR,
    IPRPointSI
} from './production';
import { convertToSI, convertFromSI } from './units';

export interface IPRPoint {
    rate: number;
    pwf: number;
}

function mapCurve(curveSI: IPRPointSI[]): IPRPoint[] {
    return curveSI.map(pt => ({
        rate: convertFromSI(pt.qM3S, 'stb/d', 'flowrate'),
        pwf: convertFromSI(pt.pwfPa, 'psi', 'pressure')
    }));
}

export function generateLinearIPR(prPsi: number, jStbdPsi: number, steps = 50): IPRPoint[] {
    const prPa = convertToSI(prPsi, 'psi', 'pressure');
    const qUnit = convertToSI(1, 'stb/d', 'flowrate');
    const pUnit = convertToSI(1, 'psi', 'pressure');
    const jSI = jStbdPsi * (qUnit / pUnit);
    return mapCurve(linearIPR(prPa, jSI, steps));
}

export function generateVogelIPR(prPsi: number, qMaxStbd: number, steps = 50): IPRPoint[] {
    const prPa = convertToSI(prPsi, 'psi', 'pressure');
    const qMaxM3S = convertToSI(qMaxStbd, 'stb/d', 'flowrate');
    return mapCurve(vogelIPR(prPa, qMaxM3S, steps));
}

export function generateFetkovichIPR(prPsi: number, qMaxStbd: number, n: number, steps = 50): IPRPoint[] {
    const prPa = convertToSI(prPsi, 'psi', 'pressure');
    const qMaxM3S = convertToSI(qMaxStbd, 'stb/d', 'flowrate');
    return mapCurve(fetkovichIPR(prPa, qMaxM3S, n, steps));
}
