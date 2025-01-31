
const clickedPaths = [];
let cityList = []


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

d3.select("#refresh-button")
    .on("click", function() {
        console.log("Resetting visualization...");

        // // Reset de geselecteerde paden in de SVG
        // if (svgLoader) {
        //     svgLoader.resetMap(); // Zorg dat je een resetfunctie hebt in SvgLoader
        // }

        // Maak de info containers leeg
        document.querySelector("#mainInfoBlockContainer").innerHTML = "";
        document.querySelector("#extraInfoBlockContainer").innerHTML = "";

        // Leeg de geselecteerde stedenlijst
        cityList = [];

        // Stop de netwerkvisualisatie
        if (network) {
            network.stop();
        }

        // Herlaad de visualisatie
        initVis();
    }); // Controleer of de knop is gevonden



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

    // Initialize the main infoBlock
    // let infoBlockMain = new infoBlock('main', "#mainInfoBlockContainer");
}

function updateVis() {
    console.log("updating visualisation");
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





async function drawInfoBlocks(cities) {
    // Selecteer de containers
    const mainContainer = document.querySelector("#mainInfoBlockContainer");
    const extraContainer = document.querySelector("#extraInfoBlockContainer");

    // Maak de containers eerst leeg
    mainContainer.innerHTML = "";
    extraContainer.innerHTML = "";

    let mainInfoBlock;

    // Process the main info block
    if (cities.length > 0) {
        // Haal de stad op via getCityFromRegionId en wacht op het resultaat
        let city = await getCityFromRegionId(cities[0]);
        if (city) {  // Zorg ervoor dat er een stad is
            mainInfoBlock = new infoBlock(cities[0], "#mainInfoBlockContainer", city.trimEnd(), false);

        }
    }

    // Verwerk de extra info blocks
    for (let i = 1; i < cities.length; i++) {
        let city = await getCityFromRegionId(cities[i]);
        if (city) {  // Zorg ervoor dat er een stad is
            let extraInfoBlock = new infoBlock(cities[i], "#extraInfoBlockContainer", city.trimEnd(), true);

            if (mainInfoBlock) {
                let arrowSvg = d3.select("#arrowsContainer");
                const weight = getEdgeWeight(cities[0], cities[i]);
                const otherWeight = getEdgeWeight(cities[i], cities[0]);
                mainInfoBlock.drawArrow(extraInfoBlock, weight, otherWeight, arrowSvg);
            }
        }
    }
}

function getEdgeWeight(source, target) {
    const edge = network.network.find(edge => edge.source === source && edge.target === target);
    return edge ? edge.weight : 5;
}

// Pas de functie aan om het resultaat van getCityFromRegionId asynchroon te verwerken
async function getCityFromRegionId(name) {
    let datapath = 'data/idToName.csv';
    console.log(name);

    // Haal het CSV-bestand op en wacht op de gegevens
    const response = await fetch(datapath);
    const data = await response.text();

    // Split de CSV in rijen
    let rows = data.split('\n');

    // Loop door de rijen om de overeenkomstige regio te vinden
    for (let row of rows) {
        let columns = row.split(',');

        // Controleer of de eerste kolom overeenkomt met de naam
        if (columns[0] === name) {
            console.log(columns[1]);  // Log de gevonden stad
            return columns[1];  // Geef de waarde van de tweede kolom terug
        }
    }

    // Als geen stad is gevonden, return null
    return null;
}




