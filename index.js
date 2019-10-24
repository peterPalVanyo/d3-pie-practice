const form = document.querySelector('form')
const name = document.querySelector('#name')
const price = document.querySelector('#price')
const error = document.querySelector('#error')

form.addEventListener('submit', (e) => {
    e.preventDefault()
    if(name.value && price.value) {
        const item = {
            name: name.value,
            price: parseInt(price.value) 
        }
        db.collection('hifi').add(item).then(res => {
            error.textContent = ''
            name.value = ''
            price.value = ''
        })
    } else {
        error.textContent = 'pleas enter values everywhere'
    }
})