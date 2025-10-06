---
layout: default
title: Projects
nav: true
permalink: /projects/
---
<section>
  <div class="projects-grid">
    {% assign projects = site.data.projects | default: empty %}
    {% for item in projects %}
      <a class="project-tile" href="{{ item.url | relative_url }}" aria-label="{{ item.title }}">
        <span class="cover" style="{% if item.image %}background-image:url('{{ item.image | relative_url }}'){% endif %}"></span>
        <span class="overlay"></span>
        <span class="label">
          <h3>{{ item.title }}</h3>
          {% if item.description %}<p>{{ item.description }}</p>{% endif %}
        </span>
      </a>
    {% endfor %}
  </div>
</section>
