module.exports.space = function space(hspacer, wspacer, perc) {
  return hspacer < wspacer 
    ? hspacer * perc
    : wspacer * perc;
};

// this func is only designed to work with input integers < 110
module.exports.placeString = function(place) {
  var skipInts = {11: undefined, 12: undefined, 13: undefined}
    , suffixMap = {1: 'st', 2: 'nd', 3: 'rd'}
    , lstDigit = place % 10;

  if ((lstDigit in suffixMap) && (!(place in skipInts))) {
    var pl = place + suffixMap[lstDigit];
  }
  else {
    var pl = place + 'th';
  }

  return pl + ' place';
};

module.exports.lineMarker = function(h, k) {
  var a = k 
    , b = k 
    , point = a + h;

  var poly = [
                a, ',-', h
              , ' ', b, ',-', h
              , ' 0,-', h,
              , ' 0,', h,
              , ' ', b, ',', h
              , ' ', a, ',', h
              , ' ', point, ',0 '
             ]
             .join('');

  return poly;
};

module.exports.skeleton = function(vizType, spacer, scales, splitLines) {

  var mxRunners = scales.ys.domain()[1];

  splitLines.append('line')
    .attr('x1', function(d, i) {return scales.xs(d.split_dist)})
    .attr('y1', scales.ys(0)-spacer)
    .attr('x2', function(d, i) {return scales.xs(d.split_dist)})
    .attr('y2', scales.ys(mxRunners)+spacer)
    .attr('stroke', '#999999')
    .attr('stroke-width', 1.5)
    .style('opacity', 0.5)

  splitLines.append('text')
    .attr('class', 'split-text')
    .filter(function(d) {return d.split_label !== 'Pre-Finish'})
    .attr('x', function(d, i) {return scales.xs(d.split_dist)})
    .attr('y', scales.ys(0)-spacer)
    .attr('dy', '-0.35em')
    .style('text-anchor', function(d) {
      if ((d.split_label === 'Half') || (d.split_label === 'Finish')) {
        return 'start';
      } else {
        return 'middle';
      }
    })
    .style('font-size', vizType === 'project' ? spacer+'px': spacer*1.3 + 'px')
    .text(function(d) {return d.split_label});
};

var metaMap = function(data) {
  var map = data.reduce(function(acc, el) {
    var idx = el.splits[0].runner_idx;
    var year = el.splits[0].year
    var datum = {
                  name: el.name
                , country: el.co
                , place: el.place
                , year: year
                , offlTime: el.offl_time
                };
    acc[idx] = datum
    return acc;
  }, {});
  return map;
}

module.exports.dataStructs = function(data) {

  var splits = _.pluck(data, 'splits');
  var splitStrs = splits.sort(function(a, b) {return b.length - a.length}).slice(0, 1)[0]
  var meta = metaMap(data)

  return {splits: splits, splitStrs: splitStrs, meta: meta};
};

module.exports.genScales = function(it, splits) {

  var margin = it.margin
    , width = it.width
    , height = it.height;

  var mxRunners = splits.length;
  var mxSplitN = d3.max(splits, function(d) {return d.length})
  var yearExt = d3.extent(splits.map(function(d) {return d[0].year}));

  var distExt = splits.reduce(function(acc, el) {
    var elemMn = el[0].split_dist
      , elemMx = el.slice(-1)[0].split_dist;
    if (elemMn < acc.mnDist) {acc.mnDist = elemMn}
    if (elemMx > acc.mxDist) {acc.mxDist = elemMx}
    return acc;
  }, {mnDist: Infinity, mxDist: -Infinity});

  var xScale = d3.scale.linear()
    .domain([distExt.mnDist, distExt.mxDist])
    .range([0, width-margin.right-margin.left])

  var yScale = d3.scale.linear()
    .domain([0, mxRunners])
    .range([margin.top, height-margin.bottom])

  var colorScale = d3.scale.ordinal()
    .domain(yearExt)
    .range(['#F7941D', '#00ADEF', '#652D90', '#8CC63E', '#ED008B'])

  return {xs: xScale, ys: yScale, cs: colorScale};
};
