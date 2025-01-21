// SVG drawing area

var margin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 100
};

var width = 250 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Scales
var x = d3.scaleLinear()
    .range([0, width]);

var y = d3.scaleBand()
    .range([0, height])
    .paddingInner(0.1);

var yAxis = d3.axisLeft()
    .tickSize(0)
    .scale(y);

var yAxisGroup = svg.append("g")
    .attr("class", "y-axis axis");

// Voeg een titel bovenaan de SVG toe
var chartTitle = svg.append("text")
    .attr("class", "chart-title")
    .attr("text-anchor", "left")
    .attr("x", -65) // Gecentreerd bovenaan de grafiek
    .attr("y", -10) // Een beetje boven de grafiek
    .text(""); // Begin zonder tekst

// Initialize data
loadData();

// Create a 'data' property under the window object
// to store the coffee chain data
Object.defineProperty(window, 'data', {
  // data getter
  get: function () {
    return _data;
  },
  // data setter
  set: function (value) {
    _data = value;
    // update the visualization each time the data property is set by using the equal sign (e.g. data = [])
    updateVisualization();
  }
});

// Sort order
var reverse = false;

// Event Listener (ranking type)
var selectRankingType = d3.select("#ranking-type").on("change", updateVisualization);

// Event listener (reverse sort order)
var changeSortingOrder = d3.select("#change-sorting").on("click", function () {
  reverse = !reverse;
  updateVisualization();
});

// Load CSV file
function loadData() {
  d3.csv("data/data.csv", (row) => {
    row.out = +row.out;
    row.in = +row.in;
    return row;
  }).then(function (csv) {
    // Store csv data in global variable
    data = csv;

    // updateVisualization gets automatically called within the data = csv call;
    // basically(whenever the data is set to a value using = operator);
    // see the definition above: Object.defineProperty(window, 'data', { ...
  });
}

// Render visualization
function updateVisualization() {
  // Get the selected ranking option
  var rankingType = selectRankingType.property("value");

  if (rankingType === "in") {
    chartTitle.transition()
        .duration(500) // Fade out
        .style("opacity", 0)
        .on("end", function () {
          chartTitle.text("Top 5 in") // Update de tekst
              .transition()
              .duration(500) // Fade in
              .style("opacity", 1);
        });
  } else {
    chartTitle.transition()
        .duration(500) // Fade out
        .style("opacity", 0)
        .on("end", function () {
          chartTitle.text("Top 5 out") // Update de tekst
              .transition()
              .duration(500) // Fade in
              .style("opacity", 1);
        });
  }

  // Sort data
  data.sort(function (a, b) {
    return b[rankingType] - a[rankingType];
  });

  if (reverse)
    data.reverse();

  // Filter top 5
  var topData = data.slice(0, 5);

  // Update scales domains
  y.domain(topData.map(function (d) {
    return d.city;
  }));
  x.domain([0, d3.max(topData, function (d) {
    return d[rankingType];
  })]);

  // Data join for bars
  var bars = svg.selectAll(".bar")
      .data(topData, function (d) {
        return d.city;
      });

  // Enter
  bars.enter().append("rect")
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("y", function (d) {
        return y(d.city); // Align with the correct vertical position
      })
      .attr("class", "bar")

      // Update
      .merge(bars)
      .style("opacity", 0.5)
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .attr("x", 0)
      .attr("y", function (d) {
        return y(d.city);
      })
      .attr("width", function (d) {
        return x(d[rankingType]);
      })

  // Exit
  bars.exit()
      .transition()
      .duration(500)
      .style("opacity", 0) // Laat de labels vervagen
      .remove();

  // Data join for labels
  var labels = svg.selectAll(".label")
      .data(topData, function (d) {
        return d.city;
      });

  // Enter
  labels.enter().append("text")
      .attr("class", "label")
      .attr("x", 0) // Begin buiten het zicht aan de linkerkant
      .attr("y", function (d) {
        return y(d.city) + y.bandwidth() / 2 + 5; // Verticaal gecentreerd
      })

      .attr("text-anchor", "end") // Rechts uitlijnen
      .text(function (d) {
        return d[rankingType]; // Waarde weergeven
      })
      .style("opacity", 0) // Begin met volledig transparant

      // Update
      .merge(labels)
      .style("opacity", 0.5)
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .attr("x", function (d) {
        return x(d[rankingType]) - 5; // Update positie
      })
      .attr("y", function (d) {
        return y(d.city) + y.bandwidth() / 2 + 5; // Verticaal gecentreerd
      })
      .text(function (d) {
        return d[rankingType]; // Waarde updaten
      });

  // Exit
  labels.exit()
      .transition()
      .duration(500)
      .style("opacity", 0) // Laat de labels vervagen
      .remove();

  // Update axes
  yAxisGroup = svg.select(".y-axis")
      .transition()
      .duration(1000)
      .call(yAxis)
      .selectAll(".tick text")
      .attr("text-anchor", "start")
      .attr("dx", "-6em");

}

