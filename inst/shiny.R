library(shiny)

ui <- fluidPage(
  htmltools::tags$h1("This is a shiny app"),
  beeswimmer::beeswimmerOutput("plot")
)

server <- function(input, output, session) {
  output$plot <- beeswimmer::renderBeeswimmer({
    beeswimmer::beeswimmer(
      beeswimmer::ady_data|>
        rbind(
          beeswimmer::ady_data |>
            dplyr::mutate(patient = "Patient 2")
        ) |>
        dplyr::select(-c(dplyr::starts_with("crit")))
        # dplyr::filter(rowid %in% c(1))
    )
  })
}   

shinyApp(ui, server)