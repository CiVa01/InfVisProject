class SvgLoader {

	tooltip = document.getElementById('tooltip');
	constructor(idToNameMapping, url) {
		this.idToNameMapping = idToNameMapping;
		this.url = url;
		console.log(url);
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
			path.addEventListener('mouseover', this.handleMouseOver);
			path.addEventListener('mouseout', this.handleMouseOut);
			path.addEventListener('click', this.handleClick);
		});
	}

	handleMouseOver(event) {
		const path = event.target;
		const id = path.getAttribute('id');
		if (id) {
			// Bounding box van het path ophalen
			const bbox = path.getBoundingClientRect();

			// Tooltip tekst instellen
			this.tooltip.textContent = getNameFromId(id);
			this.tooltip.style.display = 'block';

			// Dynamische positie instellen
			this.tooltip.style.left = `${bbox.left + window.scrollX + bbox.width / 2}px`;
			this.tooltip.style.top = `${bbox.top + window.scrollY}px`;
		}
	}

	handleMouseOut() {
	tooltip.style.display = 'none';
}

	handleClick(event) {
		const path = event.target;

		path.classList.toggle('clicked');
		const index = clickedPaths.indexOf(path);

		if (index === -1) {
			clickedPaths.push(path);
		} else {
			clickedPaths.splice(index, 1);
		}

	}
}
