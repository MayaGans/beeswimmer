HTMLWidgets.widget({

  name: 'beeswimmer',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    return {

      renderValue: function(x) {
        // Apply dataframe transformation of each child dataframes
        let data = Object.values(x.dat).map((childObject) => {
          return HTMLWidgets.dataframeToD3(childObject);
        });
        
        this.svg = beeswarm(el.id, data, x.xIsAvisit, x.uniqAlertCat, x.xDomain, this.svg);
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
