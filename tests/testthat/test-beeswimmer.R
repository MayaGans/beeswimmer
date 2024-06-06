test_that("beeswimmer works", {
  ady <- -1000:1000

  testthat::expect_no_error(
    beeswimmer(
      data.frame(
        rowid = 1:length(ady),
        patient = "One",
        ady = factor(ady),
        timing = as.numeric(as.character(ady)),
        body_part = factor(rep(c("A really long string", "A", "GHI"), length(ady))),
        flag_score = sample(c(NA, 0.5, 1), length(ady), replace = TRUE),
        last_collected = 1000
      ),
      legend_title = "this is a title"
    )
  )

})
