---
layout: page
group: product
title: Sign up for a free Snowplow trial
shortened-link: Free trial
weight: 7
---

# Free one month Snowplow trial of the Managed Service Batch

See what becomes possible when you have direct access to your granular, event-level data.

## How it works

* We provide you with tracking tags to integrate into your website
* You integrate the tracking tags on your website / and or setup an alternative Snowplow tracker to track data from other platforms
* We provide you with credentials so you can access your data in our own Amazon Redshift cluster
* You plug in the analysis tools of your choice so you can see what is possible with your data
* We can also, under certain circumstances, offer you a [Looker] [looker] trial on top of your Snowplow data, so you can see how the combination of Snowplow and Looker gives business users unprecedented flexibility to explore and mine your event-level data.
* If after your trial you decide to sign up to the Managed Service, we will migrate your data over for you for no additional cost.

## Sign up today

<div id="trial-form">
	<form class="form-horizontal">
		<div class="control-group" id="groupName">
			<label class="control-label" for="inputName">Name</label>
			<div class="controls" id="controlsName">
				<input type="text" id="inputName" placeholder="Name">
			</div>
		</div>
		<div class="control-group" id="groupEmail">
			<label class="control-label" for="inputEmail">Email</label>
			<div class="controls" id="controlsEmail">
				<input type="text" id="inputEmail" placeholder="Email">
			</div>
		</div>
		<div class="control-group" id="groupCompany">
			<label class="control-label" for="inputCompany">Company</label>
			<div class="controls" id="controlsCompany">
				<input type="text" id="inputCompany" placeholder="Company">
			</div>
		</div>
		<div class="control-group" id="groupEventsPerMonth">
			<label class="control-label" for="inputEventsPerMonth">Events per month</label>
			<div class="controls" id="controlsEventsPerMonth">
				<select id="inputEventsPerMonth">
					<option>&lt; 1 million</option>
					<option>1 - 10 million</option>
					<option>10 - 100 million</option>
					<option>100 - 1 billion</option>
					<option>1 billion +</option>
				</select>
			</div>
		</div>
		<div class="control-group">
			<div class="controls">
				<button type="submit" class="btn btn-success btn-primary" id="submitFreeTrialButton">Sign up</button>
			</div>
		</div>
	</form>
</div>




[looker]: http://looker.com/
[snowplow-as-a-service]: /product/get-started/#saas