
const clickedPaths = [];

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
    let infoBlockMain = new infoBlock('main');
    infoBlockMain.init()
}

function updateVis() {
    console.log("updating visualisation");
    /*todo: at hier nog moet gebeuren is als volgt:
    het dropdown menu en de svgloader en network moeten met elkaar praten. Oftewel, selectie moet overschreven worden door het dropdown en het juiste path halen
    De visualisaties moeten nog correct geupdate worden.
    Denk dat dat het meest ingewikkelde is
    */

    let selection = svgLoader.getSelectedPaths();
    console.log(selection);

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
