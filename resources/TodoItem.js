module.exports = {
    properties: {
        id: "uuid",
        text: {type: "string", required: true},
        completed: {type: 'boolean', default: false}
    }
}
