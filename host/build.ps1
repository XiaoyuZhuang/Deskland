# 从源码构建 Sylvaframe：使用 Windows 自带的 .NET Framework C# 编译器。
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$lib = Join-Path $root 'lib'
$bin = Join-Path $root 'bin'
New-Item -ItemType Directory -Force $lib, $bin | Out-Null
$version = '1.0.4191.47'
$webviewFiles = @(
    @{ Entry = 'lib/net462/Microsoft.Web.WebView2.Core.dll'; Name = 'Microsoft.Web.WebView2.Core.dll' },
    @{ Entry = 'lib/net462/Microsoft.Web.WebView2.WinForms.dll'; Name = 'Microsoft.Web.WebView2.WinForms.dll' },
    @{ Entry = 'runtimes/win-x64/native/WebView2Loader.dll'; Name = 'WebView2Loader.dll' },
    @{ Entry = 'LICENSE.txt'; Name = 'WebView2-SDK-LICENSE.txt' },
    @{ Entry = 'NOTICE.txt'; Name = 'WebView2-SDK-NOTICE.txt' }
)
$missing = @($webviewFiles | Where-Object { -not (Test-Path -LiteralPath (Join-Path $lib $_.Name)) })
if ($missing.Count -gt 0) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = Join-Path ([IO.Path]::GetTempPath()) ('sylvaframe-webview2-' + [Guid]::NewGuid().ToString('N') + '.zip')
    $package = $null
    try {
        Write-Host "下载 WebView2 SDK $version..."
        Invoke-WebRequest "https://api.nuget.org/v3-flatcontainer/microsoft.web.webview2/$version/microsoft.web.webview2.$version.nupkg" -OutFile $archive -UseBasicParsing
        $package = [IO.Compression.ZipFile]::OpenRead($archive)
        foreach ($file in $webviewFiles) {
            $entry = $package.GetEntry($file.Entry)
            if ($null -eq $entry) { throw "依赖包缺少 $($file.Entry)" }
            $sourceStream = $entry.Open()
            $targetStream = $null
            try {
                $targetStream = [IO.File]::Create((Join-Path $lib $file.Name))
                $sourceStream.CopyTo($targetStream)
            } finally {
                if ($null -ne $targetStream) { $targetStream.Dispose() }
                $sourceStream.Dispose()
            }
        }
    } finally {
        if ($null -ne $package) { $package.Dispose() }
        if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive -Force }
    }
}
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $csc)) { throw '找不到 .NET Framework C# 编译器，请在 64 位 Windows 上构建。' }
$appVersion = (Get-Content -LiteralPath (Join-Path $root '..\tools\version.json') -Raw | ConvertFrom-Json).version
if ($appVersion -notmatch '^\d+\.\d+\.\d+$') { throw 'Invalid application version' }
$versionSource = Join-Path $bin 'Sylvaframe-version.cs'
$versionText = @"
using System.Reflection;
[assembly: AssemblyTitle("Sylvaframe")]
[assembly: AssemblyProduct("Sylvaframe")]
[assembly: AssemblyVersion("$appVersion.0")]
[assembly: AssemblyFileVersion("$appVersion.0")]
[assembly: AssemblyCopyright("Copyright 2026 Deskland authors")]
"@
[IO.File]::WriteAllText($versionSource, $versionText, (New-Object Text.UTF8Encoding($false)))
& $csc /nologo /target:winexe /platform:x64 /optimize+ /codepage:65001 /win32manifest:"$root\app.manifest" `
    /win32icon:"$root\Sylvaframe.ico" `
    /out:"$bin\Sylvaframe.exe" `
    /r:System.dll /r:System.Drawing.dll /r:System.Windows.Forms.dll /r:System.Web.Extensions.dll `
    /r:"$lib\Microsoft.Web.WebView2.Core.dll" /r:"$lib\Microsoft.Web.WebView2.WinForms.dll" `
    "$root\DesktopHost.cs" "$root\Themes.cs" "$versionSource"
if ($LASTEXITCODE -ne 0) { throw '编译失败' }
foreach ($file in $webviewFiles) { Copy-Item -LiteralPath (Join-Path $lib $file.Name) -Destination $bin -Force }
Copy-Item -LiteralPath (Join-Path $root 'Sylvaframe.ico') -Destination (Join-Path $bin 'Sylvaframe.ico') -Force
Write-Host "编译完成：$bin\Sylvaframe.exe"
