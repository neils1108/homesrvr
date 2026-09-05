import type { APIRoute } from 'astro';
import db from '../../../../lib/db';

export const POST: APIRoute = async ({ params, request }) => {
    const id = Number(params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return new Response(
            JSON.stringify({
                error: 'Invalid server ID'
            }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }

    const server = db.prepare(`
        SELECT id
        FROM servers
        WHERE id = ?
    `).get(id);

    if (!server) {
        return new Response(
            JSON.stringify({
                error: 'Server not found'
            }),
            {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }

    try {
        const body = await request.json();

        const cpu = Number(body.cpu);
        const memory = Number(body.memory);

        if (
            !Number.isFinite(cpu) ||
            !Number.isFinite(memory) ||
            cpu < 0 ||
            cpu > 100 ||
            memory < 0 ||
            memory > 100
        ) {
            return new Response(
                JSON.stringify({
                    error: 'CPU and memory must be between 0 and 100'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const now = Math.floor(Date.now() / 1000);

        db.prepare(`
            UPDATE servers
            SET
                online = 1,
                cpu_usage = ?,
                memory_usage = ?,
                last_seen = ?
            WHERE id = ?
        `).run(
            cpu,
            memory,
            now,
            id
        );

        return new Response(
            JSON.stringify({
                success: true,
                server: {
                    id,
                    cpu,
                    memory,
                    online: true,
                    last_seen: now
                }
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Stats update error:', error);

        return new Response(
            JSON.stringify({
                error: 'Invalid JSON'
            }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};