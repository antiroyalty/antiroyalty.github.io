---
layout: default
title: Writing
permalink: /writing/
---

<section>
  <div class="page-intro">
    <p class="eyebrow">Research notes + field notes</p>
    <h1>Writing</h1>
    <p>Notes on electricity systems, research software, climate, policy, and learning how physical things are made.</p>
  </div>
  {% assign posts_by_year = site.posts | group_by_exp: 'post', 'post.date | date: "%Y"' %}
  {% for year in posts_by_year %}
    <h2 class="year-heading">{{ year.name }}</h2>
    <ul class="post-list">
      {% for post in year.items %}
        <li>
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: site.theme_config.date_format | default: '%Y-%m-%d' }}</time>
        </li>
      {% endfor %}
    </ul>
  {% endfor %}
</section>
