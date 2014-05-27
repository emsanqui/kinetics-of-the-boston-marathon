var misc = require('./misc');

module.exports.params = function(sel, fn) {

  var colors = {
                 gray: '#999999'
               , green: '#8CC63E'
               , orange: '#F7941D'
               , blue: '#00ADEF'
               , purple: '#652D90'
               , magenta: '#ED008B'
               };

  var aspect = 1.9
    , sW = parseFloat(d3.select(sel).style('width'))
    , W = sW > 550 ? 500: sW
    , H = ($(window).height()*0.9) / 2 
    , spacer = misc.space(H, W, 0.03);

  var margin = {top: spacer, bottom: spacer, left: spacer, right: spacer*3}
    , width = W - margin.left - margin.right
    , height = H - margin.top - margin.bottom;

  var viewBox = "0 0 " + W + " " + H; 

  var svg = d3.select(sel)
    .append('svg')
    .attr("viewBox",viewBox)
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var p = {
            sel: sel
          , svg: svg
          , height: height
          , width: width
          , margin: margin
          , spacer: spacer
          , colors: colors
          };
  fn(p);
};
