param(
 [Parameter(Mandatory=$true)][string]$BundlePath,
 [Parameter(Mandatory=$true)][string]$JavaPath,
 [Parameter(Mandatory=$true)][string]$KeystorePath,
 [Parameter(Mandatory=$true)][string]$PasswordFile,
 [string]$Version='1.0.0'
)
$ErrorActionPreference='Stop'
if($Version -notmatch '^\d+\.\d+\.\d+$'){throw 'Version must be major.minor.patch'}
$bundle=(Resolve-Path -LiteralPath $BundlePath).Path
$keystore=(Resolve-Path -LiteralPath $KeystorePath).Path
$java=(Resolve-Path -LiteralPath $JavaPath).Path
$projectRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$releaseDirectory=Join-Path $projectRoot ('releases/android-v'+$Version)
New-Item -ItemType Directory -Force -Path $releaseDirectory | Out-Null
$output=Join-Path $releaseDirectory ('DevPath-'+$Version+'.apk')
$oldPassword=[Environment]::GetEnvironmentVariable('DEVPATH_APK_PASSWORD','Process')
try {
 $env:DEVPATH_APK_PASSWORD=(Get-Content -LiteralPath $PasswordFile -Raw).Trim()
 if(-not $env:DEVPATH_APK_PASSWORD){throw 'The signing password is empty'}
 & $java -jar (Join-Path $bundle 'apksigner.jar') sign --ks $keystore --ks-type PKCS12 --ks-key-alias devpath --ks-pass env:DEVPATH_APK_PASSWORD --key-pass env:DEVPATH_APK_PASSWORD --v4-signing-enabled false --out $output (Join-Path $bundle 'DevPath-unsigned.apk')
 if($LASTEXITCODE -ne 0){throw 'APK signing failed'}
 & $java -jar (Join-Path $bundle 'apksigner.jar') verify --verbose --print-certs $output
 if($LASTEXITCODE -ne 0){throw 'APK signature verification failed'}
 $hash=(Get-FileHash -LiteralPath $output -Algorithm SHA256).Hash.ToLowerInvariant()
 Set-Content -LiteralPath ($output+'.sha256') -Value ($hash+'  '+[IO.Path]::GetFileName($output)) -Encoding utf8
 Write-Output ('Verified signed APK: '+$output)
} finally {
 [Environment]::SetEnvironmentVariable('DEVPATH_APK_PASSWORD',$oldPassword,'Process')
}
