import AdminUIModule from 'lynx-admin-ui';
import DatagridModule from 'lynx-datagrid';
import { App, ConfigBuilder } from 'lynx-framework';
import PaymentsModule from '..';
import PaymentMethodEntity from '../entities/payment-method.entity';
import StripePayment from '../libs/stripe-payment';
import PaymentsTestModule from './test-module';

const port = Number(process.env.PORT) || 3000;

let myConfig = new ConfigBuilder(__dirname, false)
    .setOnDatabaseInit(async () => {
        let p = await PaymentMethodEntity.findOne({
            where: { name: StripePayment.getName() },
        });
        if (!p) {
            p = new PaymentMethodEntity();
            p.name = StripePayment.getName();
            await p.save();
        }
    })
    .build();

StripePayment.setKeys('pk_test_yourkey', 'sk_test_yourkey');

PaymentsModule.register(StripePayment);

const app = new App(myConfig, [
    new DatagridModule(),
    new AdminUIModule(),
    new PaymentsModule(),
    new PaymentsTestModule(),
]);

app.startServer(port);
