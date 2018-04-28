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
			textVanity: textVanity
		}).done(function(data){

			if(data){
				// number of attempts
				$(".attempts span").text(data[2]);

				// public key
				$(".public-key span").text(data[0]);
				$(".public-key .clipboard").attr("data-clipboard-text", data[0]);

				// private key (wif)
				$(".private-key span").text(data[1]);
				$(".private-key .clipboard").attr("data-clipboard-text", data[1]);
				
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


