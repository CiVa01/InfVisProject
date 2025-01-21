let svg = d3.select("body").append("svg")
	.attr("width", 600)
	.attr("height", 200);

// Call visualization with 2 datasets sequentially
updateChart([5, 10, 15]);
updateChart([20, 30]);

function updateChart(data) {
	// Data-join (circle now contains the update selection)
	let circle = svg.selectAll("circle")
		.data(data);

	// Enter (initialize the newly added elements)
	circle.enter().append("circle")
		.attr("class", "dot")
		.attr("fill", "#707086")

		// Enter and Update (set the dynamic properties of the elements)
		.merge(circle)
		.attr("r", d=>d)
		.attr("cx",(d,index)=>(index * 80) + 50 )
		.attr("cy", 80);

	// Exit
	circle.exit().remove();
}