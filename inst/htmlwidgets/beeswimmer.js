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

        // Make sure uniqAlertCat is an array when there's only 1 item
        let uniqAlertCat = x.uniqAlertCat

        if (!Array.isArray(uniqAlertCat)) {
          uniqAlertCat = [uniqAlertCat]
        } 
        
        this.svg = beeswarm(el.id, outData, x.xIsAvisit, uniqAlertCat, x.xDomain, this.svg);
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
