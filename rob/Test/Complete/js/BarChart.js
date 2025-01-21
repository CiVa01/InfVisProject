class BarChart {
	constructor({ container, width, height, dataPath, chartId }) {
		this.chartId = chartId; // Unieke ID voor deze grafiek
		this.container = container;
		this.margin = { top: 30, right: 30, bottom: 30, left: 70 };
		this.width = (width || 250) - this.margin.left - this.margin.right;
		this.height = (height || 150) - this.margin.top - this.margin.bottom;

		// Voeg de knop toe in de container
		this.currentRankingType = "in"; // Start met "Top 5 in"
		this.createToggleButton();

		// SVG element maken
		this.svg = d3.select(container)
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
			.attr("x", -65)
			.attr("y", -10)
			.text("");

		this.reverse = false;

		this.setupEventListeners();

		this.loadData(dataPath);
	}

	// Dynamisch knop toevoegen
	createToggleButton() {
		const buttonHtml = `
        <button type="button" class="buttonTop" id="${this.chartId}-toggle-ranking">
            <span class="arrow">↑</span>
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
			this.currentRankingType = this.currentRankingType === "in" ? "out" : "in";
			d3.select(`#${this.chartId}-toggle-ranking`)
				// .text(this.currentRankingType === "in" ? "↓" : "↓")
				.classed("arrow-up", this.currentRankingType === "in")
				.classed("arrow-down", this.currentRankingType === "out");
			this.updateVisualization();
		});

		// Change sorting button
		d3.select(`#${this.chartId}-change-sorting`).on("click", () => {
			this.reverse = !this.reverse;
			const button = d3.select(`#${this.chartId}-change-sorting`);
			button.classed("clicked", this.reverse);
			d3.select(`#${this.chartId}-change-sorting`).text(this.reverse ? "%" : "%");
			this.updateVisualization();
		});
	}

	loadData(dataPath) {
		d3.csv(dataPath, row => {
			row.out = +row.out;
			row.in = +row.in;
			return row;
		}).then(csv => {
			this.data = csv;
			this.updateVisualization();
		});
	}

	updateVisualization() {
		if (!this.data) return;

		const rankingType = this.currentRankingType;

		this.chartTitle
			.transition()
			.duration(500)
			.style("opacity", 0.5)
			.on("end", () => {
				this.chartTitle
					.text(rankingType === "in" ? "Top 5 in" : "Top 5 out")
					.transition()
					.duration(500)
					.style("opacity", 1);
			});

		this.data.sort((a, b) => b[rankingType] - a[rankingType]);
		if (this.reverse) this.data.reverse();
		const topData = this.data.slice(0, 5);

		this.y.domain(topData.map(d => d.city));
		this.x.domain([0, d3.max(topData, d => d[rankingType])]);

		const bars = this.svg.selectAll(".bar").data(topData, d => d.city);

		bars.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", 0)
			.attr("y", d => this.y(d.city))
			.attr("height", this.y.bandwidth())
			.attr("width", 0)
			.merge(bars)
			.style("opacity", 0.5)
			.transition()
			.duration(1000)
			.style("opacity", 1)
			.attr("x", 0)
			.attr("y", d => this.y(d.city))
			.attr("width", d => this.x(d[rankingType]));

		bars.exit()
			.transition()
			.duration(500)
			.style("opacity", 0)
			.remove();

		const labels = this.svg.selectAll(".label").data(topData, d => d.city);

		labels.enter()
			.append("text")
			.attr("class", "label")
			.attr("x", 0)
			.attr("y", d => this.y(d.city) + this.y.bandwidth() / 2 + 5)
			.attr("text-anchor", "end")
			.style("opacity", 0)
			.merge(labels)
			.style("opacity", 0.5)
			.transition()
			.duration(1000)
			.attr("x", d => this.x(d[rankingType]) - 5)
			.attr("y", d => this.y(d.city) + this.y.bandwidth() / 2 + 5)
			.style("opacity", 1)
			.text(d => d[rankingType]);

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
	}
}
