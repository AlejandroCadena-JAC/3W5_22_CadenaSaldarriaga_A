// step 1 do get path code

 // setting all values of the select

const getStartStations = document.getElementById("beginSt");
const getEndStations = document.getElementById("endSt");

const getStations = async () => 
{
   response = await fetch("http://10.101.0.12:8080/stations");
    console.log(response);

    const stationData = response.json();

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

 async function getInfo(path){
    response = await fetch(path);
    const pathData = response.json()

    return pathData;
};


async function getStartAndEndStation()
{
    var start = document.getElementById('beginSt');
    var end = document.getElementById('endSt');

    var startValue = start.options[start.selectedIndex].text;

    var endValue = end.options[end.selectedIndex].text;

    let completePath = " http://10.101.0.12:8080/path/" + encodeURIComponent(startValue) + "/" + encodeURIComponent(endValue);
    
   let pathData = await getInfo(completePath);

    let firstStationSegmentId = pathData[0].SegmentId;

   for(segment in pathData)
   {
        if(firstStationSegmentId != pathData[segment].SegmentId)
        {
            let newStationName = pathData[segment].Name;

            let currentSegmentId = pathData[segment].SegmentId;

            // getting distance

            let distancePath = "http://10.101.0.12:8080/distance/" + encodeURIComponent(startValue) + "/" + encodeURIComponent(newStationName);


            let totalDist = await getInfo(distancePath); 

            let speedo = await getInfo("http://10.101.0.12:8080/averageTrainSpeed");
            
            let totalSpeed = speedo[0].AverageSpeed;

            let timeToTravel = totalDist / totalSpeed;

            console.log(timeToTravel);
        }
   }
}

var bttn = document.getElementById('print');

bttn.addEventListener("click",  getStartAndEndStation);



