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

}