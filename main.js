(function () {
  const deckUrl = "https://deckofcardsapi.com/api/deck/";
  const shuffleUrl = "new/shuffle/?deck_count=1";
  const drawUrl = "/draw/?count=5";
  const imageUrl = "https://deckofcardsapi.com/static/img/";
  let cards = [];
  let hand = {};
  const ranks = {
    A: 14,
    K: 13,
    Q: 12,
    J: 11,
    10: 10,
    9: 9,
    8: 8,
    7: 7,
    6: 6,
    5: 5,
    4: 4,
    3: 3,
    2: 2,
    0: 10,
  };

  async function getDeck() {
    const data = await fetch(deckUrl + shuffleUrl);
    const response = await data.json();
    return response.deck_id;
  }

  async function drawCards(deckId) {
    try {
      const data = await fetch(deckUrl + deckId + drawUrl);
      const response = await data.json();
      addCardsToList(response);
    } catch (error) {
      return console.error("Error fetching cards:", error);
    }
  }

  const addCardsToList = (result) => {
    result["cards"].forEach((element) => {
      cards.push(element.code);
    });
  };

  function evaluateHand(cards) {
    cards.sort((a, b) => ranks[a[0]] - ranks[b[0]]);

    if (
      cards[0][0] === "0" &&
      cards[1][0] === "J" &&
      cards[2][0] === "Q" &&
      cards[3][0] === "K" &&
      cards[4][0] === "A" &&
      cards[0][1] === cards[1][1] &&
      cards[1][1] === cards[2][1] &&
      cards[2][1] === cards[3][1] &&
      cards[3][1] === cards[4][1] &&
      cards[4][1] === cards[0][1]
    ) {
      return { hand: "Royal Flush", sortedCards: cards };
    }
  }

  const displayHand = (result) => {
    document.write(
      `<div style="margin-bottom: 20px; border-bottom: solid 1px lightgrey; padding: 40px;"><h1>${result.hand}</h1></br></br>`
    );
    result["sortedCards"].forEach((element) => {
      document.write(
        `<img src="${imageUrl}${element}.png" style="margin: 4px;" />`
      );
    });
    document.write(`</div>`);
  };

  function dealCards() {
    getDeck()
      .then(drawCards)
      .then(() => {
        hand = evaluateHand(cards);
      })
      .then(() => (cards = []))
      .then(() => displayHand(hand))
      .catch((error) => console.error("Error dealing cards:", error));
  }

  document.getElementById("deckApiButton").addEventListener("click", dealCards);
})();