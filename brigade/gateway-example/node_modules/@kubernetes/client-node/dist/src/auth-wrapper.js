"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api = require("./api");
class Core_v1Api extends api.Core_v1Api {
    constructor(baseUri) {
        super(baseUri);
    }
    setDefaultAuthentication(auth) {
        this.authentications.default = auth;
    }
}
exports.Core_v1Api = Core_v1Api;
class Extensions_v1beta1Api extends api.Extensions_v1beta1Api {
    constructor(baseUri) {
        super(baseUri);
    }
    setDefaultAuthentication(auth) {
        this.authentications.default = auth;
    }
}
exports.Extensions_v1beta1Api = Extensions_v1beta1Api;
//# sourceMappingURL=auth-wrapper.js.map