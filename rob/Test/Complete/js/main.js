// Counter voor het dynamisch aanmaken van grafieken
let chartCounter = 1;

// Functie om een nieuwe BarChart te maken
function createBarChart() {
    const chartId = "chart" + chartCounter++; // Maak een unieke ID voor elke nieuwe grafiek

    // Voeg een nieuwe container toe voor de nieuwe grafiek
    const chartArea = document.createElement("div");
    chartArea.id = chartId + "-chart-area";
    chartArea.className = "chart-area"; // Voeg de CSS-klasse toe
    document.getElementById("charts-container").appendChild(chartArea);

    // Maak een nieuwe BarChart met de nieuwe ID
    new BarChart({
        container: "#" + chartId + "-chart-area", // Dynamisch gegenereerde container
        width: 230,
        height: 150,
        dataPath: "data/data.csv", // Of welk data pad je ook gebruikt
        chartId: chartId // Geef de chartId mee
    });
}

// Voeg een event listener toe aan de knop
document.getElementById("initButton").addEventListener("click", createBarChart);
