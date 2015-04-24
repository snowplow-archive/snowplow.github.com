---
layout: page
group: product-hidden
title: Sign up for Snowplow as a Service
shortened-link: Snowplow as a Service
weight: 16
---

# Sign up for Snowplow as a Service

Enter your details below, and a member of the Snowplow team will be in touch to complete the setup of your Snowplow account.

<div id="signup-form">
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
		<div class="control-group" id="groupServiceType">
			<label class="control-label" for="inputServiceType">Service type</label>
			<div class="controls" id="controlsServiceType">
				<label class="radio">
					<input type="radio" name="optionsServiceType" id="serviceTypeManaged" value="managed" checked>
					Managed service
				</label>
				<label class="radio">
					<input type="radio" name="optionsServiceType" id="serviceTypeHosted" value="hosted" checked>
					Hosted service
				</label>
				<label class="radio">
					<input type="radio" name="optionsServiceType" id="serviceTypeUnsure" value="unsure" checked>
					Not sure
				</label>
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
				<button type="submit" class="btn btn-success btn-primary" id="submitSnowplowSignup">Sign up</button>
			</div>
		</div>
	</form>
</div>	