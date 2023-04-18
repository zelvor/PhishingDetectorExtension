const btn1 = document.getElementById('btn1')
const btn2 = document.getElementById('btn2')
const page1 = document.getElementById('page-1')
const page2 = document.getElementById('page-2')
const subpage2 = document.getElementById('subpage-2')
const submitBtn = document.getElementById('button-addon2')

btn1.addEventListener('click', () => {
  page1.style.display = 'block'
  page2.style.display = 'none'
  subpage2.style.display = 'none'
})

btn2.addEventListener('click', () => {
  page1.style.display = 'none'
  page2.style.display = 'block'
})

submitBtn.addEventListener('click', () => {
    subpage2.style.display = 'block'
})
