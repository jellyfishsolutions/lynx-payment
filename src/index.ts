import SimpleModule from "lynx-framework/simple.module";

export default class TemplateModule extends SimpleModule {

    get translation(): string {
        return __dirname + "/locale";
    }

    get controllers(): string {
        return __dirname + "/controllers";
    }

    get views(): string {
        return __dirname + "/views";
    }

    get public(): string {
        return __dirname + "/public";
    }
}
