---
layout: post
title: "How to electrify, fast"
date: 2026-09-10 12:00:00 -0700
categories: notes
---

*I started drafting these ideas in 2025 and returned to them in 2026.*

I feel like there's a dissonance in how we talk about climate change and decarbonization and I find it annoying. We say we need to decarbonize ASAP, but then don't set up any of the actions we need to take to be a flywheel. So nothing takes off. My grandparents have a (Russian) phrase for this: "Hurrying slowly."

On one hand, we should have started much earlier. The [IPCC pathways that limit warming to 1.5°C](https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/) require rapid emissions reductions now, followed by some amount of carbon dioxide removal. We do have ways to remove carbon, including forests, soil management, and early engineered systems. But we do not have anything operating at the enormous scale assumed in many climate models.

I do not want our plan to depend on a future machine arriving just in time to clean up several decades of continued emissions. The less carbon we emit now, the less we have to remove later.

On the other hand, the work to decarbonize has been, let's just say, sluggish. We spend years discussing the optimal program, the perfect incentive, and the exact allocation of every cost. Cost, reliability, and equity are real constraints. They are not reasons to wait forever, though!

So what would it actually mean to electrify California fast?

My short answer is: replace the largest sources of fossil-fuel use first, stop treating every electric project as a unique engineering problem, make new loads flexible by default, and build clean supply and wires at the same time.

## Electrification is not the final goal

The goal is not to install the largest possible number of electric appliances. The goal is to stop burning fossil fuels while keeping energy reliable and affordable.

