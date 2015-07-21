// -*- coding: utf-8 -*-

var MainViewModel = (function() {
    function MainViewModel() {
        var that = this;
        var createMap = function() {
            return new Datamap({
                element: document.getElementById('map'),
                fills: that.fills,
                geographyConfig: {
                    popupTemplate: function(geography, data) {
                        if (!data) {
                            return "";
                        };
                        return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong><br />Rank:' +  data.index + '</div>';
                    }
                }
            });
        };
        this.fills = Enumerable.range(1, 127)
            .toObject("$.toString()", function(x) {
                return "hsl(180, " + 100 * (1.0 * (1 - x / 127)) + "%, 45%)";
            });
        this.map = createMap();
        
        this.data = ko.observableArray();
        this.metrics = ko.observableArray([
            "Overall Index",
            "Science and Technology",
            "Culture",
            "Int'l Peace and Security",
            "World Order",
            "Planet and Climate",
            "Prosperity and Equality",
            "Health and Wellbeing"
        ]);
        this.currentMetric = ko.observable("Overall Index");
        this.highlightingMetric = ko.observable(null);
        this.valuesForCurrentMetricOrdered = ko.computed(function() {
            var val = Enumerable.from(this.data())
                .orderBy(function(x) {
                    return x[that.currentMetric()];
                })
                .toArray();
            return val;
        }, this);
        this.fillData = ko.computed(function() {
            return Enumerable.from(this.data())
                .toObject("$.code",
                          function(x) {
                              return {
                                  fillKey: x[that.currentMetric()].toString(),
                                  index: x[that.currentMetric()]
                              };
                          });
        }, this);
        this.fillData.subscribe(function(newValue) {
            this.map.updateChoropleth(this.fillData());
        }, this);

        $(window).resize(function() {
            delete this.map;
            that.map = null;
            $('#map').empty();
            that.map = createMap();
        });
    }

    MainViewModel.prototype.changeMetric = function(data, e) {
        this.currentMetric($(e.target).text());
    };

    MainViewModel.prototype.load = function() {
        var that = this;
        return $.ajax({
            url: 'data.json',
            dataType: 'json'
        })
            .done(function(e) {
                that.data(e);
                that.map.updateChoropleth(that.fillData());
            });
    };

    MainViewModel.prototype.highlightMetric = function(data, e) {
        this.highlightingMetric(data);
    };

    MainViewModel.prototype.removeHighlightingMetric = function(data, e) {
        this.highlightingMetric(null);
    };

    return MainViewModel;
})();

(function() {
    var viewModel = new MainViewModel();
    viewModel.load();
    ko.applyBindings(viewModel);

})();
