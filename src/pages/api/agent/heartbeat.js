import crypto from 'node:crypto';
import db from '../../../lib/db';
export const POST = async ({ request }) => {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
            error: 'Missing agent token'
        }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    const token = auth.slice(7);
    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    const agent = db.prepare(`
        SELECT server_id
        FROM agents
        WHERE token_hash = ?
    `).get(tokenHash);
    if (!agent) {
        return new Response(JSON.stringify({
            error: 'Invalid agent token'
        }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    try {
        const body = await request.json();
        const cpu = Number(body.cpu);
        const memory = Number(body.memory);
        if (!Number.isFinite(cpu) ||
            !Number.isFinite(memory) ||
            cpu < 0 ||
            cpu > 100 ||
            memory < 0 ||
            memory > 100) {
            return new Response(JSON.stringify({
                error: 'CPU and memory must be between 0 and 100'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        const hostname = typeof body.hostname === 'string'
            ? body.hostname
            : null;
        const ip = typeof body.ip === 'string'
            ? body.ip
            : null;
        const os = body.os && typeof body.os === 'object'
            ? JSON.stringify(body.os)
            : null;
        const network = body.network &&
            typeof body.network === 'object'
            ? body.network
            : null;
        const download = network &&
            Number.isFinite(Number(network.download))
            ? Number(network.download)
            : null;
        const upload = network &&
            Number.isFinite(Number(network.upload))
            ? Number(network.upload)
            : null;
        const latency = network &&
            Number.isFinite(Number(network.latency))
            ? Number(network.latency)
            : null;
        const now = Math.floor(Date.now() / 1000);
        db.prepare(`
            UPDATE servers
            SET
                address = COALESCE(?, address),
                hostname = COALESCE(?, hostname),
                os = COALESCE(?, os),
                online = 1,
                cpu_usage = ?,
                memory_usage = ?,
                network_download = ?,
                network_upload = ?,
                network_latency = ?,
                last_seen = ?
            WHERE id = ?
        `).run(ip, hostname, os, cpu, memory, download, upload, latency, now, agent.server_id);
        return new Response(JSON.stringify({
            success: true
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    catch (error) {
        console.error('Heartbeat error:', error);
        return new Response(JSON.stringify({
            error: 'Invalid JSON'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
