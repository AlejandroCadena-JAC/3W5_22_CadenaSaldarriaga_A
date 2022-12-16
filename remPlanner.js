// step 1 do get path code

 // setting all values of the select

const getStartStations = document.getElementById("beginSt");
const getEndStations = document.getElementById("endSt");

const getStations = async () => 
{
    response = await fetch("http://10.101.0.12:8080/stations");
    console.log(response);

    const stationData =  await response.json();

    return stationData;
};

const createOptions = async () =>
{
    const options = await getStations();

    for(option of options)
    {
        const newStationOption = document.createElement("option");
        const newEndStationOption = document.createElement("option");
        console.log(option);

        newStationOption.value = option.StationId;
        newStationOption.text = option.Name;
        newEndStationOption.value = option.StationId;
        newEndStationOption.text = option.Name;
        
        getStartStations.appendChild(newStationOption); 
        getEndStations.appendChild(newEndStationOption);
    }

   
};

createOptions();

// getting the beginning and end stations to create the path and calculate time
async function getInfo(path)
{
    response = await fetch(path);
    const pathData = await response.json()

    return pathData;
};



async function getStartAndEndStation()
{
    var start = document.getElementById('beginSt');
    var end = document.getElementById('endSt');

    var startValue = start.options[start.selectedIndex].text;

    var endValue = end.options[end.selectedIndex].text;

    let completePath = "http://10.101.0.12:8080/path/" + encodeURIComponent(startValue) + "/" + encodeURIComponent(endValue);
    
    let pathData = await getInfo(completePath);

    let firstStationSegmentId = pathData[0].SegmentId;

   for(segment in pathData)
   {
        if(firstStationSegmentId != pathData[segment].SegmentId)
        {
            let newStationName = pathData[segment].Name;

            let currentSegmentId = pathData[segment].SegmentId;

            let newStationID = pathData[segment].StationId;

            console.log(newStationID);

            // getting distance

            let distancePath = "http://10.101.0.12:8080/distance/" + encodeURIComponent(startValue) + "/" + encodeURIComponent(newStationName);


            let totalDist = await getInfo(distancePath); 

            let speedo = await getInfo("http://10.101.0.12:8080/averageTrainSpeed");
            
            let totalSpeed = speedo[0].AverageSpeed;

            let timeToTravel = (totalDist / totalSpeed) * 60;

            let currentStationSC = "http://10.101.0.12:8080/schedule/" + encodeURIComponent(newStationName);

            let currentStationSchedule = await getInfo(currentStationSC);
            userTime = document.getElementById('departure');
            let departureTime = userTime.value;

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

                        if(arrivalTime.getHours() <= date.getHours() && arrivalTime.getMinutes() <= date.getMinutes() && counter === 0)
                        {
                            counter++;
                            console.log(newStationName);
                            console.log(nextDeparture);
                            break;
                        }
                    }
                    break // try this to reset the segment and path
               }
            }
        }
   }
}

var bttn = document.getElementById('print');

bttn.addEventListener("click",  getStartAndEndStation);

async function createTable(station,time)
{
    tableId = document.getElementById('pathTable');

    var row = document.createElement("TR");
    row.setAttribute("id", "row");

    tableId.appendChild(row);

    var cell = document.createElement("TD");
    var arrivalTime = document.createTextNode(time);
    var data = document.createTextNode(station);

    cell.appendChild(data);
    cell.appendChild(arrivalTime);
    tableId.appendChild(cell);
}

