// step 1 do get path code

 // setting all values of the select

const getStartStations = document.getElementById("beginSt");
const getEndStations = document.getElementById("endSt");
const getStationInfo = document.getElementById("infoSt");

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
        const stationInfoOption = document.createElement("option");
        

        newStationOption.value = option.StationId;
        newStationOption.text = option.Name;
        newEndStationOption.value = option.StationId;
        newEndStationOption.text = option.Name;
        stationInfoOption.value = option.StationId
        stationInfoOption.text = option.Name;

        getStartStations.appendChild(newStationOption); 
        getEndStations.appendChild(newEndStationOption);
        getStationInfo.appendChild(stationInfoOption);
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

    if (startValue === endValue){
        window.alert("Are you trying to take the train to the same station you left from bucko?");
        return 0;
    }

    let completePath = "http://10.101.0.12:8080/path/" + encodeURIComponent(startValue) + "/" + encodeURIComponent(endValue);

    let pathData = await getInfo(completePath);

    console.log(pathData);
    userTime = document.getElementById('departure');
    let inputTime = userTime.value;

    let departureTime = await getSchedule(pathData,pathData[0].Name,inputTime)
    let firstStationSegmentId = pathData[0].SegmentId;

    let completeDeparture = await addStr(departureTime,2,":");
    console.log(departureTime);
    const initialDepartureTimeArray = completeDeparture.split(':');

    let departureDate = new Date();

    departureDate.setUTCHours(initialDepartureTimeArray[0]);
    departureDate.setUTCMinutes(initialDepartureTimeArray[1]);

    createTable(startValue,departureDate.getUTCHours() + ":" + departureDate.getUTCMinutes());

    let previousArrivalTime = new Date()

    previousArrivalTime.setUTCHours(departureDate.getUTCHours());
    previousArrivalTime.setUTCMinutes(departureDate.getUTCMinutes());

   for(let stationIndex= 0; stationIndex < pathData.length; stationIndex++)
   {
        if(pathData[stationIndex].SegmentId != firstStationSegmentId || pathData[stationIndex].SegmentId != pathData[stationIndex].SegmentId)
        {
            if(typeof(pathData[stationIndex + 1]) != "undefined")
            {
                firstStationSegmentId = pathData[stationIndex].SegmentId;
                nextStationName = pathData[stationIndex + 1].Name;

                currentStationName = pathData[stationIndex].Name;

                let distancePath = "http://10.101.0.12:8080/distance/" + encodeURIComponent(currentStationName) + "/" + encodeURIComponent(nextStationName);

                let totalDist = await getInfo(distancePath); 

                let speedo = await getInfo("http://10.101.0.12:8080/averageTrainSpeed");
                    
                let totalSpeed = speedo[0].AverageSpeed;

                let timeToTravel = (totalDist / totalSpeed) * 60;

                let UTCTimeTraveled = new Date();

                UTCTimeTraveled.setUTCMinutes(timeToTravel);

                let currentStationArrivalTime = await GetArrival(UTCTimeTraveled,previousArrivalTime);

                previousArrivalTime = currentStationArrivalTime;

                let currentStationArrivalTimeString = currentStationArrivalTime.getUTCHours() + ":" + currentStationArrivalTime.getUTCMinutes();

                let departureFromSwitch = await getSchedule(pathData,currentStationName,currentStationArrivalTimeString);

                let newDepartureTime = await addStr(departureFromSwitch,2,":");
                const newDepartureTimeArray = newDepartureTime.split(':');

                let newDepartureDate = new Date();
                if(newDepartureTimeArray[1].value < 10)
                {
                    newDepartureTimeArray[1] = String(newDepartureTimeArray[1]).padStart(2, '0');
                }
                newDepartureDate.setUTCHours(newDepartureTimeArray[0]);
                newDepartureDate.setUTCMinutes(newDepartureTimeArray[1]);

                createTable(nextStationName,newDepartureDate.getUTCHours() + ":" + newDepartureDate.getUTCMinutes());
                }
                else
                {
                    break;
                }
            
        }
        else
        {
            if(typeof(pathData[stationIndex + 1]) != "undefined")
            {
                nextStationName = pathData[stationIndex + 1].Name;

                currentStationName = pathData[stationIndex].Name;
    
                let distancePath = "http://10.101.0.12:8080/distance/" + encodeURIComponent(currentStationName) + "/" + encodeURIComponent(nextStationName);
    
                let totalDist = await getInfo(distancePath); 
    
                let speedo = await getInfo("http://10.101.0.12:8080/averageTrainSpeed");
                    
                let totalSpeed = speedo[0].AverageSpeed;
    
                let timeToTravel = (totalDist / totalSpeed) * 60;
    
                let UTCTimeTraveled = new Date();
    
                UTCTimeTraveled.setUTCMinutes(timeToTravel);
    
                let currentStationArrivalTime = await GetArrival(UTCTimeTraveled,previousArrivalTime);
    
                previousArrivalTime = currentStationArrivalTime;
    
                createTable(nextStationName,currentStationArrivalTime.getUTCHours() + ":" + currentStationArrivalTime.getUTCMinutes());
            }
            else
            {
                break;
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
    var cell2 = document.createElement("TD");
    var arrivalTime = document.createTextNode(time);
    var data = document.createTextNode(station);

    cell.appendChild(data);
    cell2.appendChild(arrivalTime);
    tableId.appendChild(cell);
    tableId.appendChild(cell2);
}

async function getSchedule(stations,newStationName, time,)
{

    let currentStationSC = "http://10.101.0.12:8080/schedule/" + encodeURIComponent(newStationName);

    let schedulePromise = await getInfo(currentStationSC);

    filteredSchedules = schedulePromise.filter(schedulePromise => schedulePromise.SegmentId === stations[0].SegmentId);

    let advancedFilter = [];

    let timeHolder = [];    
    let splits = time.split(":");

    if(splits[1] < 10)
    {
        splits[1] = String(splits[1]).padStart(2, '0');
    }
    else if(splits[0]< 10)
    {
        splits[0] = addStr(splits[0],2,'0');
    }

    timeHolder.push(splits[0] + splits[1]);

    for(let dep =0; dep <filteredSchedules.length; dep++){

        let time = filteredSchedules[dep].Time.split('T');
        let splicedTime = time[1].substring(0,time[1].length - 8);
        let splitTime = splicedTime.split(":")
        advancedFilter.push(splitTime[0] + splitTime[1]);

    }
    console.log(time)
    console.log(advancedFilter)
    var completeSchedule = advancedFilter.filter(advancedFilter => timeHolder[0] <= advancedFilter);
    console.log(completeSchedule);

    var correct = completeSchedule.reduce(function(previous,current){
        return (Math.abs(current - timeHolder[0]) < Math.abs(previous - timeHolder[0])? current: previous);
    });
  //  console.log(correct);
    return correct;
}

function addStr(str, index, stringToAdd){
    return str.substring(0, index) + stringToAdd + str.substring(index, str.length);
  }



async function GetArrival(timeToTravel,arrivalTime)
{
    let nextArrival = new Date();

    nextArrival.setUTCHours(arrivalTime.getUTCHours());

    nextArrival.setUTCMinutes(arrivalTime.getUTCMinutes() + timeToTravel.getUTCMinutes());


    if(nextArrival.getUTCMinutes() < 10)
    {
        nextArrival.setUTCMinutes(String(nextArrival.getUTCMinutes()).padStart(2, '0'));
    }
    console.log(nextArrival.getUTCHours());

    console.log(nextArrival.getUTCMinutes());

    return nextArrival;
}


async function printInfo()
{

    var station = document.getElementById('infoSt');
    var infoContainer = document.getElementById('infoText');

    var staInfo = station.options[station.selectedIndex].value;

    let infoPath = "http://10.101.0.12:8080/stations/" + encodeURIComponent(staInfo);
    const info = await getInfo(infoPath);
    console.log(info);
   

   
    var par = document.createElement('p');
    var par2 = document.createElement('p');
    var par3 = document.createElement('p');
    par.innerText = "Station Name:" + " "+ JSON.stringify(info[0].Name);
    par2.innerText = "Station Postal Code:"  + " " + JSON.stringify(info[0].PostalCode);
    par3.innerText = "Station Street Name:"  + " " + JSON.stringify(info[0].StreetName);

    infoContainer.appendChild(par);
    infoContainer.appendChild(par2);
    infoContainer.appendChild(par3);
   
}
var additionalInfo = document.getElementById('stationInfo');

additionalInfo.addEventListener("click", printInfo)
