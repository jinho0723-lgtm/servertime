# PowerShell script to register a silent background task on Windows
# Runs node live-ingest.js every 3 hours

$taskName = "TIMEPIN_Ticket_Ingest"
$action = New-ScheduledTaskAction -Execute "node.exe" -Argument "F:\TIMEPIN\live-ingest.js" -WorkingDirectory "F:\TIMEPIN"
$trigger = New-ScheduledTaskTrigger -Daily -At "08:30"
$repetition = (New-ScheduledTaskTrigger -Once -At (Get-Date)).Repetition
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Write-Host "Registering Windows Background Task '$taskName'..."
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force
Write-Host "Done! Task '$taskName' registered successfully."
