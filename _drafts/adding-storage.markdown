---
layout: post
title: "Trying to Add Battery Storage to My Home"
date: 2025-10-08 12:00:00 -0700
categories: notes
---

In fall 2025, I had about two months to work out whether I could add a battery to my existing solar system before the federal tax credit ended.

I did not get the battery installed, but I did spend those two months learning how storage would fit into the solar and electrical systems already in the house. This post records what I learned, where I got stuck, and what I would need to do if I return to the project.

## No battery, no toilet flush

I wanted a battery primarily for one reason: 

The house has a sewer ejector pump that moves wastewater out of the lower level. The pump stops when the power goes out. I wanted enough backup power to keep it available during an outage.

The other benefits of using more of our solar energy (we have solar panels) and backup during a power outage were great but definitely secondary to being able to remove waste from our home. Having the sewer ejector overflow is absolutely no fun, and we've had that experience before.

I didn't know how exactly much battery capacity I would need, or what is available on the market. I also didn't know whether it would be possible with the type of solar that I have, nor whether it'd even be possible without a panel upgrade. I first needed to know how much power the pump draws while running, how much it needs when it starts, and which other circuits should stay on.

## We have solar at home

The 2019 A1 Sun installation agreement describes my Enphase solar system as 4.44 kW DC. It has twelve LG370 solar modules, twelve IQ7+ microinverters, and one IQ Envoy monitoring unit. The matching PG&E agreement lists the system as 4.0 kW CEC-AC. The DC number comes from the solar modules. The CEC-AC number estimates output after conversion to AC. The system operates under PG&E's NEM 2 tariff.

<figure class="post-banner post-photo-portrait">
  <img src="{{ '/assets/img/enphase/iq7-array.webp' | relative_url }}" alt="Enphase app array view showing twelve solar panels, each labeled IQ7+">
  <figcaption>The array view shows all twelve panels and the IQ7+ microinverter attached to each one.</figcaption>
</figure>

I had first treated the battery as a product that I could add to the solar system. In practice, the two systems need to work together.

