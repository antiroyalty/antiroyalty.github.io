---
layout: post
title: "How I check whether my research is wrong"
date: 2026-09-18
categories: research code
---

I'm trying to finish a paper on whether solar and battery storage make economic sense for households in California. A lot of that work lately has been trying to find ways the answer could be wrong. This has been productive, although occasionally in ways that are inconvenient for the paper I am trying to finish.

The model represents a household in each of 47 California counties. It chooses how much solar and storage to install, and how to operate that equipment hour by hour, then combines the energy bills with the cost of buying the equipment. I also want to know what happens when the household electrifies its appliances and adds an EV. More electricity consumption changes how much of the solar production the home can use, and when it needs power. Does that make solar and storage a better investment?

One result keeps coming back: under the modeled post-tax-credit costs and NEM 3 rules, the least-cost systems have small solar installations and essentially no storage. That surprised me. But a result being surprising doesn't tell me whether I've found something interesting or made a mistake somewhere. I could have the wrong battery price. I could be calculating the credits for electricity sold back to the grid incorrectly. Or I could have perfectly correct calculations for two households that aren't being given comparable choices.

So, how do I check? There are really several questions here: (1) does the code calculate the model I intended, (2) do the inputs and the model's behavior resemble the things they represent, and (3) does the conclusion survive a reasonable change in an important assumption? A passing unit test can answer a very specific accounting question. It leaves quite a lot of the rest open.

## What is the model actually minimizing?

One problem was that I had ended up with different cost calculations in optimization and reporting. The optimizer could assign value to an export credit that the reporting calculation could not actually use to reduce the household's bill. A separate simulation experiment exposed cases where those calculations ranked equipment choices differently.

That was a problem! The solver was choosing a system using a different definition of savings from the one I would put in the paper. And looking at a yearly total wouldn't necessarily make it obvious where the difference came from.

For this, I want an example small enough to calculate myself. Put aside the 8,760 hours of electricity flows for a moment. Suppose a household owes $20 for generation and $40 for delivery. It earns $30 of generation credits and $5 of delivery credits, and has another $29 of charges that those credits cannot pay.

If generation and delivery share one eligible pool, there are $35 of credits to apply against $60 of charges. Add the $29, and the bill is $54. But if the pools are separate, only $20 of the generation credits can be used. The remaining $10 sits there while the household still owes money for delivery. The bill is now $64.

These are teaching numbers, but they let me see what a rule does before asking the code for an answer. The research calculation settles credits annually and assigns no future value to unused balances. That's a simplification. A real utility bill has monthly statements and carryover rules, and this calculation doesn't reproduce all of them. I still need to be explicit about which simplification the optimizer is using, because it can change which equipment the model decides to buy.

Optimization and reporting now share the annual accounting equation. I also take the selected hourly electricity flows, recalculate the bill, and check that the totals reconcile. That keeps the two implementations from drifting apart. Though agreement alone isn't enough either: they could both be using the same wrong assumption. The small examples give me a way to check what the shared equation actually means.

Equipment lifetimes have a similar issue. My study runs for 25 years, and the assumed battery life is 15 years, so a household that buys a battery needs to replace it during the study. Then the study ends while the replacement still has five years of life left. I assign it one-third of its cost as remaining value. (That is an assumption about its remaining value, not money I know the household will receive.)

The test starts with three dated amounts: pay $10,000 now, pay $10,000 in year 15, and assign $3,333 of remaining value in year 25. At a 7% discount rate, that works out to about $1,116 per year over the study. I calculate this schedule independently and compare it with the shared annualization code. It is much easier to reason about those payments than to stare at a coefficient and decide whether it looks right.

Some checks are more basic. Electricity has to balance in every hour. A battery cannot discharge energy it never received, and some of the electricity sent into it is lost during charging. That energy has to be accounted for too. I require the battery's charge at the end of the modeled year to match the beginning; otherwise, the model can quietly borrow energy from outside the study.

I also check solar production at night, incomplete hourly profiles, negative loads, and whether the meter imports and exports simultaneously. A yearly bar chart can look perfectly ordinary while a few hours underneath it make no physical sense.

The optimization solver gives me another check. It reports the cost of a feasible solution and a lower bound on the best possible cost. The difference tells me how much improvement could still be hiding in an unresolved solution. For the main runs, I require that gap to be no more than $1 per year.

That tells me how closely the solver has answered the question. It says nothing about whether my battery price is accurate to within a dollar! The solver can be very precise about the problem I gave it, including assumptions I should have questioned. I would describe this work as verification, reconciliation, and validation; I haven't formally verified the whole research model.

## Does this look like the household I say it represents?

