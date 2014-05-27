SHELL           := /bin/bash
TIME			:= $(shell date "+%m/%d %I:%M%p")
COMPLETE		:= \033[32mSuccess ✔\033[39m


# Dependencies
PYTHON			?= python
NODE_MODULES	:= node_modules
BROWSERIFY		:= $(NODE_MODULES)/browserify/bin/cmd.js
CLEANCSS		:= $(NODE_MODULES)/clean-css/bin/cleancss
UGLIFY 			:= $(NODE_MODULES)/uglify-js/bin/uglifyjs

HTML			:= index.html
CONFIG			:= project-config.json
DIST_DIR		:= dist

DATA_DIR		:= data
MDATA			:= $(DATA_DIR)/{m2010,m2011,m2012,m2013,m2014}.txt
WDATA			:= $(DATA_DIR)/{w2010,w2011,w2012,w2013,w2014}.txt
PARSER			:= parser.py
MJSON			:= data/marathon-men.json
WJSON			:= data/marathon-women.json
DATA_TARGETS	:= $(MJSON) $(WJSON)

# Viz components
JS_DIR			:= js
MODULES			:= $(JS_DIR)/modules/*.js
JS				:= $(JS_DIR)/bumps-chart-project.js
JS_MIN			:= $(JS_DIR)/bumps-chart-project.min.js

CSS_DIR			:= css
CSS				:= $(CSS_DIR)/bumps-chart.css
CSS_MIN			:= $(CSS_DIR)/bumps-chart.min.css

.PRECIOUS: $(DATA)
.PHONY: build project clean

build: project
	mkdir -p $(DIST_DIR)/{js,css,data,vendor}
	cp -R $(NODE_MODULES)/* $(DIST_DIR)/vendor/
	cp $(HTML) $(CONFIG) $(DIST_DIR)
	cp $(JS_MIN) $(DIST_DIR)/js/
	cp $(CSS_MIN) $(DIST_DIR)/css/
	cp $(DATA_TARGETS) $(DIST_DIR)/data/
	@printf "\n$(TIME) · \033[35mCompiling...\033[39m"
	@printf " $(COMPLETE)\n"

project: $(DATA_TARGETS) $(JS_MIN) $(CSS_MIN)

$(MJSON): $(PARSER)
	cat $(MDATA) | $(PYTHON) $< $@

$(WJSON): $(PARSER)
	cat $(WDATA) | $(PYTHON) $< $@

$(JS_MIN): $(JS) $(MODULES)
	$(BROWSERIFY) -d $< | $(UGLIFY) > $@

$(CSS_MIN): $(CSS)
	cat $^ | $(CLEANCSS) --s0 > $@

clean:
	@- $(RM) -r $(DATA_TARGETS) \
				$(JS_MIN) \
				$(CSS_MIN) \
				$(DIST_DIR)
