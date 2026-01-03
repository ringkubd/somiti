<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Somiti;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_personal_and_somiti_notifications()
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->addMember($user);

        // use a somiti for notifications (schema requires somiti_id)
        $somiti2 = Somiti::factory()->create(['created_by_user_id' => $owner->id]);

        // personal notification (tied to a somiti)
        Notification::create(['somiti_id' => $somiti2->id, 'user_id' => $user->id, 'notifiable_id' => $user->id, 'notifiable_type' => User::class, 'title' => 'Hello', 'message' => 'personal', 'is_read' => false]);

        // somiti notification
        Notification::create(['somiti_id' => $somiti->id, 'notifiable_id' => $somiti->id, 'notifiable_type' => Somiti::class, 'user_id' => $owner->id, 'title' => 'Somiti news', 'message' => 'update', 'is_read' => false]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson(route('notifications.index'));

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_user_cannot_view_other_users_notification()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $notification = Notification::create(['somiti_id' => Somiti::factory()->create(['created_by_user_id' => $other->id])->id, 'user_id' => $other->id, 'notifiable_id' => $other->id, 'notifiable_type' => User::class, 'title' => 'Hi', 'message' => 'private']);

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson(route('notifications.show', ['notification' => $notification->id]));
        $response->assertStatus(403);
    }

    public function test_member_can_mark_somiti_notification_read()
    {
        $owner = User::factory()->create();
        $manager = User::factory()->create();

        $somiti = Somiti::factory()->create(['created_by_user_id' => $owner->id]);
        $somiti->managers()->create(['user_id' => $manager->id, 'from_date' => now()]);

        $notification = Notification::create(['somiti_id' => $somiti->id, 'notifiable_id' => $somiti->id, 'notifiable_type' => Somiti::class, 'user_id' => $owner->id, 'title' => 'X', 'message' => 'Y']);

        Sanctum::actingAs($manager, ['*']);

        $response = $this->postJson(route('notifications.markRead', ['notification' => $notification->id]));
        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', ['id' => $notification->id, 'is_read' => 1]);
    }

    public function test_user_can_delete_their_notification()
    {
        $user = User::factory()->create();
        $notification = Notification::create(['somiti_id' => Somiti::factory()->create(['created_by_user_id' => $user->id])->id, 'user_id' => $user->id, 'notifiable_id' => $user->id, 'notifiable_type' => User::class, 'title' => 'Temp', 'message' => 'delete']);

        Sanctum::actingAs($user, ['*']);

        $response = $this->deleteJson(route('notifications.destroy', ['notification' => $notification->id]));
        $response->assertStatus(200);

        $this->assertSoftDeleted('notifications', ['id' => $notification->id]);
    }
}
