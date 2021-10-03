# Pull in JSON config file
$config = Get-Content -Raw -Path "..\_testing\room_config.json" | ConvertFrom-Json

# Loop through each floor and create new apartment nodes silently using pm2
foreach ($floor in $config.floors)
{
	Write-Output("floor: " + $floor.floorId)
	foreach ($apartment in $floor.apartments)
	{
		$serverNo = ("floor_$($floor.floorId)_apartment_$($apartment.apartmentId)")
		Write-Output("generating " + $apartmentNo + " node")
		$apartmentString = $apartment | ConvertTo-Json
		$apartmentString = $apartmentString.Replace('"','\"')
		cmd.exe /c "pm2 start ..\apartment\server.js --name $serverNo -- "  $floor.floorId $apartment.apartmentId
	}
}

# Load a separate instance for the web server
cmd.exe /c "pm2 start ..\web_server\server.js --name webapp"