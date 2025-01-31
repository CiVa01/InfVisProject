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
        edges.sort((a, b) => b.weight - a.weight);

        // Only show lines to the 10 most popular destinations
        let topEdges = edges.slice(0, 10);

        let targetIds = new Set(topEdges.map(edge => edge.target));
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

        // Calculate the total outgoing weight
        let totalWeight = topEdges.reduce((sum, edge) => sum + edge.weight, 0);

        // Loop through each edge and draw a line
        topEdges.forEach(edge => {
            let targetid = edge.target;

            let path = allPaths.filter(path => path.getAttribute('id') === targetid)[0];

            if(path) {
                let targetBBox = path.getBBox();
                let targetX = targetBBox.x + targetBBox.width / 2;
                let targetY = targetBBox.y + targetBBox.height / 2;

                // Calculate animation speed based on weight
                let speed = (totalWeight - edge.weight) / totalWeight * 500;

                // Draw the line with a dashed stroke
                let line = g.append("line")
                    .attr("x1", sourceX)
                    .attr("y1", sourceY)
                    .attr("x2", targetX) // Start from sourceX (but we will animate the endpoint)
                    .attr("y2", targetY) // Same for Y
                    .attr("stroke", "black")
                    .attr("stroke-dasharray", "5,5")
                    .attr("stroke-width", 5)
                    .attr("opacity", function () {return Math.max(0.5, 1/edge.weight);})
                    .style("pointer-events", "none");

                // Calculate the line length using Pythagorean theorem (distance between source and target)
                let lineLength = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));

                // Initially, set the stroke-dashoffset to the full line length, so the dashes are hidden
                line.attr("stroke-dashoffset", lineLength)
                    .transition()
                    .duration(((1/speed) * 800000)) // Adjust speed dynamically based on edge weight
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0)
                    .on("end", function repeat() {
                        // Restart the animation after it ends to create a continuous effect
                        d3.select(this)
                            .attr("stroke-dashoffset", lineLength)
                            .transition()
                            .duration(((1/speed) * 800000))
                            .ease(d3.easeLinear)
                            .attr("stroke-dashoffset", 0)
                            .on("end", repeat); // Loop the transition again after it completes
                    }); // Animate the dashoffset to 0, which reveals the moving dashes
            }
        });
    }

    showMore(svgLoader) {
        let sourcePath = svgLoader.selectedPaths[0];
        let id = sourcePath.getAttribute('id');

        let targetPaths = svgLoader.selectedPaths.slice(1);
        let svg = d3.select(sourcePath.closest("svg"));
        let g = svg.append("g").attr("id", "network-lines");

        let sourceBBox = sourcePath.getBBox();
        let sourceX = sourceBBox.x + sourceBBox.width / 2;
        let sourceY = sourceBBox.y + sourceBBox.height / 2;

        g.append("circle")
            .attr("cx", sourceX)
            .attr("cy", sourceY)
            .attr("r", 5)
            .attr("fill", "blue")
            .attr("opacity", "0.6")
            .style("pointer-events", "none");

        targetPaths.forEach(targetPath => {
            let targetId = targetPath.getAttribute('id');
            let targetBBox = targetPath.getBBox();
            let targetX = targetBBox.x + targetBBox.width / 2;
            let targetY = targetBBox.y + targetBBox.height / 2;

            let edgeToTarget = this.network.find(e => e.source === id && e.target === targetId);
            if(edgeToTarget) {
                let speedToTarget = Math.min(1000, Math.max(0.5, 200000 / edgeToTarget.weight));

                let controlX1 = (sourceX + targetX) / 2;
                let controlY1 = Math.min(sourceY, targetY) - 40;

                let pathOutward = g.append("path")
                    .attr("d", `M${sourceX},${sourceY} Q${controlX1},${controlY1} ${targetX},${targetY}`)
                    .attr("fill", "none")
                    .attr("fill-opacity", 0)
                    .attr("stroke-dasharray", "5,5")
                    .attr("opacity", 0.8)
                    .attr("stroke-linecap", "round")
                    .style("pointer-events", "none")
                    .style("stroke", "gold")  // Using .style to apply stroke color
                    .style("stroke-width", function() {
                        return  Math.min(10, Math.max(1, edgeToTarget.weight * 0.2));
                    });;

                animateDashedLine(pathOutward, speedToTarget);
            }

            let edgeToSource = this.network.find(e => e.source === targetId && e.target === id);
            if (edgeToSource) {
                let speedToSource = Math.min( 1000, Math.max(0.5, 200000 / edgeToSource.weight));

                let controlX2 = (sourceX + targetX) / 2;
                let controlY2 = Math.max(sourceY, targetY) + 40;

                let pathReturn = g.append("path")
                    .attr("d", `M${targetX},${targetY} Q${controlX2},${controlY2} ${sourceX},${sourceY}`)
                    .attr("fill", "none")
                    .attr("fill-opacity", 0)
                    .attr("stroke-dasharray", "5,5")
                    .attr("opacity", 0.8)
                    .attr("stroke-linecap", "round")
                    .style("pointer-events", "none")
                    .style("stroke", "darkblue")  // Using .style to apply stroke color
                    .style("stroke-width", function() {
                        return Math.min(200000, Math.max(3, edgeToSource.weight * 0.2));
                    });

                animateDashedLine(pathReturn, speedToSource);
            }
        });

        function animateDashedLine(path, speed) {
            let totalLength = path.node().getTotalLength();
            path.attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(speed) // Weight now controls speed correctly
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .on("end", () => animateDashedLine(path, speed)); // Continuous animation
        }
    }

    stop() {
        // Select the parent SVG
        let svg = d3.select("svg");

        // Remove the group containing all the visualizations
        svg.select("#network-lines").remove(); // Remove all lines, circles, and animations
    }

}