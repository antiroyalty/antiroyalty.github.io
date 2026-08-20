---
layout: post
title: "What an EnergySage Quote Is Actually Calculating"
date: 2026-08-18 12:00:00 -0700
categories: notes
---

I was recently reviewing an EnergySage quote for five solar-and-battery options. Every offer showed a shorter payback period with a battery than with solar alone. The solar-and-battery estimates ranged from 6.1 to 7.6 years, compared with 6.8 to 9.6 years for solar alone.

That result was surprising. In my research on residential solar and storage in California, a battery can reduce annual bills without earning back its installed cost.

I first thought the difference came from simple payback rather than net present value. Net present value discounts future savings because a dollar received years from now is worth less than a dollar today. After I worked through the quote, I found a larger difference: EnergySage and my model were not answering the same question.

The installer prices in the quote are still useful. I would not use its 25-year savings estimates without rebuilding the calculation from the underlying assumptions.

## The same battery value appears in all five quotes

The five installers gave different prices for solar and storage. EnergySage then reported separate 25-year savings estimates for solar alone and for solar with a battery.

I removed the installer names and labeled the offers A through E. I calculated the value assigned to the battery in two steps:

`added net savings = solar-and-battery savings − solar-only savings`

`implied gross battery value = added net savings + battery price`

For example, quote A becomes:

`($157,071 − $77,481) + $14,500 = $94,090`

| Quote | Battery price | Added net savings | Implied gross battery value |
| --- | ---: | ---: | ---: |
| A | $14,500 | $79,590 | $94,090 |
| B | $10,900 | $83,156 | $94,056 |
| C | $14,650 | $79,469 | $94,119 |
| D | $12,995 | $81,108 | $94,103 |
| E | $14,500 | $79,444 | $93,944 |

The implied gross value ranges from $93,944 to $94,119. The difference between the highest and lowest result is only $175, or about 0.2 percent.

This does not reveal EnergySage's full internal model. It does show that the long-term battery benefit is nearly identical across all five offers. The platform appears to calculate one property-level battery value, then subtract each installer's battery price.

## A high escalation rate puts most of the value in later years

The fine print says that EnergySage uses a 7.1 percent annual energy-cost inflation estimate. It attributes the estimate to the ten-year California average from the U.S. Energy Information Administration.

I originally called this a nominal discount rate. That was wrong. The [EIA publishes electricity prices in nominal dollars](https://www.eia.gov/tools/faqs/faq.php?id=13&t=5), which means the prices are not adjusted for inflation. EnergySage uses the historical price change as an electricity-price escalation rate. The rate increases future avoided bills. It does not reduce future dollars to their present value.

If a rate of $0.40 per kWh rises by 7.1 percent each year, it reaches about $0.74 in year 10 and $2.08 in year 25:

`$0.40 × 1.071^24 = $2.08 per kWh`

The recent rate increases in California were real. They may continue. The difficult assumption is that the same average increase continues, compounds, and applies for 25 years.

The quote reports 25-year cash savings and a simple payback period. Those measures do not discount the later savings. A high escalation rate therefore gives the last years of the estimate a large effect on the result.

## The fine print leaves out the tariff rules that give a battery value

The quote also says that its calculation does not account for time-of-use rates or utility net-billing policies.

These are not minor details for a battery in California. A time-of-use rate changes the price of electricity during the day. A net-billing tariff changes the credit for electricity exported to the grid. Under California's current [Net Billing Tariff](https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/demand-side-management/customer-generation/net-energy-metering-and-net-billing), export credits vary by hour. A battery can store solar energy when export credits are low, then supply the home when grid electricity costs more.

The result is different under one-to-one net metering. If an exported kWh receives the same credit as a kWh used later, the battery adds little bill value. It can even reduce value because some energy is lost during charging and discharging.

EnergySage's own [battery-savings guide](https://www.energysage.com/energy-storage/how-much-can-you-save-batteries/) explains that battery savings depend on net metering and time-varying rates. The exported quote omits both, but still assigns about $94,000 of gross value to the battery. It does not provide enough information to reproduce that value from the household's tariff and energy use.

## The quote shows one battery purchase across 25 years

I also checked the fine print for a battery replacement assumption.

The quote does not say that the battery will physically last 25 years. It shows one battery purchase at installation and then reports solar-and-battery savings over 25 years. It does not show a replacement cost, battery degradation, declining usable capacity, or an end-of-life assumption.

I cannot inspect EnergySage's private calculation. I can only audit what the quote presents. In the displayed calculation, the original battery is treated as if it continues to produce savings across the full 25-year period without another battery purchase.

That is a favorable assumption. The [2024 Annual Technology Baseline](https://atb.nlr.gov/electricity/2024/residential_battery_storage) uses a 15-year lifetime for residential batteries. It includes battery-augmentation costs to maintain rated capacity during that period. Many home-battery warranties cover ten to fifteen years. A 25-year estimate should state what happens when the first battery reaches the end of its useful life.

## Annual bill savings do not prove that a battery is cost-effective

My research asks whether the battery's bill savings exceed its installed cost. I tested a 13.5 kWh battery added to a fixed 7.6 kW solar system. The battery reduced the annual bill by about $1,037 before accounting for its purchase price.

Over 15 years, discounted at 7 percent, those annual savings have a present value of about $9,445:

`$1,037 × 9.108 = $9,445`

The factor 9.108 is the present-value annuity factor for 15 years at 7 percent. The modeled installed battery cost was about $19,719, based on the NREL cost benchmark. The resulting net value was negative:

`$9,445 − $19,719 = −$10,274`

The battery could save money on each bill and still fail to recover its capital cost. Under these assumptions, the installed cost would need to fall to about $701 per kWh for the battery to break even.

EnergySage's five battery prices ranged from $10,900 to $14,650. Those prices were lower than the benchmark in my model. However, the exported comparison did not include enough battery specifications for me to confirm each system's usable capacity, power, or equipment scope. I could not compare those prices with my model until I knew the storage capacity and equipment included.

## What I would use the quote for

EnergySage gives a homeowner a useful way to compare installer prices, equipment, reviews, and years in business. Its long-term savings number needs a separate check.

For a solar-and-battery investment, I would ask for these inputs:

- The battery's usable capacity, output power, efficiency, and expected degradation.
- The household's hourly imports and exports.
- The actual time-of-use rate and hourly export credits.
- The assumed electricity-price escalation and discount rates.
- The battery's expected service life and any replacement cost.
- The equipment, electrical work, and backup hardware included in the price.
- The annual cash flows used to calculate payback and long-term savings.

I expected the difference between the EnergySage quote and my research to come mainly from simple payback versus net present value. That explained part of it. The larger issue was that the two calculations used different time horizons, tariff detail, future-price assumptions, and battery-life assumptions.

The quote can help compare offers. It is not enough, by itself, to show that a battery will pay for itself.
