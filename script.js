document.addEventListener("DOMContentLoaded", function () {
    const svgHeight = 700;
    const svgWidth = 1000;
    const padding = 100;
    const apiUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"

    //create svg canvas
    const svg = d3
      .select("body")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .attr("id", "chart");

    //create a tooltip div
    const tooltip = d3
      .select("#chart")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("display", "none");
  
    //fetch data from the dataset
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (!data) {
          console.error("Error loading data");
          return;
        }
  
        data.forEach(function (d) {
          d.Place = +d.Place;
          var parsedTime = d.Time.split(":");
          d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
        });

        const timeFormat = d3.timeFormat("%M:%S");      
  
        //create x-scale
        const xScale = d3
          .scaleLinear()
          .domain([
            d3.min(data, (d) => d["Year"] - 1),
            d3.max(data, (d) => d["Year"] + 1)
          ])
          .range([padding, svgWidth - padding]);
  
        //create y-scale
        const yScale = d3
          .scaleTime()
          .domain(d3.extent(data, (d) => d["Time"]))
          .range([padding, svgHeight - padding]);
  
        //create x-axis
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
        svg
          .append("g")
          .attr("transform", `translate(0, ${svgHeight - padding})`)
          .attr("id", "x-axis")
          .call(xAxis);
  
        //create y-axis
        const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));
        svg
          .append("g")
          .attr("transform", `translate(${padding}, 0)`)
          .attr("id", "y-axis")
          .call(yAxis);
  
        //create plotting points
        const dots = svg
          .selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", (d) => xScale(d["Year"]))
          .attr("cy", (d) => yScale(d["Time"]))
          .attr("r", 6)
          .attr("class", "dot")
          .attr("data-xvalue", (d) => d["Year"])
          .attr("data-yvalue", (d) => d["Time"].toISOString())
          .attr("fill", (d) => (d["Doping"] === "" ? "green" : "red"));
 
        //mouse move event handler
        dots
          .on("mouseover", function (event, d) {
            const tooltipX = xScale(d["Year"]);
            const tooltipY = yScale(d["Time"]);
  
            tooltip
              .attr("data-year", d["Year"])
              .style("display", "block")
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY - 50}px`)
              .html(
                `${d["Name"] || ""}: ${d["Nationality"] || ""}<br>${
                  d["Year"] || ""
                }, ${timeFormat(d["Time"]) || ""}<br><br>${d["Doping"] || ""}`
              );
          })
          .on("mouseout", function () {
            tooltip.style("display", "none");
          });
  
        //create legend
        const legend = svg
          .append("g")
          .attr("class", "legend")
          .attr("transform", `translate(${svgWidth - 2 * padding}, ${padding})`);
  
        const legendItems = legend
          .selectAll("g")
          .data(["No Doping Allegations", "Doping Allegations"])
          .enter()
          .append("g")
          .attr("transform", (d, i) => `translate(0, ${i * 30})`);
  
        legendItems
          .append("circle")
          .attr("r", 5)
          .attr("fill", (d) => (d === "No Doping Allegations" ? "green" : "red"));
  
        legendItems
          .append("text")
          .attr("x", 10)
          .attr("y", 5)
          .text((d) => d);
      });
  });
  