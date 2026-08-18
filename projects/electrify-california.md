---
layout: default
title: Electrify California
description: A homeowner-facing companion to research on electrification, solar, storage, and utility rates in California.
permalink: /projects/electrify-california/
explorer_url: "https://electrify-california.vercel.app/"
---

<article class="project-case-study">
  <header class="case-hero">
    <div class="case-hero__copy">
      <p class="eyebrow">Home energy research companion</p>
      <h1>Electrify California</h1>
      <p class="case-lead">A homeowner-facing way to explore how location, utility rates, household energy use, electrification, solar, and storage shape modeled costs.</p>
      <div class="case-actions">
        {% if page.explorer_url %}
          <a class="button" href="{{ page.explorer_url }}">Open the research preview</a>
        {% else %}
          <span class="case-status">Deployment in progress</span>
        {% endif %}
      </div>
    </div>

    <dl class="case-facts" aria-label="Project summary">
      <div>
        <dt>Perspective</dt>
        <dd>One representative household</dd>
      </div>
      <div>
        <dt>Resolution</dt>
        <dd>County, utility, and research scenario</dd>
      </div>
      <div>
        <dt>Evidence</dt>
        <dd>Versioned research releases</dd>
      </div>
      <div>
        <dt>Built with</dt>
        <dd>React and TypeScript</dd>
      </div>
    </dl>
  </header>

  <section class="case-section" aria-labelledby="case-question-title">
    <p class="eyebrow">The question</p>
    <h2 id="case-question-title">What might going electric mean for one household?</h2>
    <p>The research studies costs across California. This companion changes the point of view. It lets a homeowner inspect one modeled household and ask how a utility, rate plan, load profile, and technology scenario affect the result.</p>

    <ol class="case-question-list">
      <li>
        <strong>Annual and monthly bills</strong>
        <span>See whether modeled energy bills rise or fall, and when seasonal changes occur.</span>
      </li>
      <li>
        <strong>Capital and lifetime costs</strong>
        <span>Keep bill savings separate from equipment costs, incentives, annualized costs, and lifetime value.</span>
      </li>
      <li>
        <strong>Hourly energy behavior</strong>
        <span>Inspect how household load, solar, storage, grid imports, exports, and price signals interact.</span>
      </li>
    </ol>
  </section>

  <section class="case-section case-section--split" aria-labelledby="case-method-title">
    <div>
      <p class="eyebrow">Method</p>
      <h2 id="case-method-title">A window into the research, not a new calculator</h2>
    </div>
    <div>
      <p>The browser does not run an optimization or calculate a new tariff. It selects and explains results that the research model has already produced.</p>
      <p>Each release records the research commit, paper run, scenario, tariff snapshot, source files, and file hashes. The application rejects incomplete, inconsistent, unpublished, or modified results.</p>
    </div>
  </section>

  <section class="case-section case-section--split" aria-labelledby="case-role-title">
    <div>
      <p class="eyebrow">My role</p>
      <h2 id="case-role-title">Research, modeling, and product design</h2>
    </div>
    <div>
      <p>I developed the underlying California solar and storage research and designed this companion to make its household-level implications easier to inspect.</p>
      <p>The project combines energy modeling, tariff and billing logic, reproducible data releases, runtime validation, and an accessible interactive interface.</p>
    </div>
  </section>

  <aside class="case-note" aria-labelledby="case-status-title">
    <p class="eyebrow">Current status</p>
    <h2 id="case-status-title">The interface is ready for its first research release.</h2>
    <p>The live application remains a research preview until the first pinned results pass the publication checks. Results describe a representative modeled household. They are not an individual bill forecast or installation recommendation.</p>
  </aside>
</article>
