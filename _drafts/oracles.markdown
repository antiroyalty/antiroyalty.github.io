Here’s a publishable first draft.

# The Reality Stack

*How to tell whether a technology can actually change the world*

When I worked in crypto, I used to talk about the need for “real-world oracles.”

A blockchain could tell you everything that had happened inside its own universe. It could establish who owned a token, whether a transaction satisfied a contract, or how funds had moved between addresses. But the moment a contract referred to something outside that universe—a shipment arriving, a crop failing, a house changing hands—it encountered a much harder problem:

How does a computational system know what actually happened?

My hunch was that crypto would not become truly useful until it developed better real-world oracles. It could create a rich, self-contained financial system without them. But it could not become an operating system for the broader economy.

I initially thought of the oracle problem as a data problem: find a trustworthy source and bring its information on-chain. Over time, I came to see that this was much too narrow.

A real-world oracle is not merely a data feed. It is an institutional arrangement connecting a representation to reality.

That arrangement needs to answer several questions:

- **Identity:** Who or what made the observation?
- **Provenance:** Where did the evidence come from, and what happened to it along the way?
- **Authority:** What makes this account operative rather than merely informative?
- **Incentives:** Why should the participants report honestly and act correctly?
- **Resources:** Does the system control the money, people, materials, or access required to respond?
- **Actuation:** Can it produce an actual change in the world?
- **Recourse:** What happens when it is wrong?

These questions form what I think of as the **reality stack**. They offer a way to evaluate any technology that claims to affect the world:

**Which layers does it reach, and where does it stop?**

## Representation is not reality

Technology is extraordinarily good at producing representations.

A dashboard represents a factory. A database represents a supply chain. A token represents an asset. A medical record represents a patient. A language model represents a problem through text.

But manipulating the representation does not necessarily change the thing represented.

Changing a field in a property database does not, by itself, establish ownership. Flagging a machine as defective does not repair it. Generating a treatment plan does not cause someone to receive treatment. Recording a ton of carbon removal does not mean that a ton of carbon was removed.

The gap between the record and the reality is where institutions live.

Property records work because governments recognize them, courts enforce them, surveyors establish boundaries, and people can ultimately be removed from land they do not own. Medical records matter because licensed practitioners, pharmacies, insurers and hospitals have defined responsibilities around them. A shipping manifest matters because carriers, ports, customs agencies and buyers participate in a web of contracts and enforcement.

The representation becomes consequential because an entire structure connects it to the world.

This is why the oracle problem is so difficult. It cannot be solved solely by making the database more immutable. Immutability might tell us that a claim has not been changed. It cannot tell us that the claim was true in the first place.

## The layers of the reality stack

Consider a system intended to detect and repair dangerous cracks in bridges.

At the first layer, it needs **identity**. Which bridge are we looking at? Which camera, inspector or sensor produced the observation? Is the device itself authentic?

Then comes **provenance**. When was the image captured? Has it been modified? Was the sensor calibrated? Can we trace the observation back to its source?

But even impeccable evidence does not create **authority**. Who may decide that the bridge is unsafe? Can an AI system close a lane, or must a licensed engineer approve the finding? Which government body has jurisdiction?

The system must also contend with **incentives**. A maintenance contractor might benefit from finding more problems. A local government might benefit from minimizing them. An inspector may face pressure to keep a bridge open. Trustworthiness is not simply a property of data; it depends on the interests of the people and organizations producing it.

Even an authoritative decision cannot accomplish much without **resources**. Are workers available? Is there money in the maintenance budget? Can the necessary materials be obtained? Does anyone control the signs, barriers and machinery?

Only then can **actuation** occur: closing the lane, dispatching a crew and repairing the structure.

Finally, the system needs **recourse**. What if the bridge was closed unnecessarily? What if a defect was missed? Who is responsible, how can the decision be challenged, and how does the system learn from the error?

A camera connected to a model may reach the first two layers. It can observe and classify. A municipal dashboard may add authority by bringing the result to an official. A maintenance platform may mobilize resources. A fully integrated operating system might close the loop from detection through repair and verification.

All of these can be useful technologies. But they do not have the same relationship to reality.

The question is not simply, “Does it use AI?” It is: **How far down the stack does it go?**

## What crypto taught us

Crypto’s greatest successes largely occurred where the relevant reality already existed on-chain.

Tokens could be transferred, exchanged, collateralized and composed because the blockchain itself was authoritative about their state. There was no gap between the record of the token and the token. The representation was the asset.

The difficulties appeared when tokens claimed to represent something else.

A token representing a house still required a recognized title system. A token representing carbon removal required someone to measure and verify the removal. A prediction market resolving an election required an accepted source of election results. A decentralized insurance contract required a way to determine whether the insured event had occurred.

Stablecoins provide an instructive compromise. Their practical architecture generally does not eliminate trusted institutions. Instead, a bank holds money, an issuer creates redeemable claims, custodians safeguard assets, and legal agreements establish responsibility. The blockchain makes those claims programmable and transferable, but an accountable institution anchors them to reality.

