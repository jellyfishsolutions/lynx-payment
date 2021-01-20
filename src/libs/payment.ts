import PaymentEntity, { Status } from '../entities/payment.entity';
import { v4 as uuidv4 } from 'uuid';
import User from 'lynx-framework/entities/user.entity';

/**
 * Additional payment option
 */
export interface PaymentOptions {
    /**
     * Custom stripe publishable key
     */
    pk?: string;
    /**
     * Custom stripe secret key
     */
    sk?: string;
}

/**
 * Base class that define a payment states.
 * Each implementation of this class shall contain all the necessary backend methods to perform the operation.
 *
 * Moreover, this class defines also static methods to create a new payment flow.
 */
export abstract class Payment {
    private static methods: any = {};

    static register(paymentMethod: any) {
        Payment.methods[paymentMethod.getName()] = paymentMethod;
    }

    static factory(name: string, p: PaymentEntity, user: User): Payment {
        let _pm = Payment.methods[name];
        return new _pm(p, user);
    }

    payment: PaymentEntity;
    user: User;

    constructor(payment: PaymentEntity, user: User) {
        this.payment = payment;
        this.user = user;
    }

    /**
     * Check if the payment is available for the current request, based on the `payment` and `user` values.
     */
    abstract isAvailable(): Promise<boolean>;

    /**
     * Create a new payment, performing any additional configuration and initialization.
     */
    abstract create(): Promise<CreateData>;

    /**
     * Update the current status of the `payment` based on its internal state.
     */
    abstract updateStatus(): Promise<void>;

    /**
     * Create a new payment flow with any additional data connected.
     * @param amount The current price amount (a decimal number, the actual price for the user)
     * @param currency The currency used for the price
     * @param description An user-readable description of the payment (it should describe the item purchased, for example)
     * @param callback The callback url in which the user will be redirect after the payment
     * @param layout The base layout path in which include the current checkout flow
     * @param options Additional options for the payment. Currently supports Stripe custom keys and credit price
     */
    static async createPayment(
        amount: number,
        currency: string,
        description: string,
        callback: string,
        layout: string,
        options?: PaymentOptions
    ): Promise<PaymentEntity> {
        let p = new PaymentEntity();
        p.status = Status.init;
        p.amount = amount * 100;
        p.currency = currency;
        p.description = description;
        p.callback = callback;
        p.layout = layout;
        p.data = options || {};
        p.uuid = uuidv4();
        await p.save();
        return p;
    }
}

/**
 * Contains information about how the selected payment method should by displayed.
 */
export interface CreateData {
    /**
     * Custom data used by the payment type;
     */
    data: any;
    /**
     * The path containing the partial view (the main html form) for the chosen payment method
     */
    viewHtml: string;
    /**
     * The path containing the partial view (any additional js-scripts to be included) for the chosen payment method
     */
    viewJs: string;
}
