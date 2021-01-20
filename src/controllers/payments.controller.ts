import { Route, GET, Name, POST } from 'lynx-framework/decorators';
import Request from 'lynx-framework/request';
import PaymentMethodEntity from '../entities/payment-method.entity';
import PaymentEntity, { Status } from '../entities/payment.entity';
import { Payment } from '../libs/payment';
import { BaseController } from 'lynx-framework/base.controller';

@Route('/checkout')
export default class PaymentsController extends BaseController {
    @Name('checkout-view')
    @GET('/:uuid')
    async getPayment(uuid: string, req: Request) {
        let payment = (await PaymentEntity.findOne({
            where: { uuid: uuid },
        })) as PaymentEntity;

        if (payment.status != Status.init && payment.status != Status.started) {
            throw this.error(500, 'Invalid payment checkout-view');
        }

        let methods = (await PaymentMethodEntity.find()).filter((m) =>
            Payment.factory(m.name, payment, req.user).isAvailable()
        );

        let data = {
            payment: payment,
            methods: methods,
        };
        payment.status = Status.started;

        await payment.save();

        return this.render('payments/payment', req, { data: data, uuid: uuid });
    }

    @Name('checkout-do')
    @POST('do/:uuid')
    async performPayment(uuid: string, req: Request) {
        let p = (await PaymentEntity.findOne({
            where: { uuid: uuid },
        })) as PaymentEntity;

        if (p.status != Status.started) {
            throw this.error(500, 'Invalid payment checkout-do');
        }

        let m = (await PaymentMethodEntity.findOne({
            where: { id: req.body.method },
        })) as PaymentMethodEntity;
        p.paymentMethod = m;
        p.status = Status.progress;

        let payment = Payment.factory(m.name, p, req.user);

        let createData = await payment!.create();
        let obj = p.data;
        obj.id = createData.data.paymentId;
        p.data = obj;
        await p.save();
        return this.render('payments/checkout', req, {
            createData: createData,
            uuid: uuid,
        });
    }

    @Name('checkout-result')
    @GET('/result/:uuid')
    async paymentResult(uuid: string, req: Request) {
        let p = (await PaymentEntity.getRepository().findOne({
            where: { uuid: uuid },
            relations: ['paymentMethod'],
        })) as PaymentEntity;
        if (p.status != Status.progress) {
            throw this.error(500, 'Invalid payment checkout-result');
        }

        let m = (await PaymentMethodEntity.findOne({
            where: { id: p.paymentMethod.id },
        })) as PaymentMethodEntity;

        let payment: Payment = Payment.factory(m.name, p, req.user);

        await payment!.updateStatus();
        if ((p.status as Status) == Status.error) {
            this.addErrorMessage(this.tr('p.payment-error', req), req);
        } else {
            this.addSuccessMessage(
                this.tr('p.payment-successfully-done', req),
                req
            );
        }

        return this.redirect(p.callback, { uuid: p.uuid });
    }
}
