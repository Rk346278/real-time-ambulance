// -----------------------------
// DRIVER UPDATE TYPE
// -----------------------------
export interface DriverUpdate {
    type: 'driver';
    driverName: string;
    ambulanceNumber: string;
    fromLocation: string;
    toLocation: string;
    timestamp: string;
}

// -----------------------------
// NURSE ENUMS
// -----------------------------
export enum ConditionSeverity {
    CRITICAL = 'Critical',
    SERIOUS = 'Serious',
    STABLE = 'Stable',
}

export enum ImmediateRequirement {
    OXYGEN = 'Oxygen',
    WHEELCHAIR = 'Wheelchair',
    ICU_BED = 'ICU Bed',
    DOCTOR = 'Doctor',
}

// -----------------------------
// NURSE UPDATE TYPE
// -----------------------------
export interface NurseUpdate {
    type: 'nurse';
    patientId: string;
    patientName: string;
    age: number;
    conditionSeverity: ConditionSeverity;
    immediateRequirement: ImmediateRequirement;
    notes: string;
    timestamp: string;
}

// -----------------------------
// UNION OF BOTH
// -----------------------------
export type LiveUpdate = DriverUpdate | NurseUpdate;
