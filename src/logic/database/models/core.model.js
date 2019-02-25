export default {
    tables: [{
            name: 'user',
            columns: [{
                    name: 'id',
                    type: 'TEXT',
                    primaryKey: true,
                },
                {
                    name: 'name',
                    type: 'TEXT'
                },
                {
                    name: 'email',
                    type: 'TEXT'
                },
                {
                    name: 'dateCreated',
                    type: 'DATE',
                }
            ]
        },
        {
            name: 'logs',
            columns: [{
                    name: 'id',
                    type: 'TEXT',
                    primaryKey: true,
                },
                {
                    name: 'name',
                    type: 'TEXT'
                },
                {
                    name: 'email',
                    type: 'TEXT'
                },
                {
                    name: 'dateCreated',
                    type: 'DATE',
                }
            ]
        }
    ]
}