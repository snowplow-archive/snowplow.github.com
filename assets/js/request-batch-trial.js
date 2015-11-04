$(function() {

	// hide previous error messages

	$('.error').hide();
	$('.request-trial-group').removeClass("error");

	function isEmail(email) { // http://stackoverflow.com/questions/2507030/email-validation-using-jquery
		var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	}

	$('#submitRequestBatchTrial').click(function() {

		// hide previous error messages

		$('.help-inline').hide();
		$('.request-trial-group').removeClass("error");

		// fetch inputs

		var leadSource = document.getElementById("inputLeadSource").value;
		var firstName = document.getElementById("inputFirstName").value;
		var lastName = document.getElementById("inputLastName").value;
		var email = document.getElementById("inputEmail").value;
		var company = document.getElementById("inputCompany").value;
		var eventsPerMonth = document.getElementById("inputEventsPerMonth").value;

		var submission = {
			leadSource: leadSource,
			firstName: firstName,
			lastName: lastName,
			email: email,
			company: company,
			eventsPerMonth: eventsPerMonth
		};

		// validate inputs

		if (leadSource != "Trial Form Batch") { return false; }

		if (firstName == "") {
			$('#groupFirstName').addClass("error"); // add class 'error' to #groupFirstName
			$('#controlsFirstName').append('<div class="help-inline">Please enter a first name.</div>'); // add this div after the #controlsFirstName element
			return false;
		}

		if (lastName == "") {
			$('#groupLastName').addClass("error"); // add class 'error' to #groupLastName
			$('#controlsLastName').append('<div class="help-inline">Please enter a last name.</div>'); // add this div after the #controlsLastName element
			return false;
		}

		if (email == "") {
			$('#groupEmail').addClass("error"); // add class 'error' to #groupEmail
			$('#controlsEmail').append('<div class="help-inline">Please enter an email address.</div>'); // add this div after the #controlsEmail element
			return false;
		}

		if (!isEmail(email)) {
			$('#groupEmail').addClass("error"); // add class 'error' to #groupEmail
			$('#controlsEmail').append('<div class="help-inline">Please enter a valid email address.</div>'); // add this div after the #controlsEmail element
			return false;
		}

		if (company == "") {
			$('#groupCompany').addClass("error"); // add class 'error' to #groupCompany
			$('#controlsCompany').append('<div class="help-inline">Please enter a company name.</div>'); // add this div after the #controlsCompany element
			return false;
		}

		// If passed validation, now submit form to the dataLayer
		//dataLayer.push({
			//'event': 'submit_trial_form_batch',
			//'submission': submission
		//});

		if (leadSource == "Trial Form Batch") {

			var p1 = "00D2400";
			var p2 = "0000bPI5";

			var p3 = "https://www.sal";
			var p4 = "esfo";
			var p5 = "rce.com/servlet/servlet.WebT";
			var p6 = "oLead?encoding=UTF-8";

			var form = document.getElementById("requestBatchTrial");

			var elementOID = document.createElement("input");
    	elementOID.name = "oid";
			elementOID.value = p1 + p2;
			elementOID.setAttribute("type", "hidden");
    	form.appendChild(elementOID);

			var elementRetURL = document.createElement("input");
    	elementRetURL.name = "retURL";
			elementRetURL.value = "http://snowplowanalytics.com/get-started/thanks/";
			elementRetURL.setAttribute("type", "hidden");
    	form.appendChild(elementRetURL);

			snowplow(function () {

				var snplow2 = this.snplow2;
				var domainUserId = snplow2.getDomainUserId();

				var elementDUID = document.createElement("input");
	    	elementDUID.name = "00N2400000HRtrl";
				elementDUID.value = domainUserId;
				elementDUID.setAttribute("type", "hidden");
	    	form.appendChild(elementDUID);

			})

	    form.method = "POST";
	    form.action = p3 + p4 + p5 + p6;
			form.submit();
		}

		// do not reload page

		return false;

	});
});
