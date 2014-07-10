# What is snowplow.github.com?

snowplow.github.com is the source code and content for [http://snowplowanalytics.com](http://snowplowanalytics.com) website.

The site is built in [Jekyll](https://github.com/mojombo/jekyll) and served by [Github Pages](http://pages.github.com/). (Thanks to the great people of Github for this fantastic service.) 

## Content covered

The content covers:

1. What Snowplow is, including why we developed Snowplow, and how Snowplow differs from other approaches to web and event analytics
2. How Snowplow works, from a technical standpoint
3. How we plan to develop Snowplow
4. How to perform analyses using Snowplow
5. Overview of the Professional Services we offer around Snowplow

All content is copyright (c) 2012-2014 Snowplow Analytics Ltd and not to be reused without permission. 


## Adding new content and editing existing content

We welcome fixes and improvements! In particular on the analysis side, there is a wide range of ways Snowplow can be used, and we can't possibly hope to cover them all ourselves. If you've used it for a specific type of analysis, we'd love you to share it here. Please fork the repo, make your changes and then create a pull request.

### Contributing to the website

1. [Fork](https://help.github.com/articles/fork-a-repo) the repository
2. Clone your fork to your local machine
3. Make the desired changes to the webiste. More details on this are [below](#website-update)
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
8. [Committing your changes and deploying them to Github Pages](#9-committing-your-changes-and-deploying-them-to-github-pages)


<a name="2-making-changes-locally" />
#### 1. Making changes locally

Once you have the repo cloned locally, you can make changes to it. More details on specific changes (e.g. adding a blog post etc.) can be found below.

<a name="3-adding-a-new-blog-post" />
#### 2. Adding a new blog post


This is straightforward. Create a new markdown file in the _posts directory, with the filename format `YYYY-MM--DD-title.md`.

In the file add the following [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter) to the top of the post:

```yaml
---
layout: post # Should be set to post for all blog posts, page for all other pages (except homepage)
shortenedlink: JavaScript Tracker 0.14.0 released # Link that will appear in the side menu
title: Snowplow JavaScript Tracker 0.14.0 released with new features # Page title will appear in the browser
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
layout: page
group: analytics # Primary grouping for page
sub_group: overview # Sub groups are used to divide page content in the analytics section
title: The Snowplow Analytics cookbook # Title as sent to the browser
shortened-link: Analytics Cookbook # Title as displayed in the sidebar
description: The Snowplow Analytics Cookbook contains a wealth of recipes for using Snowplow data to answer your business questions. # Description as passed to Google
weight: 1 # How far up in the sidebar the page should appear relative to other pages
---
```

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

In order to compile the website locally, you will need be running [Jekyll] (http://rubygems.org/gems/jekyll). This site was developed using Jekyll v1.4.3.

We recommend using the [Vagrant] (http://www.vagrantup.com/) and the [Snowplow development environment] (https://github.com/snowplow/dev-environment).

First, clone the dev environment:

	$ git clone --recursive https://github.com/snowplow/dev-environment.git 
	$ cd dev-environment
	$ vagrant up

Note that we use the `--recursive` flag to clone in [ansible-playbooks] (https://github.com/snowplow/ansible-playbooks) as a submodule. 

Now SSH into the VM and run the [snowplow-website.yml] Ansible Playbook, which installs Ruby, RVM and Jekyll:

	$ vagrant ssh
	$ ansible-playbook /vagrant/ansible-playbooks/snowplow-website.yml \
		--inventory-file=/home/vagrant/ansible_hosts --connection=local

Note that there is a bug we still need to fix, which means the final step in the playbook, which installs Jekyll, doesn't successfully run first time: you need to exit the terminal after you first run the playbook, then log back in and run it again:

	$ exit
	$ vagrant ssh 
	$ ansible-playbook /vagrant/ansible-playbooks/snowplow-website.yml \
		--inventory-file=/home/vagrant/ansible_hosts --connection=local

Now everything should be ready!

Now navigate to the `snowplow.github.com` repo in the dev-environment and build it using:

    $ export LC_ALL=en_US.UTF-8
    $ export LANG=en_US.UTF-8
	$ jekyll serve

*In most cases people clone the `snowplow.github.com` repo into the `dev-environment` repo on the host machine, in which case on the VM it can be found in `/vagrant/snowplow.github.com`*

Once the site has been compiled, it should be viewable on the host. Type 'localhost:4001' on your browser to access it. (Note that the dev-environment Vagrantfile forwards port 4000 on the VM to 4001 on the host.)

<a name="9-committing-your-changes-and-deploying-them-to-github-pages" />
#### 8. Committing your changes and deploying them to Github Pages

When you are happy with the updates:

1. Merge them with the master branch
2. Push the master branch to origin

The good people at Github will compile the website and serve it on `http://snowplowanalytics.com`! Thank you [Github pages] (http://pages.github.com/).

[dev-environment]: https://github.com/snowplow/dev-environment
