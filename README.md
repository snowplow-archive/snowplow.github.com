# What is snowplow.github.com?

snowplow.github.com is the source code and content for [http://snowplowanalytics.com](http://snowplowanalytics.com) website.

The site is built in [Jekyll](https://github.com/mojombo/jekyll) and served by [Github Pages](http://pages.github.com/). (Thanks to the great people of Github for this fantastic service.) 

## Content covered

The content covers:

1. What Snowplow is, including why we developed Snowplow, and how Snowplow differs from other approaches to web analytics
2. How Snowplow works, from a technical standpoint
3. How we plan to develop Snowplow
4. How to perform analyses using Snowplow
5. Overview of the Professional Services we offer around Snowplow

All content is copyright (c) 2012 Snowplow Analytics Ltd and not to be reused without permission. 


## Adding new content and editing existing content

We welcome fixes and improvements! In particular on the analysis side, there is a wide range of ways Snowplow can be used, and we can't possibly hope to cover them all ourselves. If you've used it for a specific type of analysis, we'd love you to share it here. Please fork the repo, make your changes and then create a pull request.

### Contributing to the website

1. [Fork](https://help.github.com/articles/fork-a-repo) the repository
2. Clone your fork to your local machine
3. Make the desired changes to the webiste. More details on this are [below](#website-update)
4. Make a [pull request](https://help.github.com/articles/using-pull-requests). We will incorporate your updates to the site ASAP


<a name="website-update" />
### Updating the website

1. [A note about Jekyll and Github pages](#1-a-note-about-plugins-and-github-pages)
2. [Making changes locally](#2-making-changes-locally)
3. [Adding a new blog post](#3-adding-a-new-blog-post)
4. [Adding pages to the website (not the blog)](#4-adding-pages-to-the-website-not-the-blog)
5. [Embedding images](#5-embedding-images)
6. [Links between pages](#6-links-between-pages)
7. [Side menus](#7-side-menus)
8. [Previewing changes locally](#8-previewing-the-changes-locally)
9. [Committing your changes and deploying them to Github Pages](#9-committing-your-changes-and-deploying-them-to-github-pages)

#### 1. A note about Jekyll and Github pages

NEED TO UPDATE THIS CONTENT

#### 2. Making changes locally

NEED TO UPDATE THIS CONTENT

#### 3. Adding a new blog post

NEED TO UPDATE THIS CONTENT

This is straightforward. Create a new markdown file in the _posts directory, with the filename format `YYYY-MM--DD-title.md`.

In the file add the following [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter) to the top of the post:

	---
	layout: blog-post
	shortenedlink: {{TITLE YOU WANT TO APPEAR ON THE BLOG SIDEBAR}}
	title: {{FULL TITLE DISPLAYED AT THE TOP OF THE POST}}
	tags: {{ANY TAGS}}
	---

Then type in the rest of the post, in markdown, as normal.

#### 4. Adding pages to the website (not the blog)

NEED TO UPDATE THIS CONTENT

Adding a page to the rest of the site is reasonably straightforward.

First, create an appropriately titled markdown file and save it to the appropriate directory. (The site folder structure reflects the site information structure, so if you want to create a new page in the 'Product' section it's best to save it in the product folder.)

Second, add a [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter) to the top of the Markdown file e.g.:

	---
	layout: section
	category: {{e.g. 'product', 'services', 'analytics', 'contact'}}
	title: {{PAGE TITLE (used in side menu)}} 
	weight: {{INTEGER INDICATING WHERE ON THE SIDE MENU THIS SHOULD APPEAR i.e. 1 = top spot}}
	---

Note that if you're adding content to the Analytics section, you'll need to specify the 'analytics_category' you want the page to belong to e.g. 'product', 'catalogue' etc, as pages are currently divided into these subsections

#### 5. Embedding images

NEED TO UPDATE THIS CONTENT

Images are committed to the appropriate /img folder (depending on which section the image belongs). It can then be referenced in the Markdown as normal.
	
#### 6. Links between pages

NEED TO UPDATE THIS CONTENT

When adding links to between pages on the site:

1. Always use relative URLs e.g. `/analytics/catalogue-analytics/overview.html`
2. Remember all URLs end in `.html`

#### 7. Side menus

NEED TO UPDATE THIS CONTENT

Side menus should automatically update with new blog posts / web pages as appropriate.

When the side menu is generated (Jekyll compiles the site) it fetches all the different pages, filters them by category and uses this to populate all the menus. To see how this is done, refer to the `_includes/sidebar_analytics`, `_sidebar_contact.html` etc. files. (There is one file for each side menu.)

#### 8. Previewing the changes locally

NEED TO UPDATE THIS CONTENT

This is advisable before performing any commits :-). To preview the site on your host machine, you'll need to build it in the VM (guest machine):

	$ vagrant ssh
	$ cd /vagrant/snowplow.github.com
	$ jekyll --server

This will build the website and serve it to port localhost:4000. The Vagrant box is setup to forward this to localhost:4001 on your host machine, so open up a browser and enter `localhost:4001`. You should see the updated website displayed.

Remember, if you don't like what you see, and modify the site, to preview the changes, you'll need to CTRL-C out of Jekyll, then re-run 

	jekyll --server

from the repo directory, (which will recompile it).

#### 9. Committing your changes and deploying them to Github Pages

NEED TO UPDATE THIS CONTENT

[dev-environment]: https://github.com/snowplow/dev-environment