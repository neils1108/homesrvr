import net from 'node:net';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import config from '../../config/homesrvr';
import db from '../../lib/db';
const execFileAsync = promisify(execFile);
const TIMEOUT = 5000;
function unknownResult() {
    return {
        status: 'unknown',
        responseTime: null
    };
}
async function checkHttp(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, TIMEOUT);
    const start = Date.now();
    try {
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal
        });
        const responseTime = Date.now() - start;
        clearTimeout(timeout);
        return {
            status: response.ok
                ? 'up'
                : 'down',
            responseTime
        };
    }
    catch {
        clearTimeout(timeout);
        return {
            status: 'down',
            responseTime: null
        };
    }
}
function checkTcp(host, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const start = Date.now();
        let finished = false;
        const finish = (status, responseTime) => {
            if (finished)
                return;
            finished = true;
            socket.destroy();
            resolve({
                status,
                responseTime
            });
        };
        socket.setTimeout(TIMEOUT);
        socket.once('connect', () => {
            finish('up', Date.now() - start);
        });
        socket.once('timeout', () => {
            finish('down', null);
        });
        socket.once('error', () => {
            finish('down', null);
        });
        socket.connect(port, host);
    });
}
async function checkPing(host) {
    const start = Date.now();
    try {
        const isWindows = process.platform === 'win32';
        const args = isWindows
            ? ['-n', '1', '-w', String(TIMEOUT), host]
            : ['-c', '1', '-W', '5', host];
        await execFileAsync(isWindows ? 'ping.exe' : 'ping', args, {
            timeout: TIMEOUT + 1000
        });
        return {
            status: 'up',
            responseTime: Date.now() - start
        };
    }
    catch {
        return {
            status: 'down',
            responseTime: null
        };
    }
}
function checkAgent(serverId) {
    const server = db.prepare(`
        SELECT
            last_seen
        FROM servers
        WHERE id = ?
    `).get(serverId);
    if (!server) {
        return unknownResult();
    }
    if (!server.last_seen) {
        return unknownResult();
    }
    const age = Math.floor(Date.now() / 1000) -
        server.last_seen;
    return {
        status: age <= 90
            ? 'up'
            : 'down',
        responseTime: null
    };
}
async function checkService(service) {
    const monitor = service.monitor;
    if (!monitor || monitor.type === 'none') {
        return unknownResult();
    }
    switch (monitor.type) {
        case 'http':
            if (typeof service.url !== 'string' ||
                service.url.trim() === '') {
                return unknownResult();
            }
            return checkHttp(service.url);
        case 'tcp':
            if (typeof service.host !== 'string' ||
                typeof service.port !== 'number') {
                return unknownResult();
            }
            return checkTcp(service.host, service.port);
        case 'ping':
            if (typeof service.host !== 'string' ||
                service.host.trim() === '') {
                return unknownResult();
            }
            return checkPing(service.host);
        case 'agent':
            if (typeof monitor.serverId !== 'number') {
                return unknownResult();
            }
            return checkAgent(monitor.serverId);
        default:
            return unknownResult();
    }
}
export const GET = async () => {
    if (!config.services.enabled ||
        config.services.items.length === 0) {
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    const results = await Promise.all(config.services.items.map(async (service) => {
        const result = await checkService(service);
        return {
            name: service.name,
            status: result.status,
            responseTime: result.responseTime
        };
    }));
    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
