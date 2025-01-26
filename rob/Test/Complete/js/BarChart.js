class BarChart {
	constructor({ container, dataPath, chartId }) {
		this.chartId = chartId; // Unique ID for this chart
		this.container = container;
		this.margin = { top: 40, right: 40, bottom: 15, left: 130 };
		this.width = 400 - this.margin.left - this.margin.right;
		this.height = 150 - this.margin.top - this.margin.bottom;

		// Initialize properties
		this.immigration = true; //
		this.percentage = false;

		this.init();
		this.createButtons();
		this.setupEventListeners();
		this.loadData(dataPath);
	}

	init() {
		this.svg = d3.select(this.container)
			.append("svg")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

		this.x = d3.scaleLinear().range([0, this.width]);
		this.y = d3.scaleBand().range([0, this.height]).paddingInner(0.1);

		this.yAxis = d3.axisLeft(this.y).tickSize(0);
		this.yAxisGroup = this.svg.append("g").attr("class", "y-axis axis");

		this.chartTitle = this.svg.append("text")
			.attr("class", "chart-title")
			.attr("x", -90)
			.attr("y", -15)
			.text("");
	}

	createButtons() {
		const buttonHtml = `
        <button type="button" class="buttonTop" id="${this.chartId}-toggle-ranking">
            <span class="arrow">↥</span>
        </button>
        <button type="button" class="buttonSort" id="${this.chartId}-change-sorting">
            %
        </button>
    `;

		d3.select(this.container)
			.append("div")
			.attr("id", "button-div")
			.html(buttonHtml);
	}

	setupEventListeners() {
		// Toggle ranking button
		d3.select(`#${this.chartId}-toggle-ranking`).on("click", () => {
			this.arrowAnimation();
			this.updateVisualization();
		});

		// Change sorting button
		d3.select(`#${this.chartId}-change-sorting`).on("click", () => {
			this.percentage = !this.percentage;
			this.updateVisualization();

			d3.select(`#${this.chartId}-change-sorting`)
				.classed("active", this.percentage);
		});
	}

	arrowAnimation() {
		this.immigration = !this.immigration; // Toggle between true (in) and false (out)
		d3.select(`#${this.chartId}-toggle-ranking`)
			.classed("arrow-up", this.immigration) // true means "in"
			.classed("arrow-down", !this.immigration); // false means "out"
	}

	loadData(dataPath) {
		d3.csv(dataPath, row => {
			row.out = +row.out;
			row.in = +row.in;
			row.population = +row.population;
			return row;
		}).then(csv => {
			this.data = csv;
			this.updateVisualization();
		});
	}


	updateVisualization() {
		if (!this.data) return;

		const rankingType = this.immigration ? "in" : "out";

		const processedData = this.percentage
			? this.data.map(d => ({
				...d,
				value: d.population > 0 ? (d[rankingType] / d.population) * 100 : 0
			}))
			: this.data.map(d => ({
				...d,
				value: d[rankingType]
			}));

		console.log("Processed data:", processedData);

		processedData.sort((a, b) => b.value - a.value);

		const topData = processedData.slice(0, 5);

		this.y.domain(topData.map(d => d.city));
		this.x.domain([0, d3.max(topData, d => d.value)]);

		// Update de balken
		const bars = this.svg.selectAll(".bar").data(topData, d => d.city);

		bars.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", 0)
			.attr("y", d => this.y(d.city))
			.attr("height", this.y.bandwidth())
			.attr("width", 0)
			.merge(bars)
			.style("opacity", 0.8)
			.transition()
			.duration(1000)
			.style("opacity", 1)
			.attr("x", 0)
			.attr("y", d => this.y(d.city))
			.attr("width", d => this.x(d.value));

		bars.exit()
			.transition()
			.duration(500)
			.style("opacity", 0)
			.remove();

		// Update de labels
		const labels = this.svg.selectAll(".label").data(topData, d => d.city);

		labels.enter()
			.append("text")
			.attr("class", "label")
			.attr("x", 0)
			.attr("y", d => this.y(d.city) + this.y.bandwidth() / 2 + 5)
			.attr("text-anchor", "end")
			.merge(labels)
			.style("opacity", 0)
			.transition()
			.duration(1000)
			.style("opacity", 1)
			.attr("x", d => this.x(d.value) - 5)
			.attr("y", d => this.y(d.city) + this.y.bandwidth() / 2 + 5)
			.text(d => this.percentage ? d.value.toFixed(2) : d[rankingType]);

		labels.exit()
			.transition()
			.duration(500)
			.style("opacity", 0)
			.remove();

		this.yAxisGroup
			.transition()
			.duration(1000)
			.call(this.yAxis)
			.selectAll(".tick text")
			.attr("text-anchor", "start")
			.attr("dx", "-6em");

		// Update de titel
		this.chartTitle
			.transition()
			.duration(500)
			.style("opacity", 0.5)
			.on("end", () => {
				this.chartTitle
					.text(this.immigration ? "Top 5 moving in from..." : "Top 5 moving out to...")
					.transition()
					.duration(500)
					.style("opacity", 1);
			});
	}

}
