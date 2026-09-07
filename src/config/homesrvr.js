export default {
    site: {
        name: 'Homesrvr',
        subtitle: 'My Homelab'
    },
    favorites: [
        {
            name: 'Proxmox',
            url: 'https://proxmox.example.com'
        },
        {
            name: 'Immich',
            url: 'https://photos.example.com'
        },
        {
            name: 'Jellyfin',
            url: 'https://jellyfin.example.com'
        }
    ],
    overview: {
        enabled: true,
        title: 'Overview',
        servers: [
            {
                name: 'T630',
                serverId: 1
            },
            // {
            //     name: 'HP ProDesk',
            //     serverId: 2
            // },
            // {
            //     name: 'Server 3',
            //     serverId: 3
            // },
            // {
            //     name: 'Server 4',
            //     serverId: 4
            // }
        ]
    },
    network: {
        enabled: true,
        title: 'Network',
        download: {
            enabled: true,
            label: 'Download'
        },
        upload: {
            enabled: true,
            label: 'Upload'
        },
        latency: {
            enabled: true,
            label: 'Latency'
        }
    },
    services: {
        enabled: true,
        title: 'Services',
        items: [
            {
                name: 'Immich',
                url: 'https://photos.example.com',
                monitor: {
                    type: 'http'
                }
            },
            {
                name: 'Jellyfin',
                url: 'https://jellyfin.example.com',
                monitor: {
                    type: 'http'
                }
            },
            {
                name: 'Minecraft',
                host: '192.168.2.50',
                port: 25565,
                monitor: {
                    type: 'tcp'
                }
            },
            // {
            //     name: 'Ping Test',
            //     host: '192.168.2.1',
            //
            //     monitor: {
            //         type: 'ping'
            //     }
            // },
            // {
            //     name: 'T630 Agent',
            //
            //     monitor: {
            //         type: 'agent',
            //         serverId: 1
            //     }
            // }
        ]
    },
    links: {
        enabled: true,
        title: 'Links',
        items: [
            {
                name: 'GitHub',
                url: 'https://github.com'
            },
            {
                name: 'Documentation',
                url: 'https://example.com/docs'
            },
            // {
            //     name: 'Another Link',
            //     url: 'https://example.com'
            // }
        ]
    },
    footer: {
        enabled: true,
        text: 'Made by',
        name: 'neils1108',
        url: 'https://neils1108.eu'
    }
};
