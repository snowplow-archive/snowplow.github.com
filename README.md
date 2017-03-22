https://snowplowanalytics.com: [![Build Status][travis-image-master]][travis]

https://next.snowplowanalytics.com: [![Build Status][travis-image-develop]][travis]

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

### Colours

![colours][colours]

From dark to light (see it [live](http://paletton.com/#uid=53E161kpnocgvvWkYrusajwy2dZkl3rFccH9h3vPpjogsdiWkl3rFccH9h3vPpjogsdiW)).

### Blue

- #062249 rgb(6, 34, 73)
- #143666 rgb(20, 54, 102)
- **#234A7F rgb(35, 74, 127)**
- #3A5E90 rgb(58, 94, 144)
- #597AA7 rgb(89, 122, 167)

### Purple

- #4B1064 rgb(75, 16, 100)
- #631F81 rgb(99, 31, 129)
- **#773793 rgb(119, 55, 147)**
- #8F53A9 rgb(143, 83, 169)
- #B481CA rgb(180, 129, 202)

### Green

- #4A8710 rgb(74, 135, 16)
- #67AE24 rgb(103, 174, 36)
- **#83C644 rgb(131, 198, 68)**
- #A6E46A rgb(166, 228, 106)
- #C0EF94 rgb(192, 239, 148)

[colours]: /assets/img/readme/colours.png

[travis]: https://travis-ci.org/snowplow/snowplow.github.com
[travis-image-master]: https://travis-ci.org/snowplow/snowplow.github.com.svg?branch=master
[travis-image-develop]: https://travis-ci.org/snowplow/snowplow.github.com.svg?branch=develop
