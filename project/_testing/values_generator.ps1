function GenerateRandomSwitchMessage($config)
{
	# Get floor index
	$floorCt = $config.floors.Length 
	$floorIx = Get-Random -Minimum 0 -Maximum $floorCt

	# Get apartment index
	$apartmentCt = $config.floors[$floorIx].apartments.Length
	$apartmentIx = Get-Random -Minimum 0 -Maximum $apartmentCt

	# Get light index
	$lightCt = $config.floors[$floorIx].apartments[$apartmentIx].lights.Length
	$lightIx = Get-Random -Minimum 0 -Maximum $lightCt

	# Store IDs in vars and generate other variables
	$floorId = $config.floors[$floorIx].floorId
	$apartmentId = $config.floors[$floorIx].apartments[$apartmentIx].apartmentId
	$lightId = $config.floors[$floorIx].apartments[$apartmentIx].lights[$lightIx].lightId
	$lightDirection = "off"
	if ((Get-Random -Minimum 0 -Maximum 2) -eq 0)
	{
		$lightDirection = "on"
	}
	
	# Generate topic string
	$topic = "smartlight/floors/floor_$($floorId)/apartments/apartment_$($apartmentId)"

	# Generate payload string
	$payload = @{
		"type"="switch"
		"floorId"=$floorId
		"apartmentId"=$apartmentId
		"lightId"=$lightId
		"direction"=$lightDirection
	}
	$payload = $payload | ConvertTo-Json
	$payload = $payload.Replace('"','\"')

	# Publish to apartment
	PublishToTopic $topic $payload
}

function GenerateRandomSensorMessage($topic)
{
	# Get floor index
	$floorCt = $config.floors.Length
	$floorIx = Get-Random -Minimum 0 -Maximum $floorCt

	# Get apartment index
	$apartmentCt = $config.floors[$floorIx].apartments.Length
	$apartmentIx = Get-Random -Minimum 0 -Maximum $apartmentCt

	# Get sensor index
	$sensorCt = $config.floors[$floorIx].apartments[$apartmentIx].sensors.Length
	$sensorIx = Get-Random -Minimum 0 -Maximum $sensorCt

	# Store IDs in vars and generate other variables
	$floorId = $config.floors[$floorIx].floorId
	$apartmentId = $config.floors[$floorIx].apartments[$apartmentIx].apartmentId
	$sensorId = $config.floors[$floorIx].apartments[$apartmentIx].sensors[$sensorIx].sensorId
	$motionDirection = "out"
	if ((Get-Random -Minimum 0 -Maximum 2) -eq 0)
	{
		$motionDirection = "in"
	}
	$luxValue = Get-Random -Minimum 0 -Maximum 1000
	
	# Generate topic string
	$topic = "smartlight/floors/floor_$($floorId)/apartments/apartment_$($apartmentId)"

	# Generate payload string
	$payload = @{
		"type"="sensor"
		"floorId"=$floorId
		"apartmentId"=$apartmentId
		"sensorId"=$sensorId
		"lux"=$luxValue
		"motion"=$motionDirection
	}
	$payload = $payload | ConvertTo-Json
	$payload = $payload.Replace('"','\"')

	# Publish to apartment
	PublishToTopic $topic $payload
}

function PublishToTopic($topic, $payload)
{
	mqtt publish -h broker.hivemq.com -p1883 -t $topic -m $payload
}

# Pull in JSON config file
$config = Get-Content -Raw -Path "..\_testing\room_config.json" | ConvertFrom-Json

# Loop until stopped by user
while ($true)
{
	if ((Get-Random -Minimum 0 -Maximum 2) -eq 0)
	{
		GenerateRandomSwitchMessage $config
	}
	else
	{
		GenerateRandomSensorMessage $config
	}

	$sleepTime = Get-Random -Minimum 0.5 -Maximum 1.5
	Start-Sleep -s $sleepTime
}

















#$test='{"type":"web","floorId":0,"apartmentId":0,"lightId":0,"time":"1999-01-01","direction":"on"}'\
$test = '{"type":"request","floorId":"floor_0","roomId":"room_0","lightId":"light_0","time":"1999-01-01","direction":"on"}'
$topic = "smartlight/floors/floor_0/apartments/apartment_0"
$test = $test.Replace('"','\"')
#$topic = "smartlight/web/webapp"

mqtt publish -h broker.hivemq.com -p1883 -t $topic -m $test