class SvgLoader {
	constructor(idToNameMapping, url) {
		this.idToNameMapping = idToNameMapping;
		this.url = url;
	}

	loadMap(){
		fetch(this.url)
			.then(response => response.text)
			.then(svgContent => )
	}


}
