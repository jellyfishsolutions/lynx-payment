import SimpleModule from 'lynx-framework/simple.module';
import { Payment } from './libs/payment';

export default class PaymentsModule extends SimpleModule {
    static register(paymentMethod: any) {
        Payment.register(paymentMethod);
    }

    get controllers(): string {
        return __dirname + '/controllers';
    }

    get translation(): string {
        return __dirname + '/locale';
    }

    get views(): string {
        return __dirname + '/views';
    }

    get public(): string {
        return __dirname + '/public';
    }

    get entities(): string {
        return __dirname + '/entities';
    }
}
