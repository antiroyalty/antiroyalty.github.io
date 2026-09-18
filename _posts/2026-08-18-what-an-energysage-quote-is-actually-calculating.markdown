---
layout: post
title: "What an EnergySage Quote Is Actually Calculating"
date: 2026-08-18 12:00:00 -0700
categories: notes
---

I was recently reviewing an EnergySage comparison generated on July 10, 2026, with five quotes for solar and battery storage. All five quotes showed a shorter payback period with a battery than with solar alone. The solar-and-battery estimates ranged from 6.1 to 7.6 years, while the solar-only estimates ranged from 6.8 to 9.6 years.

This was interesting, and suspicious to me; I've been researching the cost of residential solar and storage in California at Energy and Resources Group, Berkeley, part of the Energy, Modeling, Analysis and Controls Group (EMAC). In my tentative results, adding a battery can save money on the electric bill, but the savings are usually not enough to recover the cost of the battery... so I started investigating.

At first, I thought the difference was probably simple payback (the way they're calculating) vs NPV (the way I'm calculating the cost effectiveness). Simple payback counts how many years of savings it takes to recover the original cost. Net present value also accounts for the fact that a dollar saved fifteen years from now is worth less than a dollar saved today.

That was part of the difference, but not all of it. I started working backwards from the EnergySage numbers to understand what else was going on.

## Working backwards from the five quotes

In the quote, five installers proposed different prices for both solar and storage. EnergySage then showed how much the homeowner would supposedly save over 25 years with solar alone, and with solar plus a battery.

<figure class="post-banner">
  <div class="energysage-quote-crop">
    <img src="{{ '/assets/img/energysage/quote-cash-savings-and-payback.png' | relative_url }}" alt="EnergySage comparison showing cash savings and payback periods for five quotes, with solar and battery payback shorter than solar-only payback in every quote">
  </div>
  <figcaption>The exported comparison showed shorter cash payback for solar plus battery in all five quotes. <a href="{{ '/assets/pdf/energysage/solar-battery-quote-redacted.pdf' | relative_url }}">View the complete privacy-redacted quote (PDF).</a></figcaption>
</figure>

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

The five quotes look like five separate financial projections, but they're mostly the same projection with five different prices plugged in. EnergySage gives the battery about $94,000 in value every time. It then subtracts whatever that installer charges. So the cheapest battery automatically looks like the best investment, without any visible adjustment for which battery it is or how it performs...

## The 7.1 percent assumption is doing a lot

Looking at the fine print: EnergySage assumes that electricity prices will increase by 7.1 percent every year. It bases this number on the previous ten years of California electricity prices reported by the U.S. Energy Information Administration.

<figure class="post-banner">
  <img src="{{ '/assets/img/energysage/quote-fine-print.png' | relative_url }}" alt="EnergySage fine print stating that the calculation uses 7.1 percent energy cost inflation and does not account for time-of-use rates or utility net-billing policies">
  <figcaption>The quote says it assumes 7.1 percent annual energy-cost inflation. It also says the estimate excludes time-of-use rates and utility net-billing policies.</figcaption>
</figure>

Basically, each year, the model makes electricity 7.1% more expensive. That also means that the electricity avoided by adopting solar + storage is 7.1% more valuable. Because the increase compounds, electricity priced at $0.40/kWh today reaches about $2.08 per kWh in year 25.

To see how much 7.1 percent compounds, I started with electricity at $0.40 per kWh:

- Year 2: `$0.40 × 1.071 = $0.428 per kWh`
- Year 10: `$0.40 × 1.071^9 = $0.74 per kWh`
- Year 25: `$0.40 × 1.071^24 = $2.08 per kWh`

California electricity prices genuinely increased a lot during the previous decade. But EnergySage took that historical increase and carried it forward for another 25 years. That is a very strong assumption. It makes electricity more than five times as expensive by the end of the calculation!

