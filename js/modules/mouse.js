var misc = require('./misc');

var selTextAbbr = function(hoverElems) {

  var nameParts = hoverElems.name.trim().split(' ')  
  var fstNameAbbr = nameParts[0][0] + '.'
    , lastName = nameParts.slice(-1)[0]
    , fullName = [fstNameAbbr, ' ', lastName].join('')
    , coAbbr = [' (', hoverElems.country, ')'].join('')
    , finish = 'Finish: ' + hoverElems.offlTime;

  var label = hoverElems.type === 'marker'
    ? fullName
    : fullName + coAbbr;

  var html = [label, finish, hoverElems.rank].join('<br>');

  return html;
};

module.exports.mouseEnter = function(sel, params, meta, el, type, vizType) {

  var duration = 250
    , opacity = 0.05
    , mouse = d3.mouse(params.svg.node()).map(function(d) {return parseInt(d)})
    , key = el[0].runner_idx
    , metaDatum = meta[key];

  var rank = [
               misc.placeString(metaDatum.place)
             , ', '
             , metaDatum.year
             ]
             .join('');

  sel.marker.filter(function(d) { return key !== d[0].runner_idx })
    .transition()
    .duration(duration)
    .style('opacity', opacity)

  sel.markerText.filter(function(d) { return key === d[0].runner_idx })
    .transition()
    .duration(duration)
    .style('opacity', 1)

  sel.path.filter(function(d) { return key !== d[0].runner_idx })
    .transition()
    .duration(duration)
    .style('opacity', opacity)

  var hoverElems = {
                    name: metaDatum.name
                  , country: metaDatum.country
                  , rank: rank
                  , offlTime: metaDatum.offlTime
                  , type: type
                  };
  var html = selTextAbbr(hoverElems);

  var rProps = {
                 x: -params.width/38
               , y: -params.width/9.5
               , f: params.width/60
               };

  if (vizType === 'project') {
    var c = 2
    rProps = {x: rProps.x*c, y: rProps.y*c/1.3, f: rProps.f*c}
  };

  sel.tooltip.classed("hidden", false)
    .style("left", (d3.event.pageX + rProps.x) + "px")
    .style("top", (d3.event.pageY + rProps.y) + "px")
    .style('font-size', rProps.f + "px")
    .html(html);  
};

module.exports.mouseLeave = function(sel, params) {

  sel.tooltip.classed("hidden", true)

  var duration = 250;
  sel.marker
    .transition()
    .duration(duration)
    .style('opacity', 1)

  sel.markerText
    .transition()
    .duration(duration)
    .style('opacity', 0)

  sel.path
    .transition()
    .duration(duration)
    .style('opacity', 1)

  params.svg.selectAll('.split-text')
    .transition()
    .duration(duration)
    .ease('linear')
    .style('opacity', 1);
};
