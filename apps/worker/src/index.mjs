console.log("[worker] starting…");
// TODO: implement queue consumer in Week 3
setInterval(() => {
  // heartbeat
  process.stdout.write(".");
}, 5000);

