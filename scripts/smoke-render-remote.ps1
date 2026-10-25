param(
  [string]$ApiUrl = "https://lab-render-api.ddepazosdesanmartin.workers.dev",
  [int]$Fps = 30,
  [int]$Seconds = 3,
  [int]$Size = 800
)
$ErrorActionPreference = "Stop"
if ($Fps -lt 1 -or $Fps -gt 60 -or $Seconds -lt 1 -or ($Fps*$Seconds) -gt 600 -or $Size -lt 16 -or $Size -gt 1920 -or $Size % 2) { throw "Parametros invalidos" }
Add-Type -AssemblyName System.Drawing
$secret = Read-Host "Introduce API_TOKEN de Cloudflare (no se mostrara)" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try { $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr); $secret.Dispose() }
if ([string]::IsNullOrWhiteSpace($token)) { throw "API_TOKEN vacio" }
$headers = @{ Authorization = "Bearer $token"; "User-Agent" = "LAB-Render-Smoke/1.0"; Accept = "application/json" }
$job = $null
try {
  $payload = @{fps=$Fps; frameCount=($Fps*$Seconds); width=$Size; height=$Size} | ConvertTo-Json -Compress
  $job = Invoke-RestMethod -Method Post -Uri "$ApiUrl/api/jobs" -Headers $headers -ContentType "application/json" -Body $payload
  $jobId = $job.jobId
  if (-not $jobId) { $jobId = $job.id }
  if ($jobId -notmatch '^[0-9a-fA-F-]{36}$') { throw "Respuesta de creacion sin UUID: $($job | ConvertTo-Json -Compress)" }
  Write-Host "Job creado: $jobId"
  $temp = Join-Path $env:TEMP "lab-smoke-$jobId.png"
  for ($i=0; $i -lt $Fps*$Seconds; $i++) {
    $bmp = New-Object System.Drawing.Bitmap($Size,$Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.Clear([System.Drawing.Color]::FromArgb(17,20,28))
      $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(110,220,240))
      try {
        $x = [int](($Size-120)*$i/[math]::Max(1,($Fps*$Seconds-1)))
        $g.FillEllipse($brush,$x,[int]($Size/2-60),120,120)
      } finally { $brush.Dispose() }
      $bmp.Save($temp,[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $g.Dispose(); $bmp.Dispose() }
    $bytes = [System.IO.File]::ReadAllBytes($temp)
    Invoke-RestMethod -Method Put -Uri "$ApiUrl/api/jobs/$jobId/frames/$i" -Headers $headers -ContentType "image/png" -Body $bytes | Out-Null
    if (($i+1)%30 -eq 0) { Write-Host "Fotogramas enviados: $($i+1)/$($Fps*$Seconds)" }
  }
  Remove-Item $temp -ErrorAction SilentlyContinue
  Invoke-RestMethod -Method Post -Uri "$ApiUrl/api/jobs/$jobId/submit" -Headers $headers -ContentType "application/json" -Body '{}' | Out-Null
  Write-Host "Render remoto solicitado. Job: $jobId"
  Write-Host "Consultar: gh run list --workflow render-remote.yml --repo ddepazos/lab --limit 3"
  Write-Host "Descargar al completar: Invoke-WebRequest -Uri '$ApiUrl/api/jobs/$jobId/download' -Headers \$headers -OutFile 'LAB-render-$jobId.mp4'"
} finally { $token = $null; $headers = $null }
