d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


function beeswarm(el, data, xIsAvisit, uniqAlertCat, xDomain) {
  function createScales(xIsAvisit, xDomain) {
      let scales = {
        width: window.innerWidth * 0.9,
        dimensions: {
          width: window.innerWidth * 0.9,
          height: 75,
          margin: {
            top: 10,
            right: 40,
            bottom: 20,
            left: 40,
          },
          gridPatientWidth: 100
        }
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

      return scales

    }

    const colorScale = d3.scaleOrdinal()
      .domain(uniqAlertCat)
      .range(["#2e2585", "#7e2954", "#5da899", "#9f4a96", "#94cbec", "#c26a77", "#dccd7d"])

    function createLegend(el, categories, colorScale) {

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
            !item.includes("Unscheduled") & !item.includes("Open Label")
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
        .attr('font-size', 20)
        // Give class to some tick values for formatting (only for AVISIT xaxis)
        .attr("class", (d, index) => {
          if (xIsAvisit) {
            if (importantAvisits.includes(d)) {
              return "tick-label-start"
            } else if (index === (xDomainToShow.length - 1)) {
              return "tick-label-end"
            }
          }
        })
    }

    function bubbleChart(el, data, patient, xDomain, uniqueAlertCat, xIsAvisit, colorScale, last_collected) {

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


      const yScale = d3
        .scaleLinear()
        .domain([0, 1])
        .range([scales.dimensions.boundedHeight, 0]);


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
        .attr('x1', d => scales.xScale(d.last_collected))
        .attr('y1', scales.dimensions.height)
        .attr('x2', d => scales.xScale(d.last_collected))
        .attr('y2', -10)
        .style("stroke-width", 1)
        .style("stroke", "#ABABAB")
        .style("fill", "none")
        .on("mouseenter", onMouseEnterLastCollected)
        .on("mouseleave", onMouseLeaveLastCollected)


      // 5. Draw Data
      const sim = d3.forceSimulation(data)
        .force("charge", d3.forceManyBody().strength(1))
        .force("collide", d3.forceCollide().radius((d) => d.count * 7)) // 1 is padding
        .force("x", d3.forceX().x((d) => scales.xScale(d.timing)))
        .force("y", d3.forceY(yScale(0.5)))

      const circles = bounds.append("g")
        .attr("class", "circles")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)

      sim.on("tick", () => {
        circles
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", (d) => d.count * 7)
          .attr("fill", (d) => colorScale(d.alert_cat))
      })

      const yAxisGenerator = d3.axisLeft()
        .scale(yScale)

    // 7. Interactions

    //-----------------
    // Circle tooltip
    //-----------------
    const tooltip = d3.select(`#${el} .tooltip`)
    const wrapper = document.querySelector(`#${el} .wrapper`)
    const wrapperBoundBox = wrapper.getBoundingClientRect();
    const xAxis = d3.select(`#${el} .xaxis`)

    function onMouseEnter(e, datum) {
      let bottomOverflow = false
      let rightOverflow = false
      // Place the tooltip!
      // By default, tooltip's top left corner will be placed on the point it hovers.
      // If tooltip overflows from the wrapper to the right, then its top right corner will be placed on the point
      // If tooltip overflows from the wrapper to the bottom, then its bottom left corner will be placed on the point

      const boundBox = this.getBoundingClientRect();


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

      // The width of the area of the .wrapper that the user sees (area that tooltip is allowed to be in)
      const viewAbleWrapperWidth = Math.min(window.innerWidth, wrapperBoundBox.width)

      // tooltip overflows to the right
      if (tooltipWidthX > viewAbleWrapperWidth) {
        rightOverflow = true
      }


      //--------------------
      // tooltip placement
      //--------------------
      let tooltipX
      let tooltipY

      const circleCenterX = (boundBox.left + boundBox.right) / 2
      const circleCenterY = (boundBox.top + boundBox.bottom) / 2

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
        .moveToFront();
    }

    function onMouseLeave() {
      tooltip.style("opacity", 0)

      d3.select(this)
        .style("stroke-width", "0")
    }

    function onMouseEnterLastCollected(e, datum) {

      const boundBox = this.getBoundingClientRect();

      // Place the tooltip in the center of the line, unless it overflows to
      // left or right, then put them to the right/left of the line.
      const lineCenterX = (boundBox.left + boundBox.right) / 2
      const lineCenterY = (boundBox.top + boundBox.bottom) / 2

      let lastCollectedTooltipHTML = `
        <div class="last-collected-tooltip"><b>Last Collected:</b> ${datum.last_collected}</div>
      `

      // The x position that tooltip goes to (from left)
      const tooltipWidth = parseFloat(tooltip.style("width"))
      const tooltipWidthX = e.pageX + tooltipWidth;

      // The width of the area of the .wrapper that the user sees (area that tooltip is allowed to be in)
      const viewAbleWrapperWidth = Math.min(window.innerWidth, wrapperBoundBox.width)

      let lineTooltipOffset

      if (tooltipWidthX > viewAbleWrapperWidth) {
        // Right overflow, tooltip goes to the left of the line
        lineTooltipOffset = -100
      } else {
        // All the rest, tooltip goes to the right of the line
        lineTooltipOffset = 0
      }

      tooltip
        .style("left", lineCenterX + "px")
        .style("top", lineCenterY + "px")
        .style("opacity", 1)
        .style("transform", `translateX(${lineTooltipOffset}%)`)
        .html(lastCollectedTooltipHTML)

      d3.select(this)
        .style("stroke-width", 5)
    }

    function onMouseLeaveLastCollected() {
      tooltip.style("opacity", 0)

      d3.select(this)
        .style("stroke-width", "1")
    }
  }

    const uniquePatient = [...new Set(d3.map(data, d => d.patient))]

    const importantAvisits = ["Screening", "Baseline"]

    for (let i = 0; i < uniquePatient.length; i++) {

      const realDataPatient = data.filter(d => d.patient === uniquePatient[i])

      const last_collected = [...new Set(d3.map(data, d => d.last_collected))][0]

      bubbleChart(
         el,
         realDataPatient,
         uniquePatient[i],
         xDomain,
         uniqAlertCat,
         xIsAvisit,
         colorScale,
         last_collected
      )
    }

    createLegend(el, uniqAlertCat, colorScale)
    createXAxis(el, xIsAvisit, xDomain, importantAvisits)

}
