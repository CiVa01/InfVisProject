// Class that represents all municipalities and branches as a network
// Not visible in its entirety, a backend representation
// Network visualisations between municipalites is based on this
// To-do:
// WrangleData()
// CreateVis()

class Network {
    network = [];
    regions = {};
    data;

    constructor(data) {
        this.data = data;
        this.wrangleData();
    }

    wrangleData() {
        //Create the network, start with initializing a set of nodes and a list of edges
        const nodes = {};
        let edges = [];
        // Loop over all the data once
        this.data.forEach(d => {
            //Check if the RegionFrom is already a node, if not, create a new node for it, containing the ID and name of the region
            if (!nodes[d.RegionFromID]) {
                nodes[d.RegionFromID] = {
                    id: d.RegionFromID,
                    name: d.RegionFromName,
                };
            }

            // Create an edge object for the data entry
            const edge = {
                source: d.RegionFromID,
                target: d.RegionToID,
                weight: d.AmountOfPeople
            }

            //push the edge to the network
            edges.push(edge);
        });

        this.regions = nodes;
        this.network = edges;
    }

    showOne(svgLoader){
        let path = svgLoader.selectedPaths[0];
        let id = path.getAttribute('id');

        let edges = this.network.filter(edge => edge.source === id);
        console.log(edges);
        let targetIds = new Set(edges.map(edge => edge.target));
        let allPaths = Array.from(svgLoader.allPaths);
        allPaths = allPaths.filter(p => targetIds.has(p.getAttribute('id')));

        // Get the parent SVG and clear old lines
        let svg = d3.select(path.closest("svg"));
        let g = svg.append("g").attr("id", "network-lines");

        // Get source position
        let sourceBBox = path.getBBox();
        let sourceX = sourceBBox.x + sourceBBox.width / 2;
        let sourceY = sourceBBox.y + sourceBBox.height / 2;

        // Draw a small circle to indicate the source
        g.append("circle")
            .attr("cx", sourceX)
            .attr("cy", sourceY)
            .attr("r", 5)
            .attr("fill", "blue")
            .attr("opacity", "0.6")
            .style("pointer-events", "none");

        // Loop through each edge and draw a line
        edges.forEach(edge => {
            let targetid = edge.target;

            let path = allPaths.filter(path => path.getAttribute('id') === targetid)[0];

            if(path) {
                let targetBBox = path.getBBox();
                let targetX = targetBBox.x + targetBBox.width / 2;
                let targetY = targetBBox.y + targetBBox.height / 2;

                // Calculate animation speed based on weight
                let speed = Math.max(0.5, 5 / edge.weight);

                // Draw the line with a dashed stroke
                let line = g.append("line")
                    .attr("x1", sourceX)
                    .attr("y1", sourceY)
                    .attr("x2", targetX) // Start from sourceX (but we will animate the endpoint)
                    .attr("y2", targetY) // Same for Y
                    .attr("stroke", "black")
                    .attr("stroke-dasharray", "5,5")
                    .attr("stroke-width", 2)
                    .attr("opacity", function () {return Math.max(0.1, Math.min(1, 1 / edge.weight));})
                    .style("pointer-events", "none");

                // Calculate the line length using Pythagorean theorem (distance between source and target)
                let lineLength = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));

                // Initially, set the stroke-dashoffset to the full line length, so the dashes are hidden
                line.attr("stroke-dashoffset", lineLength)
                    .transition()
                    .duration(speed * 1000) // Adjust speed dynamically based on edge weight
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0); // Animate the dashoffset to 0, which reveals the moving dashes
            }
        });
    }

    showMore(svgLoader){
        // Identfi
        let path = svgLoader.selectedPaths[0];
        let id = path.getAttribute('id');


    }

    stop() {
        // Select the parent SVG
        let svg = d3.select("svg");

        // Remove the group containing all the visualizations
        svg.select("#network-lines").remove(); // Remove all lines, circles, and animations
    }

}