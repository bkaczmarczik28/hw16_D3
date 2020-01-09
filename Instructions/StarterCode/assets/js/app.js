// Define SVG area dimensions
var svgWidth = 900;
var svgHeight = 600;

//Define the chart's margins as an object - space between the chart and teh full svg file
var chartMargin = {
    top: 20,
    right: 30,
    bottom: 100,
    left: 100
};

//Define the dimensions of the chart area from our desired margins and total svg dimensions
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

//Select body, append svg area to it and set the dimensions
var svg = d3.select("#scatter")
            .append('svg')
            .attr("height", svgHeight)
            .attr("width", svgWidth);

//Appending group element to center graph in the svg element
var chartGroup = svg.append("g")
                    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Initial Parameters for what will first appear when page is loaded
var chosenXAxis = "age";
var chosenYAxis = "smokes";

// function to scale the x-axis depending on chosen axis from click event
function XScale(censusData, chosenAxis) {

    // extending scale range 5% of min/max to optimize chart space without having data go over axis
    var min = d3.min(censusData, d => d[chosenAxis]);
    var max = d3.max(censusData, d => d[chosenAxis]);

	var xLinearScale = d3.scaleLinear()
    .domain([(min-min*0.05), (max+max*0.05)])
    .range([0, chartWidth]);

    return xLinearScale;
}

// function to scale the y-axis depending on chosen axis from click event
function YScale(censusData, chosenAxis) {

    // extending scale range by 10$ to optimize chart space without having data go over axis
    var min = d3.min(censusData, d => d[chosenAxis]);
    var max = d3.max(censusData, d => d[chosenAxis]);

	var yLinearScale = d3.scaleLinear()
		.domain([(min-min*0.25), (max+max*0.1)])
        .range([chartHeight, 0]);

    return yLinearScale;
}

// function used to update x-axis upon click event
function renderXAxes (newXScale, xAxis) {

    var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
        .duration(100)
        .call(bottomAxis);
    
    return xAxis;
}

// function used to update x-axis upon click event
function renderYAxes (newYScale, yAxis) {

    var leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
        .duration(100)
        .call(leftAxis);
    
    return yAxis;
}

// function to update circles presented data based on selected x-axis from click event
function renderCirclesX(chartGroup, newXScale, chosenXAxis) {

    chartGroup.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    
    return chartGroup;        
}

// function to update abbreviations presented data based on selected x-axis from click event
function renderStateAbbrX(textGroup, xLinearScale, chosenXAxis) {

    console.log("Inside the renderStateAbbrX function");
    console.log(chosenXAxis);
    console.log(xLinearScale)

    textGroup.selectAll()
        .transition()
        .duration(1)
        .attr("x", d => xLinearScale(d[chosenXAxis]));
    
    return textGroup;        
}

// // function to update presented data based on selected y-axis from click event
function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup        
}

// function used for updating circle group with tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup){

    // update labels for tooltip
	    if (chosenXAxis === "age") {
            var xlabel = "Median Age (years): ";
        }
        else if (chosenXAxis === "income") {
            var xlabel = "Median Household Income: $";
        }
        else if (chosenXAxis === "poverty") {
            var xlabel = "Poverty (%): ";
        };

    // update labels for tooltip
    	if (chosenYAxis === "obese") {
            var ylabel = "Obesity (%): ";
        }
        else if (chosenYAxis === "smokes") {
            var ylabel = "Smoking (%): ";
        }
        else if (chosenYAxis === "healthcare") {
            var ylabel = "Lacks Healthcare (%): ";
        };

        // console.log(chosenYAxis)
        // console.log(chosenXAxis)

        // create updated tooltip
        // reference d3Style class d3 - tip
        var toolTip = d3.tip() 
            .attr("class", "d3-tip")
            .offset([80, 60])
            .html(function(d) {
            return (`${d.state}
                    <br>${xlabel}${d[chosenXAxis]}
                    <br>${ylabel}${d[chosenYAxis]}`
                    ); 
        });

        // console.log(circlesGroup)
        
        circlesGroup.call(toolTip); //have to call the tooltip - chocolate cake recipe
        
        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data, this);
        });
        
        return circlesGroup;
}
    

