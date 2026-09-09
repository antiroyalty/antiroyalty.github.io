---
layout: post
title: "What an EnergySage Quote Is Actually Calculating"
date: 2026-08-18 12:00:00 -0700
categories: notes
---

I was recently reviewing an EnergySage comparison with five quotes for solar and battery storage. All five quotes showed a shorter payback period with a battery than with solar alone. The solar-and-battery estimates ranged from 6.1 to 7.6 years, while the solar-only estimates ranged from 6.8 to 9.6 years.

This was interesting to me because I have been researching the cost of residential solar and storage in California. In my results, adding a battery can save money on the electric bill, but the savings are usually not enough to recover the cost of the battery.

At first, I thought the difference was probably simple payback versus net present value. Simple payback counts how many years of savings it takes to recover the original cost. Net present value also accounts for the fact that a dollar saved fifteen years from now is worth less than a dollar saved today.

That was part of the difference, but it was not all of it. I started working backwards from the EnergySage numbers to understand what else was happening.

## Working backwards from the five quotes

The five installers proposed different prices for both solar and storage. EnergySage then showed how much the homeowner would supposedly save over 25 years with solar alone, and with solar plus a battery.

To isolate the battery, I first subtracted the solar-only savings from the solar-and-battery savings. This gave me the *added net savings* shown for storage. Then I added the battery price back in, since that cost had already been subtracted from the final savings number.

For example, the first quote showed $157,071 in savings with solar and storage, compared with $77,481 for solar alone. The battery itself cost $14,500:

`($157,071 − $77,481) + $14,500 = $94,090`

I removed the installer names and repeated the same calculation for all five quotes:

| Quote | Battery price | Added net savings | Implied gross battery value |
| --- | ---: | ---: | ---: |
| A | $14,500 | $79,590 | $94,090 |
| B | $10,900 | $83,156 | $94,056 |
| C | $14,650 | $79,469 | $94,119 |
| D | $12,995 | $81,108 | $94,103 |
| E | $14,500 | $79,444 | $93,944 |

The answer was basically the same every time. EnergySage assigned the battery between $93,944 and $94,119 in gross value across the five quotes. That is a range of only $175, or about 0.2 percent.

I cannot see EnergySage's internal calculation, so I can't say exactly how it produced this number. But the consistency is useful information! The installers proposed different equipment at different prices, while the quote appears to use one shared estimate of the battery's value for the property. It then subtracts each installer's battery price.

## The 7.1 percent assumption is doing a lot

The next place I looked was the fine print. EnergySage says that it assumes electricity costs increase by 7.1 percent each year, based on the previous ten years of California electricity prices from the U.S. Energy Information Administration.

