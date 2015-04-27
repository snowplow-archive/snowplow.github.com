$(function() {
	$('.error').hide();
	$('#submission-successful').hide();

	function IsEmail(email) {
	  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	  return regex.test(email);
	} // http://stackoverflow.com/questions/2507030/email-validation-using-jquery

	$('#submitRegisterForRealTimeButton').click(function() {

		// Hide previous error messages
		$('.help-inline').hide();
		$('.control-group').removeClass("error");
		$('.submission-successful').hide();

		// Fetch values submitted into form
		var name = document.getElementById("inputName").value;
		var email = document.getElementById("inputEmail").value;
		var company = document.getElementById("inputCompany").value;
		var eventsPerMonth = document.getElementById("inputEventsPerMonth").value;

		var submission = {
			name: name,
			email: email,
			company: company,
			eventsPerMonth: eventsPerMonth
		};

		// Now validate form
		if (name == "") {
			// Add class 'error' to #groupName
			$('#groupName').addClass("error");
			// Add '<span class="help-inline">Please enter a name</span>' immediately following the #controlsName element
			$('#controlsName').append('<span class="help-inline">Please enter a name</span>');
			return false;
		} 

		if (!IsEmail(email)) {
			// Add class 'error' to #groupEmail
			$('#groupEmail').addClass("error")
			// Add '<span class="help-inline">Please enter a name</span>' immediately following the #controlsName element
			$('#controlsEmail').append('<span class="help-inline">Please enter a valid email</span>')
			return false;
		}

		if (company == "") {
			$('#groupCompany').addClass("error")
			$('#controlsCompany').append('<span class="help-inline">Please enter a company name</span>')
			return false;
		}

		// If passed validation, now submit form to the dataLayer
		dataLayer.push({
			'event': 'submit_trial_form',
			'submission': submission
		});

		// And show success piece...
		$('#register-for-real-time-form').append('<div class="submission-successful"><h2 class="text-success">Thank you!</h2><p>A member of the Snowplow trial will be in touch in the next couple of business days.</p></div>');
		// ...then scroll down to it
		$('html,body').animate({scrollTop: $('.submission-successful').offset().top},'slow');
			
		return false; // Do not reload page
	});
});