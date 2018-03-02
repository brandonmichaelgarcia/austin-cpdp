d3.csv("/static/data/us-income-inequality.csv", extract_data);
var [label_array, val_array, maxval, sampsize] = [0,0,0,0];


function drawLoop(data){
    [label_array, val_array, maxval, sampsize] = data;

    draw();

    d3.select(window).on("resize", draw);
}


function draw() {
    d3.select('#line-chart').selectAll('*').remove();
    var width = (window.innerWidth > 600) ? 900 : 400;
    var p = 30;
    var  w = width - p*4;
    var  h = 500;

    var x = d3.scale.linear()
                .domain([ label_array[0], label_array[sampsize-1] ])
                .range([0, w]);
    var y = d3.scale.linear()
                .domain([0, maxval])
                .range([h, 0]);

    var vis = d3.select("#line-chart")
                .data([val_array])
                .append("svg:svg")
                .attr("width", w + p *2)
                .attr("height", h + p * 2)
                .append("svg:g")
                .attr("transform", "translate(" + p + "," + p + ")");


    var rules = vis.selectAll("g.rule")
                .data(x.ticks(15))
                .enter().append("svg:g")
                .attr("class", "rule");

    // Draw grid lines
    rules.append("svg:line")
                .attr("x1", x)
                .attr("x2", x)
                .attr("y1", 0)
                .attr("y2", h - 1);

    rules.append("svg:line")
                .attr("class", function(d) { return d ? null : "axis"; })
                .data(y.ticks(10))
                .attr("y1", y)
                .attr("y2", y)
                .attr("x1", 0)
                .attr("x2", w);
;        // Place axis tick labels
    rules.append("svg:text")
                .attr("x", x)
                .attr("y", h + 15)
                .attr("dy", ".71em")
                .attr("text-anchor", "middle")
                .text(x.tickFormat(10))
                .text(String);

    rules.append("svg:text")
                .data(y.ticks(12))
                .attr("y", y)
                .attr("x", -10)
                .attr("dy", ".35em")
                .attr("text-anchor", "end")
                .text(y.tickFormat(5));

    // Series I
    vis.append("svg:path")
                .attr("class", "line")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2)
                .attr("d", d3.svg.line()
                .x(function(d) { return x(d.x); })
                .y(function(d) { return y(d.y); }));

    vis.selectAll("circle.line")
                .data(val_array)
                .enter().append("svg:circle")
                .attr("class", "line")
                .attr("fill", "steelblue" )
                .attr("cx", function(d) { return x(d.x); })
                .attr("cy", function(d) { return y(d.y); })
                .attr("r", 1);

    // -----------------------------
    // Add Title then Legend
    // -----------------------------
    vis.append("svg:text")
                .attr("x", w/4)
                .attr("y", 20)
                .text("% share of income (excluding capital gains): U.S. 1920-2008");

    vis.append("svg:rect")
                .attr("x", w/2 - 20)
                .attr("y", 50)
                .attr("stroke", "steelblue")
                .attr("height", 1)
                .attr("width", 40);

    vis.append("svg:text")
                .attr("x", 30 + w/2)
                .attr("y", 55)
                .text("Top 5% households");
}


function extract_data(data1) { 
    /* Read CSV file: first row =>  year,top1,top5  */
    var maxval = 0;
    var sampsize = 0;
    var label_array = new Array();
    var val_array = new Array();

    sampsize = data1.length;

    for (var i=0; i < sampsize; i++) {
    label_array[i] = parseInt(data1[i].year);
    val_array[i] = { x: label_array[i], y: parseFloat(data1[i].p99), z: parseFloat(data1[i].p95) };
    maxval = Math.max(maxval, parseFloat(data1[i].p99), parseFloat(data1[i].p95) );
    }

    maxval = (1 + Math.floor(maxval / 10)) * 10;   

    drawLoop([label_array, val_array, maxval, sampsize]);
}