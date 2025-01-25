// TODO: move this functionality to the network class

// lineDrawer.js

const clickedPaths = [];
const svgContainer = document.getElementById('svgContainer');

// SVG namespace
const SVG_NS = 'http://www.w3.org/2000/svg';

function drawLinesBetweenPaths() {
	// Verwijder bestaande lijnen
	const linesGroup = document.getElementById('linesGroup') || createLinesGroup();

	while (linesGroup.firstChild) {
		linesGroup.removeChild(linesGroup.firstChild);
	}

	// Teken lijnen tussen alle aangeklikte paths
	for (let i = 0; i < clickedPaths.length - 1; i++) {
		for (let j = i + 1; j < clickedPaths.length; j++) {
			const path1 = clickedPaths[i];
			const path2 = clickedPaths[j];
			drawLine(path1, path2, linesGroup);
		}
	}
}

function createLinesGroup() {
	const group = document.createElementNS(SVG_NS, 'g');
	group.setAttribute('id', 'linesGroup');
	svgContainer.querySelector('svg').appendChild(group);
	return group;
}

function drawLine(path1, path2, group) {
	const svg = svgContainer.querySelector('svg');
	const svgPoint = svg.createSVGPoint();

	function getSVGCoordinates(bbox) {
		svgPoint.x = bbox.left + bbox.width / 2;
		svgPoint.y = bbox.top + bbox.height / 2;
		const matrix = svg.getScreenCTM().inverse();
		return svgPoint.matrixTransform(matrix);
	}

	const bbox1 = path1.getBoundingClientRect();
	const bbox2 = path2.getBoundingClientRect();

	const coords1 = getSVGCoordinates(bbox1);
	const coords2 = getSVGCoordinates(bbox2);

	const line = document.createElementNS(SVG_NS, 'line');
	line.setAttribute('x1', coords1.x);
	line.setAttribute('y1', coords1.y);
	line.setAttribute('x2', coords2.x);
	line.setAttribute('y2', coords2.y);

	// Voeg de CSS-klasse 'line' toe
	line.classList.add('line');

	group.appendChild(line);
}



