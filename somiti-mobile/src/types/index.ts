export interface User {
    id: number; name: string; email: string; phone: string;
    role: string; created_at: string;
}
export interface Somiti {
    id: number; name: string; unique_code: string;
    currency: string; currency_symbol: string;
    total_shares: number | null;
}
export interface Deposit {
    id: number; somiti_id: number; user_id: number; amount: string;
    month: string; type: string; status: string; created_at: string;
    somiti?: Somiti; user?: User;
}
export interface Loan {
    id: number; somiti_id: number; user_id: number; amount: string;
    interest_rate: string; status: string; outstanding_balance: string;
    somiti?: Somiti; user?: User;
}
export interface Investment {
    id: number; somiti_id: number; amount: string; type: string;
    status: string; start_date: string;
    somiti?: Somiti;
}
export interface Fdr {
    id: number; somiti_id: number; bank_name: string;
    interest_rate: string; maturity_amount: string; status: string;
}
export interface UserShare {
    id: number; user_id: number; somiti_id: number;
    share_count: number; status: string;
    somiti?: Somiti; user?: User;
}
export interface ShareTransfer {
    id: number; somiti_id: number; from_user_id: number | null;
    to_user_id: number; quantity: number; price_per_share: string;
    status: string;
    from_user?: User; to_user?: User; somiti?: Somiti;
}
export interface BankAccount {
    id: number; somiti_id: number; bank_name: string;
    account_number: string; account_type: string;
    current_balance: string; is_active: boolean;
    somiti?: Somiti;
}
export interface FinancialYear {
    id: number; somiti_id: number; title: string;
    start_date: string; end_date: string; is_active: boolean;
    share_value: string;
}
export interface SomitiMessage {
    id: number; somiti_id: number; user_id: number;
    message: string; message_type: string;
    created_at: string; user: { id: number; name: string };
}
export interface PaginatedResponse<T> {
    data: T[]; current_page: number; last_page: number;
    total: number; next_page_url: string | null;
}
export interface DashboardStats {
    total_members: number; total_savings: number;
    total_loans: number; net_fund: number; share_capital: number;
}
