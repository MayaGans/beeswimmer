d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


function beeswarm(el, data, xIsAvisit, uniqAlertCat, xDomain, currSvg) {

  function createScales(xIsAvisit, xDomain) {
      let scales = {
        width: window.innerWidth * 0.9,
        dimensions: {
          width: window.innerWidth * 0.9,
          height: 150,
          margin: {
            top: 10,
            right: 40,
            bottom: 20,
            left: 40,
          },
          gridPatientWidth: 100
        },
        circleMultiplier: 12
      }

    scales.dimensions.boundedWidth =
      scales.dimensions.width - scales.dimensions.margin.left - scales.dimensions.margin.right;

    scales.dimensions.boundedHeight =
      scales.dimensions.height - scales.dimensions.margin.top - scales.dimensions.margin.bottom;

      let xScale;
      if (xIsAvisit) {
        // Discrete scale
        xScale = d3
          .scalePoint()
          .domain(xDomain)
          .range([0, scales.dimensions.boundedWidth])
          .padding(0.2)
      } else {
        // Numeric scale
        xScale = d3
          .scaleLinear()
          .domain(xDomain)
          .range([0, scales.dimensions.boundedWidth]);
      }

      scales.xScale = xScale


      const yScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([scales.dimensions.boundedHeight, 0]);
      scales.yScale = yScale

      return scales

    }

    const colorScale = d3.scaleOrdinal()
      .domain(uniqAlertCat)
      //.range(["#2e2585", "#7e2954", "#5da899", "#9f4a96", "#94cbec", "#c26a77", "#dccd7d"])
      // brightness turned up to 70
      .range(["#9088dd", "#da8bb3", "#9cc9c0", "#ce97c9", "#7dbfe8", "#d3929c", "#dfd286"])

    function createLegend(el, categories, colorScale) {
      console.log("after c")
console.log(categories)
      const legend = d3
        .select(`#${el} .legend`)
        .selectAll("div")
        .data(categories)
        .enter()
        .append('div')
        .append('svg')
        .attr('height', 30)
        .attr('width', d => d.length*8.5 + 30)

      let circle = legend.append('circle')
        .attr('r', 7)
        .attr('cx', 20)
        .attr('cy', 20)
        .attr('fill', d => colorScale(d))
        .attr('class', 'legend-circle')

      let text = legend.append('text')
        .text(d => d)
        .attr('transform', (d, i) => `translate(40,25)`)

       // legend.on('click', subsetGraph)

    }

    function createXAxis(el, xIsAvisit, xDomain, importantAvisits) {

      let scales = createScales(xIsAvisit, xDomain)
      // 6. Draw peripherals
      let xAxisGenerator = d3.axisBottom()
        .scale(scales.xScale)
        .tickSizeOuter(0)

      // If using AVISIT as xAxis, selectively show tickvalues
      if (xIsAvisit) {
        var xDomainToShow = xDomain.filter((item) => {
          return(
            !item.includes("Unscheduled") & !item.includes("Open Label") & !item.includes("OL") & !item.includes("Unsch")
          )
        })

        xDomainToShow = xDomainToShow.filter((item, index) => {
          return(
            // Screening and baseline must be shown
            importantAvisits.includes(item) |
            // and every 3 items (in the xDomain array, not necessarily every 3 weeks)
            index % 3 === 0
          )
        });

        xAxisGenerator = xAxisGenerator
          .tickValues(xDomainToShow)
      }

      const xaxis = d3
        .select(`#${el} .xaxis`)
        .append("div")
        .attr("class", "patient-lane xaxis")

      const xSpan = xaxis
        .append("div")
        .attr("class", "patient-id")
        .append("span")

      const xSection = xaxis
        .append("svg")
        .attr("class", "patient-chart")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${scales.width} ${scales.dimensions.height}`)
        .style("transform", `translateX(${scales.dimensions.margin.left}px)`)
        .classed("svg-content", true)
        .append("g")
        .call(xAxisGenerator)
        .selectAll("text")
        .attr('font-size', '15px')
        /*
        .attr("class", (d, index) => {
          if (xIsAvisit) {
            if (importantAvisits.includes(d)) {
              return "tick-label-start"
            } else if (index === (xDomainToShow.length - 1)) {
              return "tick-label-end"
            }
          }
        })
        */
    }

    function bubbleChart(el, data, patient, xDomain, uniqueAlertCat, xIsAvisit, colorScale) {

      let scales = createScales(xIsAvisit, xDomain)

      const lane = d3
        .select(`#${el} .wrapper`)
        .append("div")
        .attr("class", "patient-lane")

      const patientIdSection = lane
        .append("div")
        .attr("class", "patient-id")
        .append("span")
        .text(patient)

      const patientChartSection = lane
        .append("svg")
        .attr("class", "patient-chart")
        //.attr("width", dimensions.width)
        //.attr("height", dimensions.height)
        //.append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${scales.dimensions.width} ${scales.dimensions.height}`)
        .classed("svg-content", true);

      const bounds = patientChartSection
        .append("g")
        .attr("class", "bounds")
        .style(
          "transform",
          `translate(${scales.dimensions.margin.left}px, ${scales.dimensions.margin.top}px)`
        );




      // TODO
      // legend (remove the multiselect from the app, you're seeing it all, folks!)

      // TODO - LATER
      // clicking on a circle REMOVES it toggles it
      // each legend item is a button that toggles the class 'hide-dots' for its babies
      // hide-dots has the css of opacity - 0
      // OR redraw the force

      // Last Collected queue (black vertical line)
      const lastCollected = bounds.append("g")
        .attr("class", "last-collected-queue")
        .selectAll("line")
        .data(data)
        .enter()
        .append("line")
        .attr('x1', d => scales.xScale(d[0].last_collected))
        .attr('y1', scales.dimensions.height)
        .attr('x2', d => scales.xScale(d[0].last_collected))
        .attr('y2', -10)
        .style("stroke-width", 1)
        .style("stroke", "#ABABAB")
        .style("fill", "none")
        .on("mouseenter", onMouseEnterLastCollected)
        .on("mouseleave", onMouseLeaveLastCollected)


      // 5. Draw Data

      // Plotting the biggest circles first. Doing the collision detection on there,
      // Then we'll plot down the smaller circles within the same cluster on top of the biggest circle

      const biggestCircles = data.map(array => array.filter(obj => obj["is_max_flag_score"] === true))
      const biggestCirclesArr = [].concat(...biggestCircles)

      const smallerCircles = data.map(array => array.filter(obj => obj["is_max_flag_score"] === false))
      const smallerCirclesArr = []
      for(let i=0; i < smallerCircles.length; i++) {
        smallerCirclesArr[smallerCirclesArr.length] = smallerCircles[i]
      }

      // Each bubble cluster gets a group
      const circleClusters = bounds.append("g")
        .attr("class", "circle-group")
        .selectAll()
        .data(biggestCirclesArr)
        .join("g")
        .attr("class", "circle-cluster")

      const bigCircles = circleClusters.selectAll()
        .data((d) => Array(d))
        .join("circle")
        .attr("class", "biggest-circle")

      const smallCircles = circleClusters.selectAll()
        .data((d) => {
          // data that goes behind it is an array of objects of smallerCirclesArr items.
          return smallerCirclesArr.flat().filter(obj => obj.rowid === d.rowid)
        })
        .join("circle")
        .attr("class", "smaller-circle")

      // Sim to repel bubbles in same x value, but not overlap
      const sim = d3.forceSimulation(biggestCirclesArr)
        .force("charge", d3.forceManyBody().strength(1))
        .force("collide", d3.forceCollide().radius((d) => d.flag_score * scales.circleMultiplier))
        .force("x", d3.forceX().x((d) => {
          return scales.xScale(d.timing)
        }))
        .force("y", d3.forceY(scales.yScale(0.5)))
        .on("tick", () => {

          bigCircles
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", (d) => d.flag_score * scales.circleMultiplier)
            .attr("fill", (d) => {
              let hsl = d3.hsl(colorScale(d.body_part))
              // The more severe an event is, drop its lightness
              let newColor = d3.hsl(hsl.h, hsl.s, hsl.l - ((d.flag_score-1) * 0.15))

              return newColor.formatHex()
            })
            // slowly light up as sim settles
            .style("opacity", 1/sim.alpha())
            .on("mouseenter", onMouseEnter)
            .on("mouseleave", onMouseLeave)


          smallCircles
            .attr("cx", (d) => {
              // The "big circle" that the small circle belongs to
              let origBigCircle = bigCircles._groups.flat().map(arr => arr.__data__)
                .filter((arr) => arr.rowid === d.rowid)

              let bigCircleObject =  origBigCircle[0]

              return bigCircleObject.x
            })
            .attr("cy", (d) => {
              // The "big circle" that the small circle belongs to
              let origBigCircle = bigCircles._groups.flat().map(arr => arr.__data__)
                .filter((arr) => arr.rowid === d.rowid)

              let bigCircleObject =  origBigCircle[0]

              // From the center of the bigCircle, move it down by 15px as flag_score changes
              return bigCircleObject.y + (d.max_flag_score - d.flag_score) * scales.circleMultiplier
            })
            .attr("r", (d) => {
              return d.flag_score * scales.circleMultiplier
            })
            .attr("fill", (d) => {
              let hsl = d3.hsl(colorScale(d.body_part))
              // The more severe an event is, drop its lightness
              let newColor = d3.hsl(hsl.h, hsl.s, hsl.l - ((d.flag_score-1) * 0.15))

              return newColor.formatHex()
            })
            .style("opacity", 1/sim.alpha())
            .on("mouseenter", onMouseEnter)
            .on("mouseleave", onMouseLeave)
        })

      const yAxisGenerator = d3.axisLeft()
        .scale(scales.yScale)

    // 7. Interactions

    //-----------------
    // Circle tooltip
    //-----------------
    const tooltip = d3.select(`#${el} .tooltip`)
    const wrapper = document.querySelector(`#${el} .wrapper`)
    const wrapperBoundBox = wrapper.getBoundingClientRect();
    // The width of the area of the .wrapper that the user sees (area that tooltip is allowed to be in)
    const viewAbleWrapperWidth = Math.min(window.innerWidth, wrapperBoundBox.width)
    const xAxis = d3.select(`#${el} .xaxis`)

    function onMouseEnter(e, datum) {
      let bottomOverflow = false
      let rightOverflow = false
      // Place the tooltip!
      // By default, tooltip's top left corner will be placed on the point it hovers.
      // If tooltip overflows from the wrapper to the right, then its top right corner will be placed on the point
      // If tooltip overflows from the wrapper to the bottom, then its bottom left corner will be placed on the point

      let boundBox = this.getBoundingClientRect();


      //----------------------------
      // Bottom overflow detection
      //----------------------------

      // The Height that tooltip comes down to (from top)
      const tooltipHeight = parseFloat(tooltip.style("height"))
      const xAxisHeight = parseFloat(xAxis.style("height"))
      const tooltipHeightY = e.pageY + tooltipHeight;
      // The height of the area of the .wrapper that the user sees (area that tooltip is allowed to be in)
      const viewAbleWrapperHeight = Math.min(window.innerHeight, wrapperBoundBox.bottom) - xAxisHeight

      // tooltip overflows to the bottom
      if (tooltipHeightY > viewAbleWrapperHeight) {
        bottomOverflow = true
      }

      //---------------------------
      // Right overflow detection
      //---------------------------

      // The x position that tooltip goes to (from left)
      const tooltipWidth = parseFloat(tooltip.style("width"))
      const tooltipWidthX = e.pageX + tooltipWidth;

      // tooltip overflows to the right
      if (tooltipWidthX > viewAbleWrapperWidth) {
        rightOverflow = true
      }


      //--------------------
      // tooltip placement
      //--------------------
      let tooltipX
      let tooltipY

      const circleCenterX = (boundBox.left + boundBox.right) / 2 + window.scrollX
      const circleCenterY = (boundBox.top + boundBox.bottom) / 2 + window.scrollY

      // We have to think about top overflow too... The top row's tooltip may overflow to the top
      if (bottomOverflow & rightOverflow) {
        tooltipX = circleCenterX - tooltipWidth
        tooltipY = circleCenterY - tooltipHeight
      } else if (bottomOverflow) {
        tooltipX = circleCenterX
        tooltipY = circleCenterY  - tooltipHeight
      } else if (rightOverflow) {
        tooltipX = circleCenterX - tooltipWidth
        tooltipY = circleCenterY
      } else {
        // default case, the top-left corner of the tooltip is at the center of the circle
        tooltipX = circleCenterX
        tooltipY = circleCenterY
      }

      tooltip
        .style("left", tooltipX + "px")
        .style("top", tooltipY + "px")
        .style("opacity", 1)
        .html(datum.tooltip)

      d3.select(this)
        .style("stroke-width", 5)
        .attr("stroke", (d) => colorScale(d.alert_cat))
        .attr('z-index', 99999)
        //.moveToFront();
    }

    function onMouseLeave() {
      tooltip.style("opacity", 0)

      d3.select(this)
        .style("stroke-width", "0")
        // Send back to its original position
        //.attr('z-index', 99999)
        //.moveToFront();
    }



    //--------------------
    // Line tooltip placement
    //--------------------
    const lineTooltip = d3.select(`#${el} .line-tooltip`)
    function onMouseEnterLastCollected(e, datum) {

      const lineTooltipBoundBox = this.getBoundingClientRect();

      // Place the tooltip in the center of the line, unless it overflows to
      // left or right, then put them to the right/left of the line.
      const lineCenterX = (lineTooltipBoundBox.left + lineTooltipBoundBox.right) / 2 + window.scrollX
      const lineCenterY = (lineTooltipBoundBox.top + lineTooltipBoundBox.bottom) / 2 + window.scrollY

      let lastCollectedTooltipHTML = `
        <div class="last-collected-tooltip"><b>Last Collected:</b> ${datum[0].last_collected}</div>
      `

      // The x position that tooltip goes to (from left)
      const lineTooltipWidth = parseFloat(lineTooltip.style("width"))
      const lineTooltipWidthX = e.pageX + lineTooltipWidth;

      let lineTooltipOffset

      if (lineTooltipWidthX > viewAbleWrapperWidth) {
        // Right overflow, tooltip goes to the left of the line
        lineTooltipOffset = -100
      } else {
        // All the rest, tooltip goes to the right of the line
        lineTooltipOffset = 0
      }
      
      lineTooltip
        .style("left", lineCenterX + "px")
        .style("top", lineCenterY + "px")
        .style("opacity", 1)
        .style("transform", `translateX(${lineTooltipOffset}%)`)
        .html(lastCollectedTooltipHTML)

      d3.select(this)
        .style("stroke-width", 5)
        .attr('z-index', 99999)
        .style("max-width", 200)
    }

    function onMouseLeaveLastCollected() {
      lineTooltip.style("opacity", 0)

      d3.select(this)
        .style("stroke-width", "1")
    }
  }

    const importantAvisits = ["Screening", "Baseline"]

    if (currSvg !== null) {
      document.getElementById(el).querySelector(".legend").innerHTML = null
      document.getElementById(el).querySelector(".wrapper").innerHTML = null
      document.getElementById(el).querySelector(".tooltip").innerHTML = null
      document.getElementById(el).querySelector(".xaxis").innerHTML = null
    }

    for (let i = 0; i < data.patientData.length; i++) {

      // const last_collected = [...new Set(d3.map(data, d => d.last_collected))][0]

      bubbleChart(
         el,
         data.patientData[i],
         data.patientId[i],
         xDomain,
         uniqAlertCat,
         xIsAvisit,
         colorScale
        //  last_collected
      )
    }

    createLegend(el, uniqAlertCat, colorScale)
    createXAxis(el, xIsAvisit, xDomain, importantAvisits)

}
