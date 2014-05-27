var misc = require('./misc')
  , mouse = require('./mouse');

module.exports.assemble = function(params, data, vizType) {

  var ds = misc.dataStructs(data)
    , scales = misc.genScales(params, ds.splits)
    , sel = objs(params, ds, scales);

  misc.skeleton(vizType, params.spacer, scales, sel.splitLines);   
  animate();
  
  var cnt = 0
    , l = data.length;
  function postMouse() {
    cnt += 1
    // wait for the last runner to cross the 
    // finish prior to initiating the transition
    if (cnt === l) {
      sel.clearPath
        .on('mouseenter', function(el) {
          mouse.mouseEnter(sel, params, ds.meta, el, 'line', vizType);
        })
        .on('mousemove', function(el) {
          mouse.mouseEnter(sel, params, ds.meta, el, 'line', vizType);
        })
        .on('mouseleave', function(el) {
          mouse.mouseLeave(sel, params);
        })

      sel.marker
        .on('mouseenter', function(el) {
          mouse.mouseEnter(sel, params, ds.meta, el, 'marker', vizType);
        })
        .on('mousemove', function(el) {
          mouse.mouseEnter(sel, params, ds.meta, el, 'marker', vizType);
        })
        .on('mouseleave', function(el) {
          mouse.mouseLeave(sel, params);
        })
    };
  };

  // compute the duration of each line transition
  function dur(d, i) {
    var tot_time = d.slice(-1)[0].split_mins;
    var scaled = Math.pow(tot_time, 2) * 0.25;
    return scaled;
  };

  // compute the length of a path at a position
  function translateAlong(path) {
    var l = path.getTotalLength();
    return function(i) {
      return function(t) {
        var p = path.getPointAtLength(t * l);
        return "translate(" + p.x + "," + p.y + ")";
      }
    }
  };

  // transition each line; index, i is given to the function
  function transitionThis(d,i) {
    d3.select(this)
        .transition()
        .duration(function(d,i) {return dur(d,i)})
        .ease("quad")
        .attrTween("transform", translateAlong(sel.strokes[i]))
  };

  // animate the paths and markers simultaneously
  function animate() {
    sel.path.each(function(d) { d.totalLength = this.getTotalLength(); })
        .attr("stroke-dasharray", function(d) { return d.totalLength + " " + d.totalLength; })
        .attr("stroke-dashoffset", function(d) { return d.totalLength; })
        .transition()
        .duration(function(d,i) {return dur(d,i)})
        .ease("quad")
        .attr("stroke-dashoffset", 0)
        .each('end', postMouse);

    sel.marker
      .each(transitionThis)

    sel.markerText
      .each(transitionThis)
  };
};

var objs = function(params, ds, scales) {

  var line = d3.svg.line()
    .x(function(d, i) {return scales.xs(d.split_dist)})
    .y(function(d, i) {return scales.ys(d.split_place)})

  var nodeGroup = params.svg
    .append('g')
    .attr('transform', 'translate(' + params.margin.left 
                              + ',' + params.margin.top + ')');

  var splitLines = nodeGroup.selectAll('line')
      .data(ds.splitStrs)
      .enter()

  var splitNodes = nodeGroup.selectAll('polygon')
      .data(ds.splits)
      .enter() 

  var tooltip = d3.select(params.sel)
    .append("div")
    .attr("class", "tooltips hidden")

  var marker = splitNodes.append("polygon")
    .attr("points", misc.lineMarker(params.height*0.0088, params.width*0.025))
    .attr('fill', function(d, i) {return scales.cs(d[0].year)})

  var markerText = splitNodes.append('text')
    .attr('dx', '1.5em')
    .attr('dy', '0.35em')
    .style('font-size', params.spacer)
    .text(function(d,i) {
      var rank = d.slice(-1)[0].split_place+1;
      return misc.placeString(rank).split(' ')[0];
    })
    .style('opacity', 0);
 
  var path = splitNodes.append('path')
      .attr('class', 'path')
      .attr('stroke', function(d, i) {return scales.cs(d[0].year)})
      .attr('fill', 'none')
      .attr('stroke-width', params.spacer/3)
      .attr('id', function(d, i) {return 'path_'+i})
      .attr('stroke-linecap', 'round')
      .attr('d', function(d) {return line(d)})
    
  var clearPath = splitNodes.append('path')
      .attr('class', function(d) {return 'path_' + d[0].runner_idx})
      .attr('stroke', 'black')
      .attr('fill', 'none')
      .attr('stroke-width', params.spacer)
      .attr('stroke-linecap', 'round')
      .attr('d', function(d) {return line(d)})
      .style('opacity', 0)

  var strokes = ds.splits.map(function(d,i) {
    return params.svg.select('#path_' + i).node();
  });
  
  return {
           marker: marker
         , markerText: markerText
         , path: path
         , clearPath: clearPath
         , splitLines: splitLines
         , strokes: strokes
         , tooltip: tooltip
         }
};
