(() => {
  const deckUrl = "https://deckofcardsapi.com/api/deck/";
  const shuffleUrl = "new/shuffle/?deck_count=1";
  const drawUrl = "/draw/?count=5";
  const imageUrl = "https://deckofcardsapi.com/static/img/";
  const testUrl = "https://prog2700.onrender.com/pokerhandtest/";
  const specificHandUrl =
    "https://www.deckofcardsapi.com/api/deck/new/shuffle/?cards=3S,2D,AS,4S,5S";
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
  const testTargets = [
    "royalflush",
    "straightflush",
    "fourofakind",
    "fullhouse",
    "flush",
    "straight",
    "threeofakind",
    "twopair",
    "onepair",
    "highcard",
    "random",
  ];

  const getDeck = async (specificHand = false) => {
    const url = specificHand ? specificHandUrl : deckUrl + shuffleUrl;
    const data = await fetch(url);
    const response = await data.json();
    return response.deck_id;
  };

  const drawCards = async (deckId) => {
    try {
      const data = await fetch(deckUrl + deckId + drawUrl);
      const response = await data.json();
      addCardsToList(response);
    } catch (error) {
      return console.error("Error fetching cards:", error);
    }
  };

  const addCardsToList = (result) => {
    result["cards"].forEach((element) => {
      cards.push(element.code);
    });
  };

  const evaluateHand = (cards) => {
    cards.sort((a, b) => ranks[a[0]] - ranks[b[0]]);
    let handName = "";

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
      handName = "Royal Flush";
    } else if (isFlush(cards) && isStraight(cards)) {
      handName = "Straight Flush";
    } else if (checkNumOfSameRankCards(cards, 4)) {
      handName = "Four of a Kind";
    } else if (
      checkNumOfSameRankCards(cards, 3) &&
      checkNumOfSameRankCards(cards, 2)
    ) {
      handName = "Full House";
    } else if (isFlush(cards)) {
      handName = "Flush";
    } else if (isStraight(cards)) {
      handName = "Straight";
    } else if (checkNumOfSameRankCards(cards, 3)) {
      handName = "Three of a Kind";
    } else if (isTwoPair(cards)) {
      handName = "Two Pair";
    } else if (checkNumOfSameRankCards(cards, 2)) {
      handName = "One Pair";
    } else {
      handName = "High Card";
    }

    if (isStraightWithLowAce(cards)) {
      const lastCard = cards.pop();
      cards.unshift(lastCard);
    }

    return { hand: handName, sortedCards: cards };
  };

  const isFlush = (cards) => {
    return (
      cards[0][1] === cards[1][1] &&
      cards[1][1] === cards[2][1] &&
      cards[2][1] === cards[3][1] &&
      cards[3][1] === cards[4][1] &&
      cards[4][1] === cards[0][1]
    );
  };

  const isStraightWithLowAce = (cards) => {
    return (
      cards[0][0] === "2" &&
      cards[1][0] === "3" &&
      cards[2][0] === "4" &&
      cards[3][0] === "5" &&
      cards[4][0] === "A"
    );
  };

  const isStraight = (cards) => {
    if (isStraightWithLowAce(cards)) {
      return true;
    }

    const cardRanks = cards.map((card) => ranks[card[0]]);
    for (let i = 0; i < cardRanks.length - 1; i++) {
      if (cardRanks[i + 1] - cardRanks[i] !== 1) {
        return false;
      }
    }
    return true;
  };

  const isTwoPair = (cards) => {
    const rankCounts = countCardRanks(cards);
    return (
      Object.values(rankCounts).filter((count) => count === 2).length === 2
    );
  };

  const countCardRanks = (cards) => {
    const rankCounts = {};
    for (const card of cards) {
      const rank = card[0];
      rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    }
    return rankCounts;
  };

  const checkNumOfSameRankCards = (cards, numOfSameRankCards) => {
    const rankCounts = countCardRanks(cards);
    return Object.values(rankCounts).includes(numOfSameRankCards);
  };

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

  const dealCards = (specificHand = false) => {
    getDeck(specificHand)
      .then(drawCards)
      .then(() => {
        hand = evaluateHand(cards);
      })
      .then(() => (cards = []))
      .then(() => displayHand(hand))
      .catch((error) => console.error("Error dealing cards:", error));
  };

  const testHand = async (handType) => {
    const url = testUrl + handType;
    let testHand = [];

    try {
      const response = await fetch(url);
      const data = await response.json();
      testHand = data.cards.map((card) => card.code);

      const evaluatedHand = evaluateHand(testHand);
      displayHand(evaluatedHand);
      return evaluatedHand;
    } catch (error) {
      console.error("Error fetching cards:", error);
      throw error;
    }
  };

  const runAllTests = async () => {
    for (const element of testTargets) {
      await testHand(element);
    }
  };

  document.getElementById("deckApiButton").addEventListener("click", () => {
    dealCards();
  });
  document.getElementById("testButton").addEventListener("click", runAllTests);
  document
    .getElementById("specificHandButton")
    .addEventListener("click", () => {
      dealCards(true);
    });
})();
