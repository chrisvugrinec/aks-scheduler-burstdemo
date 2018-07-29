const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const convict = require("convict");
const { Event } = require("./brigade-event")

const app = express();
app.use(bodyParser.raw({type: "*/*"}));


// ==== CONFIGURATION ====
// Configure what values we get from environment variables. These are
// passed into the runtime via `chart/templates/deployment.yaml`.
// To learn more about configuration using Convict, go here:
//   https://github.com/mozilla/node-convict
var config = convict({
    // Example of a custom var. See chart/values.yaml for the definition.
    exampleVar: {
        doc: "This is an example. Feel free to delete or replace.",
        default: "EMPTY",
        env: "EXAMPLE"
    },

    // Predefined vars.
    port: {
        doc: "Port number",
        default: 8080,
        format: "port",
        env: "GATEWAY_PORT"
    },
    ip: {
        doc: "The pod IP address assigned by Kubernetes",
        format: "ipaddress",
        default: "127.0.0.1",
        env: "GATEWAY_IP"
    },
    namespace: {
        doc: "The Kubernetes namespace. Usually passed via downward API.",
        default: "default",
        env: "GATEWAY_NAMESPACE"
    },
    appName: {
        doc: "The name of this app, according to Kubernetes",
        default: "unknown",
        env: "GATEWAY_NAME"
    }
});
config.validate({allowed: 'strict'});
const namespace = config.get("namespace");


app.post("/v1/webhook/cmdemo/:project", (req, res) => {

    const eventName = "myevent";
    const project = req.params.project
    const payload = "console.log(\"hello world\")";

    console.log("job triggered for project: "+project);
    brigEvent = new Event("default");
    brigEvent.create(eventName, project, payload).then(() => {
        res.json({"status": "accepted"});
    }).catch((e) => {
        console.error(e);
        res.sendStatus(500);
    }); 
});


// ==== BOILERPLATE ====
// Kubernetes health probe. If you remove this, you will need to modify
// the deployment.yaml in the chart.
app.get("/healthz", (req, res)=> {
    res.send("OK");
})
// Start the server.
http.createServer(app).listen(config.get('port'), () => {
    console.log(`Running on ${config.get("ip")}:${config.get("port")}`)
})