Each IQ7+ converts the direct current from one solar panel into alternating current on the roof. A battery added to this system would connect on the AC side. This is called an AC-coupled system. Enphase says the [IQ7+ is compatible with its IQ Battery and IQ Gateway](https://enphase.com/store/microinverters/iq7-series/iq7plus-microinverter).

The rooftop microinverters could stay. Most of the remaining work concerned the equipment around the battery: backup controls, the electrical-panel connection, permits, the utility application, and the choice of loads to back up.

## The three questions I needed to answer

I narrowed the project down to three questions:

1. Could I add a battery without losing NEM 2?
2. Which Enphase battery and backup design would support the sewer pump?
3. Could the existing electrical panel accept that design, or would it need other work?

I answered the first question. The other two remained open.

## Could I keep NEM 2?

I started with NEM 2 because I did not want the storage project to change the tariff for the existing solar system. PG&E customer support could not give me a firm answer by phone. The agent directed me to PG&E's Rule 21 interconnection team, so I sent the question in writing in September 2025.

PG&E's response separated a battery addition from a solar expansion. The team told me that a battery-only project, with no new panels or solar inverters, could remain on NEM 2. Its response said that storage at or below 10 kW could be added, while storage above 10 kW would need a certified power control system under the stated rules.

Here, **kW means the battery system's power**, not its energy capacity in kWh. Those two units are easy to mix up.

The written answer matched the core language in [PG&E's NEM 2 tariff](https://www.pge.com/tariffs/assets/pdf/tariffbook/ELEC_SCHEDS_NEM2.pdf#page=32). The tariff says that adding energy storage does not, by itself, end the remaining NEM 2 transition period. It treats an increase in solar generation differently. An existing generating facility can generally increase its original nameplate rating by no more than 10 percent or 1 kW, whichever is greater, and remain within that modification rule.

The tariff also contains a separate warning for some customers who add storage through the Self-Generation Incentive Program. Because these rules can change and the details depend on the project, I would confirm the current tariff and incentive conditions in writing before restarting the work.

PG&E's answer resolved this part of the project. Adding the battery alone would not end my NEM 2 status. Adding or changing solar equipment was more restricted.

## A battery is not automatically backup power

I next needed to work out which circuits should keep running when the grid was down, and which battery system could support them.

Enphase sold several battery sizes that could work with the IQ7+ system. Staying with Enphase would also put solar and storage in the same app. I still needed to choose the size and backup design.

A grid-connected battery does not automatically make a house work during an outage. It can be installed only to store and shift energy while the grid is available. In that design, my solar would still shut down when the grid failed.

A proper backup installation would need several parts working together:

1. An IQ Battery 5P to store energy and create a local source of power during the outage.
2. An [IQ System Controller 3 or 3G](https://enphase.com/download/iq-system-controller-3-data-sheet) to detect the outage and disconnect the house from PG&E. This prevents the home system from sending power onto utility lines.
3. Compatible gateway and communications equipment so the controller, battery, and existing IQ7+ microinverters can operate as one system. Because my solar installation has an older IQ Envoy, an installer would need to confirm whether it could stay with a Communications Kit 2 or whether the gateway or combiner would need replacement.
4. A defined group of circuits on the backed-up side of the controller.

The battery would not connect directly to the sewer pump. In an essential-loads design, an electrician would place the pump circuit in a backup-loads panel with the refrigerator, internet equipment, lights, and any other circuits I selected. Only those circuits would stay on during an outage. In a whole-home design, the controller could back up the main panel, but one 5P would not provide enough power for every household load to run normally. The system would need load controls or more batteries.

When the grid failed, the controller would first isolate the backed-up circuits from PG&E. The 5P would then establish the local electrical supply. That would allow the IQ7+ solar system to operate while the sun was available, serve the backed-up loads, and recharge the battery. At night, the battery would supply those circuits by itself.

Enphase lists the IQ7 series, IQ Battery 5P, and IQ System Controller 3/3G as a [supported backup configuration](https://enphase.com/installers/resources/documentation/apps?f%5B0%5D=product_media_name%3A667&search_api_language=All). I still could not choose between essential-loads and whole-home backup without the sewer pump specifications and a proper load plan.

## Finding the actual main panel

I photographed the label inside one electrical panel because I hoped it would answer the panel-upgrade question.

<figure class="post-banner">
  <img src="{{ '/assets/images/posts/electrical-panel-label.webp' | relative_url }}" alt="Manufacturer label inside an Eaton convertible residential electrical panel">
  <figcaption>The enclosure label says that this Eaton convertible panel accepts a main breaker rated up to 200 A.</figcaption>
</figure>

The label says that the panel can accept a main breaker rated up to 200 A. It does not prove that the installed main breaker is 200 A. It also does not show the existing solar breaker, free breaker positions, service rating, or how the bus is already being used.

I later found another clue in the seller disclosures. The home inspector described an underground electrical service and a main breaker panel on the left exterior of the house, close to the gas meter. The inspector estimated a 200 A, 120/240 V service and saw two main disconnects rated at 100 A each. The report separately listed two breaker subpanels in the garage.

The panel in my photo may be one of the garage subpanels rather than the main service equipment. The outside panel could be a meter-main cabinet or a service-disconnect enclosure near the electric meter. It may contain only the two large 100 A disconnects that feed the garage subpanels, which would explain why I had not used it for ordinary circuits.

The original solar agreement adds one clue. It says that the existing service panel would not be modified, except to add the circuit breaker or fuse needed for the solar system, unless other work was stated separately. That suggests the 2019 solar installation did not include a panel replacement. However, the agreement refers to attached drawings and a quote sheet that are not present in the two-page copy I have. I therefore could not confirm the solar breaker's size or connection point.

The PG&E interconnection agreement in the seller packet also refers to a separate application form. I do not have that form or the original one-line diagram. These are all the records I have from the seller.

### What the 48 kVA estimate means

The records support a rough capacity check, but not a permit design.

If the inspector's 200 A service estimate is correct, its nominal capacity is:

`200 A × 240 V = 48,000 VA`, or about 48 kVA.

The 48 kVA value describes how much apparent power a 200 A service could supply at one moment at nominal voltage. It is a service rating, not a measure of normal household use or battery storage. It also does not show how much capacity is still free. That requires a load calculation based on the equipment in the house.

Battery storage uses a different unit. Kilowatts describe how fast a battery can supply power. Kilowatt-hours describe how much energy it stores.

The [IQ7+ data sheet](https://enphase.com/sites/default/files/2021-04/IQ7-IQ7plus-DS-EN-US.pdf) gives a maximum continuous output of 1.21 A at 240 V for each microinverter. The [IQ Battery 5P data sheet](https://enphase.com/en-lac/download/iq-battery-5p-data-sheet) gives a continuous rating of 16 A at 240 V.

| Equipment | Continuous current at 240 V | Branch-circuit limit |
| --- | ---: | ---: |
| Twelve IQ7+ microinverters | `12 × 1.21 A = 14.52 A` | Up to 13 IQ7+ units on one 20 A branch |
| One IQ Battery 5P | `3,840 VA ÷ 240 V = 16 A` | One battery on one 20 A branch |
| Combined continuous output | `14.52 A + 16 A = 30.52 A` | Two 20 A source breakers, if wired this way |

One IQ Battery 5P stores [5.0 kWh of usable energy and can provide 3.84 kW continuously](https://enphase.com/learn/home-energy/explore-your-system/know-your-enphase-storage-system).

### What one 5P could cover for a day

If I spread 5 kWh evenly across 24 hours, I would have an average of about 208 W:

`5 kWh ÷ 24 h = 0.208 kW`

That could support a small set of carefully managed loads. It would not support normal use of the whole house. This rough example shows what an essential-loads day might look like:

| Load | Example use | Energy for the day |
| --- | ---: | ---: |
| Refrigerator | 1.5 kWh per day | 1.50 kWh |
| Modem and router | 20 W for 24 hours | 0.48 kWh |
| Four LED lights | 9 W each for 5 hours | 0.18 kWh |
| Two laptops | 60 W each for 3 hours | 0.36 kWh |
| Phones and small devices | Round estimate | 0.10 kWh |
| Sewer pump | 1 kW for 15 minutes total | 0.25 kWh |
| **Example total** |  | **2.87 kWh** |

These are example values, not measurements from my house. The refrigerator would cycle on and off, and I do not yet know the sewer pump's actual power or daily run time. The remaining energy would provide some room for longer pump operation, more lights, or other small loads. Conversion losses, the backup reserve, and cold or hot weather would reduce that margin.

Large electric loads would change the result quickly. Heating or air conditioning, electric water heating, an oven, a clothes dryer, or EV charging could use most of the battery or exceed one 5P's 3.84 kW continuous output.

The solar interconnection records list 6,798.8 kWh of annual household use before the solar installation. That works out to about 18.6 kWh per day. If the house still used energy at that rate, one 5P would cover only about 27 percent of an average day. It would take almost four full 5P batteries to equal that daily energy use, before allowing for a backup reserve or poor solar weather.

So one 5P would not power the whole house normally for a full day without solar. It might keep a limited group of essential loads running for a day. With the correct backup controls, daytime solar could power loads and recharge the battery during an outage. Whether that would carry the house through the night and the next cloudy day would depend on the weather and how carefully I managed the loads.

The sewer pump would not run continuously, so an average-load estimate would be more useful than dividing 5 kWh by the pump's full power. Its starting surge is a separate question. One 5P can provide 7.68 kVA for three seconds, but I would still need the pump's nameplate and an installer calculation to know whether that is enough.

At its rated charging power, one 5P would draw about 16 A. That is 8 percent of a 200 A service rating. The charging load would still need to be included in the house load calculation, but it would not by itself require the utility service to increase from 200 A.

I also tried the common 120-percent bus calculation as a second rough check. [NREL's energy-storage quick-reference guide](https://www.nrel.gov/docs/fy23osti/85845.pdf) describes this as one of several possible ways to connect power sources on the load side of a panel:

`200 A bus × 120% − 200 A main breaker = 40 A for source breakers`

Under this specific arrangement, one 20 A solar breaker plus one 20 A battery breaker would use the full 40 A allowance. The existing twelve IQ7+ units could fit on one 20 A branch, but the missing one-line diagram means I cannot confirm that they were wired that way.

This result would leave room for one 5P under that one connection method. It would not mean that one battery was the most the house could support before a service upgrade. Two 5P units would store 10 kWh, three would store 15 kWh, and four would store 20 kWh. Adding units would increase both the stored energy and the possible output power. It would also require more branch-circuit and connection capacity.

Put another way, the simple calculation points to one 5P before that panel connection would need a different design. It does not point to one 5P before the utility service would need to increase above 200 A.

Enphase supports designs with multiple 5P units, and its [system-planning guidance](https://enphase.com/download/planning-grid-tied-iq-battery-system-without-backup-tech-brief) describes power-control settings that can limit the current seen by the main panel. An installer might also choose another approved connection method. Either approach could allow more stored energy without increasing the home's service rating.

I could not tell which option would work here. The inspection report describes two 100 A main disconnects, not one verified 200 A main breaker. I do not know the bus ratings, feeder arrangement, solar connection point, or loads served by each garage subpanel. The 120-percent rule also has placement requirements and is only one possible connection method.

The records make one modest battery look plausible without a service upgrade. More storage may also have been possible. Either design could still have required a new backup-loads panel, a system controller, breaker changes, or other work inside the existing 200 A service.

An installer would still need to inspect the service equipment, prepare a one-line electrical diagram, and choose an allowed connection method. The installer would also need the sewer pump's nameplate data. The panel calculation says nothing about whether one battery can start that motor during an outage.

## What one 5P would have cost

I did not get far enough to request a firm installer quote. I can still estimate the likely range from published prices.

[EnergySage reported a median price of $1,344 per kWh for Enphase batteries](https://www.energysage.com/energy-storage/best-home-batteries/enphase-encharge-the-complete-review/), based on quotes from the first half of 2024. At that rate, 5 kWh would cost about $6,720. However, that brand-level average does not describe my complete backup system.

[SolarReviews estimated $15,000 to $17,000 for a complete system with two 5P batteries](https://www.solarreviews.com/blog/enphase-battery-what-you-need-to-know). It also estimated that a backup-loads panel could add $1,000 to $2,000. A one-battery system would cost less, but it would still need the controller, communications equipment, permits, and much of the same installation work.

For this house, I would therefore have budgeted about $10,000 to $13,000 for one 5P with essential-load backup. This is an estimate, not a contractor quote. It does not include a main-panel upgrade or other major electrical work.

The [30 percent federal credit available in 2025](https://www.irs.gov/credits-deductions/residential-clean-energy-credit) could have reduced that range to about $7,000 to $9,100:

| Estimated cost | Before the 2025 credit | After a 30% credit |
| --- | ---: | ---: |
| Lower estimate | $10,000 | $7,000 |
| Upper estimate | $13,000 | $9,100 |

The system had to be installed and placed in service by December 31, 2025, to qualify. Paying a deposit or signing a contract was not enough.

### Why the bill savings were small under NEM 2

I also wanted to know whether the battery would pay for itself. For this house, the answer was no.

NEM 2 gives exported solar energy a credit based on the retail rate for the same time-of-use period. The battery could move some afternoon solar into the evening, when electricity cost more. However, I would give up the credit for the energy used to charge it. I would also lose some energy during charging and discharging.

I do not have enough billing data to reproduce my exact annual bill. To test the scale, I used PG&E's E-TOU-C rates from September through December 2025. PG&E listed a summer peak rate of $0.61457 per kWh and a summer off-peak rate of $0.49157 per kWh. The winter rates were $0.48974 and $0.45974 per kWh. These historical rates are available in [PG&E's residential rate archive](https://www.pge.com/tariffs/en/rate-information/electric-rates.html).

The [5P data sheet lists a round-trip efficiency of 90 percent](https://enphase.com/download/iq-battery-5p-data-sheet). If I stored 5 kWh of midday solar, I could expect to get about 4.5 kWh back. A simplified summer calculation is:

`4.5 kWh × $0.61457 − 5 kWh × $0.49157 = about $0.31`

That is about 31 cents from one full cycle. The same calculation with the winter rates produces a loss of about 9 cents. The winter peak price difference was too small to cover the energy lost in the battery.

If I completed one full cycle on all 122 summer days and skipped the unfavorable winter cycles, the rate difference would be about $38 per year. This assumes that I had enough midday solar to fill the battery and enough evening demand to empty it each day.

NEM 2 also applies non-bypassable charges to electricity imported from the grid. Solar export credits cannot erase those charges. Using the battery would avoid some of them, which would add a small amount to the savings. It would not change the overall result. The [NEM 2 tariff explains both the time-of-use credits and these charges](https://www.pge.com/tariffs/assets/pdf/tariffbook/ELEC_SCHEDS_NEM2.pdf#page=11).

Under these assumptions, rate shifting would save tens of dollars per year, not thousands. My actual result would depend on my rate plan, Community Choice Aggregation charges, solar exports, and evening use. Even if those details increased the savings to $300 per year, a system that cost $7,000 to $9,100 after the credit would take about 23 to 30 years to pay back.

That is longer than the [5P warranty of 15 years or 6,000 cycles](https://enphase.com/download/iq-battery-5p-en-us-2024-10-01-warranty). The calculation also excludes battery degradation and the return I could have earned by keeping the money elsewhere.

### Update: the calculation after the federal credit ended

I revisited this calculation in August 2026. The [IRS now says that the residential clean-energy credit is not available for expenditures made after December 31, 2025](https://www.irs.gov/newsroom/faqs-for-modification-of-sections-25c-25d-25e-30c-30d-45l-45w-and-179d-under-public-law-119-21-139-stat-72-july-4-2025-commonly-known-as-the-one-big-beautiful-bill-obbb). If my $10,000 to $13,000 estimate still holds, I would now pay that full amount.

The table compares the two decisions. It uses $300 in annual savings, which is much more favorable than my house-specific rate calculation.

| Installation date | Estimated out-of-pocket cost | Simple payback at $300 per year |
| --- | ---: | ---: |
| 2025, with the 30% federal credit | $7,000 to $9,100 | 23 to 30 years |
| 2026, without the federal credit | $10,000 to $13,000 | 33 to 43 years |

At the more likely savings of tens of dollars per year, neither installation would pay for itself during the battery's useful life. The end of the credit therefore made a weak financial case worse. It did not change the basic conclusion.

One California incentive could still change the purchase price for some households. The [CPUC currently lists a Residential Solar and Storage Equity incentive of $1,100 per kWh](https://www.cpuc.ca.gov/sgip). It is for qualifying low-income households and paired solar-and-storage projects. The broader Small Residential Storage incentive is listed as available only through 2025.

At the published rate, 5 kWh of storage could receive up to $5,500 before program limits and eligible-cost rules. I have not established that my household or existing solar system would qualify. The program also requires enrollment in a qualifying demand-response program.

The [NEM 2 tariff exempts the Residential Solar and Storage Equity category from the automatic move to the Net Billing Tariff](https://www.pge.com/tariffs/assets/pdf/tariffbook/ELEC_SCHEDS_NEM2.pdf#page=32). Adding solar can still trigger separate system-modification rules. I would ask PG&E to confirm the result in writing before relying on this incentive.

I remain motivated to electrify the house, but storage serves a different purpose from replacing a gas appliance. For this NEM 2 system, its strongest value is outage protection. It is not electric-bill savings.

This result is specific to a house with solar on NEM 2. The tariff makes the existing solar valuable because exported energy receives a relatively high credit. That same feature reduces the financial value of storing the energy at home. A house on a tariff with low export credits can have a different storage calculation.

For me, one 5P would have been a resilience purchase rather than a short-term investment. Its main value was the ability to keep the sewer pump and a few other essential circuits available during an outage. That protection mattered, but I could not describe it as a predictable return on the electric bill.

## Why I stopped

The federal Residential Clean Energy Credit created the deadline. The IRS says the credit covered 30 percent of qualified battery-storage costs for equipment [installed through December 31, 2025](https://www.irs.gov/credits-deductions/residential-clean-energy-credit). Property placed in service after that date did not qualify.

By the time I was doing this research, I had about two months left. I still needed an installer, a final system design, a permit, a utility interconnection application, and a clear answer about the electrical work. I did not think I could finish all of that carefully before the deadline, so I did not install a battery.

The existing solar equipment appeared to be compatible with Enphase storage. I stopped because I could not resolve the design, permitting, and contracting questions in the time available. The tax credit improved the price, but it did not leave enough time for me to plan the work well.

## What I would do next

If I restart the project, I now have a much shorter list of work:

1. Record the sewer pump's model, running power, and starting power.
2. Choose the other circuits that need backup during an outage.
3. Photograph the main breaker, full breaker layout, solar breaker, meter, and nearby equipment.
4. Ask installers for a one-line diagram that shows the battery, backup controller, protected loads, and panel connection.
5. Ask each installer to state in writing how the project will be filed with PG&E and whether it changes the existing NEM 2 system.
6. Compare battery models only after the required power, energy, and electrical design are clear.

Even without an installation, the research changed the order in which I would approach the project. I would begin with the pump and the other backup loads, then ask an installer to design a system around them. I would compare battery models after that.
