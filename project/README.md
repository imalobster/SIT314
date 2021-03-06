Instructions for testing the SmartLight prototype (note I could not include Docker images in this repo due to their size - however the Dockerfile and .dockerignore files exist):

1. Ensure you check the count of floors in the ./_testing/simulation_config.json file.
2. Instantiate individual floor fog nodes (need as many found in above step - currently 2) using the server.js file in the ./floor folder. I have set up two EC2s for this purpose which run the nodes as docker containers on startup.
3. Instantiate a single processing node using the server.js file in the ./processing folder. I have set up an EC2 for this purpose using a docker container - it does not run on startup since I like to run it as a foreground process (to read the console printouts).
4. Now create three separate PowerShell windows
5. In the first window, run the apartment_generator.ps1 script in the ./_testing folder. This will instantiate room nodes using the config file. They are ran in the background using pm2.
6. Now in the same window, run the values_generator.ps1 script in the ./_testing folder. This will automatically generate new switch and sensor messages and publish them to the apartments created in the previous step.
7. In the second PowerShell window, run the status_reader.ps1 script in the ./_testing folder. This will show the current light directions of all apartments in each floor. It will update every 5 seconds as new requests are delivered to the apartment nodes to switch lights off.
8. In the third PowerShell window, copy the 'function WebAppRequest()' codeblock in the webapp_requests.ps1 script (again in the ./_testing directory) and paste it into this window. You can now issue webapp requests to switch lights on and off using this format '**WebAppRequest floorId apartmentId lightId direction**'
