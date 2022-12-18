if(firstStationSegmentId != pathData[station].SegmentId)
        {
            let newStationName = pathData[station].Name;

            let currentSegmentId = pathData[station].SegmentId;

            let newStationID = pathData[station].StationId;

            let previousStationName = pathData[station - 1].Name

            console.log(newStationID);

            // getting distance

            let distancePath = "http://10.101.0.12:8080/distance/" + encodeURIComponent(startValue) + "/" + encodeURIComponent(newStationName);


            let totalDist = await getInfo(distancePath); 

            let speedo = await getInfo("http://10.101.0.12:8080/averageTrainSpeed");
            
            let totalSpeed = speedo[0].AverageSpeed;

            let timeToTravel = (totalDist / totalSpeed) * 60;

            
           
            let arrivalArray = departureTime.split(':');
            
            let nextArrival = new Date();

            nextArrival.setHours(arrivalArray[0]);

            nextArrival.setMinutes(arrivalArray[1] + timeToTravel);

            let newArrival = nextArrival.getHours() + ":" + nextArrival.getMinutes();


            createTable(newStationName,newArrival);

            counter = 0;
            for (nextTrain in currentStationSchedule)
            {
                let nextStation = pathData[nextTrain];
                console.log(nextStation.SegmentId);
               if(nextStation.SegmentId === currentSegmentId && newStationID === nextStation.StationId)
               {
                    for (train in currentStationSchedule)
                    {
                        let date = new Date();

                        timeArray = currentStationSchedule[train].Time.split('T');
                        
                        time = timeArray[1].substring(0,timeArray[1].length - 8);

                        hoursMins = time.split(':')

                        date.setHours(hoursMins[0]);
                        date.setMinutes(hoursMins[1]);

                        let nextDeparture = date.getHours() + ":" + date.getMinutes();

                        departureArray = departureTime.split(':');

                        arrivalTime = new Date();

                        arrivalTime.setHours(departureArray[0]);

                        arrivalTime.setMinutes(departureArray[1] + timeToTravel);
                        
                        // if hour is the same but minutes are > on next train choose that one

                        if(arrivalTime.getHours() <= date.getHours() && arrivalTime.getMinutes() <= date.getMinutes() && counter === 0)
                        {
                            counter++;
                            console.log(newStationName);
                            console.log(nextDeparture);
                            createTable(newStationName,nextDeparture);
                            break;
                        }
                    }
                    break // try this to reset the segment and path
               }
            }
        }