//const json = require('./clientJSON');

//function buildGraph(json) {


function updateGraph() {
  var request = new XMLHttpRequest();
  request.responseType = 'json';
  
  request.open("GET", "http://192.168.43.234:8080/ariadata/waste");
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  
  request.onload = function() {
    var data = request.response;

    //buildGraph(json);
    //data.forEach(function(d) {
    //  d.data_date = new Date(d.data_date);
    //})
    
    var dataByDate = d3.nest()
      .key(function(d) {return d.data_date; })
      .key(function(d) {return d.data_value; })
      .rollup(function(v) { return v.length;})
    .object(data);
    
    //var dataByDatePerValue = d3.nest().key(function(d) { return d.data_value; }).rollup(function(v) { return v.length; }).entries(data);
    
    graphPage.innerHTML = graphPage.innerHTML + JSON.stringify(dataByDate) + "<br/>";
    
    var data = [
    {date: '2018-03-25', Pee: dataByDate['2018-03-25']['1'], Mixed: dataByDate['2018-03-25']['2'], Poop: dataByDate['2018-03-25']['3']},
    {date: '2018-03-26', Pee: dataByDate['2018-03-26']['1'], Mixed: dataByDate['2018-03-26']['2'], Poop: dataByDate['2018-03-26']['3']},
      {date: '2018-03-27', Pee: dataByDate['2018-03-27']['1'], Mixed: dataByDate['2018-03-27']['2'], Poop: dataByDate['2018-03-27']['3']},
      {date: '2018-03-28', Pee: dataByDate['2018-03-28']['1'], Mixed: dataByDate['2018-03-28']['2'], Poop: dataByDate['2018-03-28']['3']},
      {date: '2018-03-29', Pee: dataByDate['2018-03-29']['1'], Mixed: dataByDate['2018-03-29']['2'], Poop: dataByDate['2018-03-29']['3']}
    ];
 
var xData = ["Pee", "Mixed", "Poop"];
 
var margin = {top: 20, right: 160, bottom: 35, left: 30};

var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
 
var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .35);
 
var y = d3.scale.linear()
        .rangeRound([height, 20]);
 
var color = d3.scale.category20();
 
var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
 
//var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

var svg = d3.select("body").append("svg")
        .attr("width", 800)
        .attr("height", 800)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
var dataIntermediate = xData.map(function (c) {
    return data.map(function (d) {
        return {x: d.date, y: d[c]};
    });
});
 
var dataStackLayout = d3.layout.stack()(dataIntermediate);
 
x.domain(dataStackLayout[0].map(function (d) {
    return d.x;
}));
 
y.domain([0,
    d3.max(dataStackLayout[dataStackLayout.length - 1],
            function (d) { return d.y0 + d.y;})
    ])
  .nice();
 
var layer = svg.selectAll(".stack")
        .data(dataStackLayout)
        .enter().append("g")
        .attr("class", "stack")
        .style("fill", function (d, i) {
            return color(i);
        });
 
layer.selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return x(d.x);
        })
        .attr("y", function (d) {
            return y(d.y + d.y0);
        })
        .attr("height", function (d) {
            return y(d.y0) - y(d.y + d.y0);
        })
        .attr("width", x.rangeBand());
 
svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    
  };
  // receive the collected data as JSON
  request.send(null);
}