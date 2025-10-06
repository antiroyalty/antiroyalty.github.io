---
layout: default
title: Writing
permalink: /writing/
---

<section>
  <h2>All Writing</h2>
  {% assign posts_by_year = site.posts | group_by_exp: 'post', 'post.date | date: "%Y"' %}
  {% for year in posts_by_year %}
    <h3 class="muted" style="margin-top:1.25rem;">{{ year.name }}</h3>
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
