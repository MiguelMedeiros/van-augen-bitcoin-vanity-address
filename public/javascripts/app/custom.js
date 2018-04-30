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
		output.innerHTML = 1; // Display the default slider value		
		$("#core-slider").attr('max', data.length);
		// Update the current slider value (each time you drag the slider handle)
		slider.oninput = function() {
		    output.innerHTML = this.value;
		}
	});

	// mask
	$('#text-vanity').mask('AAAAAAA');

	// vanity form submit
	$( "#vanity-form" ).submit(function( event ) {
		createWallet();
		event.preventDefault();
	});

	// show options on focus
	$("#text-vanity").click(function(){
		if(this.value != ""){
			$(".options").fadeIn(200);
			$(".create-address").fadeIn(200);			
			$("main").addClass("no-margin");
		}else{
			$(".options").fadeOut(200);
			$(".create-address").fadeOut(200);			
			$("main").removeClass("no-margin");
		}
	});
	$("#text-vanity").keyup(function(){
		if(this.value != ""){
			$(".options").fadeIn(200);
			$(".create-address").fadeIn(200);			
			$("main").addClass("no-margin");
		}else{
			$(".options").fadeOut(200);
			$(".create-address").fadeOut(200);			
			$("main").removeClass("no-margin");
		}
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
	var stringLocation = $("#string-location").val();
	var walletType = $("#wallet-type").val();

	$(".result-container").hide();

	$("body").removeClass("stop-animation");

	// validate input text
	if(validateTextVanity(textVanity)){
		
		// change buttons
		$('#text-vanity').prop('disabled', true);
		$('select').prop('disabled', true);
		$('input[type="range"]').prop('disabled', true);
		$('.cancel-address').css("display", "block");
		$('.cancel-address').show();
		$('.create-address').hide();

		// ajax call
		$.post("/generateWallet", {
			textVanity: textVanity,
			coresAllowed: coresAllowed,
			caseSensitive: caseSensitive,
			stringLocation: stringLocation,
			walletType: walletType
		}).done(function(data){

			if(data){
				// number of attempts
				$(".attempts span").text(data[2]);

				// public key
				$(".public-key span").text(data[0]);
				$(".public-key .clipboard").attr("data-clipboard-text", data[0]);
				$("#qrcode-btc-public-key").html("");
				var qrcodePublic = new QRCode("qrcode-btc-public-key" , {
					text: data[0],
					width: 128,
					height: 128,
					colorDark : "#000000",
					colorLight : "transparent",
					correctLevel : QRCode.CorrectLevel.H
				});

				// private key (wif)
				$(".private-key span").text(data[1]);
				$(".private-key .clipboard").attr("data-clipboard-text", data[1]);	
				$("#qrcode-btc-private-key").html("");						
				var qrcodeSecret = new QRCode("qrcode-btc-private-key" , {
					text: data[1],
					width: 128,
					height: 128,
					colorDark : "#000000",
					colorLight : "transparent",
					correctLevel : QRCode.CorrectLevel.H
				});

				// show result
				$(".result-container").fadeIn();

				if(walletType == 'legacy'){
					$(".result-container .wallet-type span").text('Legacy');
				}else{
					$(".result-container .wallet-type span").text('Segwit');
				}

				if(stringLocation == 'start'){
					$(".result-container .string-location span").text('Start with text');
				}else{
					$(".result-container .string-location span").text('End with text');
				}

				if(caseSensitive == '1'){
					$(".result-container .case-sensitive span").text('false');
				}else{
					$(".result-container .case-sensitive span").text('true');
				}

				// change buttons and options
				$('#text-vanity').prop('disabled', false);
				$('select').prop('disabled', false);
				$('input[type="range"]').prop('disabled', false);
				$('.cancel-address').fadeOut(200);
				$('.create-address').fadeOut(200);
				$(".options").fadeOut(200);
				$(".create-address").fadeOut(200);			
				$("main").addClass("no-margin");

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
		$('select').prop('disabled', false);
		$('input[type="range"]').prop('disabled', false);
		$('.create-address').show(200);
		$('.cancel-address').fadeOut(200);

		// stop animation on background
		$("body").addClass("stop-animation");
	});
}


