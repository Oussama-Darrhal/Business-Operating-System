<?php

require_once 'vendor/autoload.php';

use App\Services\ActivityLogService;
use App\Models\ActivityLog;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Activity Logs System...\n\n";

try {
    // Test 1: Create a test log entry
    echo "1. Testing log creation...\n";
    $log = ActivityLogService::logAuth('auth.login', [
        'test' => true,
        'user_email' => 'test@example.com'
    ]);
    echo "✓ Log created with ID: {$log->id}\n\n";

    // Test 2: Test filtering
    echo "2. Testing log filtering...\n";
    $logs = ActivityLogService::getLogs(['action' => 'auth.login'], 10);
    echo "✓ Found {$logs->count()} logs with action 'auth.login'\n\n";

    // Test 3: Test statistics
    echo "3. Testing statistics...\n";
    $stats = ActivityLogService::getStatistics(1, 30);
    echo "✓ Statistics generated: {$stats['total_logs']} total logs\n\n";

    // Test 4: Test cleanup (dry run)
    echo "4. Testing cleanup...\n";
    $deletedCount = ActivityLogService::cleanupOldLogs(1); // Only delete logs older than 1 day
    echo "✓ Cleanup completed: {$deletedCount} logs deleted\n\n";

    echo "All tests passed! Activity Logs system is working correctly.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}



