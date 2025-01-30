class SvgLoader {
	constructor(idToNameMapping, url) {
		this.idToNameMapping = idToNameMapping;
		this.url = url;
		this.selectedPaths = []; // Store clicked paths
		this.tooltip = document.getElementById('tooltip');
	}

	loadMap(){
		fetch(this.url)
			.then(response => response.text())
			.then(data => {
				// Voeg de SVG toe aan de container
				document.getElementById('svgContainer').innerHTML = data;

				// Selecteer alle paths binnen de geladen SVG
				const paths = document.querySelectorAll('#svgContainer path');

				this.addEventListenersToPaths(paths);
			})
			.catch(error => console.error("Error loading SVG:", error));
	}

	addEventListenersToPaths(paths) {
		paths.forEach(path => {
			path.addEventListener('mouseover', this.handleMouseOver.bind(this));
			path.addEventListener('mouseout', this.handleMouseOut.bind(this));
			path.addEventListener('click', this.handleClick.bind(this));
		});
	}

	handleMouseOver(event) {
		const path = event.target;
		const id = path.getAttribute('id');
		if (id) {
			// Bounding box van het path ophalen
			const bbox = path.getBoundingClientRect();

			// Tooltip tekst instellen
			this.tooltip.textContent = this.getNameFromId(id);
			this.tooltip.style.display = 'block';

			// Dynamische positie instellen
			this.tooltip.style.left = `${bbox.left + window.scrollX + bbox.width / 2}px`;
			this.tooltip.style.top = `${bbox.top + window.scrollY}px`;
		}
	}

	handleMouseOut() {
		this.tooltip.style.display = 'none';
	}

	handleClick(event) {
		const path = event.target;
		path.classList.toggle('clicked');

		const index = this.selectedPaths.indexOf(path);

		if (index === -1) {
			this.selectedPaths.push(path);
		} else {
			this.selectedPaths.splice(index, 1);
		}
	}

	// Method to get the list of selected paths
	getSelectedPaths() {
		console.log("fetching paths");
		return this.selectedPaths.map(path => path.getAttribute('id')); // Return an array of path IDs
	}

	getNameFromId(id) {
		let nameObject = this.idToNameMapping[id]; // Access the object using bracket notation
		if (nameObject) {
			console.log(nameObject.name);
			return nameObject.name;
		}
		console.log("ID not found:", id);
		return id; // Return the ID itself if not found
	}
}