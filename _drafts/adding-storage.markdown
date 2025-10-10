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
<Add the image here>

As you can see from the screenshot, the panels have an IQ7+ microinverter: https://enphase.com/store/microinverters/iq7-series/iq7plus-microinverter

However, this architectural choice also influences *how* a battery can be integrated, what inverters are needed, and how smooth / expensive the integration will be. 

For some background, (as I learned) -- Enphase solar systems have String inverters, which convert DC (from solar panels) to AC (for the house). Now usually, batteries connect on the DC side, sharing *the same inverter as the solar panel*. But as mentioned above, Enphase, by contrast, uses microinverters attached to each panel. These convert DC to AC *right at the panel*. This is super convenient for home usage because the solar output is *already* AC, but it also means we can't directly "tap" the DC from the panels to charge the battery. TIL.

The implication here is that we need an AC-coupled battery, one that connects to the AC side of my house's wiring. Ideally this could come from Enphase, or from some other third party manufacturer. 

Now we start the research: what batteries exist on the market? And which one is right for me? The classic million-dollar question that everyone in the energy space is asking. The capital costs for this tech are so high, that right-sizing your system for your current and forward-looking consumption is a pretty tricky optimization to get right.

I started by reviewing what is currently available on the market:

Enphase IQ Battery family

Model
Usable Capacity
Continuous Power
Notes
IQ Battery 5P
5 kWh
3.84 kW
Newest model; modular; stackable up to 80 kWh
IQ Battery 10
10.1 kWh
3.84 kW
Proven, older version
IQ Battery 3T
3.36 kWh
1.28 kW
Compact; can combine multiples