//import csv data
d3.csv("assets/data/data.csv").then(function(censusData, err) 
{
    if (err) throw err;

    //confirms the data was loaded
    // console.log(censusData); 

    // convert string csv data into integers
    // comparing age vs. smokers
    //parse data
    censusData.forEach(function(data)
    {
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.poverty = +data.poverty;
        data.income = +data.income;
        data.healthcare = +data.healthcare; 
        data.obesity = +data.obesity;
    });


    // initialize x-scale and y-scale
    var xLinearScale = XScale(censusData, chosenXAxis);
    var yLinearScale = YScale(censusData, chosenYAxis);

    // Create axis functions 
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axis to chart
    var xAxis = chartGroup.append("g")
		.attr("transform", `translate(0, ${chartHeight})`)
		.call(bottomAxis);
    
    var yAxis = chartGroup.append("g")
		.call(leftAxis);

    //Create circles for data - map to census data and append
    //initial graph will be age vs. smoking %
	var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.age))
        .attr("cy", d => yLinearScale(d.smokes))
        .attr("r", "18")
        .attr("fill", "rgba(176,233,241)")
        .attr("opacity", "1");

 
    // Append state abbreviations to the group element
    //can't bind to "text", can use p and null to have all abbr show
    var textGroup = chartGroup.selectAll('p')
        .data(censusData)
        .enter()
        .append('text')
        .text(function(d){return d.abbr})
        .attr("x", d => xLinearScale(d.age))
        .attr("y", d => yLinearScale(d.smokes))
        .attr("text-anchor", "middle")
        .attr("dy", ".35em") //text-anchor needs to be shifted slighly to fall center the circles
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr('fill', 'black');


     //Create group for x-axis and y-axis labels
    var labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top})`)
        .style("text-anchor", "middle");
    
    // Create labels for x-axis
    var ageXlabel= labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Median Age (years)");

    var povertyXlabel= labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "poverty")
        .classed("inactive", true)
        .text("In Poverty (%)");

    var incomeXlabel= labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Median Household Income ($)");

    var labelsYGroup = chartGroup.append("g")
        .attr("transform", 'rotate(-90)')
        .attr("x", (0 - (svgHeight/2)))
        .attr("y", (0 - (chartMargin.left)/2));

    // //Create labels for y-axis
    //(0,0 coordinate is shifted due to rotation -90)
    var smokesYlabel= labelsYGroup.append("text")
        .attr("x", -(chartHeight/2))
        .attr("y", -40)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var obeseYlabel= labelsYGroup.append("text")
        .attr("x", -(chartHeight/2))
        .attr("y", -60)
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");

    var healthcareYlabel= labelsYGroup.append("text")
        .attr("x", -(chartHeight/2))
        .attr("y", -80)
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

 // updateToolTip function above csv import
 var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

 // x axis labels event listener
 labelsXGroup.selectAll("text")
   .on("click", function() {

     // get value of selection
     var value = d3.select(this).attr("value");

     if (value !== chosenXAxis) {

       // replaces chosenXAxis with value
       chosenXAxis = value;
        
       console.log("Change X-axis to "+chosenXAxis)

       // updates x scale for new data
       xLinearScale = XScale(censusData, chosenXAxis);

       // updates x axis with transition
       xAxis = renderXAxes(xLinearScale, xAxis);

       // updates circles with new x values
       chartGroup = renderCirclesX(chartGroup, xLinearScale, chosenXAxis);

       //update state abbreviations with new x values
       textGroup = renderStateAbbrX(textGroup, xLinearScale, chosenXAxis);

        // update tooltip
       circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

       // changes classes to change bold text
       if (chosenXAxis === "age") {
        ageXlabel
           .classed("active", true)
           .classed("inactive", false);
        povertyXlabel
           .classed("active", false)
           .classed("inactive", true);
        incomeXlabel
           .classed("active", false)
           .classed("inactive", true);
       }
       else if (chosenXAxis === "poverty") {
        povertyXlabel
           .classed("active", true)
           .classed("inactive", false);
        ageXlabel
           .classed("active", false)
           .classed("inactive", true);
        incomeXlabel
           .classed("active", false)
           .classed("inactive", true);
       }
       else {
        incomeXlabel
            .classed("active", true)
            .classed("inactive", false);
        ageXlabel
            .classed("active", false)
            .classed("inactive", true);
        povertyXlabel
            .classed("active", false)
            .classed("inactive", true);
       }
    }

   }); //end of click function handle for x-axis


// y axis label event listener
labelsYGroup.selectAll("text")
    .on("click", function() {

    // get value of selection
    var value = d3.select(this).attr("value");

    if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        console.log("Change Y-axis to "+chosenYAxis)

        // updates x scale for new data
        yLinearScale = YScale(censusData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);

        // // updates tooltips with new x-axis
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
        obeseYlabel
            .classed("active", true)
            .classed("inactive", false);
        smokesYlabel
            .classed("active", false)
            .classed("inactive", true);
        healthcareYlabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
        smokesYlabel
            .classed("active", true)
            .classed("inactive", false);
        obeseYlabel
            .classed("active", false)
            .classed("inactive", true);
        healthcareYlabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
        healthcareYlabel
            .classed("active", true)
            .classed("inactive", false);
        obeseYlabel
            .classed("active", false)
            .classed("inactive", true);
        smokesYlabel
            .classed("active", false)
            .classed("inactive", true);
        }
    }

    }); //end of click function handle

}).catch(function(error) {
	console.log(error);
});