EnergySage has technically [reduced the assumption in 2026](https://www.energysage.com/local-data/electricity-cost/ca/), but only from 7.1 percent to 7 percent. That is not a meaningful change. Meanwhile, California's actual average residential price through June 2026 was 33.17 cents per kWh. It was 32.41 cents during the same period in 2025. That is an increase of about 2.3 percent, although the 2026 numbers are still preliminary. ([EIA data](https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_b))

The California Energy Commission agrees that utility rates have risen much faster than inflation since 2021. Its long-term forecast does not expect that pattern to continue. The CEC expects increased electricity sales to spread utility costs across more usage, leaving inflation-adjusted rates fairly stable. ([CEC IEPR](https://efiling.energy.ca.gov/GetDocument.aspx?DocumentContentId=106694&tn=269602))

I compared the EnergySage calculation with the latest CEC and EIA forecasts. These are all nominal prices, meaning the values include expected inflation:

| Projection | 2026 | 2050 | Approximate annual growth |
| --- | ---: | ---: | ---: |
| EnergySage calculation from 40 cents | $0.40 | $2.07 | 7.1% |
| CEC, PG&E planning area | $0.43 | $0.62 | 1.5% |
| CEC, California statewide | $0.32 | $0.65 | 3.0% |
| EIA, Pacific region | $0.25 | $0.41 | 2.1% |

Sources: [CEC 2025 Electricity Rate Forecast](https://efiling.energy.ca.gov/GetDocument.aspx?tn=268239) and [EIA 2026 Annual Energy Outlook, Pacific region](https://www.eia.gov/outlooks/aeo/supplement/excel/suptab_3.9.xlsx).

Any forecast for 2050 could be wrong. Rates might increase faster than the CEC or EIA expects. Still, $2.08 per kWh is more than three times the CEC forecast for the PG&E planning area. I would call that a high-growth stress case, not a reasonable central estimate.

There is also a small date problem. Forty cents compounded 24 times becomes $2.07, so that is the price in "year 25" if 40 cents is the price in year one. If 40 cents is the 2026 price and it grows for 25 full years, the 2051 price would be $2.22 per kWh.

## Future dollars are not today's dollars

Then I looked at what EnergySage does with those future electricity prices. The quote reports "25 year savings (cash)," not net present value. It adds each year's projected savings at its full future-dollar amount.

A cash total is problematic because it doesn't measure what those savings are worth today. It should not be compared directly with a cost paid today. A dollar received in 2051 is worth less than a dollar received now, in other words, today's dollar can be used or invested for the next 25 years.

Suppose someone offered me $1,000 today or $1,000 in 2051. At a 7 percent discount rate, the second option is worth about $184 today! The two payments have the same number printed on them, but they absolutely do not have the same value.

What's crazy is that same issue appears in EnergySage's electricity calculation. The model turns 40 cents into $2.08 through escalation. Discounted back 24 years at 7 percent, that $2.08 is worth about 41 cents today. The escalation makes the future number much larger. Converting it to present value almost completely reverses that increase.

EnergySage uses the first calculation but not the second, which is what I find misleading. The quote makes the future savings grow rapidly, then presents every future dollar as though it were worth a dollar today.

Here is the same problem another way. If the first-year saving is `S`:

- With no escalation, 25 years of savings equal `25 × S`.
- With 7.1 percent escalation, the undiscounted total equals `64.2 × S`.
- With 7.1 percent escalation and a 7 percent discount rate, the present value equals about `25.3 × S`.

The `25.3 × S` figure is the present value. The 2.5 figure compares EnergySage's undiscounted total with that present value:

`64.2 × S ÷ 25.3 × S = 2.54`

In this example, the cash-savings headline is about 2.5 times the present value. The 7 percent discount rate is only an example, but the underlying problem does not depend on that exact rate. EnergySage is mixing money from different years without translating it into one common year's dollars.

The result is also heavily back-loaded. About 61 percent of the nominal savings arrive during years 16 through 25. About 35 percent arrive during the final five years alone. Most of the displayed value therefore depends on electricity prices far in the future.

<figure class="post-banner post-photo-portrait">
  <img src="{{ '/assets/img/energysage/quote-cumulative-savings.png' | relative_url }}" alt="EnergySage cumulative cash-savings graph with several curves rising most sharply near the end of the 25-year period">
  <figcaption>The comparison's cumulative cash-savings curves rise fastest near the end of the 25-year window.</figcaption>
</figure>

## The quote leaves out the tariff details

Then I found something even stranger in the fine print. The quote says that its calculation does not account for time-of-use rates or utility net-billing policies.

Those are two of the most important inputs for valuing a battery in California. A time-of-use rate changes the price of electricity depending on the hour. A net-billing tariff determines how much the utility pays for solar electricity exported to the grid.

Under California's current [Net Billing Tariff](https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/demand-side-management/customer-generation/net-energy-metering-and-net-billing), solar exported during the middle of the day is usually worth less than electricity purchased from the grid. A battery can store that solar energy and use it later, when electricity is more expensive. The difference between those prices is one of the main ways that a battery produces bill savings.

Under one-to-one net metering, such as NEM 2.0, the result can be very different. If the utility gives me the same credit for an exported kWh that I would pay to use one later, I gain little by putting that energy through a battery. I might even lose value because some energy is lost during charging and discharging.

EnergySage's own [guide to battery savings](https://www.energysage.com/energy-storage/how-much-can-you-save-batteries/) says that net metering and time-varying rates are important. Yet their complete quote excludes both and still assigns about $94,000 in gross value to the battery.

So what is the battery doing to earn $94,000? The quote doesn't say, and without the tariff or hourly energy-use assumptions, that value comes out of nowhere. Which is unfortunate.

## One battery gets 25 years of savings

Then there is the battery itself. The quote charges for one battery at the beginning, then reports solar-and-storage savings for the next 25 years. But batteries do not last 25 years!

EnergySage doesn't explicitly promise that the battery will last that long. But it also does not show a replacement cost, battery degradation, or declining usable capacity. In the calculation visible to the homeowner, one battery keeps producing savings for 25 years without another purchase.

This seems remarkably generous to me. In our research, we use a 15-year battery life with no degradation, which is already optimistic. The [2024 Annual Technology Baseline](https://atb.nrel.gov/electricity/2024/residential_battery_storage) also uses a 15-year life for residential batteries and includes battery-augmentation costs to maintain capacity.

The earlier calculation makes this omission much more important. At 7.1 percent escalation, about 61 percent of the nominal savings arrive after year 15. EnergySage gives most of the battery's apparent value to the period after our assumed battery life, but it does not show the cost of buying another battery.

If a savings estimate runs for 25 years, I would want to know what it assumes after year 10 or 15. Does the homeowner replace the battery? Does its usable capacity decline? Do the savings stop? None of those assumptions were visible in this quote.

## Saving money each year != breaking even

This is where the EnergySage result is easiest to misunderstand. **A battery can reduce the electric bill every year and still cost more than it saves.**

I ran my dispatch model with a fixed 7.6 kW solar system and a 13.5 kWh battery. In that example, the battery reduced the electric bill by about $1,037 per year. That is a real benefit. It is also the gross bill reduction before paying for the battery.

Over a 15-year life, discounted at 7 percent, those annual savings are worth about $9,445 today. The present-value factor is 9.108:

`$1,037 × 9.108 = $9,445`

The installed battery cost in our model was about $19,719, based on the NREL cost benchmark. After including that cost, the net value was negative:

`$9,445 − $19,719 = −$10,274`

This is the part that is misleading about a **savings** estimate: I can save $1,037 each year and still lose money on the purchase. The bill savings must be large enough to recover the upfront cost.

I also checked the result per kWh of battery capacity. The battery saved about $77 per kWh of capacity each year:

`$1,037 ÷ 13.5 kWh = $77 per kWh per year`

Over 15 years, that produces a break-even installed cost of about $701 per kWh:

`$77 × 9.108 = $701 per kWh`

The five EnergySage battery prices ranged from $10,900 to $14,650, which was lower than the battery price in my model. However, the exported comparison doesn't provide enough detail about usable capacity, power, or included equipment. We can't fully make an equivalent price comparison without those details.

## Energy...Sage?

EnergySage is at best a starting point for getting excited about solar + storage and electrification, but I would absolutely not use it as a financial modeling tool without rebuilding the calculation. Before relying on the savings or payback numbers, I would want to see:

- The battery's usable capacity, output power, efficiency, and expected degradation.
- The household's hourly imports and exports.
- The actual time-of-use rate and hourly export credits.
- The assumed electricity-price escalation and discount rates.
- The battery's expected service life and any replacement cost.
- The equipment, electrical work, and backup hardware included in the price.
- The annual cash flows used to calculate payback and long-term savings.

I went into this expecting a technical difference between simple payback and net present value. Instead, I found several assumptions that all push the result in the same direction. EnergySage assumes an unusually high electricity-price increase, compounds it for 25 years, omits the tariff rules that determine a battery's value, and does not show a battery replacement.

Together, those choices make the battery look like an "obvious" financial winner. The quote gives a homeowner a precise payback period and a large savings number, but not the information needed to reproduce either one. The five installer offers might still be useful, and I would maybe use them to decide who to call. But I would not use EnergySage's savings estimate to decide whether the battery will pay for itself and whether this is a good decision from an economic perspective.
