$(document).ready(function(){
	//material contact form animation
	$('.myForm').find('.form-control').each(function() {
		var targetItem = $(this).parent();
		if ($(this).val()) {
			$(targetItem).find('label').css({
				'top': '10px',
				'fontSize': '12px'
			});
		}
	})
	$('.myForm').find('.form-control').focus(function() {
		$(this).parent('.input-admin').addClass('focus');
		$(this).parent().find('label').animate({
			'top': '10px',
			'fontSize': '12px'
		}, 300);
	})
	$('.myForm').find('.form-control').blur(function() {
		if ($(this).val().length == 0) {
			$(this).parent('.input-admin').removeClass('focus');
			$(this).parent().find('label').animate({
				'top': '25px',
				'fontSize': '15px'
			}, 300);
		}
	})
});
