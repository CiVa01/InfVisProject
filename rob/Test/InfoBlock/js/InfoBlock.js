let currentData = []; // Store the current data to toggle between top and bottom 5
let isTop5 = true; // Boolean to track which data set is being displayed

// Function to draw the bar chart
function drawBarChart(data) {
	// Specify the SVG drawing area
	let margin = { top: 40, right: 10, bottom: 40, left: 80 };
	let width = 200 - margin.left - margin.right,
		height = 200 - margin.top - margin.bottom;

	let svg = d3.select("#bar-chart").selectAll("*").remove(); // Clear previous chart
	svg = d3.select("#bar-chart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Create an ordinal scale for the city types on the y-axis
	let y = d3.scaleBand()
		.domain(data.map(d => d.city)) // Cities are now in sorted order
		.rangeRound([0, height])
		.paddingInner(0.2);

	// Create a linear scale for the values on the x-axis
	let x = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.value)]) // Scale to the max value
		.range([0, width]);

	let yAxis = d3.axisLeft()
		.scale(y)
		.tickSize(0) // Remove ticks and gridlines
		.tickPadding(70); // Optional padding between ticks and labels

	// Append the y-axis to the chart
	svg.append("g")
		.attr("class", "y-axis axis")
		.call(yAxis);

	// Adjust the label positioning so the city names are left-aligned
	svg.selectAll(".y-axis text")
		.style("text-anchor", "start"); // Align the labels to the left

	// Draw the bars
	svg.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("y", d => y(d.city))
		.attr("x", 0)
		.attr("height", y.bandwidth())
		.attr("width", d => x(d.value)); // Scaled width based on value

	// Append labels at the end of the bars
	svg.selectAll(".bar-label")
		.data(data)
		.enter().append("text")
		.attr("class", "bar-label")
		.attr("x", d => x(d.value) - 5) // Position slightly after the bar
		.attr("y", d => y(d.city) + (y.bandwidth() / 2))
		.style("text-anchor", "end") // Align the labels to the right
		.attr("dy", "0.35em") // Vertically center the text
		.style("fill", "white") // Set the text color to white
		.style("font-size", "10px") // Make the font smaller
		.text(d => d.value); // Display the value as text


	// Append a chart title
	svg.append("text")
		.attr("class", "chart-title")
		.attr("y", -20)
		.attr("x", 0) // Position the title at the left
		.attr("dy", ".71em")
		.style("text-anchor", "start") // Align the title to the left
		.text(isTop5 ? "Top 5 Cities" : "Bottom 5 Cities");
}

// Function to update the data (top or bottom 5 cities)
function updateChart() {
	if (isTop5) {
		// Sort the data from high to low based on value and select top 5
		currentData = data.sort((a, b) => b.value - a.value).slice(0, 5);
	} else {
		// Sort the data from low to high based on value and select bottom 5
		currentData = data.sort((a, b) => a.value - b.value).slice(0, 5);
	}

	drawBarChart(currentData);
	isTop5 = !isTop5; // Toggle the state
}

// Initial data set (top 5)
let data = [
	{ "city": "Amsterdam", "value": 3456 },
	{ "city": "Utrecht", "value": 1234 },
	{ "city": "Rotterdam", "value": 6453 },
	{ "city": "The Hague", "value": 2341 },
	{ "city": "Groningen", "value": 876 },
	{ "city": "Eindhoven", "value": 1523 },
	{ "city": "Maastricht", "value": 1023 },
	{ "city": "Leiden", "value": 423 },
	{ "city": "Delft", "value": 3123 },
	{ "city": "Breda", "value": 2210 }
];

// Draw the initial chart
updateChart();

// Event listener for the button click to toggle between top and bottom 5
document.getElementById("toggle-button").addEventListener("click", updateChart);
