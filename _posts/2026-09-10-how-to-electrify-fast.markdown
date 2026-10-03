---
layout: post
title: "How to electrify, fast"
date: 2026-09-10 12:00:00 -0700
categories: notes
---

There’s a dissonance in how we talk and act about climate change and decarbonization: on the one hand, we say we needed it yesterday. On the other hand, we don’t set up electrification to be a flywheel. We still make adopting the thing we want people to adopt surprisingly difficult.

Starting with the obvious: we should have started acting on climate change much earlier. The pathways assessed by the IPCC that limit warming to 1.5°C combine deep emissions reductions with *actually removing carbon dioxide from the air*. Some removal can come from forests and soils, and some from engineered systems, including the “carbon-sucking machines.” But scaling these methods comes with substantial feasibility and sustainability constraints. Having removal in a model doesn’t mean we’ve worked out how to deliver it. [IPCC assessment](https://www.ipcc.ch/report/ar6/wg3/chapter/summary-for-policymakers/)

I don’t want our plan to depend on a future machine arriving just in time to mop up decades of emissions. It seems risky to bet *the whole earth* on something we haven’t demonstrated at the scale we’d need. To be more confident we’ll actually achieve our results, we could instead emit less carbon now. The less we put into the air, the less we’ll have to remove later.

Meanwhile, the work to decarbonize has been, in my opinion, sluggish. We spend years discussing the optimal program, the perfect incentive, and the exact allocation of every cost. Cost, reliability, and equity are real constraints. They are not reasons to wait forever, though!

So what would it actually mean to electrify California fast?

I think a lot of it comes down to making ordinary projects ordinary. A household replacing a water heater shouldn’t have to work through a small research project to figure out whether it can buy an electric one. And the utility shouldn’t discover, one customer application at a time, that the neighborhood is going to need more electricity.

## What are we trying to make faster?

The goal is to stop burning fossil fuels while keeping energy reliable and affordable. Counting electric appliances gives us some information about that, but it doesn’t tell us how much fossil-fuel use we’ve displaced.

Electrification is useful partly because electric equipment can do the same job with much less energy. The Department of Energy estimates a typical EV’s efficiency at 87–91%, including energy recovered through regenerative braking, compared with about 30% for a conventional gasoline vehicle. A heat pump moves heat rather than generating it by burning fuel, which is why it can deliver more heat than the electrical energy it consumes. [DOE vehicle comparison](https://www.energy.gov/cmei/vehicles/articles/fotw-1360-sept-16-2024-typical-ev-87-91-efficient-compared-30-conventional), [heat-pump explanation](https://www.energy.gov/energysaver/heat-pump-systems)

There’s also the promise that the equipment gets cleaner as the grid gets cleaner. A gas furnace installed today will keep burning gas for the rest of its life. A heat pump can have lower operating emissions as the electricity supplying it gets cleaner, without the household replacing it again.

Even then, I’d want to know how much fossil-fuel use we’re actually displacing. We could get more EVs on the road while people also drive more, for example. Or better transit could reduce gasoline consumption without adding any electric cars to our count. So I’d measure progress in fuel displaced and emissions avoided. The number of devices installed only tells us part of that.

## Start before the water heater breaks

The end of an appliance’s life is an obvious opportunity. The owner already needs to spend money, and something is getting installed either way.

Unfortunately, it’s also a terrible time to start planning.

If a gas water heater breaks on Friday, most people will buy whatever can be installed by Monday. They’re not going to wait for a panel assessment, electrical work, a permit, and a rebate application to work their way through four different processes. They need hot water.

We’ve effectively arranged things so that the easy choice is to buy another gas appliance. Then we ask the customer to make the harder choice because it’s better for the climate.

I’d rather make the electric replacement easy. Some of the work has to happen before the failure: checking electrical capacity, identifying suitable equipment, preparing circuits where they’re needed, and knowing what the installation will cost. Contractors could offer standard replacement packages, with permits and incentives designed around common configurations.

Some houses might also avoid a service upgrade by managing their loads. We don’t necessarily need every appliance to run at full power simultaneously. More on that in a moment.

For these ordinary replacements, we don’t have to wait for a new technology. We could start preparing houses and standardizing installations now. That seems like a much better use of the time before someone’s furnace or water heater fails.

## Make connecting the equipment routine

California uses the word *energization* for connecting a new building or a larger electric load to utility service. That’s different from generation interconnection, where something like a solar installation or power plant connects to supply electricity.

California has already tried to address energization delays through SB 410 and AB 50. The CPUC adopted target timelines, reporting requirements, and a process for customers to report delays. That gives us a way to see where projects stop moving. [CPUC energization proceeding](https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/infrastructure/energization)

Then the actual work has to start. Reporting a delay isn’t the same as unblocking it.

The application process seems like an obvious place to improve things: structured data, automatic checks for missing information, and milestones that both the customer and utility can see. An LLM could help normalize older documents or route unusual requests. Ideally, we’d have a standard application that doesn’t need an LLM to interpret it in the first place, but that doesn’t fit as well with the mish-mash world of old paper trails we live in. At least the LLM can accelerate part of it.

The purpose would be to get a complete application to the right person with enough information to make a decision. If the next step requires a transformer or a construction crew, we should be able to see that too, including who’s responsible and what’s holding it up.

What I’d like is a “Happy Path” for common projects. If a heat pump or managed EV charger fits a configuration the utility has already evaluated, there should be a predictable way to approve it. Engineers should spend their time on the cases where the equipment or local grid conditions actually require investigation.

That would mean doing more work upfront to define those configurations and identify their limits. But we’d get to reuse that work. Making every applicant go through the same investigation again seems like an expensive way to avoid standardizing the process.

## Build capacity before everyone asks for it

The larger problem is what happens when the application is complete and the physical capacity still isn’t there.

A customer requests service, the utility studies it, and the project turns out to require a transformer, feeder, or substation upgrade. Now there’s another process for design, funding, permits, equipment, and construction. Better application software gets the customer to this point faster, but they still can’t connect.

My initial reaction is: we already know we want people to electrify. Why are we waiting for them to ask individually?

I guess it’s a bit uncharitable to call the whole process reactive. Utilities already forecast load and use meter data and geographic models. Knowing that California will adopt more EVs, though, doesn’t tell them which neighborhood will adopt first, which transformer will be overloaded, or what time everyone will charge. A proposed development might never get built. A large customer might arrive much sooner than expected.

That explains why the forecast is difficult. It doesn’t make waiting for a firm request a sufficient plan.

The question underneath this is who bears the risk of being wrong. Build early, and ratepayers might pay for capacity that sits unused. Wait, and customers bear the delay. If that delay leads someone to buy another gas furnace or prevents a fleet from switching to electric vehicles, there’s a cost to that decision too. It just doesn’t appear as an unused transformer on the utility’s books.

I think we need to be much more willing to build ahead of credible demand, and explicit about how we decide which forecasts are credible enough.

California is moving in that direction. A 2024 CPUC decision called for longer-term distribution planning, better use of local development and energization data, and information about temporary “bridging solutions” where customers could connect before permanent upgrades are complete. Those can include flexible service or limits on when and how much power a customer draws. [CPUC distribution-planning decision](https://www.cpuc.ca.gov/news-and-updates/all-news/cpuc-enhances-utility-distribution-planning-to-better-meet-growth-in-customer-demand)

The planning horizon matters a lot. If a substation takes seven years to plan and construct, a highly accurate three-year forecast still arrives four years too late. By the time we can confidently point to the demand, we’ve already missed the chance to be ready for it.

I’d want the forecasts tied to actual decisions: which equipment gets ordered, which projects enter design, and which locations need more investigation. Otherwise, we can keep improving the forecast while the construction schedule stays exactly where it was.

## Make flexible demand the default

Electrification adds electricity consumption. How much it adds to the peak depends partly on when we use it.

An EV might need to be charged by morning, without needing to charge immediately when it gets home. A water heater can do some of its heating before the evening peak. A building can pre-heat or pre-cool within a comfortable range. We should be using that flexibility as part of the plan for electrification.

California has a goal of shifting 7,000 MW of demand by 2030. That’s substantial enough to affect how we plan the grid and design the equipment connecting to it. [California Energy Commission](https://www.energy.ca.gov/news/2023-05/california-adopts-goal-make-more-electricity-available-through-smarter-use)

But I don’t think we’ll get there by expecting everyone to become interested in demand response. Someone buying an EV mostly wants their car charged. They shouldn’t need to compare utility programs, configure several apps, and keep checking whether their schedules still make sense.

There are already tools for sending useful signals. The CEC’s MIDAS system provides access to time-varying rates, emissions signals, and Flex Alerts. I’d want those signals connected to the equipment so a customer can specify what they need—when the car must be ready, for example—and the system can handle the timing. [CEC MIDAS](https://www.energy.ca.gov/proceedings/market-informed-demand-automation-server-midas)

There’s also a more local opportunity: managing how much power the house draws at once.

For a simplified example, imagine a house with a properly designed control system enforcing an 80A import limit. The other loads are using 45A, so the car can charge at 32A, bringing the total to 77A. Then the oven and heat pump add another 25A. Instead of letting the total reach 102A, the controller reduces the car’s charging to 10A. The house stays at 80A. When the other loads fall, the car can charge faster again.

Notice what changed: the car gets its energy over a different period, and the house doesn’t need to draw the maximum power of every appliance simultaneously.

The circuits and protective equipment still have to be correctly designed. The main breaker remains there for protection; we shouldn’t be using it as the thing that routinely manages demand.

PG&E’s Rule 2 recognizes certain controlled loads under specified conditions, including a UL 3141-certified power-control system with independently verified import-limit functionality. That gives a concrete route for considering managed equipment differently from equipment that can all run at once. [PG&E Rule 2, section H.7](https://www.pge.com/tariffs/assets/pdf/tariffbook/ELEC_RULES_2.pdf)

This is the sort of option I’d want checked *before* telling a household it needs a larger service.

Managing the house’s limit and responding to the wider grid are separate jobs, though. Measuring the current entering the house tells a controller when to slow down the car. It doesn’t tell the controller how heavily loaded the neighborhood is, or what electricity costs at that moment. For that, we need communication with the utility or another coordinating service.

I want the controls to be automatic and understandable, with customers able to specify what they need and share in the savings. If flexible operation reduces the infrastructure we have to build, some of that value should make electrification cheaper for the people providing the flexibility.

## Build the supply and wires at the same time

California still needs clean generation, storage, transmission, and distribution capacity as it replaces fossil-fuel use and serves additional demand. Moving consumption around helps us use that infrastructure better. It doesn’t remove the need to build it.

We can’t finish electrifying and then get around to supplying the electricity. We also can’t build remote generation and assume the power will somehow reach the places that need it.

<figure class="post-banner">
  <img src="{{ '/assets/img/electrification/caiso-20-year-resource-transmission-plan.png' | relative_url }}" alt="CAISO map of California showing areas for new solar, wind, geothermal, and storage resources, with arrows for the additional transmission needed to reach major load centers">
  <figcaption>CAISO's 2022 twenty-year outlook shows how much new generation and storage California expected to connect, and where additional transmission would be needed. The exact forecast has changed since then, but the map still shows the basic problem: many new resources are far from the places that use the most electricity. (<a href="https://www.caiso.com/documents/20yrtransmissionoutlookmap.pdf">CAISO</a>)</figcaption>
</figure>

CAISO’s approved 2025–2026 transmission plan includes 38 projects with an estimated cost of $6.7 billion. More than half the projects, and more than half the cost, are driven by forecasted load growth. [CAISO transmission plan](https://www.caiso.com/about/news/news-releases/iso-board-of-governors-approves-2025-2026-transmission-plan)

I’m excited to see that scale of planning. What I’d want to follow next is the construction: what has been ordered, what permits remain, and when the capacity will actually be available.

There are dependencies between those steps, but we should be looking for work that can happen in parallel. Waiting to settle every uncertainty before starting the next piece is how a project that we need urgently ends up years away.

The demand forecast, the procurement schedule, and the customer’s expected connection date need to describe a project that can actually happen. I’d like to see us judge the planning process by whether those dates line up.

## Use better models to approve ordinary projects faster

This is where I think better computing could help.

Utilities use power-flow studies to check whether new loads would overload equipment or cause voltage problems. My question is how much of that work we can do ahead of time, then reuse across similar requests.

California already publishes results from *Integration Capacity Analysis*, or ICA. These calculations estimate how much additional generation or load parts of the distribution system can accommodate under modeled conditions. PG&E includes the results in its Grid Resource Integration Portal. [PG&E planning data and maps](https://www.pge.com/en/about/doing-business-with-pge/interconnections/distributed-resource-planning-data-and-maps.html)

There’s still a gap between a map showing available capacity and a project getting approval. A 2026 CPUC draft review describes constraints outside the current analysis, including service-transformer and secondary-system limitations, and short-circuit duty. The engineering review can therefore find a problem that the published capacity number didn’t capture. [CPUC draft ICA review](https://docs.cpuc.ca.gov/PublishedDocs/Published/G000/M604/K537/604537575.PDF)

I’d want to use those discrepancies to work out what the screening process is missing. Which additional checks would let us confidently approve a common configuration? Which information is stale or unavailable? Which projects really do need a full study?

That seems like a useful place to develop faster models. We could screen common configurations of chargers or heat pumps against the constraints that matter at that location, then send the cases we can’t resolve to an engineer.

[DeepOPF](https://arxiv.org/abs/1905.04479) is an interesting example of the broader computational idea: use a neural network to approximate a slower optimal power-flow calculation. It addresses a different grid problem, so it isn’t a residential-energization tool. What interests me is the possibility of using expensive calculations to train a faster model for decisions we need to make repeatedly.

For an approval process, I’d want the model to expose its inputs and safety margins, and to be checked against conventional studies and field measurements. Those checks would establish which decisions we can automate. Over time, we should be able to expand that set instead of treating every new application as if we’ve learned nothing from the previous ones.

## Affordability determines whether this takes off

After looking at residential solar and storage costs, I think affordability might be the larger threat to fast electrification.

We can make heat pumps and EVs technically available. But people won’t switch quickly if the installation price is unpredictable, the electricity bill is high, and buying an appliance might turn into an electrical-upgrade project. A rebate can help with the purchase. It doesn’t resolve the monthly bill, or the gnarly process where the homeowner ends up coordinating five contractors.

I want electrification to make sense for the person paying for it. We can’t build a mass-adoption strategy around asking people to absorb those costs and difficulties because they care about the climate.

There’s an uncomfortable feedback loop here. The grid needs investment to support electrification, and utilities recover costs through customers’ bills. Higher electricity prices can then make electric equipment less attractive. If adoption slows, there’s less additional electricity consumption over which to spread the grid’s fixed costs.

We can end up making the transition more expensive through the way we pay for it.

<figure class="post-banner">
  <img src="{{ '/assets/img/electrification/electrification-affordability-loop.svg' | relative_url }}" alt="Feedback loop in which needed grid investment increases grid costs per kilowatt-hour, higher rates make electric vehicles and heat pumps less attractive, slower electrification limits electricity sales, and fixed grid costs are spread over fewer kilowatt-hours">
  <figcaption>This is the bad version of the flywheel: higher costs slow electrification, and slower electrification makes the same costs harder to spread.</figcaption>
</figure>

More electricity use could help spread those costs, particularly where we can use capacity that’s already there. The CEC’s draft 2025 energy forecast anticipates that additional sales from electrification and data centers will moderate upward pressure on rates. [CEC draft forecast](https://efiling.energy.ca.gov/GetDocument.aspx?DocumentContentId=106694&tn=269602)

That makes the timing of costs and adoption important. We need people to be able to afford the equipment and its operation before we can realize the benefits of wider adoption. I’d want rate design and installation support evaluated together: does the household actually end up with an affordable way to switch?

And which households can use it?

Renters can’t necessarily choose their heating system. Apartment buildings have different ownership and electrical arrangements. A household without spare cash can’t make an expensive purchase just because someone calculates that it might pay back eventually.

If our process mainly works for homeowners with cash, time, and good credit, we’ve designed for a limited part of California. We need arrangements that work for the other households too, without requiring each participant to learn the rules of the energy system.

I also don’t want those programs to spend years being designed and then take months to approve each person. Eligibility should be understandable, support should be predictable, and the contractor should know how to apply it as part of the installation.

## What I mean by fast

We can’t hand-hold every house through its own electrification research, financing, and construction project. At some point, this needs to become the obvious, no-brainer choice that takes off on its own.

That means doing more of the work collectively and in advance. Prepare the buildings before equipment fails. Evaluate common installations so the engineering can be reused. Order grid equipment early enough that it arrives when the demand does. Make flexible operation part of the installation, with a clear benefit for the customer.

My frustration is that we already know we want these things to happen, but still ask each household or business to discover the same obstacles and negotiate its way through them. I want California to take responsibility for making the whole process work—from deciding to replace an appliance to actually using the electric one at a cost the customer can afford. That’s the work I think we should be treating as urgent.

*I started drafting these ideas in 2025 and returned to them in 2026.*
