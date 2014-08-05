$(function() {
	$('.error').hide();
	$('#submission-successful').hide();

	// Functions to execute on submitting form
	$('#submitSnowplowSignup').click(function() {
		// Hide previous error messages
		$('.help-inline').hide();
		$('.control-group').removeClass("error")
		
		// Fetch values submitted into form
		var name = document.getElementById("inputName").value;
		var email = document.getElementById("inputEmail").value;
		var company = document.getElementById("inputCompany").value;
		var eventsPerMonth = document.getElementById("inputEventsPerMonth").value;
		var serviceType = $('input:radio[name=optionsServiceType]:checked').val();

		var submission = {
			name: name,
			email: email,
			company: company,
			eventsPerMonth: eventsPerMonth,
			serviceType: serviceType
		};

		// Now validate form
		if (name == "") {
			// Add class 'error' to #groupName
			$('#groupName').addClass("error");
			// Add '<span class="help-inline">Please enter a name</span>' immediately following the #controlsName element
			$('#controlsName').append('<span class="help-inline">Please enter a name</span>');
			return false;
		} 

		if (email == "") {
			// Add class 'error' to #groupEmail
			$('#groupEmail').addClass("error")
			// Add '<span class="help-inline">Please enter a name</span>' immediately following the #controlsName element
			$('#controlsEmail').append('<span class="help-inline">Please enter an email</span>')
			return false;
		}

		if (company == "") {
			$('#groupCompany').addClass("error")
			$('#controlsCompany').append('<span class="help-inline">Please enter a company name</span>')
			return false;
		}

		// If passed validation, now submit form to the dataLayer
		dataLayer.push({
			'event': 'submit_signup_form',
			'submission': submission
		});

		// And show success piece...
		$('#signup-form').append('<h2 class="text-success" id="submission-successful">Thank you!</h2><p>A member of the Snowplow trial will be in touch in the next couple of business days.</p>');
		// ...then scroll down to it
		$('html,body').animate({scrollTop: $('#submission-successful').offset().top},'slow');
			
		return false; // Do not reload page
	});
});