<?php

namespace Database\Seeders;

use App\Models\Approval;
use App\Models\Deposit;
use App\Models\Fdr;
use App\Models\FinancialYear;
use App\Models\Investment;
use App\Models\Ledger;
use App\Models\Loan;
use App\Models\Notification;
use App\Models\Share;
use App\Models\Somiti;
use App\Models\SomitiMember;
use App\Models\SomitiManager;
use App\Models\User;
use App\Models\UserShare;
use Illuminate\Database\Seeder;

class SomitiSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure we have users to attach
        $admin = User::firstOrCreate([
            'email' => 'admin@example.com'
        ], [
            'name' => 'Admin User',
            'phone' => '01700000001',
            'password' => 'password',
            'status' => 'active',
        ]);

        // Create 3 somitis with related data
        Somiti::factory(3)->create()->each(function (Somiti $somiti) use ($admin) {
            // ensure created_by
            $somiti->update(['created_by_user_id' => $admin->id]);

            // Financial years
            $years = FinancialYear::factory(2)->create(['somiti_id' => $somiti->id]);

            // Shares for most recent FY
            $share = Share::factory()->create([
                'somiti_id' => $somiti->id,
                'financial_year_id' => $years->first()->id,
            ]);

            // Members
            $members = SomitiMember::factory(8)->create(['somiti_id' => $somiti->id]);

            // Make first member a manager
            $managerUser = $members->first()->user;
            SomitiManager::factory()->create([
                'somiti_id' => $somiti->id,
                'user_id' => $managerUser->id,
                'from_date' => now()->subYears(1),
            ]);

            // User shares
            foreach ($members as $m) {
                UserShare::factory()->create([
                    'user_id' => $m->user_id,
                    'somiti_id' => $somiti->id,
                    'financial_year_id' => $years->first()->id,
                    'share_count' => rand(1, 10),
                ]);
            }

            // Deposits
            Deposit::factory(10)->create(['somiti_id' => $somiti->id, 'financial_year_id' => $years->first()->id]);

            // Loans
            Loan::factory(5)->create(['somiti_id' => $somiti->id, 'financial_year_id' => $years->first()->id]);

            // Investments
            $investments = Investment::factory(3)->create(['somiti_id' => $somiti->id, 'financial_year_id' => $years->first()->id]);

            // FDRs for investments
            foreach ($investments as $inv) {
                Fdr::factory()->create(['investment_id' => $inv->id, 'somiti_id' => $somiti->id]);
            }

            // Approvals (attach to random deposits and loans)
            $deposit = Deposit::where('somiti_id', $somiti->id)->inRandomOrder()->first();
            $loan = Loan::where('somiti_id', $somiti->id)->inRandomOrder()->first();

            if ($deposit) {
                Approval::factory()->create([
                    'approvable_id' => $deposit->id,
                    'approvable_type' => Deposit::class,
                    'user_id' => $admin->id,
                    'status' => 'approved',
                ]);

                // mark deposit approved so observer creates ledger
                $deposit->update([
                    'status' => 'approved',
                    'approved_by' => $admin->id,
                    'approved_at' => now(),
                ]);
            }

            if ($loan) {
                Approval::factory()->create([
                    'approvable_id' => $loan->id,
                    'approvable_type' => Loan::class,
                    'user_id' => $admin->id,
                    'status' => 'approved',
                ]);

                $loan->update([
                    'status' => 'approved',
                    'approved_by' => $admin->id,
                    'approved_at' => now(),
                ]);
            }

            // Notifications
            Notification::factory(3)->create(['somiti_id' => $somiti->id]);
        });
    }
}
