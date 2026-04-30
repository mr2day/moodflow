$ErrorActionPreference = "Stop"

$javaHome = Join-Path $env:ProgramFiles "Android\Android Studio\jbr"
$androidHome = Join-Path $env:LOCALAPPDATA "Android\Sdk"

if (-not (Test-Path (Join-Path $javaHome "bin\java.exe"))) {
  throw "Android Studio bundled JDK was not found at: $javaHome"
}

if (-not (Test-Path $androidHome)) {
  throw "Android SDK was not found at: $androidHome"
}

[Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")

$pathItems = @(
  (Join-Path $javaHome "bin"),
  (Join-Path $androidHome "platform-tools"),
  (Join-Path $androidHome "cmdline-tools\latest\bin")
)

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$parts = @()

if ($userPath) {
  $parts = $userPath -split ";" | Where-Object { $_ -and $_.Trim() }
}

foreach ($pathItem in $pathItems) {
  if ($parts -notcontains $pathItem) {
    $parts += $pathItem
  }
}

[Environment]::SetEnvironmentVariable("Path", ($parts -join ";"), "User")

Write-Host "JAVA_HOME set to $javaHome"
Write-Host "ANDROID_HOME set to $androidHome"
Write-Host "Open a new terminal before checking java or adb."
