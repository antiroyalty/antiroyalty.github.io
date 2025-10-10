---
layout: post
title: "Cataloging the steps to add battery storage"
date: 2025-10-08 12:00:00 -0700
categories: notes
---

Planning to add storage to my Berkeley home before the Income Tax Credit expires. All the work needs to be done before December 31, 2025 -- the battery needs to be online by this date to qualify for the income tax credits. Come along with me for the ride to figure out how I can get storage added to my hosue with solar.

Okay let's get into it:

I was googling around for a while how to add a battery to my house, but I was crucially omitting the fact that I already had a solar system. I thought these were two independent components! Turns out, the kind of solar system (and which one) highly influences what kind of battery is feasible. Someone had to explain that to me, so in case you haven't come across that guidance yet -- it matters! TIL. 

I currently have an Enphase solar system, and as I learned, this significantly influences what's feasible and economic. Turns out, Enphase solar systems are modular and use microinverters (one per panel), which means that my solar array produces AC power directly rather than DC! Very cool.

<Verify in the Enphase app where it shows my solar microinverter setup>
![Enphase microinverter details]({{ '/assets/images/posts/enphase-microinverter-details.jpg' | relative_url }})

As you can see from the screenshot, the panels have an IQ7+ microinverter: https://enphase.com/store/microinverters/iq7-series/iq7plus-microinverter

However, this architectural choice also influences *how* a battery can be integrated, what inverters are needed, and how smooth / expensive the integration will be. 

For some background, (as I learned) -- Enphase solar systems have String inverters, which convert DC (from solar panels) to AC (for the house). Now usually, batteries connect on the DC side, sharing *the same inverter as the solar panel*. But as mentioned above, Enphase, by contrast, uses microinverters attached to each panel. These convert DC to AC *right at the panel*. This is super convenient for home usage because the solar output is *already* AC, but it also means we can't directly "tap" the DC from the panels to charge the battery. TIL.

The implication here is that we need an AC-coupled battery, one that connects to the AC side of my house's wiring. Ideally this could come from Enphase, or from some other third party manufacturer. 

Now we start the research: what batteries exist on the market? And which one is right for me? The classic million-dollar question that everyone in the energy space is asking. The capital costs for this tech are so high, that right-sizing your system for your current and forward-looking consumption is a pretty tricky optimization to get right.

I started by reviewing what is currently available on the market:

Enphase IQ Battery family

| Model           | Usable Capacity | Continuous Power | Notes                                           |
| --------------- | --------------- | ---------------- | ----------------------------------------------- |
| IQ Battery 5P   | 5 kWh           | 3.84 kW          | Newest model; modular; stack up to ~80 kWh      |
| IQ Battery 10   | 10.1 kWh        | 3.84 kW          | Proven, older version                           |
| IQ Battery 3T   | 3.36 kWh        | 1.28 kW          | Compact; can combine multiples                   |

As their sales website deailed for me, staying within the Enphase battery would make for a more "seamless" integration with my existing Enphase microinverters and the Envoy gateway. Plus then I could manage them all under the same app. 

However, compared to the Tesla batteries, the power output per unit is pretty low -- 3.8 kW vs. Tesla's Powerwall 5 kW. Overall, that means that I'd need 2-3 units to cover full-home load. 

California's NEM Policy + Grandfathering Rules
Under California’s NEM rules (and in PG&E’s NEM2 tariff), there is a concept called “NEM paired storage”. PG&E explicitly provides for “Net Energy Metering Paired Storage” as a special provision under Schedule NEM / Schedule NEM2.  ￼
	•	The tariff includes a “special condition” (often called Special Condition 9 – NEM Paired Storage) that outlines how battery storage can be paired with an existing generating facility (your solar) without invalidating the net metering arrangement.  ￼
	•	Crucially: Decision D.22-12-056 states that adding energy storage to a customer’s existing generating facility shall not disqualify the customer from the remainder of their 20-year transition (grandfathering) under their existing NEM tariff schedule.  ￼
	•	In other words, the rule explicitly protects existing NEM 1 or 2 customers from losing their grandfathered status merely by adding storage (so long as the storage is appropriately paired).  ￼
	•	Multiple industry sources confirm this interpretation: existing NEM2 systems can add battery/storage and maintain their NEM2 status, so long as the changes don’t constitute a forbidden expansion.  ￼

What counts as a prohibited “expansion” that could force conversion to NEM 3.0
	•	The bigger risk isn’t the battery, but adding more solar (PV capacity) in a way that exceeds the allowable expansion threshold. Many sources indicate that under NEM 1/2 grandfathering, you may increase your system size by **up to 1 kW AC **or 10% of existing system size (whichever is greater) without losing the grandfathered status.  ￼
	•	If you expand solar beyond that threshold, it may trigger the move to NEM 3.0 (or force a new tariff) depending on how the utility and CPUC interpret the change.  ￼
	•	In sum: adding storage only is allowed under the NEM pairing rules; adding additional solar capacity beyond modest limits is where risk of losing grandfathering arises.