class infoChart {
	constructor({container, dataPath, chartId}) {
		this.chartId = chartId; // Unique ID for this chart
		this.container = container;

		this.optionsData = []; // Om de optiesData op te slaan
		this.makeDropdown();
		this.loadData(dataPath);
	}

	async makeDropdown() {
		// Fetch CSV data
		const response = await fetch("data/municipalities.csv");
		const csvText = await response.text();

		// Parse CSV data into rows and extract city names and population
		const rows = csvText.split("\n");
		this.optionsData = rows
			.map(row => {
				const columns = row.split(",").map(col => col.trim()); // Split de rij in kolommen
				return {
					city: columns[0], // Stadnaam (eerste kolom)
					population: parseInt(columns[1]) // Populatie (tweede kolom)
				};
			})
			.filter(data => data.city !== "city" && data.city !== ""); // Filter de header en lege rijen

		// Create a new <select> element
		const dropdown = document.createElement("select");
		dropdown.id = this.chartId + "-dropdown"; // Unique ID for this dropdown
		dropdown.classList.add("minimal-dropdown"); // Add a custom class for styling

		// Add default option with placeholder text
		const defaultOption = document.createElement("option");
		defaultOption.textContent = "Click here to select a municipality...";
		defaultOption.value = ""; // Empty value to indicate no selection
		defaultOption.disabled = true; // Make sure this option cannot be selected
		defaultOption.selected = true; // Make this the default selected option
		dropdown.appendChild(defaultOption); // Append default option to the dropdown

		// Loop through optionsData and create <option> elements dynamically
		this.optionsData.forEach(option => {
			const optionElement = document.createElement("option");
			optionElement.textContent = option.city; // Text shown in the dropdown
			optionElement.value = option.city; // Value for the dropdown
			dropdown.appendChild(optionElement); // Append option to the dropdown
		});

		// Append the dropdown to the container of the chart
		document.querySelector(this.container).appendChild(dropdown);

		// Listen for changes on the dropdown
		dropdown.addEventListener("change", () => {
			const selectedCity = dropdown.value; // Get the selected value
			this.selectData(selectedCity); // Pass the selected city to your CSV processing function
		});
	}



	loadData(dataPath) {
		d3.csv(dataPath, row => {
			row.AmountOfPeople = +row.AmountOfPeople;  // Dit is goed, omdat AmountOfPeople een numerieke waarde is

			return row;
		}).then(csv => {
			this.data = csv;
		});
	}

	selectData(targetCity) {
		const result = {};
		let totalPeopleFrom = 0;
		let totalPeopleTo = 0;

		// Check if the city exists in optionsData to get the population
		const getPopulation = (cityName) => {
			const cityData = this.optionsData.find(option => option.city === cityName);
			return cityData ? cityData.population : 0; // Return population or 0 if not found
		};

		// Process the CSV data from this.data
		this.data.forEach(row => {
			const regionToName = row.RegionToName;
			const amountOfPeople = row.AmountOfPeople;
			const regionFromName = row.RegionFromName;

			// If the target city is the "to" city, add to the peopleTo count for the regionFromName
			if (regionToName === targetCity) {
				if (!result[regionFromName]) {
					result[regionFromName] = {
						city: regionFromName,
						peopleFrom: 0,
						peopleTo: 0,
						population: getPopulation(regionFromName) // Add population for this city
					};
				}
				result[regionFromName].peopleFrom += amountOfPeople; // People are coming *to* the target city
				totalPeopleTo += amountOfPeople;
			}

			// If the target city is the "from" city, add to the peopleFrom count for the regionToName
			if (regionFromName === targetCity) {
				if (!result[regionToName]) {
					result[regionToName] = {
						city: regionToName,
						peopleFrom: 0,
						peopleTo: 0,
						population: getPopulation(regionToName) // Add population for this city
					};
				}
				result[regionToName].peopleTo += amountOfPeople; // People are going *from* the target city
				totalPeopleFrom += amountOfPeople; // Keep track of total people leaving the city
			}
		});

		// Zoek de populatie van de geselecteerde stad in optionsData
		const selectedCityData = this.optionsData.find(option => option.city === targetCity);
		const selectedPopulation = selectedCityData ? selectedCityData.population : 0;

		// Voeg de populatie toe aan de selectedData
		const selectedData = {
			cityData: Object.values(result),
			totals: {
				totalPeopleFrom,
				totalPeopleTo,
				population: selectedPopulation // Voeg de populatie toe aan de totals
			}
		};

		// Create or update the display for the selected city's data
		this.displayCityData(selectedData);
	}


	displayCityData(cityData) {
		// Check if the container already exists

		console.log(cityData);

		let cityDataContainer = document.getElementById(this.chartId + "-information");
		let toggleButton = document.getElementById(this.chartId + "-toggle");
		let graphContainer = document.getElementById(this.chartId + "-graph-container");

		// If the container doesn't exist, create it
		if (!cityDataContainer) {
			cityDataContainer = document.createElement("div");
			cityDataContainer.id = this.chartId + "-information"; // Unique ID for this display container
			document.querySelector(this.container).appendChild(cityDataContainer);
		}

		// If the toggle button doesn't exist, create it
		if (!toggleButton) {
			toggleButton = document.createElement("button");
			toggleButton.id = this.chartId + "-toggle"; // Unique ID for the toggle button
			toggleButton.textContent = "^"; // Button text
			toggleButton.style.marginTop = "10px";
			document.querySelector(this.container).appendChild(toggleButton);

			// Add event listener for the toggle button
			toggleButton.addEventListener("click", () => {
				const isHidden = graphContainer.style.display === "none";
				graphContainer.style.display = isHidden ? "block" : "none";
			});
		}

		// If the graph container doesn't exist, create it
		if (!graphContainer) {
			graphContainer = document.createElement("div");
			graphContainer.id = this.chartId + "-graph-container"; // Unique ID for the graph container
			document.querySelector(this.container).appendChild(graphContainer);
		} else {
			// Empty the existing graph container before adding a new graph
			graphContainer.innerHTML = "";
		}

		// Create the bar chart here
		new BarChart2({
			container: "#" + this.chartId + "-graph-container", // Dynamically generated container
			data: cityData.cityData, // Path to your CSV data
			chartId: this.chartId
		});

		// Display the updated information in the container
		cityDataContainer.innerHTML = `Total coming in <b>${cityData.totals.totalPeopleTo}</b> <br> Total going out <b> ${cityData.totals.totalPeopleFrom}</b> <br> Population <b> ${cityData.totals.population}</b>`;
		cityDataContainer.style.display = "block"; // Ensure it's visible when updated
	}

}
