HTMLWidgets.widget({

  name: 'beeswimmer',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    return {

      renderValue: function(x) {

        let data = HTMLWidgets.dataframeToD3(x.dat)
        beeswarm(el.id, data, x.xIsAvisit, x.uniqAlertCat, x.xDomain);

      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
