# I'm making this data in Excel, and the codes at the bottom won't work
# without the excel file. But I'll put some documentation here.

# Essentially, we're building a short ADLB, with only the columns we're interested in
# - SUBJID, AVISIT, ADY, ADT for patient identification
# - crit1, crit1fl, crit1cat, crit2, ... for alerts
# - body_part: categorizes all; events to the most basic alert category (body part)
# - flag_AESI/flag_DLT: "Y" if a given event causes AESI/DLT
# - And we'll put int a rowid, to be used for future processing

# These crit flags are arbitrary. There might be 1000s of critfls come in,
# But the important thing is to pull all "critcat" columns to know whether a specific alert caused AESI/DLT

# For now, all alerts are the same, "Amount > 3 x ULN", but in real life, we may see the text changing at different AESI/DLT

# For alert columns, we'll use
# crit1 ~ 2   to denote liver functional test
# crit3 ~ 4   to denote renal functional test
# crit5 ~ 6   to denote other functional test
# crit7 ~ 8   to denote Hepatotoxicity AESI
# crit9 ~ 10  to denote Thrombocytopenia AESI
# crit11 ~ 12 to denote Nephrotoxicity AESI
# crit13 ~ 14 to denote DLT

# We assume the grouping as
# Liver: liver functional test, Hepatotoxicity AESI, DLT
# Renal: renal functional test, Nephrotoxicity AESI, DLT
# Other: other functional test, Thrombocytopenia AESI, DLT

#------------------------------------------------------------
# The data just has one patient. Here's all the rows we have:
#------------------------------------------------------------

# AVISIT == "Screening" from rows 1~3, all on different params

# First row is a liver functional test alert that caused a hepatotoxicity AESI
# Second row is a renal functional test alert that didn't trigger AESI/DLT
# Third row is an other functional test alert that caused Thrombo AESI and DLT

# Fourth/Fifth are Week 1, Liver test (no AESI/DLT). Since we don't care about counts
# anymore, we simply show both the rows as separate bubble

# For the rest of the rows, there's only going to be one bubble per avisit,
# They are all regular alerts that don't cause AESI/DLT

#########
# Code  #
#########

fake_raw_patient_data <- readxl::read_xlsx("Book1.xlsx") %>%
  # Turn all NA into ""
  dplyr::mutate(dplyr::across(dplyr::everything(), function(x) {ifelse(is.na(x), "", x)})) %>%
  # Pull levels from here to make colour palette
  dplyr::mutate(body_part = factor(body_part,
                                   c("Liver Functional Test", "Renal Functional Test", "Other Functional Test"),
                                   c("Liver Functional Test", "Renal Functional Test", "Other Functional Test")))
# adt funky, b/c Excel wants to turn everything into dates ;(

# Give "timing" column, which is a factor of avisit or just numeric ady
ady_data <- fake_raw_patient_data %>%
  dplyr::mutate(timing = ady)

avisit_data <- fake_raw_patient_data %>%
  dplyr::mutate(timing = factor(avisit,
                                c("Screening", "Week 1", "Week 3", "Week 5", "Week 7", "Week 9", "Week 11"),
                                c("Screening", "Week 1", "Week 3", "Week 5", "Week 7", "Week 9", "Week 11")
  ))
