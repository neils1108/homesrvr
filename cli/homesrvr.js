#!/usr/bin/env node

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const HOMESRVR_URL =
    process.env.HOMESRVR_URL || 'http://localhost:8080';

async function request(path, options = {}) {
    const response = await fetch(`${HOMESRVR_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(
            `Homesrvr returned an invalid response (${response.status})`
        );
    }

    if (!response.ok) {
        throw new Error(
            data.error || `Request failed (${response.status})`
        );
    }

    return data;
}

async function registerServer(serverId) {
    const id = Number(serverId);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Server ID must be a positive number.');
    }

    const rl = readline.createInterface({
        input,
        output
    });

    try {
        const name = await rl.question('Server name: ');

        if (!name.trim()) {
            throw new Error('Server name cannot be empty.');
        }

        const server = await request('/api/servers', {
            method: 'POST',
            body: JSON.stringify({
                id: id,
                name: name.trim()
            })
        });

        console.log('');
        console.log('Server registered successfully!');
        console.log(`Name: ${server.name}`);
        console.log(`ID:   ${server.id}`);
        console.log('');
    } finally {
        rl.close();
    }
}

async function generateToken(serverId) {
    const id = Number(serverId);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error('Server ID must be a positive number.');
    }

    const result = await request('/api/agents/register', {
        method: 'POST',
        body: JSON.stringify({
            server_id: id
        })
    });

    console.log('');
    console.log('Agent token generated!');
    console.log('');
    console.log(result.token);
    console.log('');
    console.log('Copy this token into the agent config.');
    console.log('');
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Homesrvr CLI');
        console.log('');
        console.log('Commands:');
        console.log('  homesrvr register server <id>');
        console.log('  homesrvr generate token server <id>');
        console.log('');
        return;
    }

    if (args[0] === 'register' && args[1] === 'server') {
        if (!args[2]) {
            throw new Error(
                'Usage: homesrvr register server <id>'
            );
        }

        await registerServer(args[2]);
        return;
    }

    if (
        args[0] === 'generate' &&
        args[1] === 'token' &&
        args[2] === 'server'
    ) {
        if (!args[3]) {
            throw new Error(
                'Usage: homesrvr generate token server <id>'
            );
        }

        await generateToken(args[3]);
        return;
    }

    throw new Error(
        'Unknown command. Run "homesrvr" for help.'
    );
}

try {
    await main();
} catch (error) {
    console.error('');
    console.error(
        'Error:',
        error instanceof Error ? error.message : error
    );
    console.error('');
    process.exitCode = 1;
}