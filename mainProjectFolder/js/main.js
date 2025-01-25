
const clickedPaths = [];
const svgContainer = document.getElementById('svgContainer');

// SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

// municipal data
let data;

// Initialize data
loadData();

initVis();
function loadData() {
    d3.csv("/mainProjectFolder/data/data_final.csv", row => {
        // Ensure AmountOfPeople is converted to an integer
        row.AmountOfPeople = +row.AmountOfPeople;
        return row;
    }).then(csv => {
        csv = csv.filter(data => data.AmountOfPeople > 0);
        console.log("data file: ", csv);
        data = csv; // Store the data
    });
}

function initVis(){
    initMap();
    let net = new Network(data);
    console.log("net: " + net);
}