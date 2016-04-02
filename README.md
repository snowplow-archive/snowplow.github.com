# What is snowplow.github.com?

snowplow.github.com is the source code and content for the [Snowplow](http://snowplowanalytics.com) website.

The site is built in [Jekyll](https://github.com/mojombo/jekyll) and served by [GitHub Pages](http://pages.github.com/). Thanks to the great people of GitHub for this fantastic service.

All content is copyright © 2012-2015 Snowplow Analytics Ltd and not to be reused without permission.

## Adding new content and editing existing content

We welcome fixes and improvements! In particular on the analysis side, there is a wide range of ways Snowplow can be used, and we can't possibly hope to cover them all ourselves. If you've used it for a specific type of analysis, we'd love you to share it here. Please fork the repo, make your changes and then create a pull request.

### Contributing to the website

1. [Fork](https://help.github.com/articles/fork-a-repo) the repository
2. Clone your fork to your local machine
3. Make the desired changes to the website. More details on this are [below](#website-update)
4. Make a [pull request](https://help.github.com/articles/using-pull-requests). We will incorporate your updates to the site ASAP


<a name="website-update" />
### Updating the website

1. [Making changes locally](#2-making-changes-locally)
2. [Adding a new blog post](#3-adding-a-new-blog-post)
3. [Adding pages to the website (not the blog)](#4-adding-pages-to-the-website-not-the-blog)
4. [Embedding images](#5-embedding-images)
5. [Links between pages](#6-links-between-pages)
6. [Side menus](#7-side-menus)
7. [Previewing changes locally](#8-previewing-the-changes-locally)
8. [Committing your changes and deploying them to GitHub Pages](#9-committing-your-changes-and-deploying-them-to-github-pages)


<a name="2-making-changes-locally" />
#### 1. Making changes locally

Once you have the repo cloned locally, you can make changes to it. More details on specific changes (e.g. adding a blog post etc.) can be found below.

<a name="3-adding-a-new-blog-post" />
#### 2. Adding a new blog post


This is straightforward. Create a new markdown file in the _posts directory, with the filename format `YYYY-MM--DD-title.md`.

In the file add the following [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter) to the top of the post:

```yaml
---
layout: post
title: Snowplow JavaScript Tracker 0.14.0 released with new features # Full title
title-short: JavaScript Tracker 0.14.0 # REQUIRED for release posts, OPTIONAL for other blogposts (used in menu and breadcrumb)
tags: [snowplow, javascript, tracker]
author: Fred
category: Releases
---
```

Then type in the rest of the post, in markdown, as normal.

<a name="4-adding-pages-to-the-website-not-the-blog" />
#### 3. Adding pages to the website (not the blog)

Adding a page to the rest of the site is reasonably straightforward.

First, create an appropriately titled markdown file and save it to the appropriate directory. (The site folder structure reflects the site information structure, so if you want to create a new page in the 'Product' section it's best to save it in the product folder.)

Second, add a [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter) to the top of the Markdown file e.g.:

```yaml
---
layout: page # set to page (unless the page requires a custom design)
group: documentation # first level in navigation
subgroup: analytics # second level in navigation (delete otherwise)
breadcrumb: customer analytics # third level in navigation (delete otherwise)
subbreadcrumb: attribution # fourth level in navigation (delete otherwise)
title: The Snowplow Analytics cookbook # Title as sent to the browser
permalink: /product/the-best-event-data-warehouse/
description: The Snowplow Analytics Cookbook contains a wealth of recipes for using Snowplow data to answer your business questions. # Description as passed to Google
---
```

It is required to include a 'permalink' on **all** non-blog pages. Each permalink **must** have a trailing slash or the Jekyll build will fail.

<a name="5-embedding-images" />
#### 4. Embedding images

Images are committed to the appropriate `assets/img` folder (depending on which section the image belongs). It can then be referenced in the Markdown as normal.

<a name="6-links-between-pages" />
#### 5. Links between pages

When adding links to between pages on the site:

1. Always use relative URLs e.g. `/analytics/catalogue-analytics/overview.html`
2. Remember all URLs end in `.html`

<a name="7-side-menus" />
#### 6. Side menus

Side menus should automatically update with new blog posts / web pages as appropriate.

When the side menu is generated (Jekyll compiles the site) it fetches all the different pages, filters them by category and uses this to populate all the menus. To see how this is done, refer to the `_includes/snowplow/sidebar_standard` and `_includes/snowplow/sidebar_blog`.

<a name="8-previewing-the-changes-locally" />
#### 7. Previewing the changes locally

We **strongly** advise you compile and preview the site locally before pushing updates to production.

In order to compile the website locally, you will need be running VirtualBox and Vagrant.

Navigate to the repo, then build then vagrant up:

	$ vagrant up

That will take about 15 minutes to run initially. Once your VM is ready, you can ssh on and build the website

	$ vagrant ssh
	$ cd /vagrant
	$ bundle exec jekyll serve

In your host machine, open a browser and navigate to `http://localhost:4001` and bingo! There's the website!

<a name="9-committing-your-changes-and-deploying-them-to-github-pages" />
#### 8. Committing your changes and deploying them to GitHub Pages

When you are happy with the updates:

1. Merge them with the master branch
2. Push the master branch to origin

The good people at GitHub will compile the website and serve it on `http://snowplowanalytics.com`! Thank you [GitHub pages] (http://pages.github.com/).

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