Then there are the ballpark checks. I compare household and appliance consumption with the [EIA Residential Energy Consumption Survey](https://www.eia.gov/consumption/residential/data/2020/index.php?view=state) and the [California Residential Appliance Saturation Study](https://www.energy.ca.gov/data-reports/surveys/residential-appliance-saturation-study): refrigerators, lighting, plug loads, heating, and total consumption. I also check seasonal solar production, winter gas demand, and plausible effective electricity prices.

But even here, what should match? A statewide average includes homes of different sizes, in different climates, with different heating fuels. My gas-heated baseline shouldn't automatically consume the same amount of electricity as an average that includes electrically heated homes. I also compare the assembled loads with their ResStock building-simulation inputs. That helps me see whether I combined the source data correctly, though I'm still comparing with the simulation data I started from.

Actual PG&E household bills give me another reference for consumption and seasonal patterns. But one home is one home. And for a solar household, the net meter reading doesn't tell me its total electricity use. Those bills help with plausibility; there's a lot they can't tell me about whether I've represented households across all 47 counties well.

Vehicle maintenance was another case where checking an input led to more work than fixing a number. One calculation effectively charged the gasoline car $1,200 per year, while its appliance definition specified $283.65. Those should at least agree. But fixing the inconsistency raised another question: did the lower estimate cover maintenance over the ownership period I was actually studying?

I went back to the mileage bands in the maintenance source. The revised allowances cover 144,000 miles over 12 years, giving about $656 per year for the gasoline car and $324 for the EV. These are still empirical assumptions, with limitations. At least the calculation now covers the period I say it covers.

After the vehicle-cost corrections and input updates, the matched comparison showed fully electric homes with EVs costing more overall in most modeled counties. Their energy spending still fell, but buying and owning the equipment changed the answer about total cost. So I had to revise the research claim. That's a more consequential result of checking the model than getting another hundred tests to pass, even if it complicates the story I was trying to tell.

There was also a problem with the choices each household was allowed to make. An earlier setup gave the gas household a fixed solar/storage system while letting the electric household optimize its equipment. One household got to choose its system; the other got the one I assigned it.

The current comparison gives each electrification scenario both a no-solar case and an independently optimized solar/storage case. I also separate the effect of equipment from the effect of changing rate plans. Otherwise, a household can appear to save money by adding equipment when some of the savings actually come from moving to a different electricity tariff. The arithmetic can be correct all the way through, and I can still explain the result incorrectly.

## Trying another model, and changing what mine allows

I've also compared parts of the model with the [System Advisor Model, or SAM](https://sam.nlr.gov/). In an isolated experiment, I changed the solar-production model, replayed battery operation through a more detailed battery simulation, and compared alternative operating strategies. Each of those comparisons could expose a different assumption.

I have to be a little careful about what I call an independent benchmark, though. The models need matching inputs and definitions before a disagreement tells me much. And the SAM experiment used my research billing calculation to score costs, so agreement there wouldn't independently establish that the tariff calculation was right. It was useful for checking particular parts of the model; it didn't validate every current statewide result.

Another concern was whether I had simply ruled out an option that would change the answer. My central scenarios allow batteries to charge from solar, but not from the grid. That matters if a battery could buy cheap electricity and use it later when retail prices are higher. Perhaps I wasn't finding storage because I wasn't allowing one of the things it could be useful for.

I tested this across all 47 counties, for both the gas-appliance household with a gasoline car and the electric-appliance household with an EV. Solar and battery sizes were optimized separately in each case. Grid-charged energy could supply the home, but couldn't be exported.

In the 46 counties assigned to PG&E or SCE, both scenarios still selected zero storage. The solver bounds limited any missed benefit from grid charging to less than $1 per year. San Diego was the exception: including equipment costs, the additional annual savings were bounded at about $29–44 for the gas/gasoline-car household and $57–85 for the electric/EV household.

Those ranges are the unresolved numerical precision of the optimization, not variation across households. The exact optimal sizes are less certain, and the model allows small continuous battery sizes while omitting gradual degradation. So there are qualifications to attach to those results. But San Diego is still an exception to the broader finding, and I need to keep it in the explanation rather than flattening the result into “batteries don't pay.”

## The tests have assumptions too

While reviewing the tests for this post, a focused run passed 220 tests and skipped one. The skipped comparison lacked required tariff columns. It didn't run, so it doesn't give me evidence for that comparison, however reassuring the rest of the output might look.

Some older tests also encode expectations that I would now describe more narrowly. One expects a prescribed solar/storage system to cut electricity bills by 50–95%. Another expects two billing treatments to produce results within 10% of each other. Perhaps those were useful checks for particular saved cases. But why should a newly optimized system satisfy them? Neither expectation is a general law of solar economics.

I don't want to change a failed test just because I prefer the new answer. I also don't want to preserve an unjustified expectation forever because it happens to be written as an assertion. I still have to work out what failed: the implementation, the input, or the expectation itself. Putting an assumption in a test doesn't settle that question.

To keep track of this, I maintain readable methods, a formula manifest, and a source catalogue: what a number represents, where it came from, and what it does not establish. Saved run records connect results to code versions, inputs, and validation checks. Otherwise, returning to a figure months later means trying to reconstruct which calculation produced it, including which of these corrections had happened by then.

There is always another sensitivity I could run, and I am trying to prioritize the ones that could change a research claim or the interpretation of a figure. Some already have, including the revised electrification costs and the San Diego exception.

The tax-credit sensitivity is still unresolved. Existing tests pass, but the old sensitivity extends a battery discount below the eligibility threshold and assumes the same incentive treatment for a future replacement. Correcting those assumptions, then rerunning the comparison, is pending. I don't yet know how much that will change the result. That's one of the next things I need to check before I can say what the model is telling me.
