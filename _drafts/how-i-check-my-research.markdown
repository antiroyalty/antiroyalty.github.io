---
layout: post
title: "How I check whether my research is wrong"
date: 2026-09-18
categories: research code
---

I've been spending a lot of time trying to find ways my research could be wrong. This has been productive, although occasionally in ways that are inconvenient for the paper I am trying to finish.

I'm studying whether solar and battery storage make economic sense for a representative household in each of 47 California counties. I also want to know whether electrifying the home and adding an EV makes solar and storage a better investment. The model chooses equipment sizes and hourly operation, then combines energy bills with the cost of buying that equipment.

One result keeps coming back: under the modeled post-tax-credit costs and NEM 3 rules, the least-cost systems have small solar installations and essentially no storage. That surprised me. It also made me want to check whether I had accidentally built a model that was very good at confirming its own assumptions.

There are several ways that could happen. I could have the wrong battery price. I could be calculating export credits incorrectly. I could have perfectly correct calculations for two scenarios that aren't actually comparable.

So I've been separating three questions:

- Does the code calculate the model I intended?
- Do the model's inputs and behavior resemble the things they represent?
- Does the conclusion survive a reasonable change in an important assumption?

Those questions need different kinds of evidence. A passing unit test can answer a very specific accounting question. It cannot establish that a typical household will behave like my simulated household.

The first thing I now want is an example small enough to calculate myself.

For billing, that means putting aside 8,760 hours of electricity flows and starting with a few dollar amounts. Suppose a household owes $20 for generation and $40 for delivery. It earns $30 of generation credits and $5 of delivery credits. Another $29 of charges cannot be paid with those credits.

If generation and delivery share one eligible pool, the bill is $54: $29 plus the $25 left after applying $35 of credits to $60 of charges. If the pools are separate, the bill is $64. Ten dollars of generation credit is left over while delivery charges remain unpaid.

These are teaching numbers. They make a rule visible that would be easy to miss in an annual total. They also let me specify an expected answer before asking the code for one. My current research calculation settles credits annually and assigns no future value to unused balances. That is a stated simplification; it is not an exact reconstruction of every utility's monthly statement and carryover rules.

This mattered because I had ended up with different cost calculations in optimization and reporting. The optimizer could value an export credit that the reporting calculation could not use to reduce the bill. A separate simulation experiment exposed cases where those calculations ranked equipment choices differently.

That was a problem! The solver was choosing a system using a different definition of savings from the one I would put in the paper.

Optimization and reporting now share the annual accounting equation. I also recalculate the bill from the selected hourly electricity flows and check that it reconciles. Sharing the equation prevents the implementations from drifting apart. The small examples check what that shared equation means. Both are necessary, because two functions can agree and still embody the same wrong assumption.

The same approach helps with equipment lifetimes. My study runs for 25 years, while the assumed battery life is 15 years. A battery therefore needs a replacement during the study. At the end, I assign the replacement one-third of its cost as remaining value for its five unused years.

One test starts with an explicit schedule: pay $10,000 now, pay $10,000 in year 15, and assign $3,333 of remaining value in year 25. At a 7% discount rate, this is about $1,116 per year over the study. The test calculates that schedule independently, then checks the shared annualization code. It is much easier to reason about three dated amounts than an unexplained coefficient.

Some checks are even more basic. Hourly electricity has to balance. A battery cannot discharge energy that it never received, and charging losses have to go somewhere. The battery's charge at the end of the modeled year has to match the beginning. Otherwise, the model can quietly borrow energy from outside the study.

I also check solar production at night, incomplete hourly profiles, negative loads, and whether the meter imports and exports simultaneously. These checks are close to the physical meaning of the variables. An output can look perfectly ordinary in a yearly bar chart while violating one of them for a few hours.

There is a mathematical check on the optimization, too. The solver reports both a feasible cost and a lower bound on the best possible cost. Their difference tells me how much better an unresolved solution could be. For the main runs, I require that difference to be no more than $1 per year.

That is useful numerical evidence. It says nothing about whether my battery price is accurate to within a dollar! I would describe this work as verification, reconciliation, and validation, rather than formal verification of the whole research model.

Then there are the ballpark checks, which I find useful precisely because they are less elaborate.

