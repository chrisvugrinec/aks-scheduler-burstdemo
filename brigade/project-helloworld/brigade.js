const { events } = require('brigadier')

events.on("exec", (brigadeEvent, project) => {
  console.log("Hello world! FROM GITHUB...now changed and commited")
})

events.push = function(e, p) {
  j = new Job("example")
  j.env= {"MY_ENV_VAR": p.secrets.myVar}
}
