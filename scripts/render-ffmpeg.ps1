param(
 [Parameter(Mandatory=$true)][string]$InputPath,
 [string]$OutputPath = "",
 [ValidateSet("mp4","webm")][string]$Format = "mp4",
 [ValidateRange(1,60)][int]$Fps = 30,
 [ValidateRange(0,51)][int]$Crf = 18,
 [ValidateSet("slow","medium","fast")][string]$Preset = "medium"
)
$ErrorActionPreference = "Stop"
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { throw "FFmpeg no esta instalado o no esta en PATH. Instala FFmpeg antes de ejecutar este script." }
if (-not (Test-Path -LiteralPath $InputPath)) { throw "No existe el archivo o patron de entrada: $InputPath" }
$inputItem = Get-Item -LiteralPath $InputPath
if ($inputItem.PSIsContainer) {
 $frames = @(Get-ChildItem -LiteralPath $InputPath -Filter "*.png" -File | Sort-Object Name)
 if ($frames.Count -eq 0) { throw "La carpeta no contiene fotogramas PNG." }
 $first = $frames[0].Name
 if ($first -notmatch '^(.*?)(\d+)\.png$') { throw "Usa nombres secuenciales como frame000001.png." }
 $prefix = $Matches[1]; $digits = $Matches[2].Length
 $expected = $prefix + ('0' * $digits) + '.png'
 if ($first -ne $expected -and [int]$Matches[2] -ne 1) { Write-Warning "Verifica que los fotogramas sean consecutivos y comiencen en 0 o 1." }
 $pattern = Join-Path $InputPath ($prefix + '%0' + $digits + 'd.png')
 $args = @('-hide_banner','-y','-framerate',"$Fps",'-i',$pattern)
} else {
 $args = @('-hide_banner','-y','-i',$inputItem.FullName)
}
if (-not $OutputPath) {
 $base = if ($inputItem.PSIsContainer) { Join-Path $inputItem.FullName 'LAB-render' } else { Join-Path $inputItem.DirectoryName ($inputItem.BaseName + '-ffmpeg') }
 $OutputPath = "$base.$Format"
}
if ($Format -eq 'mp4') {
 $args += @('-c:v','libx264','-preset',$Preset,'-crf',"$Crf",'-pix_fmt','yuv420p','-movflags','+faststart')
} else {
 $args += @('-c:v','libvpx-vp9','-crf',"$Crf",'-b:v','0','-pix_fmt','yuv420p')
}
$args += @('-an',$OutputPath)
& ffmpeg @args
if ($LASTEXITCODE -ne 0) { throw "FFmpeg fallo con codigo $LASTEXITCODE." }
Write-Host "Archivo generado: $OutputPath"