The tests compare household and appliance consumption with the [EIA Residential Energy Consumption Survey](https://www.eia.gov/consumption/residential/data/2020/index.php?view=state) and the [California Residential Appliance Saturation Study](https://www.energy.ca.gov/data-reports/surveys/residential-appliance-saturation-study). They check refrigerators, lighting, plug loads, heating, and total consumption. There are checks for seasonal solar production, winter gas demand, and plausible effective electricity prices.

The comparison has to make sense for the household being modeled. A statewide average includes homes with different sizes, climates, and heating fuels. My gas-heated baseline should not automatically match an average that includes electrically heated homes. I also compare the assembled loads with their ResStock building-simulation inputs. That checks whether I combined the source data correctly; it is not independent evidence from measured households.

Actual PG&E household bills provide another reference for consumption and seasonal patterns. But one home is one home. And a solar household's net meter reading is different from its total electricity use. I use those bills as a limited plausibility check, rather than claiming that matching them validates all 47 counties.

A source can also be credible while the way I use it is wrong.

Vehicle maintenance was a good example. One calculation effectively charged the gasoline car $1,200 per year, while its appliance definition specified $283.65. Fixing that inconsistency raised another question: did the lower estimate represent maintenance over the whole ownership period?

I went back to the mileage bands in the maintenance source. The revised allowances cover 144,000 miles over 12 years, giving about $656 per year for the gasoline car and $324 for the EV. These remain empirical assumptions, with limitations. But the calculation now matches the ownership period I say I am studying.

After the vehicle-cost corrections and input updates, the matched comparison showed fully electric homes with EVs costing more overall in most modeled counties. Energy spending still fell. Equipment and other ownership costs changed the conclusion about total cost.

That was a much more consequential finding than getting another hundred tests to pass. I had to revise the research claim.

I also had to check the comparison itself. An earlier setup gave the gas household a fixed solar/storage system while letting the electric household optimize its equipment. That gave one scenario a choice the other did not have.

The current comparison gives each electrification scenario both a no-solar case and an independently optimized solar/storage case. I also separate the effect of equipment from the effect of changing rate plans. Otherwise, savings from a different electricity tariff can look like savings caused by the equipment. Correct arithmetic alone would not catch that interpretation problem.

I have also compared parts of the model with the [System Advisor Model, or SAM](https://sam.nlr.gov/). In an isolated experiment, I changed the solar-production model, replayed battery operation through a more detailed battery simulation, and compared alternative operating strategies.

This was helpful because each comparison could expose a different assumption. It also taught me to be careful about calling something an independent benchmark. Two models need matching inputs and definitions before their disagreement is informative. The SAM experiment used the research billing calculation to score costs, so that part was shared. It did not independently certify the tariff calculation or validate every current statewide result.

Sensitivity analysis addresses a different concern: whether I ruled out an option that would change the answer.

My central scenarios allow batteries to charge from solar, but not from the grid. That restriction could matter. A battery might buy cheap electricity and use it when retail prices are higher.

I tested that across all 47 counties for both electrification scenarios: gas appliances with a gasoline car, and electric appliances with an EV. Solar and battery sizes were optimized separately in each case. Grid-charged energy could supply the home but could not be exported.

In the 46 counties assigned to PG&E or SCE, both scenarios still selected zero storage. The solver bounds limited any missed benefit from grid charging to less than $1 per year. San Diego was the exception: the additional annual savings were bounded at about $29–44 for gas/ICE and $57–85 for electric/EV, including equipment costs.

Those San Diego ranges describe unresolved numerical precision, not variation across households. The exact optimal sizes are less certain, and the model allows small continuous battery sizes while omitting gradual degradation. Still, the experiment established an exception that belongs alongside the main finding.

The tests themselves need scrutiny, too. While reviewing them for this post, a focused run passed 220 tests and skipped one. The skipped comparison lacked required tariff columns. That comparison was not performed, so it cannot count as supporting evidence.

Some older tests also make assumptions I would now describe more narrowly. One expects a prescribed solar/storage system to cut electricity bills by 50–95%. Another expects two billing treatments to produce results within 10% of each other. Those may have served as checks for particular saved cases. They are not general laws of solar economics, and they should not become acceptance criteria for newly optimized systems.

I don't want to change a failed test just because I prefer the new answer. I also don't want to preserve an unjustified expectation forever because it happens to be written as an assertion. The task is to understand what failed: the implementation, the input, or the expectation.

The latest tax-credit review makes this distinction concrete. Existing tests pass, but the old sensitivity extends a battery discount below the eligibility threshold and assumes the same incentive treatment for a future replacement. Correcting those assumptions, then rerunning the comparison, is still pending. I cannot describe a proposed validation as something the research has already passed.

To keep track of this, I maintain readable methods, a formula manifest, and a source catalogue. They record what a number represents, where it came from, and what it does not establish. Saved run records connect results to code versions, inputs, and validation checks. I want to be able to return to a figure months later and explain which calculation produced it.

There is always another sensitivity I could run. I am trying to prioritize the ones that could change a claim, the interpretation of a figure, or a decision someone might make from the paper.

For me, the useful outcome is being able to explain why I trust a result, where that trust stops, and what evidence made me change my mind. The San Diego exception and the revised electrification costs both belong in that explanation. They are part of what the validation found.
