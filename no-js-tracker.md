---
layout: tracker
category: homepage
title: Snowplow No-JS Tracker
permalink: no-js-tracker.html
---

<div id="title">
</div>
<div id="introduction">
	<p>The No-Javascript Tracker for Snowplow allows you to track customer behavior in web-based environments that do not support Javascript, for example HTML emails.</p>
	
	<p>Use the wizard below to generate a tracking tag to embed on the HTML of web pages you wish to track using the No-JS tracker. Note: you will need to generate a unique tag for every web page you want to track.</p>
</div>

<div id="generator">
	<p>Fill in the fields below, hit <b>Generate No-JS tracking tag</b> and then embed that tag in your HTML to start tracking user views on that web page:</p>
	
	<form id="generateTagForm" name="generateTagForm" action="" >
	<fieldset>
		<fieldset>
			<h4>Application data</h4>
			<p>The application ID is used within Snowplow to distinguish event that relate to this application with others you are tracking with Snowplow</p>
			<label for="application" id="applicationId_label" >Application ID:<strong>*</strong></label>
			<input type="text" id="applicationId" name="applicationId" size="50" value="" class="text-input" />
		</fieldset>
		<fieldset>
			<h4>Page-level data</h4>
			<p>Enter the details of the page you wish to embed the tracking code in.</p>
			<label>Is the page HTTP or HTTPS?*</label>
			<input type="radio" id="pageScheme" name="pageScheme" value="http" />HTTP
			<input type="radio" id="pageScheme" name="pageScheme" value="https" />HTTPS</br>
			<label for="pageTitle" id="pageTitle_label" >Page title:<strong>*</strong></label>
			<input type="text" id="pageTitle" name="pageTitle" size="50" value="" class="text-input" /><br />
			<label for="pageUrl" id="pageUrl_label" >Page URL:</label>
			<input type="text" id="pageUrl" name="pageUrl" size="50" value="" class="text-input" /><br />
		</fieldset>
		<fieldset>
			<h4>Collector endpoint</h4>
			<p>This data is used to set the endpoint for the embed code to your collector, so that the data is passed to your Snowplow instance.</p>
			<div id="collector-selector"></div>
			<label for="collector-selector_label">Select your collector type</label><br />
			<input type="radio" id="cloudfrontCollectorType" name="collectorType" value="cloudfront" />Cloudfront collector<br />
			<input type="radio" id="otherCollectorType" name="collectorType" value="other" />Other collector (e.g. Clojure collector)<br />
			<div id="cloudfront-collector-div">
				<label for="cloudfront" id="cloudfrontSubDomain_label">Your Cloudfront subdomain:<strong>*</strong></label>
				<input type="text" id="cloudfrontSubDomain" name="cloudfrontSubDomain" size="50" value="" class="text-input" /><br />
			</div>
			<div id="other-collector-div">
				<label for="selfHostedCollectorUrl" id="selfHostedCollectorUrl_label">Your self-hosted collector URL (e.g. if you are running the Clojure collector):<strong>*</strong></label>
				<input type="text" id="selfHostedCollectorUrl" name="selfHostedCollectorUrl" size="50" value="" class="text-input" /><br />	
			</div>
			<p><strong>*</strong> indicates a required field</p>
		</fieldset>
		<input type="submit" name="submit" class="button" id="submit_btn" value="Generate No-JS tracking tag" />
	</fieldset>
	</form>
</div>

<div id="output">
</div>

