const dims = {height: 300, width: 300, radius: 150}
const cent = {x: (dims.width / 2 +5), y:(dims.height / 2 + 5)}

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 150)
    .attr('height', dims.height + 150)

const graph = svg.append('g')
    .attr('transform', `translate(${cent.x}, ${cent.y})`)

const pie = d3.pie()
    .sort(null)
    .value(d => d.price)

/* const angles = pie([
    {name: 'a', price: 500},
    {name: 'b', price: 200},
    {name: 'c', price: 300}
]) */



const arcPath = d3.arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius/2)

const colour = d3.scaleOrdinal(d3['schemeSet2'])

//update function
const update = (data) => {

    colour.domain(data.map(d => d.name))
    //data to path
    const paths = graph.selectAll('path')
        .data(pie(data))

    paths.enter()
        .append('path')
        .attr('class', 'arc')
        //autogenerate the path and apply it to the d attribute
        .attr('d', arcPath)
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        // go thru the pie() > array of object > d.name become d.data.name
        .attr('fill', d => colour(d.data.name))
}

//this can be a boilerplate for change listening LET not const!
let data = []
db.collection('hifi').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = {...change.doc.data(), id: change.doc.id}
        switch(change.type) {
            case 'added':
                data.push(doc)
                break
            case 'modified':
                const index = data.findIndex(item => item.id === doc.id)
                data[index] = doc
                break
            case 'removed':
                data = data.filter(item => item.id !== doc.id)
                break
            default:
                break
        }
    });
    update(data)
})