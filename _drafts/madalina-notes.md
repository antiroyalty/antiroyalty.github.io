

Madalina Questions

Context:
- Several years out reviewing the Coinbase architecture

How is the Ledger Service these days?
- Right before Madalina started
- The whole purpose was that in financial infrastructure and you CAN'T delete entries
- When it was first built, it was supposed to be the silver bullet for everything ledgering, bookkeeping, 
- A lot of write heavy and read heavy issues on the same service
-- More read replicas, but part of the ledger source still comes from the ledger database
-- But now you have another layer that aggregates from multiple sources
-- Also have events that are produced
- After I left, this problem became more apparent was 
- Ledger -> move the balance reads somewhere else, add caching
- As Coinbase evolved, this ended up being a good decision, because now you have multiple ledgers that power this balance, which is an aggregated balance of everything that the user does
- Ledger service now polls spot trading, DEX, derivatives (where the ledger is somewhere else, even like the blockchain)
- It is the source for all the financial accounts that the user has, and all the relational mapping that you have between them, has a redis cache on top of them
- Bought them some more time
- As you ended up having even more traffic, advanced trading, all the data goes through the ledger service
- Next bottleneck with service
- Needed to shard the postgres database
- How do you shard the database like that?
- For the Ledger, that doesn't make sense because you have a lot of posting rules / accounting rules
- As part of this DB transaction, you have to do <X>, <Y>, <Z>
- So if you shard by user, account, owner
- End up with scatter-gather
- Key insight is that the database was sharded by asset
- BTC, ETH sharded separately
- Smaller players will be sharded together
- That's how you satisfy all the same transactions 
- Currencies are separate shards
- When you take the funds from the user, you put them with an internal account and you need to split
- Did you consider going to a different kind of database
-- With Dynamo you can have consistency levels guaranteed, but...
-- Postgres is the natural candidate for ledgering, if you go anywhere
-- Because it has strong consistency, transactions are kind of inherent to the database
-- A lot of other databases implement some other version of database transactions, but Postgres is the gold standard
-- Ledger service ran for a while, then we created a Financial Account service, both internal and user accounts
-- Now you have these accounting rules that are quite complicated, you get into a financial system that is wider than just the US, data needs to land and be stored in certain jurisdictions; what is your profit, what are you storing for users; all of these internal accounts are no longer just the counter party that you dump funds in, they're very bespoke and
-- Logic became very complicated, so this is what the Posting Rules became; jurisdiction, rules for the database transaction
-- JSON is named, has a tag, that tag is passed in the ledger request
-- JSON gets stored in an S3 bucket, a separate service that operates as an integration to finhub, account history type, the posting rules
-- The service has the data as embeded, also the data saved in S3
-- So when ledger starts, it embeds it, but it also pulls the latest version from S3
-- Ledger has a service that does the translation later

- I remember you had a number of major incidents with it in 2024 - what happened? What were the ways it failed?
-- The zero balance thing was that the financial account service didn't have a fail-open version
-- Fail closed vs. fail open: bsaed on who your client is you could specify that for you, then your behavior would be different
-- If this is unavailable, return 0
-- Some other source was unavailable, where the sources that are available would return, but one was unavailable and it was all or nothing, not telling the clients that something was correct

- Balance table, account table?
- Are AccountChanges still in use?
-- Moving to what the AccountChange2s was at the beginning
-- Ledger was meant to be kept light and fast so you can post quickly, and to be the source of the fund movement happening
-- AccountHistory records were seen as the metadata associated with that, and will be all of the color associated with the money movement that is displayed in an account
-- The problem with that is, if you need something like a transaction stream, a higher bar for consistency or reliability
-- Then you have to look at the ledger, and account history entries, 
-- AccountChange2s were still seen as this Ugly Child
-- Now as we add more and more products that don't use Ledger Service, accountchange2s are seen the source of truth
-- Back office 
-- These back office services are actually wuite stable,
-- But if you want to display anything to the user, just read from AccountHistory
-- AccountHistory has all the data that the user has, streaming across everything, ordering everything, the source for everything that you see in your app
-- As of 2 months ago, don't delete those entries

- Financial Account Service
-- The source of accounts
-- If you want to trade BTC, before that buy goes through, that goes through the FinancialAccounts service

- Has the monorail been fully decomposed?
-- Monorail is gone
-- Right before Luca left, 6 months before he left, that's when the Monorail decomposition completed
-- Everything's in Go

- How is the Transfer Service? What are the biggest pain points with it?
-- Translated into Go
-- Now there's another service that does that, that is still in Go
-- Problem with the generated Ruby code
-- Transfers V2 was written maybe 3 years ago

- How does Coinbase use AI
-- Had a transition period maybe 2 years ago
-- Early last year there were some services that were angry about needing to improve code coverage to above 80%
-- Critical repositories == can't use AI
-- In the past 1 year, no more sensitive repositories
-- Don't write code by hand at all, multiple agents running on multiple different tabs
-- If someone asks a question, pull together all the information with AI, then reply like that
-- Docs, research for docs, writing code itself, writing tests
-- Product decisions have fallen short, still need clarification from a real person rather than AI
-- Agents will reference any google doc that's available, and they'll use that as the source of truth, it literally behaves 

Madalina really loved working on the Position Service, making algorithms by hand, writing code on a piece of paper before writing it down, brain completely developed and used, algorithms + maths

However, with the tool Madalina built, built the tool fully by herself, very infra heavy, a lot of docker compose, k8s, kubernetes in docker, versions to run it locally, making proxies, and how to bypass some proxies that exist on the machine, and AI really made her understand these concepts so much easier

More old school have to ditch the "I don't like how you name your variable", "extracting 
Good quality practices are probably looser, and draw the line at more programmatic level, can't actually read that level of code

Main problem with AI: people generally have bigger egos, depending on how you feed that ego, the ego is going to take over. Now you have ultimate power of building anything by yourself. Now: instead of AI being a multiplier factor, now it's a source of competition, build a lot of things in parallel because you can compete and get there faster, but you can only go to a certain level of depth. Now you end up with N different initiatives of the same type, but theyre all surface level. "AI utilization insights" into your company. SEO but with AI, analysis into whatever, but everything is so surface level, but now everything is so surface level that the quality is really bad. 

- With agents you rely a lot on their reasoning and that can change, but this is meant to be deterministic
