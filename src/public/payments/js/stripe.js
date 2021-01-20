var stripe = Stripe(pk);
var elements = stripe.elements();

var style = {
    base: {
        color: "#858796",
        '::placeholder': {
            color: '#b6b6b6',
        },
        ':focus': {
        }
    },
};

var card = elements.create("cardNumber", { style: style }).mount("#card-number");
elements.create("cardExpiry", { style: style }).mount("#card-expiry");
elements.create("cardCvc", { style: style }).mount("#card-cvc");

var form = document.getElementById('payment-form');

form.addEventListener('submit', function(ev) {

    $('#submit').attr('hidden', true);
    $('#loader').removeAttr('hidden'); 

    var clientSecret = $('#submit').attr('data-secret')
    var paymentRequest = stripe.paymentRequest({
        country: 'IT',
        currency: currency,
        total: {
          label: 'Demo total',
          amount: parseInt(amount),
        },
        requestPayerEmail: true,
      });

    var prButton = elements.create('paymentRequestButton', {
        paymentRequest: paymentRequest,
    });

    //Check the availability of the Payment Request API first.
    paymentRequest.canMakePayment().then(function(result) {
        if (result) {
            prButton.mount('#submit');
        } else {
            document.getElementById('submit').style.display = 'none';
        }
    });
    ev.preventDefault();

    stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: elements.getElement('cardNumber'),
            
        },
    }).then(function(result) {
            var route = $('#submit').attr('data-route')
            window.location.replace(route);
        
    });
});
