import { Route, GET} from "lynx-framework/decorators";
import Request from "lynx-framework/request";
import {BaseController} from "lynx-framework/base.controller";

@Route("/")
export default class UIController extends BaseController {

    @GET("/")
    async getIndex(req: Request) {
        return this.render("template/index", req);
    }
}
