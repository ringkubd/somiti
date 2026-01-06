// Types for Somiti Manager

export interface User {
    id: number;
    name: string;
    phone: string;
    email?: string;
    role: 'member' | 'manager' | 'admin';
    status: 'pending' | 'active' | 'blocked';
}

export interface Deposit {
    id: number;
    somiti_id: number;
    amount: number;
    month: string;
    type: 'monthly' | 'dps';
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export interface Loan {
    id: number;
    amount: number;
    purpose: string;
    term_months: number;
    status: 'pending' | 'approved' | 'disbursed' | 'closed' | 'rejected';
    created_at: string;
}

export interface LedgerEntry {
    id: number;
    transaction_ref: string;
    type: string;
    amount: number;
    dr_cr: 'dr' | 'cr';
    created_at: string;
}
