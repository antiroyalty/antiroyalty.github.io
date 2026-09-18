Questions

What kind of information does WeaveGrid get from utility systems? Is it able to understand network topology and constraints?

How is WeaveGrid different from ADMS like the ones offered by GE, Siemens

Utilities generally don't love adding another mission-critial system with APIs, cybersecurity reviews, procurement, support contracts, data sync. Why would they choose to go through all that trouble with WeaveGrid?

Why do you think that utilities will need a permanent dedicated platform for behind-the-meter DERs?


Why can't GE / Schneider / Siemens simply build what WeaveGrid has built?

GE Vernova's GridOS ADMS explicitly integrates with its GridOS DERMS, covering DER integration, visualization, operation, control, and optimization
https://www.gevernova.com/software/products/gridos/advanced-distribution-management-system

Plaid for grid-edge devices + orchestration. GE would rather integrate with WeaveGrid than reproduce 50-100 OEM integrations and maintain them forever. 

For every major OEM / device integration WeaveGrid has, how sticky is it? How much engineering work did it take? Could GE get equivalent access tomorrow? 

1. "What is technically hardest about integrating a new OEM or device today? If you gave a strong team the API documentation, what would still take months rather than days?"
   This directly tests your AI thesis. Listen for answers involving real-world reliability, missing telemetry, permissions, device state, safety, certification, OEM coordination, etc.—not simply API plumbing.

2. "How do you think AI changes that? Could agents make OEM integrations dramatically cheaper, and if so, what becomes the hard part of WeaveGrid's technology?"
   I'd especially like this one for a senior engineering manager. You'll learn whether they're thinking seriously about the changing software-development cost curve.

3. "Where does WeaveGrid sit relative to a utility's ADMS and DERMS five years from now? Do you expect DISCO to remain a distinct control plane?"
   This gets directly at the strategic question we've been discussing.

4. "Why couldn't GE Vernova or Schneider build this into their ADMS/DERMS?"
   Ask it exactly that directly. A strong answer should identify something structural—not "we move faster."

5. "What's something WeaveGrid knows about an EV or DER fleet after operating it for years that a new entrant wouldn't know from the OEM API?"
   This tests whether there is a data/learning moat. I'd be very interested in the answer.

6. "How much of the system is actually closed-loop today? For example, can a utility give WeaveGrid a feeder or transformer constraint and have the platform autonomously translate that into individual DER schedules?"
   This separates sophisticated managed charging from the DSO-like vision we've discussed.


7. "At what spatial and temporal resolution are you optimizing today—system, substation, feeder, transformer, individual service point?"
- for some utilities, don't have much data and are just managing rate signals and price signals
- Can organize vehicles around different transformers
- Getting an understanding of their non-EV baseload that comes from other sources, so we can try to fill the valleys there

   Then ask what is genuinely deployed in production versus technically possible/demoed.
8. "What happens when the optimization is wrong?"
   This is a deceptively good engineering question. You're dealing with a physical grid and unreliable consumer devices. You want to hear about observability, uncertainty, fallback behavior, constraint guarantees, reconciliation, and human intervention.

- Incentives are pretty aligned in that, the customer is unhappy, the utility is unhappy about that
- So the main thing that they're optimizing against is, did the person who wanted to drive their car be able to drive their car?
- Driver to get to the target charge, that's the main guarantee
- On the more utility facing side of things, with the utilities there's a little more wiggle room, client success teams, shifting load to various types of counterfactuals
- If we read in some signal incorrectly that shifted load unfavourably, the consequences are in that 

9. "With only ~60 people, what has the company deliberately chosen not to build?"
   This could reveal a lot. Are they intelligently narrow, or chronically resource-constrained?

Engineering is 25-30
Weavegrid is 60-70 people
Three service teams: 5-8 people ish, infra 3 people
Main thing, don't want to be the bottleneck to be able to say yes to things. 
Be the best partners that we can in those relationships

10. "Why has the engineering organization remained this small?"
    I would ask this directly too. Follow with: "Do you view that as evidence of software leverage, or are there things you haven't been able to pursue because of headcount?"

    
One question I'd definitely ask
Toward the end, I'd ask:
"If WeaveGrid succeeds beyond your expectations over the next five years, what does it own that is really difficult for anyone else to replace?"

Then don't suggest answers.

If they say "our algorithms" or "our integrations," I'd probe hard.

If they describe something like a utility/OEM network + unique fleet behavior data + trusted real-time control of millions of devices + deep integration into utility operations, that's a considerably stronger thesis.

And because you're talking to an engineering manager rather than a founder, you have a particularly valuable opportunity: ask what they believe privately as an engineer is genuinely difficult. Product/marketing will tell you what differentiates WeaveGrid. An experienced engineer can tell you which pieces are actually hard to reproduce.

I'd also ask one career-oriented question: "At 60 people, what would you expect someone in my role to own after 6–12 months that they'd probably never get to own at a 500-person company?" That will tell you whether the small size is actually an advantage for you, regardless of how the investment thesis plays out.


Weavegrid has three primary service teams:

-energy utility, paying weavegrid money
-- a big part of the value is that they can ensure that vehicles are charging at the cheapest time, prevent local transformer overload
-- take in signals from them, when is it clean, cheap, what does grid topology look like
-- here are all of the customers in your area that are interested in this program, utility-facing portal with them
- Consumers team
-- need EV drivers to sign up with them, sign up and indicate different programs they want to be in, get utility account number, rate information, credentials to interact with their vehicle or charger
-- notify them when their car is expected to charge, recurring constraints
- Devices team
-- all the interactions with OEMs like Tesla, Chargepoint