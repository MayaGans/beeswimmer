HTMLWidgets.widget({

  name: 'beeswimmer',

  type: 'output',

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance

    return {

      renderValue: function(x) {
        // Apply dataframe transformation of each child dataframes
        let data = Object.values(x.dat).map((obj) => {
          return(
              Object.values(obj).map((childObject) => {
                  return(HTMLWidgets.dataframeToD3(childObject))
              })
          )
        })

        let names = Object.keys(x.dat)

        let outData = {
          patientId: names,
          patientData: data
        }

        this.svg = beeswarm(el.id, outData, x.xIsAvisit, x.uniqAlertCat, x.xDomain, this.svg);
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
