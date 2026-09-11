---
layout: post
title: "Notes from a carbon capture pilot"
date: 2026-09-11 12:00:00 -0700
categories: notes
---

In July, I went with a small group from UC Berkeley to visit Calpine’s carbon capture pilot in Pittsburg. One thing I wrote down during the tour was: “At this site the co2 is just captured and released.”

<figure class="post-photo-portrait">
  <img src="{{ '/assets/img/calpine-carbon-capture-pilot/emilia-and-i-los-medanos.jpg' | relative_url }}" alt="Emilia and I standing in front of equipment and an electrical switchyard at the Los Medanos Energy Center">
  <figcaption>Emilia and I at Los Medanos, trying to look normal in the July sun.</figcaption>
</figure>

Which felt like a slightly absurd thing to do! There is this whole system separating CO₂ from a power plant’s flue gas, and then it goes back into the atmosphere. A very well-instrumented catch-and-release program for exhaust.

But I think that reaction asks too much of a pilot. The point is to run the capture equipment on actual flue gas, not the conveniently clean version you get in a lab. The team told us that the pilot could capture up to 99% of the CO₂ in the stream it treats. That is exciting. For the proposed commercial project at Sutter, though, they were designing around 95% capture instead.

The host plant in Pittsburg, Los Medanos Energy Center, is a nominal 500 MW natural-gas combined-cycle plant. That is a large single power plant — about the same class as Calpine’s Sutter Energy Center near Yuba City, which the California Energy Commission lists at 578 MW. It is not one giant turbine, though. Both sites use the same basic 2×1 arrangement: two gas turbines, two heat-recovery steam generators, and one steam turbine. [Los Medanos](https://www.energy.ca.gov/powerplant/combined-cycle/los-medanos-energy-center) and [Sutter](https://www.energy.ca.gov/powerplant/simple-cycle/sutter-energy-center) were part of California’s big early-2000s buildout of more efficient gas generation.

This is what “combined cycle” means in practice:

```text
natural gas → combustion turbines (Brayton cycle) → electricity
                       │
                       └→ hot exhaust
                              ↓
                  heat-recovery steam generators
                              ↓
                            steam
                              ↓
                   steam turbine (Rankine cycle) → more electricity
```

The first cycle gets power directly from hot, expanding combustion gases. The second cycle gets another turn with the heat that would otherwise disappear up the stack. It is a pleasingly practical arrangement: the gas turbine does not get to throw away its exhaust until the steam turbine has had a chance to use it too.

<figure class="post-banner">
  <img src="{{ '/assets/img/calpine-carbon-capture-pilot/los-medanos-plant.jpg' | relative_url }}" alt="Industrial equipment and stacks at the Los Medanos Energy Center in Pittsburg, California">
  <figcaption>Los Medanos from outside the fence. A power plant is much more pipes, platforms, and strange specific machinery than the little box it becomes in a grid model.</figcaption>
</figure>

You can capture more. It just costs more, including in energy used by the capture process itself. The last few percentage points are not free little bonus points. I wanted to know how much energy 95% capture would take, but the pilot is too small to settle that question directly. There is still modeling involved. (A very impressive capture percentage does not answer every other question for you, unfortunately.)

The phrase people use for this is *parasitic load*, which sounds more dramatic than it is. The capture system has to borrow energy from the power plant. An amine solvent catches CO₂ at one point in the process, then needs heat so it can let go of it again and be reused. In a combined-cycle plant, that heat can come from steam which would otherwise keep moving through the Rankine cycle and make electricity.

```text
steam from the heat-recovery boiler
             ├→ steam turbine → electricity
             └→ solvent regenerator → solvent reused, CO₂ separated

electricity from the plant → pumps + fans + CO₂ compression
```

That is the part I had not really appreciated before the tour. Carbon capture is not an attachment you plug into the side of a power plant. It reaches into the plant’s heat and electricity flows. Then there are pumps, fans, and the equipment that compresses CO₂ for a pipeline. They all need power too.

So the gas plant may burn the same amount of gas, but send fewer megawatts to the grid. [A recent NETL analysis](https://netl.doe.gov/projects/files/NaturalGasCombinedCycleNGCCPowerPlantswithCarbonCaptureandExhaustGasRecycleEGR_101623.pdf) estimated an approximately 11% reduction in net output for modeled gas plants with capture, from the solvent process, steam use, and CO₂ compression. The exact number for Sutter would depend on the final design and operating conditions. The “10–15%” estimate I wrote in my notes is a useful ballpark, not a number the little pilot can magically certify.

This is also where I had to separate two ideas that I initially mashed together. A 95% capture target means the system is designed to store about 95% of the CO₂ in the flue gas it treats. A lower *net* power output is different: it means the capture plant has used some of the electricity and steam that would otherwise have reached the grid. If the gas plant burns the same amount of fuel, its gross CO₂ emissions before capture do not fall just because the net output is lower. The emissions reduction comes mainly from capturing and storing the CO₂. If the plant also runs less, then it burns less gas and emits less too — but that is a separate choice.

The bigger realization for me was that capture is only the beginning of the story. Once you have caught the CO₂, you need to compress it, move it, and store it somewhere permanently. You need a pipeline route, permits, and a place underground that can hold it.

For Sutter, the team described a possible storage site in porous rock far below the surface. They had looked at a roughly 25-mile area, and different studies had apparently converged on the same place. I had assumed the geology would be the giant mysterious piece. It may still be difficult, obviously, but they had already done a remarkable amount of work to understand it.

Then there are pore space rights: permission to use the tiny open spaces in that underground rock. You cannot just point 2.3 kilometers down and say, “great, we’ll put carbon there.” Someone has to own or control the right to use that space. They were still working on it, along with pipeline easements.

There were plans for air cooling, partly because additional water use would be such a bad fit in California. This made the tradeoff especially tangible. Los Medanos uses cooling towers supplied with reclaimed water from the Delta Diablo wastewater treatment plant. I had read about water cooling plenty of times, but I had never stood beside it. It was *so loud*. The heat and water moving through this supposedly ordinary part of the plant were suddenly very real.

<figure class="post-photo-portrait">
  <img src="{{ '/assets/img/calpine-carbon-capture-pilot/los-medanos-cooling-towers.jpg' | relative_url }}" alt="Water-cooling equipment at the Los Medanos Energy Center">
  <figcaption>Water cooling at Los Medanos. It was louder in person than I expected.</figcaption>
</figure>

Sutter already uses an air-cooled condenser, and the proposed capture retrofit was designed around air cooling too. It avoids the large additional water demand that a wet-cooled capture system could create. But it does not get heat removal for free.

The capture system still needs to get rid of a lot of heat. Water cooling can move heat away efficiently because water can absorb a remarkable amount of it. Air cooling uses giant fans and heat exchangers instead. It is a bit like trying to cool your house with an air conditioner when it is 70°F outside versus when it is 105°F: the machine can still work, but the temperature difference it has available is much less helpful.

For a power plant, the consequence is not just more fan power. Hotter cooling conditions can raise the pressure at the cold end of the steam cycle, which means the steam turbine gets less useful work from the same steam. On a hot afternoon, an air-cooled plant can therefore make less electricity even before we add a capture system. Adding capture introduces another large stream of heat that has to be rejected. That can increase the energy needed to run the system, or require more cooling equipment, even while the capture target remains 95%.

So air cooling does not mean “99% capture becomes 95% capture.” It means the team is trying to achieve its chosen capture rate without adding a major water demand, and accepting some thermodynamic inconvenience in return. The DOE described Sutter as the first planned carbon-capture facility to use air cooling, specifically to minimize water consumption. ([DOE project description](https://www.energy.gov/cmei/oced/articles/award-wednesdays-august-7-2024))

There was a hoped-for arrangement for SMUD to purchase the resulting low-carbon electricity. And the project had lost DOE funding, they told us.

At that point, it started to look less like a machine and more like an extremely complicated group project. The capture equipment, the underground reservoir, the pipe route, land rights, permits, a buyer for the electricity, and the financing all have to show up at roughly the same time. If one piece is late, or disappears, the rest of the project does not exactly get to keep moving on its own.

I don't know enough to say how close Sutter was to becoming a working commercial system. Still, I went in expecting the big open questions to be chemistry or mechanical engineering. I left wondering whether the harder problem was getting the capital stack to close once a major public funding source went away.

My own research is on residential solar and batteries in California, a very different scale, but perhaps a similar shape of problem. The equipment works. Whether someone installs it depends on the equipment cost, the electricity rates, and the incentives. Those can change while you are still figuring out the project. They can matter more than the technical question you began with.

After the tour, I emailed Barbara McBride at Calpine with the question I was still stuck on: without the DOE money, could the carbon capture tax credit and a contract to sell low-carbon power be enough to get Sutter financed? Or does the first project need public money before private investors are willing to pay for the next one?

I did come away a little excited, even with that question unresolved. The tour made “the energy transition” feel much less like a set of targets on a chart. It is a lot of people trying to make a strange, specific thing real: capturing the exhaust from a power plant, transporting it somewhere, and persuading enough other people that it is worth doing.
