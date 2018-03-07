var Chart = (function(window,d3) {

    var svg, data, x, y, xAxis, yAxis, dim, chartWrapper, line, path, margin = {}, width, height;
    var breakPoint = 600;
    var chart_id = 0;
    d3.csv('/static/data/ois.csv', init); //load data, then initialize chart

    //called once the data is loaded
    function init(csv) {
        data = csv;

        //initialize scales
        xExtent = d3.extent(data, function(d,i) { return new Date(d.date) });
        yExtent = d3.extent(data, function(d,i) { return d.value });
        zExtent = d3.extent(data, function(d,i) { return d.value2 });
        x = d3.time.scale().domain(xExtent).nice();
        y = d3.scale.linear().domain(yExtent);
        z = d3.scale.linear().domain(zExtent);

        //initialize axis
        xAxis = d3.svg.axis().orient('bottom');
        yAxis = d3.svg.axis();
        zAxis = d3.svg.axis();

        //the path generator for the line chart
        line = d3.svg.line()
            .x(function(d) { return x(new Date(d.date)) })
            .y(function(d) { return y(d.value) });  
        
        line2 = d3.svg.line()
            .x(function(d) { return x(new Date(d.date)) })
            .y(function(d) { return z(d.value2) }); 

        //initialize svg
        svg = d3.select('#chart').append('svg');
        chartWrapper = svg.append('g');
        path = chartWrapper.append('path').datum(data).classed('line', true);
        chartWrapper.append('g').classed('x axis', true);
        chartWrapper.append('g').classed('y axis', true);
        chartWrapper.on('mousemove', identifyMouse)
        
        
        //add locator and text
        locator = chartWrapper.append('circle')
            .attr('r', 10)
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('display', 'none')

        ordinate_label = d3.select("body").append("div")	
            .attr("class", "tooltip")				
            .style("opacity", 0);

        bisect = d3.bisector(function(d){ return d.date; }).left;

        //render the chart
        window.addEventListener('resize', render);
        render();
    }

    function render() {
        updateDimensions(window.innerWidth);
        
        //update x and y scales to new dimensions
        x.range([0, width]);
        y.range([height,0]);
        z.range([height, 0]);

        //update svg elements to new dimensions
        svg
          .attr('width', width + margin.right + margin.left)
          .attr('height', height + margin.top + margin.bottom);
        chartWrapper.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        //update the axis and line
        xAxis.scale(x);
        yAxis.scale(y).orient(window.innerWidth < breakPoint ? 'right' : 'left');
        zAxis.scale(z).orient(window.innerWidth < breakPoint ? 'right' : 'left');

        if(window.innerWidth < breakPoint) {
            xAxis.ticks(d3.time.year, 4)
        }
        else {
            xAxis.ticks(d3.time.year, 2)
        }

        svg.select('.x.axis')
            .attr('transform', 'translate(0,' + height + ')')
            .transition()
            .duration(800)
            .call(xAxis);

        if (chart_id == 0){
            svg.select('.y.axis')
                .transition()
                .duration(800)
                .call(yAxis);
            path.transition()
                .duration(800)
                .attr('d', line);
        } else {
            svg.select('.y.axis')
                .transition()
                .duration(800)
                .call(zAxis);
            path.transition()
                .duration(800)
                .attr('d', line2);
        }

        clearAuxillaryElements();

        chartWrapper.selectAll("circle .dot")	
            .data(data)			
            .enter().append("circle")
                .attr("class", "dot")								
                .attr("r", 4)		
                .attr("cx", function(d) { return x(new Date(d.date)) })		 
                .attr("cy", function(d) { return scaleOrdinate(getOrdinateValue(d))})

        chartWrapper.selectAll("circle .bubble")	
            .data(data)			
            .enter().append("circle")
                .attr("class", "bubble")									
                .attr("r", 15)		
                .attr("cx", function(d) { return x(new Date(d.date)) })		 
                .attr("cy", function(d) { return scaleOrdinate(getOrdinateValue(d))})
                .style("opacity", 0)	
                .on("mouseover", function(d) {		
                    ordinate_label	
                        .style("opacity", .9);		
                    ordinate_label.html(d.date + ": <br>" + getOrdinateValue(d))	
                        .style("left", (d3.event.pageX) + "px")		
                        .style("top", (d3.event.pageY) + "px");	
                    })					
                .on("mouseout", function(d) {		
                    ordinate_label	
                        .style("opacity", 0);	
                });
        
        d3.select(window).on("load",slideshow);
        d3.select("#chart_id").on("change",changeChart);
    }


    function updateDimensions(winWidth) {
        margin.top = 40;
        margin.right = (winWidth < breakPoint) ? 20 : 80;
        margin.left = (winWidth < breakPoint) ? 10 : 50;
        margin.bottom = 50;

        width = (winWidth > breakPoint) ? 750 - margin.left - margin.right : 350 - margin.left - margin.right;
        height = 0.55*width;
    }

    function clearAuxillaryElements(){
        locator.attr('display', 'none');
        var dots = chartWrapper.selectAll(".dot");
        dots.transition()
        .duration(300)
        .remove();
        var bubbles = chartWrapper.selectAll(".bubbles");
        bubbles.remove();
    }

    function identifyMouse(){
        var YEAR_START = 1900;
        var coordinates = d3.mouse(this);
        var xPos = adjustYear(x.invert(coordinates[0]));
        var pos = bisect(data, xPos);
        locator
            .attr('cx', x(new Date(data[pos].date)))
            .attr('cy', scaleOrdinate(getOrdinateValueByPosition(pos)))
            .attr('display', 'block');
    }

    function adjustYear(xPos){
        var YEAR_START = 1900;
        xPos = (xPos.getMonth() + 1 > 6) ? xPos.getYear() + 1 : xPos.getYear();
        xPos += YEAR_START;
        return xPos;
    }

    function getOrdinateValue(d){
        if (chart_id == 0){
            return d.value;
        } else {
            return d.value2;
        }
    }

    function getOrdinateValueByPosition(pos){
        if (chart_id == 0){
            return data[pos].value;
        } else {
            return data[pos].value2;
        }
    }

    function scaleOrdinate(ordinate_value){
        if (chart_id == 0){
            return y(ordinate_value);
        } else {
            return z(ordinate_value);
        }
    }

    function userChangedChart(){
        i = STOP_SLIDESHOW;
        changeChart();
    }

    function changeChart(){
        chart_id = d3.select("#chart_id").property('value');
        render();
    }

    var i = 0;
    var STOP_SLIDESHOW = 5;
    function slideshow() { 
        if (i < STOP_SLIDESHOW){
            var id = i % 2;
            d3.select("#chart_id").node().value = id.toString();
            changeChart();
            
            ++i;
            setTimeout(slideshow, 5000);
        }      
    }

    return {
        render : render
    }
  
})(window,d3)
