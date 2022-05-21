const gameButton = ({ name, location, img }) => {
  const gameItem = document.createElement("article");
  gameItem.classList.add("game-item");
  gameItem.innerHTML = `
    <img src="${img}" alt="${name}">
    <div class="game-item-name">
      <h2>${name}<h2>
    </div>
  `;
  gameItem.addEventListener("click", () => {
    document.location.href = location;
  });
  return gameItem;
};

const games = [
  {
    name: "Astroid Game",
    location: "astroids",
    img: "img/astroids.png",
  },
  {
    name: "Snake Game",
    location: "snake",
    img: "img/snake.png",
  },
  {
    name: "BFS Algorithm",
    location: "bfs",
    img: "img/bfs.png",
  },
];

const gameList = document.getElementById("game-list");
games.forEach((game) => {
  gameList.appendChild(gameButton(game));
});
