library(shiny)

ui <- fluidPage(
  htmltools::tags$h1("This is a shiny app"),
  beeswimmer::beeswimmerOutput("plot")
)

server <- function(input, output, session) {
  output$plot <- beeswimmer::renderBeeswimmer({
    beeswimmer::beeswimmer(
      beeswimmer::ady_data_plot|>
        rbind(
          beeswimmer::ady_data_plot |>
            dplyr::mutate(subjid = "Patient 2")
        ) |>
        dplyr::select(-c(dplyr::starts_with("crit")))
        # dplyr::filter(rowid %in% c(1))
    )
  })
}   

shinyApp(ui, server)

