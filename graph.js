const dims = {height: 300, width: 300, radius: 150}
const cent = {x: (dims.width / 2 +5), y:(dims.height / 2 + 5)}

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 150)
    .attr('height', dims.height + 150)
//group where every elememts goes
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

const legendGroup = svg.append('g')
    .attr('transform', `translate(${dims.width + 40}, 10)`)
//use a plugin here
const legend = d3.legendColor()
    .shape('circle')
    .shapePadding(10)
    .scale(colour)
//access to the tip library
const tip = d3.tip()
    .attr('class', 'tip card')
    .html(d => {
        let content= `<div class="name">${d.data.name}</div>`
        content += `<div class="cost">${d.data.price}</div>`
        content += `<div class="delete">Click slice to delete</div>`
        return content
    })

graph.call(tip)

//update function
const update = (data) => {

    colour.domain(data.map(d => d.name))
    legendGroup.call(legend)
    legendGroup.selectAll('text').attr('fill', '#fff')
    //data to path
    const paths = graph.selectAll('path')
        .data(pie(data))

    paths.exit()
        .transition().duration(750)
        .attrTween('d', arcTweenExit)
        .remove()
    //update
    paths.attr('d', arcPath)
        .transition().duration(750)
        .attrTween('d', arcTweenUpdate)

    paths.enter()
        .append('path')
        .attr('class', 'arc')
        //autogenerate the path and apply it to the d attribute
        //.attr('d', arcPath) > no need becouse of the arcTweenEnter
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        // go thru the pie() > array of object > d.name become d.data.name
        .attr('fill', d => colour(d.data.name))
        .each(function(d){ this._current = d }) //always update
        .transition().duration(750)
            .attrTween('d', arcTweenEnter)

    graph.selectAll('path')
        .on('mouseover', (d, i, n) => {
            //n[i] > instead of this
            tip.show(d, n[i])
            handleMouseOver(d, i, n)
        })
        .on('mouseout', (d, i, n) => {
            tip.hide()
            handleMouseOut(d, i, n)
        })
        .on('click', handleClick)
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

const arcTweenEnter = (d) => {
    let i = d3.interpolate(d.endAngle, d.startAngle)
    //t=0 > start=end
    return function(t) {
        d.startAngle = i(t)
        return arcPath(d)
    }
}
const arcTweenExit = (d) => {
    let i = d3.interpolate(d.startAngle, d.endAngle)
    //t=0 > start=end
    return function(t) {
        d.startAngle = i(t)
        return arcPath(d)
    }
}
//function(using 'this')
function arcTweenUpdate(d) {
    //old(current) and new object
    let i = d3.interpolate(this._current, d)
    this._current = i(1)// or: d
    return function(t) {
        return arcPath(i(t))
    }
}

const handleMouseOver = (d, i, n) => {
    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
        .attr('fill', '#fff')
}
const handleMouseOut = (d, i, n) => {
    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
        .attr('fill', colour(d.data.name))
}
const handleClick = (d) => {
    const id = d.data.id
    db.collection('hifi').doc(id).delete()
}