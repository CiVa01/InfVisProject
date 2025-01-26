// Counter voor het dynamisch aanmaken van grafieken
let chartCounter = 1;

// Functie om een nieuwe BarChart te maken
function createBarChart() {
    const chartId = "chart" + chartCounter++; // Maak een unieke ID voor elke nieuwe grafiek

    // Voeg een nieuwe container toe voor de nieuwe grafiek
    const chartArea = document.createElement("div");
    chartArea.id = chartId + "-container";
    chartArea.className = "chart-area"; // Voeg de CSS-klasse toe
    document.getElementById("charts-container").appendChild(chartArea);

    // Maak een nieuwe BarChart met de nieuwe ID
    new BarChart({
        container: "#" + chartId + "-container", // Dynamisch gegenereerde container
        dataPath: "data/data.csv", // Of welk data pad je ook gebruikt
        chartId: chartId // Geef de chartId mee
    });
}

// Voeg een event listener toe aan de knop
document.getElementById("initButton").addEventListener("click", createBarChart);


let infoChartCounter = 1;

// Functie om een nieuwe BarChart te maken
function createInfoChart() {
    const infoChartId = "infoChart" + infoChartCounter++; // Maak een unieke ID voor elke nieuwe grafiek

    // Voeg een nieuwe container toe voor de nieuwe grafiek
    const infoChartArea = document.createElement("div");
    infoChartArea.id = infoChartId + "-container";
    infoChartArea.className = "chart-area"; // Voeg de CSS-klasse toe
    document.getElementById("infoChart-container").appendChild(infoChartArea);

    // Maak een nieuwe BarChart met de nieuwe ID
    new infoChart({
        container: "#" + infoChartId + "-container", // Dynamisch gegenereerde container
        dataPath: "data/data_final.csv", // Of welk data pad je ook gebruikt
        chartId: infoChartId // Geef de chartId mee
    });
}

document.getElementById("infoButton").addEventListener("click", createInfoChart);