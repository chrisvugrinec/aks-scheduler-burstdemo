
const k8s = require("@kubernetes/client-node");
const {Buffer} = require("buffer");
const ulid = require("ulid");

const kube = k8s.Config.defaultClient();

/**
 * Event describes an event to be sent to Brigade.
 * 
 * Events are created as Kubernetes secrets with a specific set of labels.
 * The Brigade controller watches for these events, and creates new
 * worker instances to handle them.
 * 
 * Event names are conventional. You can declare your own event name
 * here, and then your `brigade.js` file can handle it by declareing
 * `events.on("your_event_name"...)`
 * 
 * @param string ns
 *   The Kubernetes namespace.
 */
exports.Event = function(ns) {


    console.log("EVENT CALLED!!!");
    this.namespace = ns;
    /**
     * The commit SHA. If left empty, the tip of commit_ref will
     * be used instead.
     */
    this.commit_id = "";
    /**
     * The commit ref. Typically "master" or "refs/heads/manster"
     * is what you want. "refs/tags/XXX" can be used for a tag.
     */
    this.commit_ref = "refs/heads/master";
    /**
     * The name of the event provider (e.g. this gateway)
     */
    this.event_provider = "brigade-gw-pack";
    /**
     * A script to override the one in VCS.
     * If this is empty, the brigade.js in VCS will be used.
     */
    this.script = "";
    this.log_level = "debug";

    /**
     * The build ID. If this is blank (the suggested value) when `create()`
     * is called, a ULID will be generated and stored on this field.
     */
    this.build_id = "";


    this.create = function(hook, project, payload) {


        console.log("XXX CREATE");
        return kube.readNamespacedSecret(project, "default").then( () => {
 
            console.log("REading secret for project: "+project+" in namespace "+this.namespace);

            if (!this.build_id) {
              this.build_id = ulid.ulid().toLowerCase()
              console.log("XXX CREATE - NO BUILD, create buildid: "+this.build_id);
            }
            let buildName = `brigade-${this.build_id}`

            // Create Secret == create event

            let secret = new k8s.V1Secret()
            secret.type = "brigade.sh/build"
            secret.metadata = {
                name: buildName,
                labels: {
                    component: "build",
                    heritage: "brigade",
                    build: this.build_id,
                    project: project
                }
            }

            console.log("XXX CREATE - create secret data");

            secret.data = {
                // TODO: Do we let this info be passed in?

                //commit_id: b64enc(this.commit_id),
                commit_ref: b64enc(this.commit_ref),
                build_id: b64enc(this.build_id),
                build_name: b64enc(buildName),
                event_provider: b64enc(this.event_provider),
                event_type: b64enc(hook),
                project_id: b64enc(project),
                //payload: b64enc(this.script)
            }
            if (this.script) {
                console.log("XXX CREATE - NO BUILD 2");
                secret.data.script = b64enc(this.script);
            }
            if (this.log_level) {
                console.log("XXX CREATE - NO BUILD 3");
                secret.data.log_level = b64enc(this.script);
            }
            console.log("XXX CREATE - NO BUILD 4");
            return kube.createNamespacedSecret(this.namespace, secret);
        }).catch(() => {
            console.log("XXX EXECPTION");
            return Promise.reject(`project ${project} could not be loaded`);
        })
    } 
}

const encode = require('nodejs-base64-encode');
function b64enc(original) {

    result = encode.encode(original, 'base64');
    console.log("ori: "+original+" encoded: "+result);
    return result; 
    //return Buffer.from(original).toString("base64");
}
