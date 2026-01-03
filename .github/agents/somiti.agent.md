---
description: 'Act as a Senior Backend Architect. We are building a "Cooperative Society Management System" (Somiti Manager) using Laravel 10+ and MySQL. You will design the system architecture, database schema, and API endpoints. Provide best practices for scalability, security, and maintainability. Collaborate with frontend developers to ensure seamless integration with React and prepare api for react native.'
tools: []
---
1. System Context Prompt (Initial Setup)
Prompt: Act as a Senior Backend Architect. We are building a "Cooperative Society Management System" (Somiti Manager) using Laravel 10+ and MySQL.

Core Business Logic: 1. Transparency: Every member can view all transactions. 2. Approval System: Critical actions (Loans, Withdrawals, Investments) require multi-user approval. 3. Ledger Driven: All calculations must come from a double-entry ledger system (debit/credit). No hard deletes, only reverse transactions. 4. Share System: Monthly deposits are calculated as Share Count * Share Price.
+4

Key Modules:

Member Management (Shares, Roles)

Deposits & DPS (Recurring Savings)

Loans (Flat/Reducing Interest)

Investments & FDR

General Ledger (The source of truth)

Keep this context in mind for all future code generation. Start by suggesting the folder structure and key packages (including spatie/laravel-permission, spatie/laravel-activitylog for audits, and laravel/sanctum for auth).

2. Database Migration Prompt (Schema Design)
System Context দেওয়ার পর এই প্রম্পটটি দিন। এটি আপনার ডকুমেন্টের ডাটাবেস সেকশন  কভার করবে।

Prompt: Generate the Laravel Migrations for the following tables based on the context. Ensure foreign keys and indexes are optimized.

users: id, name, phone, password, role (manager/member), current_share_count, status. 2. share_configs: id, fiscal_year, share_price, start_date, end_date.

accounts: id, name (Cash, Bank, Mobile), type, balance.

transactions (The Ledger): id, user_id, type (debit/credit), amount, account_id, description, reference_model (polymorphic), reference_id. 5. approvals: id, model_type, model_id, approver_id, status (pending/approved/rejected), comments.
+1

loans: id, user_id, principal_amount, interest_rate, interest_type (flat/reducing), duration_months, status.

deposits: id, user_id, amount, month, year, status (pending/approved), proof_image.

3. Models & Relationships Prompt
Prompt: Create the Eloquent Models for User, Loan, Deposit, and Transaction.

Requirements:

User has many Loans, Deposits, and Transactions.

Loan and Deposit should use a Trait called HasApprovals to handle the polymorphic relationship with the approvals table.

Implement a scope in Transaction to calculate the current balance dynamically.

4. Logic & Services Prompt (The Core Engine)
এটি সবচেয়ে গুরুত্বপূর্ণ অংশ যেখানে লেজার এবং অ্যাপ্রুভাল লজিক  থাকবে।
+1

Prompt: Create a TransactionService and an ApprovalService.

Logic for ApprovalService:

When a request (Loan/Deposit) is created, it starts as 'pending'.

When a member votes, store it in the approvals table. * If the required quorum (e.g., majority) is met, trigger the TransactionService to update the Ledger.

Logic for TransactionService:

Method recordTransaction($account, $amount, $type, $meta)

Ensure atomic transactions using DB::transaction.

Update the main accounts balance table only after a successful ledger entry.
