import type { APIRoute } from 'astro';
import db from '../../lib/db';

const OFFLINE_AFTER = 90;

function getStatus(lastSeen: number | null) {
    if (!lastSeen) {
        return 'unknown';
    }

    const age =
        Math.floor(Date.now() / 1000) - lastSeen;

    if (age > OFFLINE_AFTER) {
        return 'down';
    }

    return 'up';
}

export const GET: APIRoute = () => {
    const servers = db.prepare(`
        SELECT
            id,
            name,
            address,
            hostname,
            os,
            online,
            cpu_usage,
            memory_usage,
            network_download,
            network_upload,
            network_latency,
            last_seen
        FROM servers
        ORDER BY id ASC
    `).all() as any[];

    const result = servers.map((server) => ({
        ...server,
        status: getStatus(server.last_seen)
    }));

    return new Response(
        JSON.stringify(result),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        if (
            typeof body.name !== 'string' ||
            body.name.trim() === ''
        ) {
            return new Response(
                JSON.stringify({
                    error: 'name is required'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const result = db.prepare(`
            INSERT INTO servers (
                name,
                address
            )
            VALUES (?, '')
        `).run(
            body.name.trim()
        );

        return new Response(
            JSON.stringify({
                id: result.lastInsertRowid,
                name: body.name.trim(),
                address: '',
                hostname: null,
                os: null,
                online: 0,
                cpu_usage: 0,
                memory_usage: 0,
                network_download: null,
                network_upload: null,
                network_latency: null,
                last_seen: null,
                status: 'unknown'
            }),
            {
                status: 201,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

    } catch (error) {
        console.error(
            'Server creation error:',
            error
        );

        return new Response(
            JSON.stringify({
                error: 'Invalid request'
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