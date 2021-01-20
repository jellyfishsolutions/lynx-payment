import {
    Route,
    GET,
    Name,
    POST,
    IsDisabledOn,
} from 'lynx-framework/decorators';
import Request from 'lynx-framework/request';
import { Payment } from '../../../libs/payment';
import { isProduction } from 'lynx-framework/app';
import { BaseController } from 'lynx-framework/base.controller';

@Route('/payment/test')
export default class TestController extends BaseController {
    @IsDisabledOn(isProduction)
    @Name('test-view')
    @GET('/')
    async test(req: Request) {
        return this.render('test-module/test', req);
    }

    @IsDisabledOn(isProduction)
    @Name('test-do')
    @POST('/')
    async performPayment(req: Request) {
        let p = await Payment.createPayment(
            parseFloat(req.body.amount),
            req.body.currency,
            req.body.description,
            req.body.cb,
            '/test-module/layout'
        );
        return this.redirect(p.currentUrl, { uuid: p.uuid });
    }
}
