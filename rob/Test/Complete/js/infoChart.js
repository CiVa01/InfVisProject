class infoChart {
	constructor({container, dataPath, chartId}) {
		this.chartId = chartId; // Unique ID for this chart
		this.container = container;

		this.makeDropdown();
		this.loadData(dataPath);
	}

	async makeDropdown() {
		// Fetch CSV data
		const response = await fetch("data/municipalities.csv");
		const csvText = await response.text();

		// Parse CSV data
		const rows = csvText.split("\n");

		// Clean up the rows, removing any empty strings or whitespace
		const optionsData = rows.map(row => row.trim()).filter(row => row !== "");

		// Create a new <select> element
		const dropdown = document.createElement("select");
		dropdown.id = this.chartId + "-dropdown"; // Unique ID for this dropdown

		// Loop through optionsData and create <option> elements dynamically
		optionsData.forEach(option => {
			const optionElement = document.createElement("option");
			optionElement.textContent = option; // Text shown in the dropdown
			dropdown.appendChild(optionElement); // Append option to the dropdown
		});

		// Append the dropdown to the container of the chart
		document.querySelector(this.container).appendChild(dropdown);

		// Listen for changes on the dropdown
		dropdown.addEventListener('change', () => {
			const selectedCity = dropdown.value; // Get the selected value
			console.log("Selected City:", selectedCity); // This will log the selected city value
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
		console.log(targetCity);
		const result = {};

		// Process the CSV data from this.data
		this.data.forEach(row => {
			const regionToName = row.RegionToName;
			const amountOfPeople = row.AmountOfPeople;
			const regionFromName = row.RegionFromName;

			// If the target city is the "to" city, add to the peopleTo count for the regionFromName
			if (regionToName === targetCity) {
				if (!result[regionFromName]) {
					result[regionFromName] = { city: regionFromName, peopleFrom: 0, peopleTo: 0 };
				}
				result[regionFromName].peopleFrom += amountOfPeople; // People are coming *to* the target city
			}

			// If the target city is the "from" city, add to the peopleFrom count for the regionToName
			if (regionFromName === targetCity) {
				if (!result[regionToName]) {
					result[regionToName] = { city: regionToName, peopleFrom: 0, peopleTo: 0 };
				}
				result[regionToName].peopleTo += amountOfPeople; // People are going *from* the target city
			}
		});

		// Convert the result object into an array to log or further process it
		const formattedResult = Object.values(result);
		console.log(formattedResult); // This will log the cities with their peopleFrom and peopleTo values
	}




}
