import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import db from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const serverId = Number(body.server_id);

        if (!Number.isInteger(serverId)) {
            return new Response(
                JSON.stringify({ error: 'server_id is required' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const server = db.prepare(`
            SELECT id FROM servers WHERE id = ?
        `).get(serverId);

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

        const token = crypto.randomBytes(32).toString('hex');

        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const createdAt = Math.floor(Date.now() / 1000);

        const result = db.prepare(`
            INSERT INTO agents (
                server_id,
                token_hash,
                created_at
            )
            VALUES (?, ?, ?)
        `).run(serverId, tokenHash, createdAt);

        return new Response(
            JSON.stringify({
                id: result.lastInsertRowid,
                token
            }),
            {
                status: 201,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch {
        return new Response(
            JSON.stringify({ error: 'Invalid request' }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};