
const clickedPaths = [];
const svgContainer = document.getElementById('svgContainer');

// SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

// municipal data
var data;

// counter for infoBlocks
var infoBlockCounter = 0

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
    let netData = new Network(data);
    let netWork = netData.network;
    let svgLoader = new SvgLoader(netData.regions, './mainProjectFolder/data/Nederland_gemeenten_2021.svg');
    // todo: Get the map visualised in the correct box - CIS
    svgLoader.loadMap();
    // todo: load in the default visualisation with explanations of how things work - ROB
    let infoBlockInit = new infoBlock();

    infoBlockInit.make()
}

function updateVis() {
    //todo: Add listener that keeps track of how many municipalities are selected - TBA

    //todo: update the network such that it displays the correct behaviour depending on the selected municipalities - TBA

    //todo: if-statement deciding wether 0, 1 or more municipalities are selected - CIS
        // If 0, display defaultVis()
        // If 1, display oneVis()
        // If >= 2, display the first municipality first and then add blocks for all subsequent municipalites
}

document.getElementById("infoButton").addEventListener("click", initVis);