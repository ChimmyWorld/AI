# Kill any existing process on port 8090
npx kill-port 8090

# Create a log directory if it doesn't exist
$logDir = ".\logs"
if (-not (Test-Path -Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir
}

# Get current timestamp for log filename
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "$logDir\expo_log_$timestamp.txt"

# Start Expo with LAN host and output to log file
Write-Host "Starting Expo server and capturing logs to $logFile"
Write-Host "Open the app on your device and reproduce the crash"
Write-Host "Press Ctrl+C to stop capturing logs"

# Start the Expo server with all output redirected to the log file
Start-Process -FilePath "npx" -ArgumentList "expo start --host lan --port 8090 --clear" -NoNewWindow

# Start capturing logs
Start-Transcript -Path $logFile -Append

# Keep the script running until user presses Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Stop-Transcript
    Write-Host "Log capture stopped. Logs saved to $logFile"
}
