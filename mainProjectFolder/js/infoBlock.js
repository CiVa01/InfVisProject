class infoBlock {
	constructor(chartId, container, city, collapsed) {
		this.city = city;
		this.chartId = chartId;
		this.container = container;
		this.blockContainer = [];
		this.datapath = "data/data_final.csv";
		this.municipalityDataPath = "data/municipalities.csv";
		this.optionsData = [];
		this.data = [];
		this.createContainer();
		this.init();
		this.style = collapsed ? 'none' : 'block';
	}

	// Verantwoordelijk voor het laden van de data en het aanroepen van makeDropdown
	async init() {
		await this.loadData(this.datapath); // Laad de gegevens van data_final.csv
		await this.loadMunicipalityData(this.municipalityDataPath); // Laad de gegevens van municipalities.csv
		// this.makeDropdown(); // Maak de dropdown nadat de data is geladen

		// document.addEventListener("change", (event) => {
		// 	if (event.target.matches("select")) {
		// 		console.log('selected something');
		// 		// updateVis();
		// 	}
		// });

		this.selectData(this.city)
	}

	// Functie voor het creëren van de container
	createContainer() {
		this.blockContainer = document.createElement("div");
		this.blockContainer.id = this.chartId + "-container"; // Uniek ID
		this.blockContainer.classList.add("info-block"); // Voeg styling toe indien nodig
		document.querySelector(this.container).appendChild(this.blockContainer);
	}

	// Laad de hoofdgegevens uit het data_final.csv bestand
	async loadData(dataPath) {
		const csv = await d3.csv(dataPath, (row) => {
			row.AmountOfPeople = +row.AmountOfPeople;  // Zorg dat AmountOfPeople een numerieke waarde is
			return row;
		});
		this.data = csv;
	}

	// Laad de gegevens van de gemeentelijst (municipalities.csv)
	async loadMunicipalityData(dataPath) {
		const response = await fetch(dataPath);
		const csvText = await response.text();

		// Verwerk de CSV naar een bruikbare vorm
		const rows = csvText.split("\n");
		this.optionsData = rows
			.map((row) => {
				const columns = row.split(",").map((col) => col.trim());
				return {
					city: columns[0],
					population: parseInt(columns[1]),
				};
			})
			.filter((data) => data.city !== "city" && data.city !== ""); // Verwijder de header en lege rijen
	}

	// Maak de dropdown met de gemeentelijst
	makeDropdown() {
		const dropdown = document.createElement("select");
		dropdown.id = this.chartId + "-dropdown"; // Uniek ID voor deze dropdown
		dropdown.classList.add("minimal-dropdown");

		const defaultOption = document.createElement("option");
		defaultOption.textContent = "Select a municipality...";
		defaultOption.value = "";
		defaultOption.disabled = true;
		defaultOption.selected = true;
		dropdown.appendChild(defaultOption);

		this.optionsData.forEach((option) => {
			const optionElement = document.createElement("option");
			optionElement.textContent = option.city;
			optionElement.value = option.city;
			dropdown.appendChild(optionElement);
		});

		this.blockContainer.appendChild(dropdown);

		dropdown.addEventListener("change", () => {
			const selectedCity = dropdown.value;
			this.selectData(selectedCity); // Verwerk de selectie
		});
	}

	// Verwerk de geselecteerde stad en update de gegevens
	selectData(selectedCity) {
		const result = {};
		let totalPeopleFrom = 0;
		let totalPeopleTo = 0;

		// Functie om de populatie van een stad op te halen
		const getPopulation = (cityName) => {
			const cityData = this.optionsData.find((option) => option.city === cityName);
			return cityData ? cityData.population : 0;
		};

		// Verwerk de data uit de main CSV (data_final.csv)
		this.data.forEach((row) => {
			const {RegionToName, AmountOfPeople, RegionFromName} = row;

			if (RegionToName === selectedCity) {
				if (!result[RegionFromName]) {
					result[RegionFromName] = {
						city: RegionFromName,
						peopleFrom: 0,
						peopleTo: 0,
						population: getPopulation(RegionFromName),
					};
				}
				result[RegionFromName].peopleFrom += AmountOfPeople;
				totalPeopleTo += AmountOfPeople;
			}

			if (RegionFromName === selectedCity) {
				if (!result[RegionToName]) {
					result[RegionToName] = {
						city: RegionToName,
						peopleFrom: 0,
						peopleTo: 0,
						population: getPopulation(RegionToName),
					};
				}
				result[RegionToName].peopleTo += AmountOfPeople;
				totalPeopleFrom += AmountOfPeople;
			}
		});

		const selectedCityData = this.optionsData.find((option) => option.city === selectedCity);
		const selectedPopulation = selectedCityData ? selectedCityData.population : 0;

		const selectedData = {
			cityData: Object.values(result),
			totals: {
				totalPeopleFrom,
				totalPeopleTo,
				population: selectedPopulation,
			},
		};

		this.displayData(selectedData);
	}

	// Toon de gegevens van de geselecteerde stad
	displayData(cityData) {
		let informationContainer = document.getElementById(this.chartId + "-information");

		if (!informationContainer) {
			informationContainer = document.createElement("div");
			informationContainer.classList.add("informationContainer");
			informationContainer.id = this.chartId + "-information";
			this.blockContainer.appendChild(informationContainer);
		} else {
			informationContainer.innerHTML = '';
		}

		informationContainer.innerHTML = `
			<h3>${this.city}</h3>
			<table class="city-data">
				<tr>
					<td>Total coming in</td>
					<td class="bold">${cityData.totals.totalPeopleTo}</td>
				</tr>
				<tr>
					<td>Total going out</td>
					<td class="bold">${cityData.totals.totalPeopleFrom}</td>
				</tr>
				<tr>
					<td>Population</td>
					<td class="bold">${cityData.totals.population}</td>
				</tr>
			</table>`;

		let toggleButton = document.createElement("button");
		toggleButton.id = this.chartId + "-toggle";
		toggleButton.className = 'expandButton iconDown';
		let icon = document.createElement("i");
		icon.className = 'fa-solid fa-angle-up';
		toggleButton.appendChild(icon);
		toggleButton.style.marginTop = "10px";
		informationContainer.appendChild(toggleButton);

		let graphContainer = document.getElementById(this.chartId + "-graph-container");

		if (!graphContainer) {
			graphContainer = document.createElement("div");
			graphContainer.id = this.chartId + "-graph-container";
			this.blockContainer.appendChild(graphContainer);
		} else {
			graphContainer.innerHTML = '';
		}

		graphContainer.style.display = this.style;

		new barChart({
			container: "#" + this.chartId + "-graph-container",
			data: cityData.cityData,
			chartId: this.chartId,
		});

		toggleButton.addEventListener("click", () => {
			toggleButton.classList.toggle("iconUp");
			toggleButton.classList.toggle("iconDown");

			const isHidden = graphContainer.style.display === "none";
			graphContainer.style.display = isHidden ? "block" : "none";
		});
	}

	class

	drawArrow(fromElement, toElement, weight, otherWeight) {
		const svgContainer = document.getElementById("arrowsContainer");

		const svg = d3.select(svgContainer).append("svg")
			.attr("width", svgContainer.clientWidth)
			.attr("height", svgContainer.clientHeight)
			.style("position", "absolute");

		const fromRect = fromElement.blockContainer.getBoundingClientRect();
		const toRect = toElement.blockContainer.getBoundingClientRect();

		const fromX = fromRect.left + fromRect.width / 2;
		const fromY = fromRect.top  + fromRect.height / 2;
		const toX = toRect.left  + toRect.width / 2;
		const toY = toRect.top + toRect.height / 2;

		svg.append("line")
			.attr("x1", fromX)
			.attr("y1", fromY)
			.attr("x2", toX)
			.attr("y2", toY)
			.attr("stroke", "black")
			.attr("stroke-width", weight > 5 ? weight : 5);

		svg.append("line")
			.attr("x1", toX)
			.attr("y1", toY)
			.attr("x2", fromX)
			.attr("y2", fromY)
			.attr("stroke", "red")
			.attr("stroke-width", otherWeight > 5 ? otherWeight : 5);
	}
}

