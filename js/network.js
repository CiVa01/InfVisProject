// Class that represents all municipalities and branches as a network
// Not visible in its entirety, a backend representation
// Network visualisations between municipalites is based on this
// To-do:
// WrangleData()
// CreateVis()

class network {
    constructor(data) {
        this.data = data;

        wrangleData();
    }


}

function wrangleData() {
    data = this.data;

    //filter the data so all edges with no people moving between them, are thrown out.
    let filteredData = data.filter(data => data.AmountOfPeople > 0)
    console.log(filteredData);
    //Create the network
    const nodes = {};
       const links = filteredData.map(d => {
        // Ensure both RegionFromID and RegionToID exist as nodes
        if (!nodes[d.RegionFromID]) {
            nodes[d.RegionFromID] = { id: d.RegionFromID, name: d.RegionFromName };
        }
        if (!nodes[d.RegionToID]) {
            nodes[d.RegionToID] = { id: d.RegionToID, name: d.RegionToName };
        }
    })
}