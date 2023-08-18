#' @import htmlwidgets
#' @importFrom dplyr %>%
#'
#' @export
beeswimmer <- function(data, unique_alert_cat = NULL, overall_view = FALSE, width = NULL, height = NULL, elementId = NULL) {

  # Determine if X is in AVISIT (is factor) or ADY (is dbl)

  x_is_avisit <- class(data$timing) == "factor"

  if (x_is_avisit) {
    x_domain <- levels(data$timing)
  } else {
    browser()
    # Make sure last_collected is part of the x scale, if it is larger than the bubbles' x
    # Throwing it in min also, JUST in case
    last_collected  <- unique(data$last_collected)
    x_domain <- c(min(min(data$timing), last_collected), max(max(data$timing), last_collected))
  }

  if (is.null(unique_alert_cat)) {
    unique_alert_cat <- levels(data[["body_part"]])
  }
  
  data <- data %>%
    # Bigger bubbles are plotted first
    # This gets reset when hovering, due to z-index = 9999 css
    dplyr::arrange(rowid, timing, dplyr::desc(flag_score)) %>%
    ## Whether the bubble is the biggest in its cluster
    dplyr::group_by(rowid) %>%
    dplyr::mutate(
      max_flag_score = max(flag_score),
      is_max_flag_score = flag_score == max(flag_score)
    ) %>%
    dplyr::ungroup()

    

  # a list of dataframes, where each list is a specific alert event
  # In this group, there's at least 1 row (original event), plus more rows if it caused AESI or DLT
  data_split <- lapply(split(data, data$patient), function(x) {split(x, x$rowid)})
  # data_split <- split(data, data$rowid)
    # forward options using x

  x <- list(
    dat = data_split,
    xDomain = x_domain,
    uniqAlertCat = unique_alert_cat,
    xIsAvisit = x_is_avisit,
    overallView = overall_view
  )

  # create widget
  htmlwidgets::createWidget(
    name = "beeswimmer",
    x,
    width = width,
    height = height,
    package = "beeswimmer",
    elementId = elementId
  )
}


#' @importFrom htmltools tags
beeswimmer_html <- function(...) {
  htmltools::tags$div(
    ...,
    htmltools::tags$div(class = "legend"),
    htmltools::tags$div(class = "beeswimmer-wrapper"),
    htmltools::tags$div(class = "tooltip"),
    htmltools::tags$div(class = "line-tooltip"),
    htmltools::tags$div(class = "xaxis")
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
