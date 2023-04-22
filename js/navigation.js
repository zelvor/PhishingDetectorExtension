const btn1 = document.getElementById('btn1')
const btn2 = document.getElementById('btn2')
const btn3 = document.getElementById('btn3')
const page1 = document.getElementById('page-1')
const page2 = document.getElementById('page-2')
const page3 = document.getElementById('page-3')
const subpage2 = document.getElementById('subpage-2')
const submitBtn = document.getElementById('button-addon2')

btn1.addEventListener('click', () => {
  page1.style.display = 'block'
  page2.style.display = 'none'
  page3.style.display = 'none'
  subpage2.style.display = 'none'
  btn1.classList.add('active')
  btn2.classList.remove('active')
  btn3.classList.remove('active')
})

btn2.addEventListener('click', () => {
  page1.style.display = 'none'
  page2.style.display = 'block'
  page3.style.display = 'none'
  subpage2.style.display = 'none'
  btn1.classList.remove('active')
  btn2.classList.add('active')
  btn3.classList.remove('active')
})

btn3.addEventListener('click', () => {
  page1.style.display = 'none'
  page2.style.display = 'none'
  page3.style.display = 'block'
  subpage2.style.display = 'none'
  btn1.classList.remove('active')
  btn2.classList.remove('active')
  btn3.classList.add('active')
})

submitBtn.addEventListener('click', () => {
    subpage2.style.display = 'block'
})
