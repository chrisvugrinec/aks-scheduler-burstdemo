const { events, Job } = require("brigadier")
  
events.on("cmdemo", (brigadeEvent, project) => {

  console.log("==> handling an 'cmdemo' job")

  const docker = new Job("cmdemo", "cvugrinec/azcli-kubectl")
  docker.privileged = true;
  docker.tasks = [
    "az login --service-principal --username http://vuggieopenshiftdemo --password HelloWorld123! --tenant 72f988bf-86f1-41af-91ab-2d7cd011db47",
    "kubectl get pods",
  ];

  docker.run()

  console.log("==> finished an 'cmdemo' job")
})
