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