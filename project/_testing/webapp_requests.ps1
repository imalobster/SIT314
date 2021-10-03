function WebAppRequest($floorId, $apartmentId, $lightId, $direction)
{
	# Generate topic string
	$topic = "smartlight/web"

	# Generate payload string
	$payload = @{
		"type"="web"
		"floorId"=$floorId
		"apartmentId"=$apartmentId
		"lightId"=$lightId
		"direction"=$direction
	}
	$payload = $payload | ConvertTo-Json
	$payload = $payload.Replace('"','\"')

	# Publish to apartment
	mqtt publish -h broker.hivemq.com -p1883 -t $topic -m $payload
}
