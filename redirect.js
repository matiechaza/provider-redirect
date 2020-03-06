LoadPaymentMethod(function(Checkout, Methods) {

  /**
   * Now, onto the integration flows.
   */

  // Define an object to encapsulate the integration.
  
  var TatodoPagoRedirect = new Methods.RedirectPayment({
    name: 'tatodopago',

    onLoad: function() {
      console.log(Checkout.data.order);
    },

    // This function will be called when the consumer finishes the checkout flow so you can initiate the Transaction.
    
    onSubmit: function(callback) {

      callback({
        success: true,
        redirect: "https://www.example.com/"
      });

    }

  });

  // Register the object in the checkout.
  Checkout.addMethod(TatodoPagoRedirect);
});