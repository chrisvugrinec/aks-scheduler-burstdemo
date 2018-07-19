"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const base64 = require("base-64");
const jsonpath = require("jsonpath");
const shelljs = require("shelljs");
const yaml = require("js-yaml");
const config_types_1 = require("./config_types");
const client = require("./auth-wrapper");
class KubeConfig {
    constructor() { }
    getContexts() {
        return this.contexts;
    }
    getClusters() {
        return this.clusters;
    }
    getUsers() {
        return this.users;
    }
    getCurrentContext() {
        return this.currentContext;
    }
    setCurrentContext(context) {
        this.currentContext = context;
    }
    static findObject(list, name, key) {
        for (let obj of list) {
            if (obj['name'] == name) {
                if (obj[key]) {
                    return obj[key];
                }
                return obj;
            }
        }
        return null;
    }
    getCurrentContextObject() {
        return this.getContextObject(this.currentContext);
    }
    getContextObject(name) {
        return KubeConfig.findObject(this.contexts, name, 'context');
    }
    getCurrentCluster() {
        return this.getCluster(this.getCurrentContextObject()['cluster']);
    }
    getCluster(name) {
        return KubeConfig.findObject(this.clusters, name, 'cluster');
    }
    getCurrentUser() {
        return this.getUser(this.getCurrentContextObject()['user']);
    }
    getUser(name) {
        return KubeConfig.findObject(this.users, name, 'user');
    }
    loadFromFile(file) {
        this.loadFromString(fs.readFileSync(file, 'utf8'));
    }
    bufferFromFileOrString(file, data) {
        if (file) {
            return fs.readFileSync(file);
        }
        if (data) {
            return new Buffer(base64.decode(data), 'utf-8');
        }
        return null;
    }
    applyToRequest(opts) {
        let cluster = this.getCurrentCluster();
        let user = this.getCurrentUser();
        if (cluster.skipTLSVerify) {
            opts.strictSSL = false;
        }
        opts.ca = this.bufferFromFileOrString(cluster.caFile, cluster.caData);
        opts.cert = this.bufferFromFileOrString(user.certFile, user.certData);
        opts.key = this.bufferFromFileOrString(user.keyFile, user.keyData);
        let token = null;
        if (user['auth-provider'] && user['auth-provider']['config']) {
            let config = user['auth-provider']['config'];
            token = 'Bearer ' + config['access-token'];
            let expiry = config['expiry'];
            if (expiry) {
                let expiration = Date.parse(expiry);
                if (expiration < Date.now()) {
                    if (config['cmd-path']) {
                        let cmd = config['cmd-path'];
                        if (config['cmd-args']) {
                            cmd = cmd + ' ' + config['cmd-args'];
                        }
                        let result = shelljs.exec(cmd, { silent: true });
                        if (result['code'] != 0) {
                            throw new Error('Failed to refresh token: ' + result);
                        }
                        let resultObj = JSON.parse(result.stdout.toString());
                        let path = config['token-key'];
                        path = '$' + path.slice(1, -1);
                        config['access-token'] = jsonpath.query(resultObj, path);
                        token = 'Bearer ' + config['access-token'];
                    }
                    else {
                        throw new Error('Token is expired!');
                    }
                }
            }
        }
        if (user.token) {
            token = 'Bearer ' + user.token;
        }
        if (token) {
            opts.headers['Authorization'] = token;
        }
        if (user.username) {
            opts.auth = {
                username: user.username,
                password: user.password
            };
        }
    }
    loadFromString(config) {
        var obj = yaml.safeLoad(config);
        if (obj.apiVersion != 'v1') {
            throw new TypeError('unknown version: ' + obj.apiVersion);
        }
        this.clusters = config_types_1.newClusters(obj.clusters);
        this.contexts = config_types_1.newContexts(obj.contexts);
        this.users = config_types_1.newUsers(obj.users);
        this.currentContext = obj['current-context'];
    }
}
exports.KubeConfig = KubeConfig;
class Config {
    static fromFile(filename) {
        let kc = new KubeConfig();
        kc.loadFromFile(filename);
        let k8sApi = new client.Core_v1Api(kc.getCurrentCluster()['server']);
        k8sApi.setDefaultAuthentication(kc);
        return k8sApi;
    }
    static fromCluster() {
        let host = process.env.KUBERNETES_SERVICE_HOST;
        let port = process.env.KUBERNETES_SERVICE_PORT;
        let caCert = fs.readFileSync(Config.SERVICEACCOUNT_CA_PATH);
        let token = fs.readFileSync(Config.SERVICEACCOUNT_TOKEN_PATH);
        let k8sApi = new client.Core_v1Api('https://' + host + ':' + port);
        k8sApi.setDefaultAuthentication({
            'applyToRequest': (opts) => {
                opts.ca = caCert;
                opts.headers['Authorization'] = 'Bearer ' + token;
            }
        });
        return k8sApi;
    }
    static defaultClient() {
        if (process.env.KUBECONFIG) {
            return Config.fromFile(process.env.KUBECONFIG);
        }
        let config = path.join(process.env.HOME, ".kube", "config");
        if (fs.existsSync(config)) {
            return Config.fromFile(config);
        }
        if (fs.existsSync(Config.SERVICEACCOUNT_TOKEN_PATH)) {
            return Config.fromCluster();
        }
        return new client.Core_v1Api('http://localhost:8080');
    }
}
Config.SERVICEACCOUNT_ROOT = '/var/run/secrets/kubernetes.io/serviceaccount';
Config.SERVICEACCOUNT_CA_PATH = Config.SERVICEACCOUNT_ROOT + '/ca.crt';
Config.SERVICEACCOUNT_TOKEN_PATH = Config.SERVICEACCOUNT_ROOT + '/token';
exports.Config = Config;
//# sourceMappingURL=config.js.map