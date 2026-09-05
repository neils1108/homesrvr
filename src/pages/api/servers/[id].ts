import type { APIRoute } from 'astro';
import db from '../../../lib/db';

export const GET: APIRoute = ({ params }) => {
    const id = Number(params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return new Response(
            JSON.stringify({ error: 'Invalid server ID' }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }

    const server = db.prepare(`
        SELECT
            id,
            name,
            address,
            hostname,
            os,
            online,
            cpu_usage,
            memory_usage,
            last_seen
        FROM servers
        WHERE id = ?
    `).get(id);

    if (!server) {
        return new Response(
            JSON.stringify({ error: 'Server not found' }),
            {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }

    return new Response(JSON.stringify(server), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};