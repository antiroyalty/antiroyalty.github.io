---
layout: post
title: "Are DAOs the future of secure dispatch for VPPs?"
date: 2026-10-12 12:00:00 -0700
categories: notes
---

Maybe. Probably not.

Imagine 100,000 batteries each changing output by 5kW simultaneously: a 500 MW change to grid dynamics. The actual impact would depend on battery location, what other energy we have available, and grid conditions. But under the right conditions, it could cause trouble.

That's part of what makes virtual power plants interesting. The batteries can sit in thousands of different homes while an "operator" (eg Tesla, Enphase) coordinates their behavior. It's distributed equipment... and whoever schedules it also has a lot of authority!

A DAO (decentralized autonomous organization) lets members govern shared resources through rules implemented partly in blockchain smart contracts. A few features: real transparency / inspectability / auditability, and automatic execution of the agreed decisions, so long as executing them can be done digitally (eg. dispatching energy through software). For a VPP, members could collectively decide what authority they grant the operator, and how that authority can change. 

The operator could keep scheduling batteries, but perhaps the DAO could govern limits: how much energy can be used, how households are compensated, or how quickly (rate of change) the fleet can change its output. The key here is that in this hypothetical world, the changes would apply to _all_ batteries part of the DAO, so we'd have to think of safety protections that are helpful at that level, and would benefit from system-level coordination and buyin, rather than just configuring individual consumer preferences. 

In other words, we wouldn't need households to vote for every discharge. They could approve policies aligning with their interests beforehand, and the equipment could reject requests outside of those policies. You can imagine a world where expanding the functionality requires 3/5 custodians to approve.

If one operator is compromised, a change in functionality wouldn't be authorized (assuming that the other actors in the system act independently and in the interest of the DAO). Just like with multiple +1s on merging a pull request or signing a key, or moving funds from cold storage, or making a large transaction at a bank, CAISO also has a published certificate policy with multi-person control of its resources. It's a similar idea at the VPP level.

DAOs are an interesting idea in theory, but challenging in practice. Keep in mind: much of crypto, including DAOs, start from an adverserial premise: that other actors aren't necessarily to be trusted. It seems like a pessimistic lens, but the current software world with the autonomous execution of agents really raises the question whether the majority of people can be considered good actors on the internet, and how powerful the bad actors can really be now. The benefits with DAOs are specifically that independent parties retain enforcable authority over permissions they've delegated. 

But being _enforceable_ is still the key point; if a DAO rejects a command but a malicious operator still finds a zero day in the firmware and can execute their commands through that interface, they'd still have the opportunity to meddle with the controls. It's not the only attack vector, and maybe not even the biggest one. Then there's the flip side of it: establishing M-of-N quorum gets increasingly hard as more people are involved. So if a dynamic change is needed, there isn't a single person you can call: a failed quorum could withhold useful grid support. These are the classic tradeoffs of centralized vs. decentralized systems, whether it's banks or utilities or planning a group trip.

There might be a more compelling case if we imagine a world with many battery manufacturors. A neighbourhood could have Tesla batteries, Enphase batteries, and a few other brands, and they're all able to help with the same grid constraint. Coordinating them could make better use of the equipment without forcing everyone to buy into the same ecosystem. WeaveGrid tries to do this today with EVs and smart thermostats, but they too are a private company.

The question remains: who controls the shared platform when so much is at stake? Who decides its fees, which providers participate, and when the incentives of the platform differ from the individual's interest which differ from the grid's interest?

In a perfect idyllic world, a DAO could let equipment owners and competing providers govern that infrastructure _toghether_. They could work in harmony: establish common payment rules, APIs and interfaces, review consequential changes, all while honoring the organization's records and agreements.

 Ultimately, DAOs are a social and organizational instrument with more layers of software and some added automation. But that means their benefits also need to contend with what we could accomplish with a traditional governance board / cooperative / private quorum. Independent authorization, transparent accounting, and member governence don't _necessarily_ require a blockchain. A DAO becaomes more interesting when several parties need a shared record and automatic execution of agreed rules. 

Of course, those benefits come with their drawbacks: smart contracts can have bugs, vulnerabilities, lost keys, disengaged members. Tradable voting power might mean that control accumulates among people whose interests differ from those supplying the batteries (ie, who gets to vote? how do they get that ability?). Or, if you need energy records to make decisions, publishing those details can expose household routines and be a security concern of its own.

In a private company, some mix of security / infra / IT will address these issues; with DAO's you're left to address them out in the open with the public to view. 

## Does it make more sense in a world with agents?

Autonomous execution by agents raises more security questions. Can vulnerabilities target vulnerble software and hardware faster? At what scale? Can the agents themselves perform malicious, or even just unskillful operation? Anthropic had eval incidents where models access real systems when models get internet access; OpenAI had their issues with HuggingFace. What does it really mean to "sign off" on your agent's proposed changes? Now agents have access to everyone's email addresses - and most services allow you to reset your password by clicking a link in your email inbox! So whose password is it really?

If attacks become faster and more automatic, we also need the ability to contain damage faster. What does that actually look like in practice, and what's the role for the human in the loop? Honestly, I'm not sure. My hunch is that we can't just ask agents to behave safely and responsibly; those are just guidelines and execution instructions. The other thing I see is that the world full of adverse (digital) actors seems a lot more likely, and it's exactly the world that crypto was built for.

Is decentralizing the vote the answer to our energy security challenges? Maybe... but I still think there might be other, easier, cheaper, and more flexible ways to get the safety features we want. And I don't think it's right to look for a problem to fit a technology; the need for it has to be burning and abundantly clear. So DAOs and VPPs? In my opinion, probably not.