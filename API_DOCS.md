# Somiti Manager API Documentation

## Authentication

### Register
`POST /api/register`
- **Params:** `name`, `phone`, `password`, `password_confirmation`
- **Response:** `{ message, user, token }`

### Login
`POST /api/login`
- **Params:** `phone`, `password`
- **Response:** `{ message, user, token }`

### Get User
`GET /api/me`
- **Headers:** `Authorization: Bearer <token>`

---

## Deposits

### Create Deposit Request
`POST /api/deposits`
- **Headers:** `Authorization: Bearer <token>`
- **Params:**
  - `somiti_id`: ID of the Somiti group.
  - `amount`: Decimal amount.
  - `month`: String (e.g., "January").
  - `type`: "monthly" | "dps".
- **Response:** `{ message, deposit }`
- **Status:** Created deposit has status `pending`.

### Approve Deposit (Manager Only)
`POST /api/deposits/{id}/approve`
- **Headers:** `Authorization: Bearer <token>`
- **Effect:**
  1. Updates deposit status to `approved`.
  2. Creates a **Ledger Entry** (Credit to User).

---

## Loans

### Request Loan
`POST /api/loans`
- **Headers:** `Authorization: Bearer <token>`
- **Params:**
  - `somiti_id`: ID of the Somiti.
  - `amount`: Loan amount.
  - `purpose`: Reason for loan.
  - `term_months`: Duration in months.
- **Response:** `{ message, loan }`

### Approve Loan (Quorum/Manager)
`POST /api/loans/{id}/approve`
- **Effect:** Updates status to `approved`. Ready for disbursement.

### Disburse Loan
`POST /api/loans/{id}/disburse`
- **Effect:**
  1. Updates status to `disbursed`.
  2. Creates a **Ledger Entry** (Debit to User).
  3. Money is physically moved (offline) or wallet updated.

---

## Data Structures

### Ledger Entry
Every financial transaction creates an immutable record:
```json
{
  "id": 1,
  "transaction_ref": "DEP-X8J9K2",
  "type": "deposit",
  "amount": "500.00",
  "dr_cr": "cr",
  "user_id": 5,
  "created_at": "2024-01-01T12:00:00Z"
}
```
