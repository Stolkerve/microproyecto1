const MAX_CARDS = 16;
const PATRON = "assets/patron.png"
const COUNTDOWN = 60 * 3 // Tres minutos
const MAX_POINTS = 1000;

const imgs = []
let cards = []
let counter = 0
let selectedCard = -1
let block = true; 
let interval = null
let founds = 0;
let player = ""

function waitForImage(imgElem) {
  return new Promise(res => {
      if (imgElem.complete) {
          return res();
      }
      imgElem.onload = () => res();
      imgElem.onerror = () => res();
  });
}

async function initImgs() {
  for (let i = 0; i < MAX_CARDS / 2; i++) {
    imgs.push(`assets/${i}.jpg`);
  }
}

function initTimer() {
  const timerElement = document.getElementById("timer")
  timerElement.textContent = "03:00"

  let timer = COUNTDOWN, minutes, seconds;
  interval = setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      timerElement.textContent = minutes + ":" + seconds;

      counter = timer
      if (--timer < 0) {
        cards.forEach((c, i) => {
          document.getElementById(i).src = imgs[c.pair]
        })
        endGame()
      }
  }, 1000);
}

function createCards() {
  // resetear
  cards = []
  selectedCard = -1
  founds = 0

  const tableElement = document.getElementById("cards-table")

  // Crear cartas
  for (let i = 0; i < MAX_CARDS / 2; i++) {
    cards.push({
      pair: i,
      selected: false
    })
    cards.push({
      pair: i,
      selected: false
    })
  }

  // Limpiar las cartas
  while (tableElement.firstChild) {
    tableElement.removeChild(tableElement.firstChild)
  }

  // Elementos de cartas
  for (let i = 0; i < 3; i++) {
    cards = cards.sort(() => 0.5 - Math.random());
  }

  cards.forEach(async (c, i) => {
    let card = document.createElement("img")
    card.className = "card"
    card.id = `${i}`
    card.src = imgs[c.pair]
    card.addEventListener("click", onCardClick)
    await waitForImage(card)
    tableElement.appendChild(card)
  })


}

function onCardClick(e) {
  if (block) return;

  const cardElement = e.target

  const cardIndex = Number(cardElement.id)
  const card = cards[cardIndex];

  if (selectedCard > 0 && card.selected) blockCards(null)
  if (selectedCard == cardIndex || card.selected ) return

  cardElement.src = imgs[card.pair]
  if (selectedCard < 0) {
    selectedCard = cardIndex
    return;
  }

  if (cards[selectedCard].selected) return

  if (cards[selectedCard].pair == card.pair) {
    cards[selectedCard].selected = true
    card.selected = true
    selectedCard = -1
    founds += 1

    if (founds == 8) {
      endGame()
      return;
    }
  } else {
    blockCards(cardElement)
  }
}

function blockCards(cardElement) {
  block = true
  setTimeout(() => {
    if (cardElement != null)
      cardElement.src = PATRON
    document.getElementById(selectedCard).src = PATRON
    selectedCard = -1
    block = false
  }, 500)
}

function endGame() {
  clearInterval(interval)
  block = true
  document.getElementById("reiniciarBtn").disabled = true

  const points = MAX_POINTS * (counter / COUNTDOWN)


  const body = document.querySelector("body")
  body.removeChild(document.getElementById("temp"))
  const mainPage = document.getElementById("main-page")
  mainPage.style = ""
  mainPage.className = "table-container"

  const lastPoints = localStorage.getItem(player)
  if (lastPoints) {
    if (Number(lastPoints) > points) {
      return
    }
  }
  localStorage.setItem(player, points.toString())

  showTable()
}


// Cache
let first = false
function showTable() {
  if (!first) {
    const body = document.querySelector("body")
    imgs.forEach((i) => {
      const img = document.createElement("img")
      img.src = i
      img.style.display = 'none'
      body.appendChild(img)
    })
    first = true
  }

  const table = document.getElementById("table-row")
  while (table.firstChild) {
    table.removeChild(table.firstChild)
  }

  for (let i = 0; i < localStorage.length; i++) {
    const player = localStorage.key(i);
    const row = document.createElement("tr")

    const playerEle = document.createElement("td")
    playerEle.className = "row"
    playerEle.textContent = player
    row.appendChild(playerEle)

    const pointsEle = document.createElement("td")
    pointsEle.className = "row"
    pointsEle.textContent = localStorage.getItem(player)
    row.appendChild(pointsEle)
    table.appendChild(row)
  }
}

function checkName() {
  const input = document.getElementById("name-input")
  if (input.value.lenght != 0) {
    player = input.value
    input.value = ""


    const tableContainer = document.createElement("div")
    tableContainer.className = "table-container"
    document.getElementById("main-page").style = "display: none"
    document.querySelector("body")
      .insertAdjacentHTML("beforeend", `
        <div class="table-container" id="temp">
          <p style="padding: 6px; font-size: larger; font-weight: 600;" id="timer">AS</p>
          <button onclick="initGame()" id="reiniciarBtn">Reiniciar?</button>
          <div class="table" id="cards-table">
          </div>
        </div>
      `)

    initGame()
  }
}

function initGame() {
  document.getElementById("reiniciarBtn").disabled = false
  if (interval) {
    clearInterval(interval)
  }
  initImgs()
  createCards()
  initTimer()

  // Esconder las cartas
  setTimeout(() => {
    cards.forEach((c, i) => {
      document.getElementById(i).src = PATRON
    })
    block = false
  }, 2500)
}

window.onload = showTable;
