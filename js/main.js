var margin = {top: 40, right: 40, bottom: 60, left: 60};

var width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// our municipal data
var data;

loadData();

var parseDate = function(data) {return data.TimeFrame.substring(0, 3);};

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function loadData(){
    d3.csv("data/merged_cleaned.csv", row =>{
        row.ID = +row.id;
        row.AmountOfPeople = +row.AmountOfPeople;
        return row;
    }).then(csv => {

        // store data globally
        data = csv;

        // Parse the date to just show the year of collection
        data.forEach(item => {
            item.TimeFrame = parseDate(item.TimeFrame);
        })

        console.log(data);
    })
}