---
layout: default
title: Resume
description: Ana Santasheva's engineering, energy research, and earlier product work.
permalink: /resume/
---

<article class="resume-page">
  <header class="page-intro resume-intro">
    <p class="eyebrow">Engineering and research</p>
    <h1 class="script-heading">Resume</h1>
    <p>I build reliable backend systems and software for energy research. My work spans financial infrastructure, distributed systems, electricity economics, and public research tools.</p>
    <p class="resume-links">
      <a href="{{ '/email/' | relative_url }}">Email</a>
      <a href="https://linkedin.com/in/anasantasheva">LinkedIn</a>
      <a href="{{ '/projects/' | relative_url }}">Projects</a>
    </p>
  </header>

  <section class="resume-section" aria-labelledby="experience-title">
    <h2 id="experience-title">Experience</h2>

    <article class="resume-company">
      <header class="resume-company__header">
        <div>
          <p class="eyebrow">2024 to present</p>
          <h3>UC Berkeley</h3>
        </div>
        <p>Energy and Resources Group</p>
      </header>

      <div class="resume-role">
        <div class="resume-role__header">
          <h4>Graduate Researcher, Energy Systems</h4>
          <p>January 2024 to present</p>
        </div>
        <ul>
          <li>Built a Python research platform that models hourly energy use and costs for 16 electrification scenarios across 47 California counties and three utility territories.</li>
          <li>Developed an 8,760-hour mixed-integer model in PuLP and HiGHS. The model jointly sizes and dispatches solar and battery storage under California tariffs.</li>
          <li>Added source-locked tariff inputs, provenance, and fail-loud validation. Statewide results showed lower modeled costs in 46 of 47 counties and median savings of $1,951 per year from co-optimizing solar and storage.</li>
          <li>Built public tools to explain the research, including <a href="{{ '/projects/electrify-california/' | relative_url }}">Electrify California</a> and an experimental <a href="{{ '/grid/' | relative_url }}">California Grid Map</a>.</li>
        </ul>
      </div>

      <div class="resume-role">
        <div class="resume-role__header">
          <h4>Graduate Student Instructor, Statistical Analysis of Biological Data</h4>
          <p>August 2023 to December 2023</p>
        </div>
        <ul>
          <li>Taught data summaries, distributions, hypothesis tests, regression, and visualization with R to 75 undergraduate students.</li>
          <li>Helped students turn ecological datasets into clear statistical arguments and reproducible analyses.</li>
        </ul>
      </div>
    </article>

    <article class="resume-company">
      <header class="resume-company__header">
        <div>
          <p class="eyebrow">2018 to 2022</p>
          <h3>Coinbase</h3>
        </div>
        <p>Backend, infrastructure, and protocols</p>
      </header>

      <div class="resume-role">
        <div class="resume-role__header">
          <h4>Senior Software Engineer, Protocols and Cloud</h4>
          <p>February 2022 to November 2022</p>
        </div>
        <ul>
          <li>Led 12 backend, frontend, and blockchain engineers to design a new distributed protocol. Refined the design and implementation through partner and executive feedback.</li>
          <li>Worked with researchers and industry experts to identify a path to scale Ethereum by three orders of magnitude for Coinbase-scale transaction volume.</li>
          <li>Designed the access-control system for Coinbase's Wallet as a Service API, the company's first public API in five years.</li>
        </ul>
      </div>

      <div class="resume-role">
        <div class="resume-role__header">
          <h4>Senior Software Engineer, Infrastructure</h4>
          <p>January 2021 to February 2022</p>
        </div>
        <ul>
          <li>Led company-wide incident response during four weeks of record traffic. One response involved more than 25 contributors and tens of millions of dollars in customer funds.</li>
          <li>Found critical database and cache failure modes. Worked directly with MongoDB to resolve bottlenecks and improve resilience.</li>
          <li>Organized six principal engineers and senior managers to plan the decomposition of Coinbase's largest monolith and establish database design standards.</li>
          <li>Designed and implemented a user service that removed a critical failure point under high load and made the system easier to extend.</li>
        </ul>
      </div>

      <div class="resume-role">
        <div class="resume-role__header">
          <h4>Software Engineer, Payments</h4>
          <p>August 2018 to January 2021</p>
        </div>
        <ul>
          <li>Designed a reliable ledger and migrated hundreds of millions of balance records from a Rails monolith to a Go service with no downtime.</li>
          <li>Designed transfer orchestration for buys, sells, deposits, withdrawals, and trades. The system later processed more than 40 million financial transactions and more than $3 billion in daily volume.</li>
        </ul>
      </div>
    </article>
  </section>

  <section class="resume-section" aria-labelledby="earlier-title">
    <h2 id="earlier-title">Earlier engineering work</h2>
    <div class="resume-earlier-grid">
      <article>
        <p class="resume-date">May to August 2017</p>
        <h3>Coinbase</h3>
        <p class="resume-title">Software Engineering Intern, Payments</p>
        <p>Moved payment functions out of a Rails monolith and added caching to reduce database load during traffic spikes.</p>
      </article>

      <article>
        <p class="resume-date">August to December 2016</p>
        <h3>Pixlee</h3>
        <p class="resume-title">Software Engineering Intern</p>
        <p>Built a production Scala service that measured user conversion, time on site, and return rate. Led accessibility work under W3C standards.</p>
      </article>

      <article>
        <p class="resume-date">January to April 2016</p>
        <h3>Sequence</h3>
        <p class="resume-title">Software Engineering Intern</p>
        <p>Developed design prototypes for clients including Facebook and Chipotle. Introduced accessibility work in design and implementation.</p>
      </article>

      <article>
        <p class="resume-date">April to August 2015</p>
        <h3>500px</h3>
        <p class="resume-title">Software Engineering Intern</p>
        <p>Built a notification system across email, web, and mobile to improve user retention.</p>
      </article>

      <article>
        <p class="resume-date">September to December 2014</p>
        <h3>Vidyard</h3>
        <p class="resume-title">Software Engineering Intern</p>
        <p>Designed and built a Ruby service for video tagging that supported the frontend product.</p>
      </article>

      <article>
        <p class="resume-date">January to May 2014</p>
        <h3>BlackBerry</h3>
        <p class="resume-title">Software Engineering Intern</p>
        <p>Developed features for the BlackBerry desktop application, Calendar, and Updates applications.</p>
      </article>

      <article>
        <p class="resume-date">May 2012 to September 2014</p>
        <h3>Student.Careers</h3>
        <p class="resume-title">Co-founder</p>
        <p>Built a platform for students to find internships and volunteer work. Participated in VentureStart and reached the UpStart competition finals.</p>
      </article>
    </div>
  </section>

  <section class="resume-section resume-columns" aria-labelledby="education-title">
    <div>
      <h2 id="education-title">Education</h2>
      <h3>University of California, Berkeley</h3>
      <p>M.S., Energy and Resources Group<br>2023 to 2025</p>

      <h3>University of Waterloo</h3>
      <p>B.A.Sc., Systems Design Engineering with Co-op<br>2013 to 2018</p>
    </div>

    <div>
      <h2>Technical skills</h2>
      <p><strong>Languages:</strong> Go, Python, Ruby, Scala, SQL, JavaScript, TypeScript</p>
      <p><strong>Backend:</strong> Distributed systems, microservices, REST APIs, gRPC, PostgreSQL, MongoDB, DynamoDB, Redis, Kafka</p>
      <p><strong>Cloud and tools:</strong> AWS, Docker, Kubernetes, Terraform, React, ArcGIS</p>
    </div>
  </section>
</article>
