---
layout: post
title: "Trying to Add Battery Storage to My Home"
date: 2025-10-08 12:00:00 -0700
categories: notes
---

In fall 2025, I had about two months to answer what sounded like a simple question: could I add a battery to my existing solar system before the federal tax credit ended?

The battery never got installed. This is not an installation guide. It is a record of what I learned, what I could not resolve in time, and why I stopped the project.

## Why I wanted a battery

I had two goals. I wanted to use more of the solar energy that my house produces, and I wanted backup power during an outage.

The backup problem is specific to my house. We have a sewer ejector pump. It moves wastewater out of the lower part of the house. When the power goes out, the pump stops. That means an outage can become a sanitation problem, not just an inconvenience.

I did not yet know how much battery capacity I needed. I first needed to know how much power the pump draws while running, how much it needs when it starts, and which other circuits should stay on. That information would determine whether I needed to back up a few essential loads or most of the house.

## The system I already had

A1 Sun installed my 3 kW Enphase solar system. It has twelve IQ7+ microinverters and one gateway, and it operates under PG&E's NEM 2 tariff.

<figure class="post-banner post-photo-portrait">
  <img src="{{ '/assets/img/enphase/iq7-array.webp' | relative_url }}" alt="Enphase app array view showing twelve solar panels, each labeled IQ7+">
  <figcaption>The array view shows all twelve panels and the IQ7+ microinverter attached to each one.</figcaption>
</figure>

I had been researching batteries as if the solar system and battery were independent products. They are not.

Each IQ7+ converts the direct current from one solar panel into alternating current on the roof. A battery added to this system would connect on the AC side. This is called an AC-coupled system. Enphase says the [IQ7+ is compatible with its IQ Battery and IQ Gateway](https://enphase.com/store/microinverters/iq7-series/iq7plus-microinverter).

The good news was that I did not need to replace the rooftop microinverters just to add storage. The harder part was everything around the battery: the backup controls, electrical-panel connection, permits, utility application, and choice of loads to back up.

## The three questions I needed to answer

I narrowed the project down to three questions:

1. Could I add a battery without losing NEM 2?
2. Which Enphase battery and backup design would support the sewer pump?
3. Could the existing electrical panel accept that design, or would it need other work?

I found a good answer to the first question. I did not finish the other two.

## Could I keep NEM 2?

This was the most confusing part of the project.

I was worried that adding storage would move the solar system from NEM 2 to the newer Net Billing Tariff, sometimes called NEM 3. PG&E customer support could not give me a firm answer by phone. The agent directed me to PG&E's Rule 21 interconnection team, so I sent the question in writing in September 2025.

PG&E's response separated a battery addition from a solar expansion. The team told me that a battery-only project, with no new panels or solar inverters, could remain on NEM 2. Its response said that storage at or below 10 kW could be added, while storage above 10 kW would need a certified power control system under the stated rules.

Here, **kW means the battery system's power**, not its energy capacity in kWh. Those two units are easy to mix up.

The written answer matched the core language in [PG&E's NEM 2 tariff](https://www.pge.com/tariffs/assets/pdf/tariffbook/ELEC_SCHEDS_NEM2.pdf#page=32). The tariff says that adding energy storage does not, by itself, end the remaining NEM 2 transition period. It treats an increase in solar generation differently. An existing generating facility can generally increase its original nameplate rating by no more than 10 percent or 1 kW, whichever is greater, and remain within that modification rule.

The tariff also contains a separate warning for some customers who add storage through the Self-Generation Incentive Program. Because these rules can change and the details depend on the project, I would confirm the current tariff and incentive conditions in writing before restarting the work.

The answer was still useful: the battery itself was not what threatened my NEM 2 status. Adding or changing solar equipment was the more sensitive part.

## A battery is not automatically backup power

My second question was not just which battery to buy. It was which system could keep the right circuits running when the grid was down.

Enphase sold several battery sizes, and its batteries could work with the IQ7+ system. Staying with Enphase also meant that solar and storage could appear in the same app. But those facts did not determine the right size or the backup design.

A grid-connected battery does not automatically make a house work during an outage. A backup system also needs equipment that safely separates the house from the grid and controls the local solar-and-battery system. Enphase's design for an IQ7 backup system uses an [IQ System Controller](https://enphase.com/installers/storage/gen2/systems/home-essentials-backup/iq6-iq7) for this purpose.

I also had to decide what to back up. A small essential-loads system might cover the sewer pump, refrigerator, internet equipment, and a few lights. Whole-home backup would require more power and more battery capacity. I could not choose between those designs without the pump specifications and a proper load plan.

## What the panel photo did—and did not—tell me

I photographed the label inside the electrical panel because I expected it to answer the panel-upgrade question.

<figure class="post-banner">
  <img src="{{ '/assets/images/posts/electrical-panel-label.webp' | relative_url }}" alt="Manufacturer label inside an Eaton convertible residential electrical panel">
  <figcaption>The enclosure label says that this Eaton convertible panel accepts a main breaker rated up to 200 A.</figcaption>
</figure>

The label says that the panel can accept a main breaker rated up to 200 A. It does not prove that the installed main breaker is 200 A. It also does not show the existing solar breaker, free breaker positions, the service rating, or how the bus is already being used.

That was not enough information to say whether the battery required a panel upgrade.

An installer would still need to inspect the installed breakers and service equipment, prepare a one-line electrical diagram, and choose an allowed connection method. A power control system or a different connection design can sometimes avoid a full panel replacement. I did not want to turn one simplified electrical-code calculation into a confident answer that might be wrong for this panel and permit application.

## Why I stopped

The federal Residential Clean Energy Credit created the deadline. The IRS says the credit covered 30 percent of qualified battery-storage costs for equipment [installed through December 31, 2025](https://www.irs.gov/credits-deductions/residential-clean-energy-credit). Property placed in service after that date did not qualify.

By the time I was doing this research, I had about two months left. I still needed an installer, a final system design, a permit, a utility interconnection application, and a clear answer about the electrical work. I was not confident that I could finish all of that correctly before the deadline.

So I did not install a battery.

The project did not stop because batteries were incompatible with my solar system. It stopped because I could not resolve the design, permitting, and contracting questions in the time available. The tax credit made the project more attractive, but it also encouraged a schedule that was too aggressive for a long-lived piece of electrical infrastructure.

## What I would do next

If I restart the project, I now have a much shorter list of work:

1. Record the sewer pump's model, running power, and starting power.
2. Choose the other circuits that need backup during an outage.
3. Photograph the main breaker, full breaker layout, solar breaker, meter, and nearby equipment.
4. Ask installers for a one-line diagram that shows the battery, backup controller, protected loads, and panel connection.
5. Ask each installer to state in writing how the project will be filed with PG&E and whether it changes the existing NEM 2 system.
6. Compare battery models only after the required power, energy, and electrical design are clear.

I started with a shopping question: which battery should I buy? I ended with a systems question: what has to keep working during an outage, and what equipment and approvals make that possible?

That second question is slower to answer. It is also the one that matters.
