import { Payment } from './payment';
import { Status } from '../entities/payment.entity';

const _stripe = require('stripe');

export default class StripePayment extends Payment {
    static getName(): string {
        return 'stripe';
    }

    private static pk: string;
    private static sk: string;

    static setKeys(pk: string, sk: string) {
        StripePayment.pk = pk;
        StripePayment.sk = sk;
    }

    async isAvailable() {
        return true;
    }

    async create() {
        let pk, sk: string;
        pk = StripePayment.pk;
        sk = StripePayment.sk;
        if (this.payment.data.pk && this.payment.data.sk) {
            pk = this.payment.data.pk;
            sk = this.payment.data.sk;
        }

        if (!pk || !sk) {
            throw new Error('Please set the stripe keys');
        }

        const stripe = _stripe(sk);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: this.payment.amount,
            currency: this.payment.currency,
            //payment_method: method,
            payment_method_types: ['card'],
        });
        return {
            viewHtml: 'payments/payment-methods/stripe-html.njk',
            viewJs: 'payments/payment-methods/stripe-js.njk',
            data: {
                layout: this.payment.layout,
                publicKey: pk,
                clientSecret: paymentIntent.client_secret,
                paymentId: paymentIntent.id,
                amount: this.payment.getAmount(),
                currency: this.payment.currency,
                symbol: this.payment.getCurrencySymbol(),
            },
        };
    }

    async updateStatus() {
        let pk, sk: string;
        pk = StripePayment.pk;
        sk = StripePayment.sk;
        if (this.payment.data.pk && this.payment.data.sk) {
            pk = this.payment.data.pk;
            sk = this.payment.data.sk;
        }

        if (!pk || !sk) {
            throw new Error('Please set the stripe keys');
        }

        const stripe = _stripe(sk);

        const paymentIntent = await stripe.paymentIntents.retrieve(
            this.payment.data.id
        );
        if (paymentIntent.status == 'succeeded') {
            this.payment.status = Status.completed;
        } else {
            this.payment.status = Status.error;
        }
        let data = this.payment.data;
        data.status = paymentIntent.status;
        this.payment.data = data;
        await this.payment.save();
    }
}
