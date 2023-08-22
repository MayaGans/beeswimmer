
<!-- README.md is generated from README.Rmd. Please edit that file -->

# beeswimmer

<!-- badges: start -->
<!-- badges: end -->

The goal of beeswimmer is to …

## Installation

You can install the development version of beeswimmer from
[GitHub](https://github.com/) with:

``` r
# install.packages("devtools")
devtools::install_github("jiwanheo/beeswimmer")
```

## Shiny Example

``` r
library(shiny)

ui <- fluidPage(
  htmltools::tags$h1("This is a shiny app"),
  beeswimmer::beeswimmerOutput("plot")
)

server <- function(input, output, session) {
  output$plot <- beeswimmer::renderBeeswimmer({
    beeswimmer::beeswimmer(
      beeswimmer::ady_data
    )
  })
}

shinyApp(ui, server)
```
