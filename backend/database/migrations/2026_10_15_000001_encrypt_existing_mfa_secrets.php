<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('mfa_secret')->nullable()->change();
        });

        DB::table('users')
            ->whereNotNull('mfa_secret')
            ->orderBy('id')
            ->chunkById(100, function ($users): void {
                foreach ($users as $user) {
                    DB::table('users')->where('id', $user->id)->update([
                        'mfa_secret' => Crypt::encryptString($user->mfa_secret),
                    ]);
                }
            });
    }

    public function down(): void
    {
        DB::table('users')
            ->whereNotNull('mfa_secret')
            ->orderBy('id')
            ->chunkById(100, function ($users): void {
                foreach ($users as $user) {
                    DB::table('users')->where('id', $user->id)->update([
                        'mfa_secret' => Crypt::decryptString($user->mfa_secret),
                    ]);
                }
            });

        Schema::table('users', function (Blueprint $table) {
            $table->string('mfa_secret')->nullable()->change();
        });
    }
};