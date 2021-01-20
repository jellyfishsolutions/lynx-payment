# Payment module for the Lynx framework

This module enables payments for the Lynx framework.
It is possible to register additional custom payment methods.

This module currently supports the Stripe payment method. It is necessary to provide the usual Stripe keys to enable it.

An administration interface is provided thought the AdminUI module.

## Installation

NOTE: The module depends on `lynx-admin-ui` and `lynx-data-grid`.

```
npm install lynx-payments
```

## Usage

Initialize the module and register the payments methods:

```
StripePayment.setKeys(
    'pk stripe key',
    'sk stripe key'
);

PaymentsModule.register(StripePayment);

const app = new App(myConfig, [new PaymentsModule(), new PaymentsTestModule()]);

```

Payment methods shall also be registered on the `PaymentMethodEntity` (this enable dynamic activation/deactivation of a single methods). For example, for the `Stripe` payment method:

```
let p = await PaymentMethodEntity.findOne({
    where: { name: StripePayment.getName() },
});
if (!p) {
    p = new PaymentMethodEntity();
    p.name = StripePayment.getName();
    await p.save();
}
```

Finally, it is possible to create a new payment request as follow:

```
@Route('/payment/test')
export default class TestController extends BaseController {
    @Name('test-do')
    @POST('/')
    async performPayment(req: Request) {
        let p = await Payment.createPayment(
            100, // the amount of the payment
            'eur', // the selected currency for the payment
            'Checkout for order 123', // the user readable description of the payment (will be displayed to the user)
            '/payment-done', // internal callback url in order to check the payment (if success or error)
            '/my-template/layout' // the base template layout in which the payment flow will be included
        );
        return this.redirect(p.currentUrl, { uuid: p.uuid });
    }
}
```

At the end of the payment flow, the user will be redirect to `/payment-done?uuid={{payment-uuid}}`. A controller with a `GET` method shall be defined, in order to complete the payment flow, retrieving the `Payment` entity with the specified `{{payment-uuid}}` and checking its `.status` property. If the status is `Status.completed`, the payment is completed successfully.

## Add a custom payment method

A payment method shall extends the base `Payment` class, providing implementations for the abstract methods.
Each `Payment` class contains the `payment` and the `user` attributes, that are the associated `PaymentEntity` and `UserEntity` values for that particular request.

The `PaymentEntity` contains a customizable `data` attribute, can be used to store payment-specific information (for example, in the Stripe implementation, the Stripe payment id can be stored in order to have a relation). The `status` attribute shall be updated based on the results of the payment (for example, in the Stripe implementation, if the credit card payment failed, the `status` will be updated to `Status.error`).

Each implementation shall also have a static method, defined as `getName(): string`, that returns a string containing a unique id for the payment method.

The payment flow is divided in three steps:

1. The user will be asked to choose a payment method from a list. In this page, all the enabled methods from the `PaymentMethod` entity will be displayed. Each method is also filtered by the `isAvailable(): Promise<boolean>` method, in which it is possible to check if the current `payment` and `user` can authorized this method.
2. For the chosen payment method, the `create(): Promise<CreateData>` is executed. It should perform any initialization and return an object containing the templated for the payment method (both the html and the js scripts). This templates will be displayed to the user. At the end of the operations, a form should be posted to the `checkout-result` named route, with the `uuid` parameter.
3. In the `checkout-result` controller, the method `updateStatus(): Promise<void>` of the payment method is executed. This method shall check the payment status (for example, with the back API), and correctly update the status of the current `payment`.
4. Finally, the payment status is checked to create flash messages, and the user is redirected to the url specified when the payment was created.
