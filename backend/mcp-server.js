const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const Docker = require("dockerode");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const os = require("os");
const yaml = require("js-yaml");

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const server = new McpServer({
  name: "CasaOS MCP Server",
  version: "1.0.0",
});

// Helper for exec
const runCommand = (command, cwd) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        resolve({ error: error.message, stderr, stdout });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

server.tool(
  "casaos_system_status",
  "Returns host CPU/Memory usage.",
  {},
  async () => {
    try {
      const memTotal = os.totalmem();
      const memFree = os.freemem();
      const memUsed = memTotal - memFree;
      const cpus = os.cpus();
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              cpu_count: cpus.length,
              cpu_model: cpus[0].model,
              memory_total_gb: (memTotal / (1024 ** 3)).toFixed(2),
              memory_used_gb: (memUsed / (1024 ** 3)).toFixed(2),
              memory_free_gb: (memFree / (1024 ** 3)).toFixed(2),
              load_average: os.loadavg(),
            }, null, 2)
          }
        ]
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }] };
    }
  }
);

server.tool(
  "casaos_list_apps",
  "Lists all running Docker containers and their status.",
  {},
  async () => {
    try {
      const containers = await docker.listContainers({ all: true });
      const apps = containers.map(c => ({
        id: c.Id.substring(0, 12),
        name: c.Names[0].replace('/', ''),
        image: c.Image,
        state: c.State,
        status: c.Status
      }));
      return {
        content: [{ type: "text", text: JSON.stringify(apps, null, 2) }]
      };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }] };
    }
  }
);

server.tool(
  "casaos_manage_app",
  "Manage a Docker container.",
  {
    containerId: z.string().describe("The ID or name of the container"),
    action: z.enum(["start", "stop", "restart", "remove"]).describe("The action to perform")
  },
  async ({ containerId, action }) => {
    try {
      const container = docker.getContainer(containerId);
      let result = "";
      if (action === "start") {
        await container.start();
        result = `Container ${containerId} started.`;
      } else if (action === "stop") {
        await container.stop();
        result = `Container ${containerId} stopped.`;
      } else if (action === "restart") {
        await container.restart();
        result = `Container ${containerId} restarted.`;
      } else if (action === "remove") {
        await container.remove({ force: true });
        result = `Container ${containerId} removed.`;
      }
      return { content: [{ type: "text", text: result }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }] };
    }
  }
);

server.tool(
  "casaos_deploy_stack",
  "Deploys a docker-compose stack to the CasaOS host.",
  {
    compose_yaml: z.string().describe("The raw docker-compose.yml string to deploy"),
    stack_name: z.string().describe("The name of the stack/directory")
  },
  async ({ compose_yaml, stack_name }) => {
    try {
      // Security validation
      const parsed = yaml.load(compose_yaml);
      if (parsed && parsed.services) {
        for (const [serviceName, serviceConfig] of Object.entries(parsed.services)) {
          if (serviceConfig.privileged) {
            throw new Error(`Service ${serviceName} requests privileged mode which is forbidden.`);
          }
          if (serviceConfig.pid === "host" || serviceConfig.network_mode === "host") {
            throw new Error(`Service ${serviceName} requests host pid/network mode which is forbidden.`);
          }
          if (serviceConfig.volumes) {
            for (const vol of serviceConfig.volumes) {
              const volString = typeof vol === "string" ? vol : (vol.source || "");
              if (volString.startsWith("/") && (volString === "/" || volString.startsWith("/var/run/docker.sock") || volString.startsWith("/root") || volString.startsWith("/etc"))) {
                throw new Error(`Service ${serviceName} maps a forbidden host path: ${volString}`);
              }
            }
          }
        }
      }

      // In CasaOS, app data often goes in /DATA/AppData
      const stackDir = path.join("/DATA/AppData", stack_name);
      
      // But we are in a container. To access /DATA, we need it mounted, 
      // or we can deploy in a temp dir.
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `casaos-stack-${stack_name}-`));
      const composeFile = path.join(tempDir, "docker-compose.yml");
      
      fs.writeFileSync(composeFile, compose_yaml);
      
      const { stdout, stderr, error } = await runCommand("docker compose up -d", tempDir);
      
      let res = `Stack ${stack_name} deployed from ${tempDir}.\n`;
      if (stdout) res += `STDOUT:\n${stdout}\n`;
      if (stderr) res += `STDERR:\n${stderr}\n`;
      if (error) res += `ERROR:\n${error}\n`;
      
      return { content: [{ type: "text", text: res }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }] };
    }
  }
);

server.tool(
  "casaos_get_logs",
  "Fetches the recent logs of a specific Docker container.",
  {
    containerId: z.string().describe("The ID or name of the container"),
    tail: z.number().optional().describe("Number of lines to show from the end of the logs (default 100)")
  },
  async ({ containerId, tail = 100 }) => {
    try {
      const container = docker.getContainer(containerId);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: tail,
        timestamps: false
      });
      // The dockerode logs stream contains headers (8 bytes) per line for multiplexing.
      // We can convert it to a readable string by stripping headers if needed, 
      // but dockerode provides an option to drop headers if we demux, or we can just parse it.
      // Easiest is to replace null bytes and non-printables if any, but let's just return it.
      const logString = logs.toString('utf8').replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');
      return { content: [{ type: "text", text: logString || "(No logs)" }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