I originally described this as a nominal discount rate, which was incorrect. The [EIA publishes electricity prices in nominal dollars](https://www.eia.gov/tools/faqs/faq.php?id=13&t=5), meaning that its historical prices are not adjusted for inflation. EnergySage is taking the historical increase in those prices and using it as an annual electricity-price escalation rate.

That distinction matters. A discount rate reduces future savings to their value today. An escalation rate does the opposite: it makes each future electric bill larger.

To see how much 7.1 percent compounds, I started with electricity at $0.40 per kWh:

- Year 2: `$0.40 × 1.071 = $0.428 per kWh`
- Year 10: `$0.40 × 1.071^9 = $0.74 per kWh`
- Year 25: `$0.40 × 1.071^24 = $2.08 per kWh`

California electricity prices genuinely increased a lot during the previous decade, and they may keep increasing. But carrying that same 7.1 percent increase forward for another 25 years makes electricity more than five times as expensive by the end of the calculation.

This assumption has an especially large effect because the quote reports simple payback and 25-year cash savings. The savings in those later years are not discounted back to their present value. As a result, a large share of the battery's value arrives far into the future, when the model assumes that electricity is extremely expensive.

## The quote leaves out the tariff details

Another part of the fine print surprised me. The quote says that its calculation does not account for time-of-use rates or utility net-billing policies.

Those are two of the most important inputs for valuing a battery in California! A time-of-use rate changes the price of electricity depending on the hour. A net-billing tariff determines how much the utility pays for solar electricity exported to the grid.

Under California's current [Net Billing Tariff](https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/demand-side-management/customer-generation/net-energy-metering-and-net-billing), solar exported during the middle of the day is usually worth less than electricity purchased from the grid. A battery can store that solar energy and use it later, when electricity is more expensive. The difference between those prices is one of the main ways that a battery produces bill savings.

Under one-to-one net metering, the result can be very different. If the utility gives me the same credit for an exported kWh that I would pay to use a kWh later, I gain little by putting that energy through a battery. I may even lose value because some energy is lost while charging and discharging.

EnergySage's own [guide to battery savings](https://www.energysage.com/energy-storage/how-much-can-you-save-batteries/) says that net metering and time-varying rates are important. But the exported quote excludes both of them and still assigns about $94,000 in gross value to the battery. Without the tariff and hourly energy-use assumptions, I could not reproduce that result.

## What happens after the first battery?

The third issue was the 25-year time horizon. The quote charges for one battery at the beginning, then reports the savings from solar and storage over the next 25 years.

To be precise, the quote does not say that the physical battery will last for 25 years. It also does not show a replacement cost, battery degradation, declining usable capacity, or the year when the first battery reaches the end of its life. In the accounting visible to the homeowner, one initial battery continues producing savings for the full 25 years without another battery purchase.

That seems generous to me. In our research, we use a 15-year battery life with no degradation, which is already on the optimistic side. The [2024 Annual Technology Baseline](https://atb.nlr.gov/electricity/2024/residential_battery_storage) also uses a 15-year lifetime for residential batteries and includes battery-augmentation costs to maintain capacity. Many home-battery warranties cover ten to fifteen years.

If a savings estimate runs for 25 years, I would want to know what it assumes after year 10 or 15. Does the homeowner replace the battery? Does its usable capacity decline? Do the savings stop? None of those assumptions were visible in this quote.

## Saving money each year is not the same as breaking even

The EnergySage result and my research initially looked contradictory, but they were also describing different parts of the calculation.

I ran our dispatch model with a fixed 7.6 kW solar system and a 13.5 kWh battery. In that example, the battery reduced the electric bill by about $1,037 per year. That is a real operational benefit! But it is the gross bill reduction before paying for the battery.

Over a 15-year life, discounted at 7 percent, those annual savings are worth about $9,445 today. The present-value factor is 9.108:

`$1,037 × 9.108 = $9,445`

The installed battery cost in our model was about $19,719, based on the NREL cost benchmark. After including that cost, the net value was negative:

`$9,445 − $19,719 = −$10,274`

So, "the battery saves $1,037 per year" does not mean that the battery is cost-effective. The savings still have to be compared with the upfront cost.

I also checked the result per kWh of battery capacity. The battery saved about $77 per kWh of capacity each year:

`$1,037 ÷ 13.5 kWh = $77 per kWh per year`

Over 15 years, that produces a break-even installed cost of about $701 per kWh:

`$77 × 9.108 = $701 per kWh`

The five EnergySage battery prices ranged from $10,900 to $14,650, which was lower than the battery price in our model. However, the exported comparison did not provide enough detail about usable capacity, power, or included equipment. I could not make an equivalent price comparison without those specifications.

## What I would still use the quote for

I do not think the EnergySage comparison is useless. It collects installer prices, proposed equipment, reviews, and company history in one place. That can be very helpful when choosing who to contact.

I would treat the long-term savings and payback estimates as a starting point, not as the final financial result. Before relying on them, I would want to see:

- The battery's usable capacity, output power, efficiency, and expected degradation.
- The household's hourly imports and exports.
- The actual time-of-use rate and hourly export credits.
- The assumed electricity-price escalation and discount rates.
- The battery's expected service life and any replacement cost.
- The equipment, electrical work, and backup hardware included in the price.
- The annual cash flows used to calculate payback and long-term savings.

I went into this expecting simple payback versus net present value to explain the difference between the EnergySage quote and our research. It explained some of it. The rest came from the 25-year time horizon, the 7.1 percent electricity-price increase, the missing tariff details, and the lack of a visible battery replacement.

The quote gave me useful information about the five offers. I would still rebuild the savings calculation before deciding whether any one of the batteries would actually pay for itself.
