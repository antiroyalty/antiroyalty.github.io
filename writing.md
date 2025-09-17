---
layout: default
title: Writing
permalink: /writing/
---

<section class="section">
  <h2 class="section-title">All Posts</h2>
  <ul class="post-list">
    {% for post in site.posts %}
      <li>
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date_to_string }}</time>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </li>
    {% endfor %}
  </ul>
</section>

