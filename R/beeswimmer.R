#' @import htmlwidgets
#'
#' @export
beeswimmer <- function(data, unique_alert_cat, width = NULL, height = NULL, elementId = NULL) {

  # Determine if X is in AVISIT (is factor) or ADY (is dbl)

  x_is_avisit <- class(data$timing) == "factor"

  if (x_is_avisit) {
    x_domain <- levels(data$timing)
  } else {
    x_domain <- c(min(data$timing), max(data$timing))
  }

  # forward options using x
  x = list(
    dat = data,
    xDomain = x_domain,
    uniqAlertCat = unique_alert_cat,
    xIsAvisit = x_is_avisit
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'beeswimmer',
    x,
    width = width,
    height = height,
    package = 'beeswimmer',
    elementId = elementId
  )
}


#' @importFrom htmltools tags
beeswimmer_html <- function(...) {
  tags$div(
    ...,
    tags$div(class = "legend"),
    tags$div(class = "wrapper"),
    tags$div(class = "tooltip"),
    tags$div(class = "xaxis")
  )
}

#' Shiny bindings for beeswimmer
#'
#' Output and render functions for using beeswimmer within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a beeswimmer
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name beeswimmer-shiny
#'
#' @export
beeswimmerOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'beeswimmer', width, height, package = 'beeswimmer')
}

#' @rdname beeswimmer-shiny
#' @export
renderBeeswimmer <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, beeswimmerOutput, env, quoted = TRUE)
}
