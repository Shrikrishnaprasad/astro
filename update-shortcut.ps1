$ws = New-Object -ComObject WScript.Shell
$sc = $ws.CreateShortcut('C:\Users\Admin\Desktop\Astro.lnk')
$sc.TargetPath = 'C:\Windows\System32\cmd.exe'
$sc.Arguments = '/c "D:\Astro\launch.bat"'
$sc.WorkingDirectory = 'D:\Astro'
$sc.WindowStyle = 7
$sc.Save()
Write-Host "Shortcut updated successfully"
