---
layout: post
title: "Retrieving Load Capacity Data from California IOUs"
date: 2024-09-15
categories: energy research
---

It's not straightforward to get load capacity data from the top 3 California IOUs. Each of them have very different sets of data, and different ways of interpreting them.

The main challenge with describing which circuits have "low" capacity is identifying what "suitable" capacity on a circuit may be. The threshold may be different in different regions, depending on number of customers served, their projected incurred loads, and network dynamics. There is also the question of the temporal allocation of each customer's load. Thus the "available capacity" on the grid cannot be strictly evaluated as a single value — in an ideal world, it should have both a spatial component (which line segment of the circuit, or which household contributes the additional load) and a temporal component (what time of day, month, or year is the load incurred).

Unfortunately, the utilities are the ones with the most comprehensive understanding of what the capacity numbers mean for any given circuit or line segment. For PG&E, the numbers displayed for given load capacities are the product of internal simulations run every time new equipment is installed or grid flows are re-evaluated. The utilities also most accurately know the number of households served by these loads, and since they own the smart meter data, they are the only ones who can really project when loads can be expected to occur.

Luckily, SCE and PG&E provide their own assessments of which circuits should be considered "low capacity." For PG&E this is called "Low Capacity Circuits," available as a unique layer on their geographically resolved ICA data. For SCE, this appears as a heatmap of Low / Med / High capacities, blending "Circuit and Substation Available Load Capacity on the Long Term." In both cases, these are a more credible source of information about potential problem areas than any single integer (e.g., circuits with less than 1 MW of capacity available), since more of the network dynamics have been taken into account and are self-described by the utility as potential problem areas.

---

## PG&E

PG&E's data is the most extensive and most easy to access and interpret, relative to the other IOUs.

The [PG&E ICA map](https://www.pge.com/b2b/distribution-resource-planning/integration-capacity-map.shtml) requires a PG&E customer login. The ICA map is extremely helpful for getting a preliminary understanding of the shape of the data.

PG&E data is notable for having 128 (month-hour) data points on substation load, as well as for feeders and line segments. To get data for the entire PG&E service territory, zoom out fully until the map encompasses the full territory, then click "Download Spatial Data" in the top right corner. This downloads a `.gdb` file (after a few minutes).

PG&E also has a [Grid Needs Assessment (GNA) map](https://www.pge.com/b2b/distribution-resource-planning/grid-needs-assessment.shtml) with a different subset of data. The ICA data is more of a "present moment" snapshot, generally used by customers to evaluate the feasibility of adding a new DER in their neighborhood. The GNA map captures what grid upgrades are needed from the utility's perspective: it generally captures the 80th percentile of ICA data, according to preliminary comparisons conducted by Eleanor Adachi.

Some data about PG&E infrastructure can also be obtained from ArcGIS via API, though as far as I can tell this data is hosted unofficially and not maintained by PG&E.

---

## SCE

SCE has around 5 million residential customers. Some of the information they make available can be accessed through ArcGIS:

[https://drpep-sce2.opendata.arcgis.com/search?tags=drpep](https://drpep-sce2.opendata.arcgis.com/search?tags=drpep)

Other ArcGIS tags available at the time of writing: "DERiM", "SCE", "Edison", "DRPEP", "LNBA."

SCE previously had a tool called DERiM. They've since deprecated it and replaced it with DRPEP (Distribution Resource Plan External Portal). The gist of both tools is a map with various layers showing different aspects of grid details. DRPEP comes with an interactive user guide and provides public access to:

- General locations of SCE distribution circuits, substations, and subtransmission systems
- Current, queued, and total distributed generation interconnection amounts
- Downloadable datasets with future API capabilities
- Available Load Capacity Heat Map
- Available Load Capacity — Substation and Circuit results
- Grid Needs Assessment (GNA)

For evaluating which SCE circuits have insufficient capacity, I've used the Available Load Capacity Heat Maps, which color-code regions by available capacity. In the data, red corresponds to low capacity available (value = 3) and green corresponds to high capacity available (value = 1).

After pulling in the layer and building the GeoJSON, the resulting areas can be visualized at [geojson.io](https://geojson.io/#map=2/0/20) — drag and drop the rendered GeoJSON file.

Note from DRPEP documentation: this layer shows estimated available capacity at the substation and circuit levels. It does not account for limitations at the circuit node level, including thermal, voltage, and voltage variation constraints. Values may significantly overstate available capacity. Customers can request additional analysis through the standard interconnection process.

---

## SDGE

For SDGE, ICA data can be accessed visually at:

[https://interconnectionmapsdge.extweb.sempra.com/#](https://interconnectionmapsdge.extweb.sempra.com/#)

You need to request access to their hosted map by registering here:

[https://www.sdge.com/more-information/customer-generation/enhanced-integration-capacity-analysis-ica](https://www.sdge.com/more-information/customer-generation/enhanced-integration-capacity-analysis-ica)

They have some limited documentation about how to use the map. Examples of accessing and filtering the data can be found in my GitHub.
