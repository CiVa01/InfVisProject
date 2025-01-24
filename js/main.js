// Initialize data
loadData();

const clickedPaths = [];
const svgContainer = document.getElementById('svgContainer');

// SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

// municipal data
var data;

function loadData(){
    d3.csv("data/merged_cleaned.csv", row => {
        row.AmountOfPeople = + row.AmountOfPeople;
        row.ID = +row.ID;
    }).then(csv => {
        data = csv;
        console.log(data.ID);
    })
}