The oracle was not replaced by cryptography. It was wrapped in cryptography.

This suggests a broader principle:

> Technology rarely eliminates trust. It relocates trust, distributes it differently, or makes parts of it more legible.

The important question is whether the resulting arrangement is more reliable, contestable and useful than what came before.

## AI agents face the same boundary

AI agents are now approaching their own version of the oracle problem.

A model can summarize a maintenance report, analyze an image, recommend a purchase or construct an elaborate plan. But intelligence is not the same as agency, and agency is not the same as consequence.

To act reliably, an agent needs authenticated observations of the world. It needs to know which systems and people it can trust. It needs authority to make certain decisions and explicit boundaries around decisions it cannot make. It needs access to resources. It needs mechanisms for action, verification and correction.

Otherwise, it remains inside a world of representations.

This is why better interfaces for agents matter—but also why they are only part of the story. A polished workspace can help a person select agents, provide context and monitor their work. That may be valuable. But it does not, by itself, create a trustworthy connection to reality.

The more consequential frontier is the interface between agents and the world:

```text
physical reality
    → authenticated observation
    → reasoning
    → authorized decision
    → mobilized resources
    → physical action
    → verified outcome
    → accountability
```

Every arrow in that loop is difficult. Every arrow contains technical, social and institutional assumptions. And every arrow is a possible place for the system to stop.

## Where does it stop?

This framework gives us a useful way to examine ambitious technology claims.

When a company says it is “transforming healthcare,” does it produce recommendations, or can it ensure that patients receive care?

When a climate platform measures emissions, can it verify the source data? Does anyone have the authority and resources to reduce those emissions?

When an agricultural model predicts irrigation needs, is it connected to the equipment that controls the water? Can it detect whether its intervention worked?

When an agent creates a plan, can it procure materials, coordinate people and respond to unforeseen conditions? Or does it end by generating another document for a human to interpret?

There is nothing inherently wrong with stopping early in the stack. Better observation and better recommendations can be enormously valuable. The mistake is confusing an informational output with a completed outcome.

A system’s stopping point tells us what kind of system it really is.

Does it:

1. **See?**
2. **Establish what is true?**
3. **Make or support an authoritative decision?**
4. **Mobilize resources?**
5. **Act?**
6. **Verify the result?**
7. **Accept responsibility when it fails?**

The further it proceeds, the more it must leave the clean world of software and encounter regulation, organizations, incentives, physical constraints and human judgment.

It also becomes harder to build—and much harder to fake.

## From intelligence to consequence

As artificial intelligence becomes cheaper and more widely available, the scarce things may increasingly be the complements it cannot generate: energy, equipment, permits, logistics, trusted relationships, physical access and institutional authority.

That changes where durable value may be found.

The most important technology companies may not be those that create the most engaging conversations with intelligence. They may be the ones that build reliable pathways from intelligence to consequence.

They will know not only how to produce an answer, but how to determine whether the answer is grounded. Not only how to recommend an action, but who may authorize it. Not only how to issue a command, but whether the resources exist to carry it out. Not only how to act, but how to verify what happened and take responsibility when it goes wrong.

The oracle problem was never just about getting information into a computer.

It was about connecting two different kinds of truth: the formal truth of computational systems and the contested, institutional and physical truth of the world we inhabit.

Crypto encountered that boundary. AI agents are encountering it now.

The next frontier may belong to those willing to build across it.


-----
Exactly—and I think your “oracle” framing generalizes beyond crypto.

Crypto could succeed at **endogenous things**: transferring tokens, enforcing contracts, composing financial primitives whose entire state already lived on-chain. But once a contract referred to something outside that closed universe—property ownership, crop failure, electricity delivered, carbon removed, an election result—the system inherited the real world’s ambiguity and trust.

The hard part wasn’t merely fetching the data. A real-world oracle needs:

- identity: who observed it?
- provenance: how was it measured?
- authority: whose account is legally operative?
- incentives: why report honestly?
- recourse: who is responsible when it’s wrong?
- actuation: can the system make the corresponding real-world change?

That is mostly an institutional problem disguised as a software problem.

Stablecoins are revealing: the practical solution wasn’t to eliminate trusted intermediaries. It was to put a bank, issuer, custodian and redemption process at the boundary, then represent their claims on-chain. The “oracle” became an accountable organization.

Agents have essentially the same problem. A model can manipulate symbols beautifully, but it needs trusted boundaries to know whether:

- the shipment actually arrived
- the machine is really overheating
- the permit was approved
- the patient took the medication
- the contractor finished the work
- its intervention improved anything

And then it needs permission to act. So the complete system is larger than an oracle:

```text
physical reality
   → authenticated observation
   → agent reasoning
   → authorized action
   → verified outcome
   → accountability
```

That may be the genuinely interesting successor to both crypto and today’s agent software: not another intelligence interface, but infrastructure for creating trustworthy closed loops between computation and reality.

Your original hunch was perhaps slightly more precise as: **crypto could become financially successful without good real-world oracles, but it could not become a general operating system for the real economy without them.** That distinction has largely held. Agents may encounter the same boundary.