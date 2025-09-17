---
layout: default
title: Projects
nav: true
---
<div class="max-w-5xl mx-auto grid gap-6 md:grid-cols-2" data-reveal>
  {% assign projects = site.projects | default: site.pages | where:"category","projects" | sort: "weight" %}
  {% for project in projects %}
  <a href="{{ project.url | relative_url }}" class="card p-6">
    <h3 class="mb-2">{{ project.title }}</h3>
    <p class="mb-3">{{ project.excerpt }}</p>
    {% if project.tags %}
      <div>
        {% for tag in project.tags %}
          <span class="tag-chip">{{ tag }}</span>
        {% endfor %}
      </div>
    {% endif %}
  </a>
  {% endfor %}
</div>