# What is *snowplow.github.com*?

This repo contains the source code and content for the [Snowplow](http://snowplowanalytics.com) website. The site is built in [Jekyll](https://github.com/mojombo/jekyll) and served by [GitHub Pages](http://pages.github.com/). Thanks to the great people of GitHub for this fantastic service.

All content is copyright © 2012-2016 Snowplow Analytics Ltd and not to be reused without permission.

1. [Making changes](#1)
2. [Adding or editing a blogpost](#2)
3. [Adding or editing another page](#3)
4. [Embedding images or other assets](#4)

<a name="1" />
## 1. Making changes

Start with cloning the repo. Work from a branch, not master, unless the change is so small that it doesn't matter.

Make sure to **compile and preview the site** before pushing updates to production. You will need [VirtualBox](https://www.virtualbox.org/wiki/Downloads) and [Vagrant](https://www.vagrantup.com/) to compile the website. Navigate to the repo, then build then vagrant up:

	$ vagrant up

That will take about 15 minutes to run initially. Once your VM is ready, you can ssh on and build the website

	$ vagrant ssh
	$ cd /vagrant
	$ bundle exec jekyll serve

In your host machine, open a browser and navigate to `http://localhost:4001` and bingo! There's the website!

When you are happy with the updates:

1. Merge them with the master branch
2. Push the master branch to origin

The good people at GitHub will compile the website and serve it on `http://snowplowanalytics.com`! Thank you [GitHub pages] (http://pages.github.com/).

<a name="2" />
## 2. Adding or editing a blogpost

This is straightforward. Create a new markdown file in the _posts directory, with the filename format `YYYY-MM--DD-title.md`.

In the file add the following [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter) to the top of the post:

```yaml
---
layout: post
title: Snowplow JavaScript Tracker 2.9.0 released with support for time travel
title-short: JavaScript Tracker 2.9.0
tags: [snowplow, javascript, tracker]
author: Fred
category: Releases
---
```

Then type in the rest of the post, in markdown, as normal.

<a name="3" />
## 3. Adding or editing another page

Adding a page to the rest of the site is reasonably straightforward.

First, create an appropriately titled markdown file and save it to the appropriate directory. (The site folder structure reflects the site information structure, so if you want to create a new page in the 'Product' section it's best to save it in the product folder.)

Second, add a [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter) to the top of the Markdown file e.g.:

```yaml
---
layout: page # set to page (unless the page requires a custom design)
group: documentation # first level in navigation
subgroup: analytics # second level in navigation (delete otherwise)
title: The Snowplow Analytics cookbook # Title as sent to the browser
permalink: /product/the-best-event-data-warehouse/
description: The Snowplow Analytics Cookbook contains a wealth of recipes for using Snowplow data to answer your business questions. # Description as passed to Google
---
```

It is required to include a 'permalink' on **all** non-blog pages. Each permalink **must** have a trailing slash or the Jekyll build will fail.

<a name="4" />
#### 4. Embedding images or other assets

Images are committed to the appropriate `assets/img` folder (depending on which section the image belongs). It can then be referenced in the Markdown as normal.

## Design

### Colors

Snowplow has two color schemes.

The main one. From dark to light:

- #1F294D
- #4C5371
- #797F94
- #A5A9B9
- #D2D4DB

And a purple one. From dark to light:

- #2D479A
- #586BAE
- #8290C2
- #ADB5D6
- #D5DAEB
