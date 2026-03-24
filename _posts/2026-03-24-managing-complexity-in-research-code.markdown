---
layout: post
title: "How I Manage Complexity in My Research Code"
date: 2026-03-24
categories: research code
---

In December 2025, I gave a talk to Berkeley's EMAC group on how I organize my research codebase. The context: I had just finished the main implementation of a fairly involved cost model for California solar+storage analysis under NEM 3.0, and I had opinions. The slides are [here](/assets/AnaSantasheva_emac_code_organization_12_2_2025.pdf).

This is the written version. The 10 things I actually do, and why.

---

## 1. Define a pipeline

The most useful thing I did early on was force myself to write down the steps of my analysis as a numbered list. Not pseudocode, not a diagram. Just a list:

1. Load rate data
2. Model baseline appliance loads
3. Compute NEM 2.0 costs
4. Compute NEM 3.0 costs
5. Compare

This list becomes the backbone of everything else. In the code, `CostService.run()` iterates over these steps in order. When something breaks, I know exactly which step failed. When someone asks what the model does, I hand them the list.

The pipeline is also the thing that survives rewrites. Individual steps change; the shape of the analysis stays the same.

---

## 2. Define a coordinator

A pipeline needs something to run it. In my codebase, that's `CostService`: a single class that serves as the entry point for running any scenario. You call `CostService.run(scenario_name)` and it handles the rest.

The coordinator does three things: it holds configuration, it calls each step in order, and it logs what's happening via `log_step()`. Nothing else. It doesn't do computation itself; it delegates.

This matters because research code tends to accumulate global state and ad hoc scripts. A coordinator pushes back on that. If you want to run the analysis, you go through one place.

---

## 3. Define self-contained modules

Each pipeline step lives in its own module. Each module exposes one function: `process()`. It takes explicit inputs and returns explicit outputs. It doesn't reach into global state. It doesn't know about the other steps.

This sounds obvious. It isn't. The temptation in research code is to share state between steps, pass big config objects around, or let modules accumulate helper logic that bleeds into neighboring files. Keeping each step self-contained means I can test it independently, swap it out, or hand it to someone else without explaining the whole system.

The discipline I enforce: if a module needs something from another module, it gets it through arguments, not imports.

---

## 4. Define helpers

Helpers are functions that don't belong to any specific pipeline step but get used across many of them. In my codebase, they're organized by domain: `electricity_rate_helpers`, `gas_rate_helpers`, `solar_helpers`, `billing_helpers`, and so on. Thirteen modules total.

The key rule: helpers are pure functions. They take inputs, return outputs, and have no side effects. This makes them easy to test and easy to reuse.

I used to scatter these functions wherever I first needed them. That made the codebase hard to search and easy to accidentally duplicate. Pulling them into named helper modules made it obvious where to look for rate calculations, where to look for solar math, and where to add something new.

---

## 5. Use a data store

My intermediate results live in CSV files, not in memory. Each scenario gets its own folder. Within that folder, results are organized by county, fuel type, or whatever the natural partition is.

I made this choice for a few reasons. CSV files are inspectable. I can open them in a spreadsheet, grep through them, version them. They're portable; another researcher can pick up where I left off without understanding my data structures. And they break the temptation to thread state through the whole pipeline. If a step fails halfway through, I can resume from the last saved checkpoint.

The tradeoff is speed. CSVs are slower than keeping everything in memory. For my analysis, that's acceptable. The ability to debug and inspect intermediate state is worth it.

---

## 6. Use classes to model objects

The core objects in my analysis are appliances: water heaters, HVAC systems, cooking ranges, EVs. Each one has a load profile, a fuel type, an efficiency rating. I model these as classes.

`ElectricAppliance` is the base class. Specific appliances inherit from it and override the load profile logic. This keeps the interface consistent while letting each appliance have its own behavior.

Research code often avoids OOP in favor of scripting. That's fine for small analyses. Once you're modeling a dozen different appliance types under different scenarios, having a shared interface saves a lot of repeated logic and makes adding a new appliance type straightforward.

---

## 7. Organize data folders

Three tiers:

- `/raw_data`: source data, never modified, never generated. If it came from an external source, it lives here and I don't touch it.
- `/data`: intermediate results generated by the pipeline. These can be regenerated. I treat them as disposable.
- `/results`: final outputs for figures, tables, and the paper. Generated by post-processing scripts, not the pipeline.

The rule for `/raw_data` is strict: I never write to it programmatically. This means I can always diff a run against the original source data and be confident that nothing upstream has been modified.

---

## 8. Use notebooks for experimenting

Notebooks are for exploration. Scripts are for reproducibility.

When I'm developing a new pipeline step or exploring a dataset, I use a notebook. It's fast to iterate, easy to see intermediate results, good for plotting. When I'm done and I know what I want to do, I port it to a module.

The anti-pattern I've tried to avoid: treating notebooks as the final artifact. Notebooks are hard to version, hard to test, and break easily when dependencies change. If a result needs to be reproducible, it needs to be a script.

---

## 9. Use GitHub

I commit every day, even if the work is incomplete. Small commits with clear messages are easier to navigate than large ones. I use branches for anything experimental, and I merge to main only when the code is working.

The detail I'm most glad about: I include the git SHA in output filenames. When I generate a results file, its name includes the short hash of the commit that produced it. This makes it possible to match any result back to the exact code that generated it, even months later.

This matters more than it sounds. Research analysis gets rerun. Figures get regenerated. Having a direct link between output and source code has saved me from several "wait, which version of the model produced this?" conversations.

---

## 10. Write documentation

The problem documentation solves is not "will other people understand this." It's "will I understand this in three weeks."

Research code gets picked up and put down. You might spend two weeks on rate modeling, shift to data cleaning for a month, then need to come back and add a new scenario. Without documentation, that context switch costs a lot of time.

My README covers installation, the basic run command (`python3 cost_service.py <scenario_name>`), and where outputs land. It doesn't need to be exhaustive. It needs to be the thing I read when I want to get a warm start.

---

These 10 things aren't a methodology or a framework. They're habits that accumulated from a lot of moments of confusion. The common thread: every one of them is about reducing the cost of picking the work back up, whether that's tomorrow or in three months.

The slides close with "many more lessons, how do you do it?" I mean it. If you have patterns that work for research code, I want to know.
