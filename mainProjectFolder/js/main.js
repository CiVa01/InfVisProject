
const clickedPaths = [];
const svgContainer = document.getElementById('svgContainer');

// SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

document.getElementById("infoButton").addEventListener("click", updateVis);
document.getElementById("svgContainer").addEventListener("click", updateVis);
// Create a global object for the SVG
let svgLoader;

// municipal data
var data;

// Store the network
var network;

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
    console.log("initialising visualisation");
    network = new Network(data);
    svgLoader = new SvgLoader(network.regions, '/mainProjectFolder/data/Nederland_gemeenten_2021.svg');
    svgLoader.loadMap();

    // todo: load in the default visualisation with explanations of how things work - ROB
    // Initialize the main infoBlock
    let infoBlockMain = new infoBlock('main');
    infoBlockMain.init()
}

function updateVis() {
    console.log("updating visualisation");
    //todo: Add listener that keeps track of how many municipalities are selected - TBA
    let selection = svgLoader.getSelectedPaths();
    
    //todo: update the network such that it displays the correct behaviour depending on the selected municipalities - TBA

    //todo: if-statement deciding wether 0, 1 or more municipalities are selected - CIS
    if(selection.length == 0){
        network.stop();
        // defaultVis.show();
    }else if(selection.length == 1){
        network.stop();
        // infoBlockInit.show(selection)
        network.showOne(svgLoader);
    }else{
        network.stop();
        network.showMore(svgLoader);
        // infoBlockInit.show(selection[0])
        // moreVis.update(selection[1:]);
    }
        // If 1, display oneVis()
        // If >= 2, display the first municipality first and then add blocks for all subsequent municipalites
}
