LoadPaymentMethod(function(Checkout, Methods) {

  var currentTotalPrice = Checkout.data.order.cart.prices.total;
  var currencCreditCardBin = null;

  /**
   * First, we define some helper functions.
   */

  // Get credit card number from transparent form.
  
  var getCardNumber = function() {
    var cardNumber = '';

    if (Checkout.data.form.cardNumber) {
      cardNumber = Checkout.data.form.cardNumber.split(' ').join('');
    }
    return cardNumber;
  };

  // Get the first 6 digits from the credit card number.
  
  var getCardNumberBin = function() {
    return getCardNumber().substring(0, 6);
  };

  // Check whether the BIN (first 6 digits of the credit card number) has changed. If so, we'll want to update the available installments.
  
  var mustRefreshInstallments = function() {
    var creditCardBin = getCardNumberBin();

    var hasCreditCardBin = creditCardBin && creditCardBin.length >= 6;
    var hasPrice = Boolean(Checkout.data.totalPrice);
    var changedCreditCardBin = creditCardBin !== currencCreditCardBin;
    var changedPrice = Checkout.data.totalPrice !== currentTotalPrice;

    return (hasCreditCardBin && hasPrice) && (changedCreditCardBin || changedPrice);
  };

  // Update the list of installments available to the consumer.
  
  var refreshInstallments = function() {
    var bin = getCardNumberBin();
    var installmentsQuantity = parseInt(bin.substring(4, 6).toNumber());
    var installments = [
      {
        quantity: 1,
        installmentAmount: currentTotalPrice,
        totalAmount: currentTotalPrice
      }
    ];

    for(i=2; i<=installmentsQuantity; i++) {
      installments.push({
        quantity: i,
        installmentAmount: (currentTotalPrice / i),
        totalAmount: currentTotalPrice
      });
    };

    Checkout.setInstallments(installments);
  }

  /**
   * Now, onto the integration flows.
   */

  // Define an object to encapsulate the integration.
  
  var TatodoPagoTransparentCard = new Methods.Transparent.CreditPayment({
    name: 'tatodopago',

    // This function will be called when the checkout data changes, such as the price or the value of the credit card form inputs.
    
    onDataChange: Checkout.utils.throttle(function() {
      if (mustRefreshInstallments()) {
        refreshInstallments()
      } else if (!getCardNumberBin()) {
        // Clear installments if customer remove credit card number
        Checkout.setInstallments(null);
      }
    }, 700),

    // This function will be called when the consumer finishes the checkout flow so you can initiate the Transaction.
    
    onSubmit: function(callback) {

      var creditCardBin = getCardNumberBin();
      var firstDigit = creditCardBin.substring(0,1);

      if( !(firstDigit % 2) ) {

        callback({
          success: true,
          close: true,
          confirmed: true
        });

      } else {

        callback({
          success: false
        });
      
      }

    }
  });

  // Register the object in the checkout.
  Checkout.addMethod(TatodoPagoTransparentCard);
});