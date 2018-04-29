$( document ).ready(function() {
	
	// Copy to Clipboard
	$('.clipboard').tooltip({
		title: 'Copied!',
    	delay: 0,
	  	trigger: 'click',
	  	placement: 'right'
	});

	var clipboard = new ClipboardJS('button');
	clipboard.on('success', function(e) {
		hideTooltip();
	});

	$.get("/coreNumbers", function(data){
		var slider = document.getElementById("core-slider");
		var output = document.getElementById("core-number");
		output.innerHTML = slider.value; // Display the default slider value

		$("#core-slider").attr('max', data.length);
		// Update the current slider value (each time you drag the slider handle)
		slider.oninput = function() {
		    output.innerHTML = this.value;
		}
	});

	// vanity form submit
	$( "#vanity-form" ).submit(function( event ) {
		createWallet();
		event.preventDefault();
	});

});

function hideTooltip() {
	setTimeout(function() {
    	$('.clipboard').tooltip('hide');
  	}, 700);
}

function validateTextVanity(textVanity){
	if(textVanity == ""){
		$("#text-vanity").addClass('error');
		$("#alert-message").text("No text, no vanity address!");
		$("#alert-message").show();
		return false;
	}else{
		$("#text-vanity").removeClass('error');
		$("#alert-message").hide();
		return true;
	}
}

function createWallet(){
	var textVanity = $("#text-vanity").val();
	var coresAllowed = $("#core-slider").val();
	var caseSensitive = $("#case-sensitive").is(':checked');
	var stringEnd = $("#string-end").val();

	$(".result-address").hide();

	$("body").removeClass("stop-animation");

	// validate input text
	if(validateTextVanity(textVanity)){
		
		// change buttons
		$('#text-vanity').prop('disabled', true);
		$('.cancel-address').css("display", "block");
		$('.cancel-address').show();
		$('.create-address').hide();

		// ajax call
		$.post("/generateWallet", {
			textVanity: textVanity,
			coresAllowed: coresAllowed,
			caseSensitive: caseSensitive,
			stringEnd: stringEnd
		}).done(function(data){

			if(data){
				// number of attempts
				$(".attempts span").text(data[2]);

				// public key
				$(".public-key span").text(data[0]);
				$(".public-key .clipboard").attr("data-clipboard-text", data[0]);
				createQRcode("qrcode-btc-public-key", data[0]);

				// private key (wif)
				$(".private-key span").text(data[1]);
				$(".private-key .clipboard").attr("data-clipboard-text", data[1]);
				createQRcode("qrcode-btc-private-key", data[1]);
				
				// show result
				$(".result-address").fadeIn();

				// change buttons
				$('#text-vanity').prop('disabled', false);
				$('.create-address').show();
				$('.cancel-address').hide();

				// stop animation on background
				$("body").addClass("stop-animation");
			}
		});
	}
}

function createQRcode(elementID, text){
	var qrcode = new QRCode(elementID, {
		text: text,
		width: 128,
		height: 128,
		colorDark : "#000000",
		colorLight : "transparent",
		correctLevel : QRCode.CorrectLevel.H
	});
}

function cancelWallet(){
	$.get("/cancelWallet", function(data){
		
		// change buttons
		$('#text-vanity').prop('disabled', false);
		$('.create-address').show();
		$('.cancel-address').hide();

		// stop animation on background
		$("body").addClass("stop-animation");
	});
}


