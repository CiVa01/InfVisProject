class barChart {
	constructor({ container, data, chartId }) {
		this.container = container;
		this.chartId = chartId; // Unique identifier for this chart
		this.margin = { top: 60, right: 0, bottom: 0, left: 130 };
		this.width = 270 - this.margin.left - this.margin.right;
		this.height = 150 - this.margin.top - this.margin.bottom;

		// Initialize properties
		this.immigration = true; // Default to peopleTo
		this.percentage = false;

		// Data passed as argument
		this.data = data;

		this.init();
		this.createButtons();
		this.setupEventListeners();
		this.updateVisualization();
	}

	init() {
		this.svg = d3.select(this.container)
			.append("svg")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

		this.x = d3.scaleLinear().range([0, this.width]);
		this.y = d3.scaleBand().range([0, this.height]).paddingInner(0.2);

		this.yAxis = d3.axisLeft(this.y).tickSize(0);
		this.yAxisGroup = this.svg.append("g").attr("class", "y-axis axis");

		this.chartTitle = this.svg.append("text")
			.attr("class", "chart-title")
			.text("");
	}

	createButtons() {
		const buttonHtml = `
            <button type="button" class="buttonTop" id="toggle-ranking-${this.chartId}">
                <i class="fa-solid fa-arrow-turn-up"></i>
            </button>
            <button type="button" class="buttonSort" id="change-sorting-${this.chartId}">
                <i class="fa-solid fa-percent"></i>
            </button>`;

		d3.select(this.container)
			.append("div")
			.attr("id", `button-div-${this.chartId}`)
			.attr("class", "buttonGraph")
			.html(buttonHtml);
	}

	setupEventListeners() {
		// Toggle ranking button
		d3.select(`#toggle-ranking-${this.chartId}`).on("click", () => {
			this.arrowAnimation();
			this.updateVisualization();
		});

		// Change sorting button
		d3.select(`#change-sorting-${this.chartId}`).on("click", () => {
			this.percentage = !this.percentage;
			this.updateVisualization();

			d3.select(`#change-sorting-${this.chartId}`)
				.classed("active", this.percentage);
		});
	}

	arrowAnimation() {
		this.immigration = !this.immigration; // Toggle between peopleTo and peopleFrom
		d3.select(`#toggle-ranking-${this.chartId}`)
			.classed("iconUp", this.immigration) // true means "peopleTo"
			.classed("iconDown", !this.immigration); // false means "peopleFrom"
	}

	updateVisualization() {
		if (!this.data) return;

		const rankingType = this.immigration ? "peopleFrom" : "peopleTo";

		// Process the data based on percentage toggle
		const processedData = this.percentage
			? this.data.map(d => ({
				...d,
				value: d.population > 0 ? (d[rankingType] / d.population) * 100 : 0
			}))
			: this.data.map(d => ({
				...d,
				value: d[rankingType]
			}));

		processedData.sort((a, b) => b.value - a.value);

		const topData = processedData.slice(0, 5);

		this.y.domain(topData.map(d => d.city));
		this.x.domain([0, d3.max(topData, d => d.value)]);

		// Update bars
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

		// Update labels
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
			.attr("x", d => (this.x(d.value) <= 35 ? this.x(d.value) + 5 : this.x(d.value) - 5))
			.style("fill", d => (this.x(d.value) <= 35 ? "black" : "white")) // Pas de kleur aan afhankelijk van de breedte van de balk
			.style("text-anchor", d => (this.x(d.value) <= 35 ? "start" : "end"))
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
			.attr("dx", "-6em")
			.text(d => {
				// Truncate text to a maximum of 20 characters
				const maxLength = 15;
				const text = d.toString();
				return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
			})
			.each(function(d) {
				d3.select(this).style("transform", `translateX(-43px)`);
			});

		// Update chart title
		this.chartTitle
			.transition()
			.duration(500)
			.style("opacity", 0.5)
			.on("end", () => {
				this.chartTitle
					.text(this.immigration ? "Top 5 coming in from" : "Top 5 going out to")
					.transition()
					.duration(500)
					.style("opacity", 1);
			});
	}
}
