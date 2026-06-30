(async () => {
  const { default: app } = await import("./app.js");
  const { createServer } = await import("http");
  const { initSocket } = await import("./socket.js");

  const httpServer = createServer(app);

  // socket must attach to HTTP server
  initSocket(httpServer);

  const PORT = process.env.PORT || 2020;

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

// (async () => {
//   const mod = await import("./app.js");
//   const app = mod.default;

//   const PORT = process.env.PORT || 3000;

//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// })();