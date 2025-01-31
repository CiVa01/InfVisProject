
const clickedPaths = [];
let cityList = []
let steden = ['Amsterdam, Utrecht, Ede'];


const svgContainer = document.getElementById('svgContainer');

// SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

document.getElementById("svgContainer").addEventListener("click", updateVis);


// Create a global object for the SVG
let svgLoader;

// municipal data
var data;

// Store the network
var network;




// Initialize data
loadData();
initVis();
function loadData() {
    try {
        d3.csv("/mainProjectFolder/data/data_final.csv", row => {
            // Ensure AmountOfPeople is converted to an integer
            row.AmountOfPeople = +row.AmountOfPeople;
            return row;
        }).then(csv => {
            csv = csv.filter(data => data.AmountOfPeople > 0);
            data = csv; // Store the data

            initVis();
        });
        console.log("Loading data succeeded")
    }catch (error){
        console.error("Error while loading the data: " + error.message);
    }
}


function initVis(){
    console.log("initialising visualisation");
    network = new Network(data);
    svgLoader = new SvgLoader(network.regions, '/mainProjectFolder/data/Nederland_gemeenten_2021.svg');
    svgLoader.loadMap();

    // todo: load in the default visualisation with explanations of how things work - ROB
    // Initialize the main infoBlock
    // let infoBlockMain = new infoBlock('main', "#mainInfoBlockContainer");
}

function updateVis() {
    console.log("updating visualisation");
    /*todo: at hier nog moet gebeuren is als volgt:
    het dropdown menu en de svgloader en network moeten met elkaar praten. Oftewel, selectie moet overschreven worden door het dropdown en het juiste path halen
    De visualisaties moeten nog correct geupdate worden.
    Denk dat dat het meest ingewikkelde is
    */

    // Combineer selectie uit svgLoader en infoBlock zonder duplicaten
    const svgSelection = svgLoader.getSelectedPaths();

    cityList = [...new Set([...svgSelection])];

    if(cityList.length == 0){
        network.stop();
        drawInfoBlocks(svgSelection);



    }else if(cityList.length == 1){
        network.stop();
        network.showOne(svgLoader);
        drawInfoBlocks(svgSelection);


    }else{
        network.stop();
        network.showMore(svgLoader);
        drawInfoBlocks(svgSelection);

        // infoBlockInit.show(selection[0])
        // moreVis.update(selection[1:]);
    }
        // If 1, display oneVis()
        // If >= 2, display the first municipality first and then add blocks for all subsequent municipalites
}





function drawInfoBlocks(cities) {
    // Selecteer de containers
    const mainContainer = document.querySelector("#mainInfoBlockContainer");
    const extraContainer = document.querySelector("#extraInfoBlockContainer");

    // Maak de containers eerst leeg
    mainContainer.innerHTML = "";
    extraContainer.innerHTML = "";

    // Verwerk het hoofd info block
    if (cities.length > 0) {
        let a = new infoBlock(cities[0], "#mainInfoBlockContainer", cities[0]);

    }

    // Verwerk de extra info blocks
    for (let i = 1; i < cities.length; i++) {
        new infoBlock(cities[i], "#extraInfoBlockContainer", cities[i]);
    }
}


function getCityFromRegionId(name) {
    let datapath = 'data/idToName.csv';

    console.log(name);

    // Fetch the CSV file
    fetch(datapath)
        .then(response => response.text())
        .then(data => {
            // Split the CSV into rows
            let rows = data.split('\n');

            // Loop through each row to find the matching RegionFromID
            for (let row of rows) {
                // Split the row into columns by comma
                let columns = row.split(',');

                // Check if the first column matches the name
                if (columns[0] === name) {
                    console.log(columns[1])
                    return columns[1]; // Return the value from the second column
                }
            }
        });
}



