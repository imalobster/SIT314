# Loop until stopped by user
$count = 0;
while ($true)
{
	if ($count % 5 -eq 0)
	{
		# Get name of all JSON files in data folder
		$files = Get-ChildItem "./data"

		Clear-Host
		# Read each in and store in array
		$data = @()
		foreach ($file in $files.Name)
		{
			$data += Get-Content -Raw -Path ".\data\$($file)" | ConvertFrom-Json
		}
		$count = 0
		Write-Output ""
		$data | Format-Table -AutoSize
	}

	$count += 1
	$val = 6 - $count
	Write-Output "Updating chart again in $($val) seconds..."
	Start-Sleep -s 1
}
