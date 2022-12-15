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

 function getStartAndEndStation()
{
    var start = document.getElementById('beginSt');
    var end = document.getElementById('endSt');

    var startValue = start.options[start.selectedIndex].value;

    var endValue = end.options[end.selectedIndex].value;

    console.log(startValue);
    console.log(endValue);
    

}

var bttn = document.getElementById('print');

bttn.addEventListener("click",  getStartAndEndStation);