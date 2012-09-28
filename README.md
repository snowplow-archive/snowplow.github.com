# What is snowplow.github.com?

snowplow.github.com is the source code and content for [http://snowplowanalytics.com](http://snowplowanalytics.com) website.

The site is built in [Jekyll](https://github.com/mojombo/jekyll) and served by [Github Pages](http://pages.github.com/). (Thanks to the great people of Github for this fantastic service.) 

## Content covered

The content covers:

1. What SnowPlow is, including why we developed SnowPlow, and how SnowPlow differs from other approaches to web analytics
2. How SnowPlow works, from a technical standpoint
3. How we plan to develop SnowPlow
4. How to perform analyses using SnowPlow
5. Overview of the Professional Services we offer around SnowPlow

All content is copyright (c) 2012 SnowPlow Analytics Ltd and not to be reused without permission. 


## Adding new content and editing existing content

We welcome fixes and improvements! In particular on the analysis side, there is a wide range of ways SnowPlow can be used, and we can't possibly hope to cover them all ourselves. If you've used it for a specific type of analysis, we'd love you to share it here. Please fork the repo, make your changes and then create a pull request.

### Contributing to the website

1. [Fork](https://help.github.com/articles/fork-a-repo) the repository
2. Clone your fork to your local machine
3. Make the desired changes to the webiste. More details on this are [below](#website-update)
4. Make a [pull request](https://help.github.com/articles/using-pull-requests). We will incorporate your updates to the site ASAP


<a name="website-update" />
### Updating the website

1. [A note about plugins and Github pages](#1-a-note-about-plugins-and-github-pages)
2. [Making changes locally](#2-making-changes-locally)
3. [Adding a new blog post](#3-adding-a-new-blog-post)
4. [Adding pages to the website (not the blog)](#4-adding-pages-to-the-website-not-the-blog)
5. [Embedding images](#5-embedding-images)
6. [Links between pages](#6-links-between-pages)
7. [Side menus](#7-side-menus)
8. [Previewing changes locally](#8-previewing-the-changes-locally)
9. [Committing your changes and deploying them to Github Pages](#9-committing-your-changes-and-deploying-them-to-github-pages)

#### 1. A note about plugins and Github pages

The SnowPlow Analytics website uses Jekyll plugins for additional functionality. (E.g. pagination). These are **not** supported by Github pages. As a result, we have to use a workaround. (Kindly provided by [Alexandre Rademaker] (http://arademaker.github.com/) [here] (http://arademaker.github.com/blog/2011/12/01/github-pages-jekyll-plugins.html):

1. All source files for the website (e.g. markdown files etc.) are stored in the **source** branch. This is where **all** modifications to the website should be made.
2. Jekyll should be run locally to generate the static html files locally
3. These static files (saved in the `_site` folder) should be copied to the root directory on the master branch
4. These static files are the ones that are then served on Github pages
5. As a result, **does not** need to process the files in Github pages. That is why the `.nojekyll` file is included in the master branch

As all the Jekyll processing is performed locally, you need to make sure that Jekyll and all the plugins used are installed on your local machine. Because Jekyll runs on top of Ruby, you'll need a copy of Ruby locally, and then you'll need to install:

1. [jekyll](https://github.com/mojombo/jekyll). To install the gem execute `sudo gem install jekyll`.
2. [jekyll-pagination](https://github.com/blackwinter/jekyll-pagination). To install the gem execute `sudo gem install jekyll-pagination`.
3. ... (no other plugins used currently)

More explanation on how to update the site is given below:

#### 2. Making changes locally

First, on your local repository, switch to the source branch to update the source files

	git checkout source

Make the relevant changes to the site. To add a new blog post, for example, see the next section: 

#### 3. Adding a new blog post

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

Images are committed to the appropriate /img folder (depending on which section the image belongs). It can then be referenced in the Markdown as normal.
	
#### 6. Links between pages

When adding links to between pages on the site:

1. Always use relative URLs e.g. `/analytics/catalogue-analytics/overview.html`
2. Remember all URLs end in `.html`

#### 7. Side menus

Side menus should automatically update with new blog posts / web pages as appropriate.

When the side menu is generated (Jekyll compiles the site) it fetches all the different pages, filters them by category and uses this to populate all the menus. To see how this is done, refer to the `_includes/sidebar_analytics`, `_sidebar_contact.html` etc. files. (There is one file for each side menu.)

#### 8. Previewing the changes locally

This is advisable before performing any commits :-). To preview the site on your local machine, navigate to the repo:

	cd snowplow.github.com

And run Jekyll

	jekyll --server

This will compile the website to the _site directory. to view the website, enter

	localhost:4000

In your browser URL window.

Remember, if you don't like what you see, and modify the site, to preview the changes, you'll need to CTRL-C out of Jekyll, then re-run 

	jekyll --server

from the repo directory, (which will recompile it).

#### 9. Committing your changes and deploying them to Github Pages

Once you are happy with the updates you've made to the website, you need to deploy them to production.

Remember: source files are stored in the `source` branch. (Which you have been editting.) To deploy, we need to get Jekyll to generate the static html pages, copy them to our master repo and then push them to Github. To do this:

Firstly add and commit the changes made to the source repo

	git checkout source
	// make relevant changes and updates to the site
	git add .
	git commit -m "{{enter description of changes made}}"

Now run Jekyll locally to generate the static pages into the `_site` folder

	jekyll

Now switch to the master branch

	git checkout master

Now we want to copy the static html files for the website into the root folder of the master branch. These will be the pages served by Github Pages. (Remember - we also add the `.nojekyll` file so Github pages doesn't use Jekyll to do any processing after we've finished the upload.)

	cp -r _site/* . && rm -rf _site/ && touch .nojekyll

Now push both the source and master branches to origin

	git push --all origin

All done!