const sqlite3 = require('sqlite3')
const Promise = require('bluebird')
const nanoid = require('nanoid')

// import models
const Core = require('./models/core.model').default

class database {

    constructor(dbName, memory = false) {

        // definitions
        this.memory = memory
        this.dbName = dbName
        this.dbFolderPath = ''
        this.models = {
            Core,
        }
        // if the folder path does not contain a trailing slash, add it.    
        if (this.dbFolderPath.slice(this.dbFolderPath.length - 1, this.dbFolderPath.length) !== '/') {
            this.dbFolderPath = this.dbFolderPath + '/'
        }
        // combine the name with the path and call the connect method
        this.dbPath = this.dbFolderPath + this.dbName
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.memory ? ':memory:' : this.dbPath, (err) => {
                if (err) {
                    console.log('Could not connect to database', err)
                    // if no database found, create using model
                    this.createDB().then(resolve).catch(err => reject(err))
                } else {
                    console.log(`Connected to database: ${this.dbName} via ${this.memory ? 'memory' : 'disk'}.`)
                    if (this.memory) this.createDB()
                    resolve()
                }

            })
        })
    }

    createDB() {
        return new Promise((resolve, reject) => {
            // create the database using model
            let model = this.models[this.dbName]

            if (!model) return reject('model_not_found');
            if (!model.tables) return reject('tables_not_found');

            for (let table of model.tables) {

                let parameters = []

                // begin the query string               
                let query = `CREATE TABLE IF NOT EXISTS ${table.name} (`
                for (let column of table.columns) {

                    // define the name & type
                    let param = `${column.name} ${column.type}`

                    // append any additional options
                    if (column.primaryKey) param = param + ` PRIMARY KEY`
                    if (column.autoIncrement) param = param + ` AUTOINCREMENT`
                    // push the string to an array
                    parameters.push(param)
                }
                // convert the array into a string
                query = query + parameters.join(', ') + `)`;

                console.log(query);

                // run the query
                this.db.serialize(() => this.db.run(query))
            }
            // this.db.close()
            resolve()
        })
    }

    newRow(table, template) {
        return new Promise((resolve, reject) => {
            const id = nanoid()
            const model = this.models[this.dbName].tables.find(model => model.name === table)

            // Non negotiable
            template.id = id
            template.dateCreated = new Date()

            // VALIDATION: iterate over the columns in the model
            for (let column of model.columns) {
                // apply defaults
                if (column.hasOwnProperty('default') && !template.hasOwnProperty(column.name)) template[column.name] = column.default
            }

            // VALIDATION: iterate over the properties in the template
            const keys = Object.keys(template)
            for (let key of keys) {
                // verify the key exists in the model
                let column = model.columns.find(column => column.name === key)
                if (!column) return reject(`${key} was not found on model ${model.name}`)
                // fail if trying to assign primary key
                // if (column.primaryKey) return reject(`Can not assign primary key on model ${model.name}`)
            }

            // parse the template
            const parsedTemplate = keys.join(', ');
            // add a question mark for the values in the query
            const values = Array.from('?'.repeat(keys.length)).join(',');

            this.db.serialize(async () => {
                const query = this.db.prepare(`INSERT INTO ${table} (${parsedTemplate}) VALUES (${values})`);
                console.log(...Object.values(template))
                query.run(...Object.values(template));

                query.finalize(res => {
                    console.log(this.lastID)
                });
            });

            resolve(template)
        })
    }
}

export default database