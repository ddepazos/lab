$ErrorActionPreference = 'Stop'
$installer = @(Get-ChildItem "$PSScriptRoot/../react-app/src-tauri/target/release/bundle/nsis/*.exe")
if ($installer.Count -ne 1) { throw 'Expected exactly one NSIS installer' }
$destination = Join-Path $env:RUNNER_TEMP 'LAB Desktop smoke'
$setup = Start-Process -FilePath $installer[0].FullName -ArgumentList "/S /D=$destination" -WindowStyle Hidden -Wait -PassThru
if ($setup.ExitCode -ne 0) { throw "Installer exited with $($setup.ExitCode)" }
$executable = Join-Path $destination 'lab-desktop.exe'
if (!(Test-Path -LiteralPath $executable)) { throw 'Installed executable is missing' }
$app = Start-Process -FilePath $executable -WindowStyle Hidden -PassThru
try {
    $deadline = (Get-Date).AddSeconds(30)
    do {
        Start-Sleep -Milliseconds 500
        $app.Refresh()
        if ($app.HasExited) { throw "Installed application exited with $($app.ExitCode)" }
    } until ($app.MainWindowHandle -ne 0 -or (Get-Date) -gt $deadline)
    if ($app.MainWindowHandle -eq 0) { throw 'Installed application did not create a window' }
    Write-Output "NSIS installation and native window startup passed: $($app.MainWindowTitle)"
} finally {
    if (!$app.HasExited) { Stop-Process -Id $app.Id }
}
