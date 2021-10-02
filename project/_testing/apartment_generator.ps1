# Pull in JSON config file
Get-Con

$test='{"type":"web","floorId":0,"apartmentId":0,"lightId":0,"time":"1999-01-01","direction":"on"}'
$test = $test.Replace('"','\"')
$topic = "smartlight/web/webapp"

mqtt publish -h broker.hivemq.com -p1883 -t $topic -m $test