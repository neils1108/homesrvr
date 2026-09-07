export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        const id = Number(body.id);

        if (!Number.isInteger(id) || id <= 0) {
            return new Response(
                JSON.stringify({
                    error: 'id is required and must be a positive number'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

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

        const existing = db.prepare(`
            SELECT id FROM servers WHERE id = ?
        `).get(id);

        if (existing) {
            return new Response(
                JSON.stringify({
                    error: 'Server ID already exists'
                }),
                {
                    status: 409,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        db.prepare(`
            INSERT INTO servers (
                id,
                name,
                address
            )
            VALUES (?, ?, '')
        `).run(
            id,
            body.name.trim()
        );

        return new Response(
            JSON.stringify({
                id,
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
        console.error('Server creation error:', error);

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