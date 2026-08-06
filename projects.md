---
layout: default
title: Projects
nav: true
permalink: /projects/
---
<section>
  <div class="page-intro">
    <p class="eyebrow">Tools, maps, and working models</p>
    <h1>Projects</h1>
    <p>Experiments that make electricity systems, infrastructure, and research software easier to inspect.</p>
  </div>
  <div class="projects-grid">
    {% assign projects = site.data.projects | default: empty %}
    {% for item in projects %}
      <a class="project-tile project-tile--{{ item.accent | default: 'paper' }}" href="{{ item.url | relative_url }}" aria-label="{{ item.title }}">
        <span class="project-motif" aria-hidden="true"></span>
        <span class="project-tile__content">
          {% if item.status %}<span class="project-status">{{ item.status }}</span>{% endif %}
          <h3>{{ item.title }}</h3>
          {% if item.description %}<p>{{ item.description }}</p>{% endif %}
        </span>
      </a>
    {% endfor %}
  </div>
</section>