Electrification is still one of the most useful ways to get there. Electric technologies often need much less energy to perform the same task. A typical electric vehicle converts about 87 to 91 percent of its stored energy into movement, compared with about 30 percent for a gasoline vehicle. ([U.S. Department of Energy](https://www.energy.gov/cmei/vehicles/articles/fotw-1360-sept-16-2024-typical-ev-87-91-efficient-compared-30-conventional)) A heat pump moves heat instead of producing it through combustion, and can use much less energy than a furnace or electric-resistance heater. ([U.S. Department of Energy](https://www.energy.gov/energysaver/heat-pump-systems))

Electric equipment also gets cleaner as the grid gets cleaner. A gas furnace installed today will burn gas for the rest of its life. A heat pump installed today can have lower emissions each year as more clean electricity comes online.

But "electrify everything" isn't really a complete climate strategy. California also needs fewer vehicle miles, better transit and land use, industrial process changes, methane reductions, energy efficiency, and carbon removal for emissions that are genuinely difficult to eliminate. Transportation is still California's largest source of greenhouse gas emissions, according to the state's [2023 emissions inventory](https://ww2.arb.ca.gov/ghg-inventory-data). Replacing gasoline vehicles matters, but so does reducing the need to drive them.

I would therefore measure speed in fossil fuel displaced and emissions avoided, not in electrified devices installed.

## Use equipment replacement as the deadline

The fastest practical time to replace a furnace, water heater, or car is often when the existing one reaches the end of its life. That is when the owner is already prepared to spend money and the project already has to happen.

The problem is that equipment failures create terrible planning conditions. If a gas water heater breaks on Friday, most people will buy whatever can be installed by Monday. They will not wait for a panel assessment, permit, rebate application, and electrical work.

Fast electrification therefore starts before the equipment fails. Buildings can be made electric-ready with panel space, conduit, suitable circuits, and a plan for managing load. Contractors can offer standard replacement packages. Permits and incentives can use a small number of pre-approved designs. Some homes can avoid a service upgrade by using load-management controls instead of assuming every new appliance must run at full power at the same time.

This is less exciting than announcing a new technology target, because ultimately we don't need any new tech. But this means that we don't have to wait to set this into motion: it's feasible *today*.

## Make energization routine

California uses the word *energization* for connecting a new building or a larger electric load to utility service. This is different from generation interconnection, which connects solar, batteries, or power plants to the grid.

Some energization projects still take months or years. California passed SB 410 and AB 50 to address that problem, and the CPUC has now established target timelines and utility reporting requirements. ([CPUC energization proceeding](https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/infrastructure/energization)) publishing timelines is useful because they lets us see where projects stop moving. Then, the actual work can start: reporting a delay isn't the same as unblocking it.

The application process should start with structured data, automatic checks for missing information, and a visible list of project milestones. An LLM could help normalize older documents or route unusual requests. Ideally, a more durable solution is a standard application that does not need an LLM to interpret it in the first place, but that doesn't fit as well with the mish-mash world of old paper trails we live in. At least the LLM can accelerate part of it.

But it has its limits. An LLM can tell us that an application is missing a parcel number. What it can't do, though, is manufacture a transformer, design a feeder, or send a crew to the site.

Ideally, we would streamline as much of this as possible, aka create a "Happy Path" that's easy for consumers to adopt. Utilities can separate routine requests from projects that need detailed engineering. A standard heat pump, managed EV charger, or small service change should have a standard path. Engineers should spend their time on cases that are actually unusual. 

Imagined like this, it seems clear that this would accelerate electrification and decarbonization - we just haven't been properly serious about it so far.

## Build distribution capacity before every customer asks for it

The current process is often reactive. A customer requests service, the utility studies the request, and only then does it discover that a transformer, feeder, or substation needs an upgrade.

That approach works when load grows slowly. It works much less well when an entire neighborhood is adding electric cars, heat pumps, and water heaters.

California already forecasts where electric load is likely to grow. Utilities can combine those forecasts with building data, vehicle adoption, permits, and the age and loading of existing equipment. They should use that information to order equipment and upgrade constrained areas before every individual customer enters a queue.

This requires regulators to let utilities invest ahead of confirmed requests, while still checking that the investment is useful. It also requires utilities to publish enough information for customers, cities, and developers to plan around real grid capacity.

I think this is a larger bottleneck than application paperwork. Better software can remove wasted time, which matters. But if the physical capacity is not there, a perfect application only reaches "no" faster...

## Why is building distribution capacity reactive? A side note

In my opinion, it's three factors stacked together: a legacy planning model, regulatory incentives, and real engineering uncertainty. But the deepest issue is who bears the risk of a forecast being wrong.

Historically, electricity demand grew slowly. Utilities could watch demand rise on a circuit, wait for a firm customer request, and then justify an upgrade. Regulators also wanted to avoid making every ratepayer pay for transformers and substations that might never be used.

That approach makes a particular tradeoff:
- Build early, and ratepayers risk paying for unused capacity.
- Wait for certainty, and customers bear the delay.

The old system favored certainty. That was reasonable when demand changed gradually. It works much less well when a fleet-charging depot can request several megawatts and be ready within months, while the required grid upgrade may take years. CPUC staff has explicitly said that the prior practice is “no longer sufficient” for these new loads. [CPUC staff proposal, 2024](https://docs.cpuc.ca.gov/PublishedDocs/Efile/G000/M529/K078/529078850.PDF)

There are also genuine engineering limits. Distribution problems are extremely local. Knowing that California will adopt more EVs doesn’t tell a utility:
- which neighborhood will adopt them first;
- which transformer will become overloaded;
- what hour the vehicles will charge;
- whether a proposed development will actually be built; or
- whether customers will manage their demand instead of requiring an upgrade

Utilities therefore need forecasts at the circuit and transformer level, not just statewide projections. They also have to check voltage, equipment temperature, protection settings, and the capacity of upstream feeders and substations.

I guess it's a bit uncharitable to say that the process is reactive. It's not -- utilities already forecast load and use meter data and geographic models. The reactive part often appears later: a firm service request reveals that the forecast didn’t reserve enough capacity at that exact location, or the request arrives much sooner than expected. The upgrade then enters a separate process for design, funding, permits, equipment, and construction. Effectively, electrification makes every weakness in that arrangement more visible.

California is now trying to allow a utility to start planning (and sometimes funding or building) an upgrade before a completed customer application proves the electricity need (projects called ["pending loads"](https://docs.cpuc.ca.gov/PublishedDocs/Published/G000/M544/K154/544154869.PDF)). A 2024 CPUC decision requires longer-term planning, better use of local development and energization data, and temporary “bridging solutions” when permanent upgrades won’t arrive in time. [CPUC summary, Oct 2024](https://www.cpuc.ca.gov/news-and-updates/all-news/cpuc-enhances-utility-distribution-planning-to-better-meet-growth-in-customer-demand). Longer term planning helps because if a substation takes seven years to plan and construct, a highly accurate three-year forecast is almost useless. By the time the need appears in the forecast, the utility is already four years late.

## Make flexible demand the default

Electrification adds a lot of energy demand, but it does not have to add the same amount of peak demand.

Many new electric loads can move in time. An EV usually needs to be charged by morning, not the minute it arrives home. A heat-pump water heater can warm water before the evening peak. A building can pre-heat or pre-cool within a comfortable range. Batteries can charge when clean power is abundant and discharge later.

California has set a goal of shifting 7,000 MW of demand by 2030. ([California Energy Commission](https://www.energy.ca.gov/news/2023-05/california-adopts-goal-make-more-electricity-available-through-smarter-use)) That is not a small side program. Flexible demand can let the same grid serve more electric equipment while avoiding some of the most expensive peak-driven upgrades. Right now, configuring this demand is done appliance-by-appliance on a case-by-case basis, and only if your battery / EV app allows it. If that wasn't limiting enough, the only controls we have right now are fixed schedules rather than dynamic shifting based on demand and price. Part of the reason for this is it's hard to coordinate. We could either have the central third party coordinate it, or perhaps we could use other signals to infer the load on the line.

Could appliances infer grid conditions from the electricity already reaching the house? To some degree. A controller can measure the home’s current and keep its combined loads within the panel’s limit. Voltage and frequency can also reveal some unusual local or system conditions. But neither reliably tells the appliance how heavily loaded the neighborhood grid is—or what electricity currently costs. For ordinary load shifting, the utility still needs to send an explicit price or capacity signal. Local electrical measurements can provide the guardrails, but they can’t replace that signal.

At the scale of one house, flexible demand can also help avoid some panel and service upgrades. Electrical service is sized around the maximum load that might run at one time, even though a house spends most of the day well below that maximum. A listed power-control system can measure the current entering the house and adjust flexible equipment before the service reaches its limit. PG&E currently has something called [Rule 2](https://www.pge.com/tariffs/assets/pdf/tariffbook/ELEC_RULES_2.pdf) which recognizes that idea. Under this rule, loads controlled by a UL 3141-certified system do not count toward *connected load* (the equipment that could otherwise run at the same time) when the system enforces an import limit. That gives you an interesting "out" for electrifying within the current constraints - you can electrify without necessarily upsizing your electrical service. (The appliances still require correctly sized circuits and breakers).

Imagine a 100A house with its power control system set to keep managed demand <= 80A. The house is using 45A, so the controller lets the car charge at 32A (77A total draw). Then the oven and heat pump turn on, adding another 25A. Letting everything continue would push demand to 102A. Instead, the controller can reduce the car to 10A and thus the total stays at 80A. When the oven turns off, the car automatically starts to charge faster again. The main breaker still provides the final protection, but it doesn't have to act. (Breaker is meant to be an emergency stopgap / shutoff). Notice the difference from a fixed schedule? The controller enforces the real electrical limit, even when the household takes on some unexpected load.

Ideally, the controls should be automatic, understandable, and easy to override. Customers should also share in the value they provide. A program that makes people uncomfortable or hands complete control to a utility will not last. Neither will a system that leaves the utility saddled with aging infrastructure, spiky demand, and limited resources.

## Build clean supply and transmission in parallel

Demand flexibility reduces the amount of new infrastructure California needs. That helps, it's still time to build.

The grid still has to serve more transit, buildings, industry, manufacturing, and data centers while replacing fossil generation. California can't electrify first and build the supply later. It also can't build remote renewable gen without the transmission that we also need to actually deliver it.

<figure class="post-banner">
  <img src="{{ '/assets/img/electrification/caiso-20-year-resource-transmission-plan.png' | relative_url }}" alt="CAISO map of California showing areas for new solar, wind, geothermal, and storage resources, with arrows for the additional transmission needed to reach major load centers">
  <figcaption>CAISO's 2022 twenty-year outlook shows how much new generation and storage California expected to connect, and where additional transmission would be needed. The exact forecast has changed since then, but the map still shows the basic problem: many new resources are far from the places that use the most electricity. (<a href="https://www.caiso.com/documents/20yrtransmissionoutlookmap.pdf">CAISO</a>)</figcaption>
</figure>

We're starting to see the scale: CAISO's approved 2025–2026 transmission plan includes 38 projects with an estimated cost of $6.7 billion. More than half of the projects and cost are driven by load growth. The plan is based on a forecast of 15 GW of additional load by 2035 and 20 GW by 2040. ([CAISO](https://www.caiso.com/about/news/news-releases/iso-board-of-governors-approves-2025-2026-transmission-plan))
This will be really exciting if all the projects follow through: California still has to permit them, finance them, buy equipment, settle where it goes, and construct it. If any one of those steps waits for all the others to finish, the schedule expands by years.

## Use better models to approve ordinary projects faster?

This is the part where I think better computating could help.

Utilities currently use power-flow studies to determine whether new load will overload equipment or cause voltage problems. The studies are pretty detailed, and they're important for difficult cases, but they can be pretty slow if every request begins from zero.

California already has a version of this! It is called *Integration Capacity Analysis*, or ICA, and it isn't an AI model. The utility starts with an electrical model of a distribution feeder, adds load at a modeled location, and keeps increasing it until the added load causes a thermal, voltage, protection, or operating violation. California's standard method produces results for 576 representative month-hour conditions instead of relying on one peak snapshot.

The three large investor-owned utilities publish these numbers. [PG&E's Grid Resource Integration Portal](https://www.pge.com/en/about/doing-business-with-pge/interconnections/distributed-resource-planning-data-and-maps.html) includes load and generation ICA values for individual line sections. [SCE's Distribution Resources Plan External Portal](https://drpep.sce.com/drpep/?page=Page) shows available load capacity at the circuit, distribution-bank, and substation levels. [SDG&E's ICA map](https://marketplace.sdge.com/more-information/customer-generation/enhanced-integration-capacity-analysis-ica) reports load integration capacity for line segments. These portals are maps of model results, not the models themselves.

They're also screening tools, not promises that a project can connect. A [2026 CPUC review](https://docs.cpuc.ca.gov/PublishedDocs/Published/G000/M604/K537/604537575.PDF) explains that the current ICA method does not test every possible constraint. It can miss limitations at a service transformer or secondary conductor, short-circuit duty, and some higher-voltage equipment. The map and the later engineering review don't always agree.

This is useful, but it isn't yet an automated "yes." What if we could have fast sub-models that screen clusters of EV chargers or heat pumps, identify clearly safe requests, and send only borderline cases to a full engineering study? NREL has already demonstrated [EV hosting-capacity analysis](https://www.nrel.gov/docs/fy21osti/75639.pdf) on real distribution feeders.

[DeepOPF](https://arxiv.org/abs/1905.04479) is an interesting example of the larger idea. It uses a neural network to approximate an optimal power-flow calculation much faster than a conventional solver. It is not a ready-made answer for residential energization; it addresses a different grid problem, but it does show how a slower physical calculation can help train a much faster first-pass model.

These models could be a good place to start for triage, but of course we'll need extra checks to authorize the specific work. The model should show its safety margin, the data it used, and why a request passed. Engineers should validate it against conventional studies and field measurements. Hopefully, over time, engineering effort on some of these projects can go down.

## The harder problem is affordability

After looking at residential solar and storage costs, I think affordability might be the bigger threat to fast electrification.

California can make heat pumps and electric vehicles technically available. But households will not switch fuels quickly if electricity is expensive, installations are unpredictable, and every project risks an electrical upgrade. A one-time rebate can help with the purchase price, but after consumers get their device, it's trouble if they still have to deal with a high monthly bill or a gnarly process that forces the homeowner to coordinate five contractors.

This creates an uncomfortable feedback loop. The grid needs investment to support electrification. Utilities recover much of that investment through electric rates. Higher rates can then make an electric car or heat pump less attractive than the fossil-fuel equipment it is supposed to replace. If adoption slows, electricity sales grow more slowly, so the grid's fixed costs are spread across fewer new kilowatt-hours. That puts still more upward pressure on rates.

<figure class="post-banner">
  <img src="{{ '/assets/img/electrification/electrification-affordability-loop.svg' | relative_url }}" alt="Feedback loop in which needed grid investment increases grid costs per kilowatt-hour, higher rates make electric vehicles and heat pumps less attractive, slower electrification limits electricity sales, and fixed grid costs are spread over fewer kilowatt-hours">
  <figcaption>This is the bad version of the flywheel: higher costs slow electrification, and slower electrification makes the same costs harder to spread.</figcaption>
</figure>

The opposite could become a useful flywheel. The [California Energy Commission's latest forecast](https://efiling.energy.ca.gov/GetDocument.aspx?DocumentContentId=106694&tn=269602) expects additional sales from electrification and data centers to spread fixed utility costs across more electricity use. That could moderate rates, but it only works if people can afford to electrify in the first place.

Equity is part of this problem, not a distraction from it. A transition limited to homeowners with cash, time, and good credit will not be fast at the scale California needs. Renters, apartment buildings, small businesses, and lower-income households need simple programs that don't need them to be energy-policy experts to actually reap the benefits of electrification. We can't hand-hold every house through the electrification decision and implementation: at some point, this needs to become the obvious, no-brainer choice that takes off on its own, for this to actually work.

At the same time, an equity program can't take three years to design and another year to approve each participant. Speed means making support predictable and easy to claim.

## What I mean by fast

I started with a question about how to electrify as fast as possible; but what's beneath that is that we need *divestment* from carbon-emitting sources, fast.

Electrification isn't the goal by itself. The goal is to eliminate fossil-fuel combustion fast enough to matter, without making the energy system unreliable or unaffordable. There might be a better way to do this, but for cars and buildings, electrification is usually the strongest tool we have. In other sectors, efficiency, changes in demand, clean fuels, carbon removal, etc. might be better.

My version of "fast electrification" would do six things at once:

1. Prepare buildings before fossil equipment fails.
2. Give routine electric loads a standard path to energization.
3. Build distribution capacity ahead of predictable demand.
4. Make flexible operation the default for cars, water heating, heating, and cooling.
5. Build clean generation, storage, and transmission in parallel.
6. Use faster models to screen ordinary cases while engineers focus on real constraints.

My point is to stop making every project bespoke. California already knows which technologies it wants people to adopt and where much of the demand will appear. The state should plan for that demand as a system, instead of asking each household or business to discover the same obstacles one project at a time. That seems both faster and more realistic than waiting for one perfect technology to save us later.
