library(shiny)

ui <- fluidPage(
  htmltools::tags$h1("This is a shiny app"),
  beeswimmer::beeswimmerOutput("plot")
)

server <- function(input, output, session) {
  output$plot <- beeswimmer::renderBeeswimmer({

    ady_data2 <- beeswimmer::ady_data |>
      dplyr::group_by(patient) |>
      dplyr::mutate(last_collected = sample(unique(ady_data$timing), 1))

    beeswimmer::beeswimmer(
      ady_data2 |>
        rbind(
          ady_data2 |>
            dplyr::mutate(patient = "Patient 2") |>
            dplyr::mutate(last_collected = sample(unique(ady_data$timing), 1))

        ) |>
        rbind(
          ady_data2 |>
            dplyr::mutate(patient = "Patient 3") |>
            dplyr::mutate(last_collected = sample(unique(ady_data$timing), 1))
        ) |>
        rbind(
          ady_data2 |>
            dplyr::mutate(patient = "Patient 4") |>
            dplyr::mutate(last_collected = sample(unique(ady_data$timing), 1))
        ) |>
        rbind(
          ady_data2 |>
            dplyr::mutate(patient = "Patient 5") |>
            dplyr::mutate(last_collected = sample(unique(ady_data$timing), 1))
        ) |>
        rbind(
          ady_data2 |>
            dplyr::mutate(patient = "Patient 6") |>
            dplyr::mutate(last_collected = sample(unique(ady_data$timing), 1))
        ) |>
        rbind(
          ady_data2 |>
            dplyr::mutate(patient = "Patient 7") |>
            dplyr::mutate(last_collected = sample(unique(ady_data$timing), 1))
        ) |>
        dplyr::select(-c(dplyr::starts_with("crit"))) |>
        dplyr::mutate(
          tooltip = "<div class='custom-tooltip'><div class=\'tooltip-title\'>Subject 1</div><div>Alert Category: Liver Functional test</div><div>Timepoint: Week 16</div><hr><div class='tooltip-table'><div class=\'tooltip-table-title\'>Study Visit</div><div class=\'tooltip-table-title\'>Study Day</div><div class=\'tooltip-table-title\'>Alert Day</div><div class=\'tooltip-table-title\'>Result Parameter</div><div class=\'tooltip-table-title\'>Result Value</div><div class=\'tooltip-table-title\'>Baseline Value</div><div class=\'tooltip-table-title\'>Result Unit</div><div class=\'tooltip-table-title\'>Normal Range Low</div><div class=\'tooltip-table-title\'>Normal Range High</div><div class=\'tooltip-table-text\'>Week 16</div><div class=\'tooltip-table-text\'>10</div><div class=\'tooltip-table-text\'>2203-02-21</div><div class=\'tooltip-table-text\'>Some param</div><div class=\'tooltip-table-text\'>142139</div><div class=\'tooltip-table-text\'>32261</div><div class=\'tooltip-table-text\'>U/L</div><div class=\'tooltip-table-text\'>13330</div><div class=\'tooltip-table-text\'>40333</div></div></div>"
        )
      # dplyr::filter(rowid %in% c(1))
    )
  })
}

shinyApp(ui, server)
