var initprj = require('./init-project')
  , assemble = require('./assemble');

var go = function(config, vizElem, data) {
  if (config.type === 'post') {
    initpst.params(vizElem, function(it) {
      assemble.assemble(it, data, config.type); 
    });
  }
  if (config.type === 'project') {
    initprj.params(vizElem, function(it) {
      assemble.assemble(it, data, config.type); 
    });
  }
};

var loadJson = function(jsonFile, fn) {
  d3.json(jsonFile, function(err, data) {
    fn(data)
  })
}

var renderEach = function(vizElems, fn) {
  vizElems.forEach(function(d) {
    d3.select(d.elem).selectAll("svg").remove();
    fn(d.elem, d.data)
  });
};

var renderAll = function(config) {
  renderEach(config.data, function(elem, jsonFile) {
    loadJson(jsonFile, function(json) {
      go(config, elem, json);   
    });
  });
};

var renderViz = function(config) {
 
  renderAll(config);

  $(window).on("resize", function() {
    d3.selectAll("svg").selectAll('.tooltips').remove();
    renderAll(config);
  });

  if (config.type === 'post') {
    config.data.forEach(function(d) {
      d3.select(d.button)
        .on('click', function() {
          renderAll({type: 'post', data: [d]})
        });
    });
  } 
  else if (config.type === 'project') {
    d3.select(config.data[0].button)
      .on('click', function() {
        renderAll(config)
      });
  }
};
module.exports.renderViz = renderViz;
