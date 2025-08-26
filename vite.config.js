import fs from "fs"
import path from "path"

function htmlInclude()
{
  let server;
  function processHtml(html, baseDir) {
    return html.replace(
      /<Include\s+path="(.+?)"\s*\/?>/g,
      (_, file) => {
        const filePath = path.resolve(baseDir, file);
        if (server) {
          server.watcher.add(filePath);
        }
        const content = fs.readFileSync(filePath, "utf-8");
        return processHtml(content, path.dirname(filePath));
      }
    );
  }
  return {
    name: "html-include",
    configResolved(config) {},
    configureServer(devServer) {
      server = devServer;
    },
    transformIndexHtml(html, ctx) {
      return processHtml(html, path.dirname(ctx.filename));
    }
  };
}

export default {
	plugins: [htmlInclude()],
};
