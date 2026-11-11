$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut('C:\Users\Admin\Desktop\Astro.lnk')
Write-Host "Target: $($sc.TargetPath)"
Write-Host "Args:   $($sc.Arguments)"
Write-Host "Dir:    $($sc.WorkingDirectory)"
