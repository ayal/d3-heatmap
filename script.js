console.log(d3);

var margin = { top: 30, right: 30, bottom: 30, left: 30 },
  width = 600,
  height = 200;

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.json("/data.json", function(rawdata) {
  const agg = rawdata.reduce((x, y) => {
    const [datestr, timestr] = y.split("T");
    const [year, month, day] = datestr.split("-");
    const [hour, minute, sec] = timestr.split(":");
    var d = new Date(
      Date.UTC(+year, +month - 1, +day, +hour + 1, +minute, +sec)
    );
    const key =
      d.getUTCHours() + "_" + (d.getUTCDay() === 0 ? 7 : d.getUTCDay());
    x[key] = (x[key] || 0) + 1;
    return x;
  }, {});
  console.log("agg", agg);
  const max = d3.max(Object.values(agg));
  console.log(max);

  const data = Object.keys(agg).map(x => ({
    group: +x.split("_")[0],
    variable: +x.split("_")[1],
    value: +agg[x]
  }));
  console.log("data", data);

  // Labels of row and columns
  var myGroups = d3.range(24);
  var myVars = d3.range(1, 8).reverse();

  // Build X scales and axis:
  var x = d3
    .scaleBand()
    .range([0, width])
    .domain(myGroups)
    .padding(0.01);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Build X scales and axis:
  var y = d3
    .scaleBand()
    .range([height, 0])
    .domain(myVars)
    .padding(0.01);
  svg.append("g").call(d3.axisLeft(y));

  // Build color scale
  const myColor = d3
    .scaleQuantile()
    .domain([1, 5, 25, 85, 250, max])
    .range(colorbrewer.Spectral[5].reverse());

  svg
    .selectAll()
    .data(data, function(d) {
      return d.group + ":" + d.variable;
    })
    .enter()
    .append("circle")
    .attr("cx", function(d) {
      return x(d.group) + 15;
    })
    .attr("cy", function(d) {
      return y(d.variable) + 15;
    })
    .attr("r", 5)
    //.attr("height", y.bandwidth())
    .style("fill", function(d) {
      return myColor(d.value);
    });

  svg.selectAll("circle").on("click", function(d, i) {
    console.log(d);
  });
});
