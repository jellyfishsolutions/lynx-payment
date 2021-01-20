import SimpleModule from 'lynx-framework/simple.module';

export default class PaymentsTestModule extends SimpleModule {
    get controllers(): string {
        return __dirname + '/controllers';
    }
    get views(): string {
        return __dirname + '/views';
    }
}
