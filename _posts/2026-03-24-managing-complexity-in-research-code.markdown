---
layout: post
title: "How I manage complexity in my research code"
date: 2026-03-24
categories: research code
---

Research code is sometimes treated as temporary. We need to run an analysis, get the results, write the paper. We’re not building a software company; how much time should we really spend organizing the code?

But the code is where our assumptions actually become a model. If we’ve implemented something incorrectly, that mistake can make it into the research conclusions. And the harder the code is to follow, the harder it is to notice.

I gave a talk to Berkeley’s EMAC group about how I’ve been dealing with this in my own work. My research involves modeling the costs of residential electrification in California, including solar and battery storage. There are building characteristics, appliance loads, utility rates, incentives, different scenarios, and quite a few intermediate calculations before we get to a cost comparison. At the time of the talk, the pipeline had 22 processing steps.

The main difficulty wasn’t how long the computation took. It was keeping track of what all those steps were doing, how they depended on each other, and whether a change in one place had affected something elsewhere.

I don’t want maintaining the software to become a whole separate research project. But I also don’t want to spend weeks investigating a result only to discover that I’ve been applying a rate incorrectly. So these are some of the choices I’ve made to keep the work understandable.

I start by writing down the analysis as a sequence of steps. For a simplified version: get the buildings and their characteristics, construct appliance load profiles, model what changes under electrification, add solar and storage, apply rates, compare costs.

This sounds basic, but it forces me to be clear about what depends on what. What information do I need before I can calculate an electricity bill? Where does that information come from? If I change the battery logic, which calculations need to run again?

The sequence is visible in the code, too. The steps are numbered and have names that say what they do. I want to be able to look at the files and recognize the analysis.

Then there’s one place that runs the whole thing. In my code, that’s a class called `CostService`. I give it a scenario, and it calls the steps in order, passes along the relevant configuration, and logs its progress. The command looks like:

```bash
python3 cost_service.py baseline
```

The detailed calculations live elsewhere. When I’m looking at the coordinator, I want to see the flow of the analysis without also having to read through the logic for calculating a solar export credit.

Each step has its own module, with a `process()` function as the entry point. The important part is being clear about the inputs it expects and the outputs it produces. The next step should be able to use those outputs without needing to know every detail of how they were calculated.

This became particularly useful when I changed the solar and battery deployment logic. I could rewrite step 9 while keeping its inputs and outputs consistent with the rest of the pipeline. That meant I could hold the other steps constant and compare the results.

There was still work to do to determine whether the new approach was better! But I could focus on that question, without also changing how the rest of the analysis worked.

Some calculations are needed in several steps. Those go into helper modules, organized around what they’re about: electricity rates, gas rates, solar, billing, and so on.

I’d like there to be an obvious place to look when I need to understand how a particular calculation works. If I’m calculating NEM 3.0 export credits in several places, I don’t want several slightly different implementations of that calculation. I want to be able to inspect the logic, fix it if necessary, and have that fix apply wherever it’s used.

The helper modules also keep the pipeline steps readable. A step can say which calculation it needs without containing the entire implementation.

For passing data between steps, I use CSV files.

Perhaps not the most exciting software choice. But I can open an intermediate result in Excel or Numbers and look at it. That’s useful when I’m trying to understand why a final result looks strange. I don’t necessarily want to reconstruct a whole program’s state just to see the values that went into a calculation.

Each step reads its inputs and writes its outputs, with files organized by scenario and the relevant subdivisions, such as county. If something looks wrong near the end, I can work backward through those outputs. Are the loads reasonable? Did the rates get applied correctly? Where does the result first stop making sense?

Saving intermediate data also means I can rerun only part of the analysis. If I’m changing something after step 9, I don’t need to redo all the work before it.

There’s a cost to reading and writing files, of course. For this analysis, I’m happy to pay that cost to be able to inspect what’s happening. As the research changes, I might make a different choice. So far, the ability to open the data and understand it has been more useful to me than making every step as fast as possible.

I do use classes where they help represent the things I’m modeling. Appliances are a good example. A water heater has a fuel type, an efficiency, a load profile, costs, and potentially incentives. Those pieces belong together.

Having classes for the appliances lets me keep their behavior in one place, while giving the rest of the analysis a consistent way to work with them. The pipeline shouldn’t need a growing collection of special cases every time I add another appliance. The appliance-specific logic can live with the appliance.

I’m also fairly strict about separating the data I started with from the data my code creates:

- `/raw_data` contains source data from elsewhere. I leave it in its original form.
- `/data` contains intermediate data generated by my analysis.
- `/results` contains the final outputs.

If I need to clean or transform something, the transformed version goes into `/data`. I want to be able to go back to the original and check what was actually there, especially when I’m trying to work out whether a surprising value came from the source or from something I did to it.

Notebooks are part of this process, too. I use them to explore datasets, try out calculations, and make plots. It’s helpful to see the intermediate results while I’m still figuring out what I want to do.

Once I know what a calculation needs to do, I move it into a module. Otherwise, the analysis can start depending on things like which cells I happened to run earlier. A variable exists, but where did its current value come from? Does restarting the notebook and running everything in order give the same result?

Those are extra questions to resolve when I’m already trying to understand the model. For the parts I’ll run repeatedly, I want the order and dependencies written into the code.

I use Git and GitHub to keep track of changes, with frequent commits and branches for experiments. A branch is useful when I want to try an approach without having decided that I’ll keep it. Commit messages also help me remember where I left off.

One detail I particularly like: I include the short Git commit identifier, or SHA, in output filenames. That gives me a way to associate a results file with a saved version of the code.

This matters when I’m looking at results from different runs. If a figure changes, I want to be able to investigate what changed in the model, instead of relying on my memory of what I was working on when I generated it. The filename gives me somewhere to start.

And then there’s documentation. Which is partly for other people, but very much for me.

I might work on rate modeling, move to another part of the research for a few weeks, and then come back. I don’t want getting started again to require reading through the whole codebase. So I write down the basic commands, how to run a scenario, and where the outputs go. Things that seem too obvious to document while I’m working on them are often exactly what I need when I return.

There’s still judgment involved in how much structure to add. I don’t always know what the analysis will need when I start building it. I need room to experiment, get something working, and then reorganize it as I understand the problem better.

What I want is to be able to come back to a result, follow how it was produced, and change the part I’m interested in without having to hold the whole project in my head.

I ended the talk by asking how other people do this. I’m still interested. What’s made your research code easier to work with, especially as the research itself changes?

The slides from my EMAC talk are [here]({{ '/assets/pdf/AnaSantasheva_emac_code_organization_12_2_2025.pdf' | relative_url }}).
