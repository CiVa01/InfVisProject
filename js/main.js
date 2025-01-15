// Initialize data
loadData();

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