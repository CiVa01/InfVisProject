class infoBlock {
	constructor(chartId, container) {
		this.chartId = chartId;
		this.container = container;
		this.blockContainer =  []
		this.datapath = "data/data_final.csv"
		this.optionsData = []; // Om de optiesData op te slaan

		this.createContainer();
		this.init();
	}

	init(){
		this.loadData(this.datapath);
		this.makeDropdown();


		document.addEventListener("change", function(event) {
			if (event.target.matches("select")) {
				console.log('selected something')
				updateVis();
			}
		});
	}


	clearContainer() {
		// Vind het container-element met de unieke ID
		let container = document.getElementById(this.chartId + "-container");

		if (container) {
			// Maak de inhoud van de container leeg
			container.innerHTML = '';
		} else {
			console.error("Container niet gevonden: " + this.chartId + "-container");
		}
	}

	createContainer() {
		this.blockContainer = document.createElement("div");
		this.blockContainer.id = this.chartId + "-container"; // Uniek ID
		this.blockContainer.classList.add("info-block"); // Voeg styling toe indien nodig
		document.querySelector(this.container).appendChild(this.blockContainer);
	}


	loadData(dataPath) {
		d3.csv(dataPath, row => {
			row.AmountOfPeople = +row.AmountOfPeople;  // Dit is goed, omdat AmountOfPeople een numerieke waarde is

			return row;
		}).then(csv => {
			this.data = csv;
		});
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
		defaultOption.textContent = "Select a municipality...";
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
		this.blockContainer.appendChild(dropdown);

		// Listen for changes on the dropdown
		dropdown.addEventListener("change", () => {
			const selectedCity = dropdown.value; // Get the selected value
			console.log(selectedCity,dropdown);
			this.selectData(selectedCity); // Pass the selected city to your CSV processing function
		});
	}

	selectData(selectedCity) {
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
			if (regionToName === selectedCity) {
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
			if (regionFromName === selectedCity) {
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
		const selectedCityData = this.optionsData.find(option => option.city === selectedCity);
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
		this.displayData(selectedData);
	}


	displayData(cityData) {
		// Find the information container and clear its contents
		let informationContainer = document.getElementById(this.chartId + "-information");

		if (!informationContainer) {
			informationContainer = document.createElement("div");
			informationContainer.classList.add("informationContainer");

			informationContainer.id = this.chartId + "-information"; // Unique ID for this display container
			this.blockContainer.appendChild(informationContainer);
		} else {
			// Clear the contents of the information container
			informationContainer.innerHTML = '';
		}

		// Update the information container with the new data
		informationContainer.innerHTML = `
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

		// Create the toggle button
		let toggleButton = document.createElement("button");
		toggleButton.id = this.chartId + "-toggle";
		toggleButton.className = 'expandButton iconUp'; // Voeg iconUp toe als default
		let icon = document.createElement("i");
		icon.className = 'fa-solid fa-angle-up';
		toggleButton.appendChild(icon);
		toggleButton.style.marginTop = "10px";
		informationContainer.appendChild(toggleButton);


		// Find the graph container and clear its contents
		let graphContainer = document.getElementById(this.chartId + "-graph-container");

		if (!graphContainer) {
			graphContainer = document.createElement("div");
			graphContainer.id = this.chartId + "-graph-container"; // Unique ID for the graph container
			this.blockContainer.appendChild(graphContainer);
		} else {
			// Clear the contents of the graph container
			graphContainer.innerHTML = '';
		}

		graphContainer.style.display = "block";

		// Create or update the graph
		new barChart({
			container: "#" + this.chartId + "-graph-container", // Dynamically generated container
			data: cityData.cityData, // Path to your CSV data
			chartId: this.chartId
		});

		// Add event listener for toggling class and visibility
		toggleButton.addEventListener("click", () => {
			// Toggle rotation classes
			toggleButton.classList.toggle("iconUp");
			toggleButton.classList.toggle("iconDown");

			// Toggle visibility of graphContainer
			const isHidden = graphContainer.style.display === "none";
			graphContainer.style.display = isHidden ? "block" : "none";
		});
	}

}
