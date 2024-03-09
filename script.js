const tokenValues = {
  "ONE HUNDRED": 100,
  TWENTY: 20,
  TEN: 10,
  FIVE: 5,
  ONE: 1,
  QUARTER: 0.25,
  DIME: 0.1,
  NICKEL: 0.05,
  PENNY: 0.01,
};

let price = 1.87;

let cid = [
  ["PENNY", 1.01],
  ["NICKEL", 2.05],
  ["DIME", 3.1],
  ["QUARTER", 4.25],
  ["ONE", 90],
  ["FIVE", 55],
  ["TEN", 20],
  ["TWENTY", 60],
  ["ONE HUNDRED", 100],
];

const cash = document.getElementById("cash");
const purchaseBtn = document.getElementById("purchase-btn");
const currPrice = document.getElementById("curr-price");
const tokens = document.querySelectorAll(".tokens-left");
const changeValuesBtn = document.getElementById("change-values-btn");
const changeValuesbox = document.getElementById("change-values");
const changeValuesClose = document.getElementById("change-values-close");
const changeDueDiv = document.getElementById("change-due");

// Changing the Values of Tokens and Price
const changeValues = () => {
  let changeInputs = document.querySelectorAll(".change-values > * > input");
  let ObjectCid = Object.fromEntries(cid);
  ObjectCid["price"] = price;
  // Convert property names to lowercase in the original object
  for (const key in ObjectCid) {
    if (ObjectCid.hasOwnProperty(key)) {
      const lowercaseKey = key.toLowerCase();
      if (lowercaseKey !== key) {
        ObjectCid[lowercaseKey] = ObjectCid[key];
        delete ObjectCid[key];
      }
    }
  }
  ObjectCid["hundred"] = ObjectCid["one hundred"];
  delete ObjectCid["one hundred"];

  // Pre-Fixing Values in the Dialogue Box
  changeInputs.forEach((input) => {
    input.value = ObjectCid[input.name];
  });

  //Showing the change values dialog box
  changeValuesbox.classList.remove("hide");

  // Waiting for changes and Closing
  changeValuesClose.addEventListener("click", () => {
    changeInputs.forEach((input) => {
      if (input.value === "") {
        alert("Values Left Unentered!!!");
        return;
      } else {
        ObjectCid[input.name] = input.value;
      }
    });
    changeValuesbox.classList.add("hide");

    // Converting Property Names to Upper Case
    for (const key in ObjectCid) {
      if (ObjectCid.hasOwnProperty(key)) {
        const uppercaseKey = key.toUpperCase();
        if (uppercaseKey !== key) {
          ObjectCid[uppercaseKey] = ObjectCid[key];
          delete ObjectCid[key];
        }
      }
    }
    ObjectCid["ONE HUNDRED"] = ObjectCid["HUNDRED"];
    delete ObjectCid["HUNDRED"];
    price = ObjectCid["PRICE"];
    delete ObjectCid["PRICE"];
    cid = Object.entries(ObjectCid);
    changeUI();
  });
};

//Updating the prices and tokens on page
const changeUI = () => {
  const tokensLeft = document.querySelectorAll(".tokens-left");
  let ObjectCid = Object.fromEntries(cid);
  ObjectCid["HUNDRED"] = ObjectCid["ONE HUNDRED"];
  delete ObjectCid["ONE HUNDRED"];
  tokensLeft.forEach((token) => {
    token.textContent = ObjectCid[token.id];
  });
  currPrice.textContent = price;
};

// Returns the Number of Tokens by dividing totalSum by tokenValue
const tokensTeller = (cid) => {
  const cashToken = [];
  cid.forEach(([tokenName, total]) => {
    for (let token of Object.entries(tokenValues)) {
      if (token[0] === tokenName) {
        cashToken.push([token[0], Math.round(total / token[1])]);
      }
    }
  });
  return cashToken;
};

const calculateChange = (totalCash, cashToken) => {
  const returnToken = [];
  let remainingChange = totalCash;

  for (let [name, value] of Object.entries(tokenValues)) {
    if (remainingChange >= value) {
      const requiredTokens = Math.floor(remainingChange / value);
      const availableTokens = cashToken[name] || 0;
      const usedTokens = Math.min(requiredTokens, availableTokens);

      if (usedTokens > 0) {
        returnToken.push([name, usedTokens * value]);
        remainingChange =
          Math.round((remainingChange - value * usedTokens) * 100) / 100;
        cashToken[name] -= usedTokens;
      }
    }
  }

  return [returnToken, remainingChange];
};

const determineRegisterStatus = (returnToken, cashToken, change, cid) => {
  if (change > 0) {
    return { status: "INSUFFICIENT FUNDS", change: [] };
  } else {
    const totalFunds = Object.values(cashToken).reduce(
      (sum, val) => sum + val,
      0
    );
    if (totalFunds === 0) {
      return {
        status: "CLOSED",
        change: cid,
      };
    } else {
      return { status: "OPEN", change: returnToken };
    }
  }
};

const checkCashRegister = (price, cash, cid) => {
  const change = Math.round((cash - price) * 100) / 100;
  if (change < 0) {
    alert("Customer does not have enough money to purchase the item");
    return;
  } else if (change === 0) {
    const status = {
      status: "No change due - customer paid with exact cash",
    };
    return status;
  } else {
    const cashToken = Object.fromEntries(tokensTeller(cid));
    const [returnToken, remainingChange] = calculateChange(change, cashToken);
    const status = determineRegisterStatus(
      returnToken,
      cashToken,
      remainingChange,
      cid
    );

    // console.log(
    //   `Cash Token: `,
    //   cashToken,
    //   `\n\nChange: `,
    //   remainingChange,
    //   `\n\nReturn Token: `,
    //   returnToken,
    //   `\n\nRegister: `,
    //   status
    // );

    return status;
  }
};

//Changes the change due dialogue box
const changeDue = (status) => {
  if (status.status === "No change due - customer paid with exact cash") {
    changeDueDiv.innerHTML += `<p>${status.status}</p>`;
  } else {
    changeDueDiv.innerHTML += `<p>Status: ${status.status}`;
    const change = status.change;
    change.forEach((val) => {
      changeDueDiv.innerHTML += `
    <div class="row-config">
      <p>${val[0]}: </p>
      <p>${val[1]}</p>
    </div>`;
    });
  }
  changeDueDiv.classList.remove("hide");
  document.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      closeChangeDue();
    }
  });
};
const closeChangeDue = () => {
  changeDueDiv.innerHTML = `<button class="close" id="change-due-close" onclick="closeChangeDue()">Close</button>`;
  changeDueDiv.classList.add("hide");
};

changeUI();
changeValuesBtn.addEventListener("click", changeValues);
purchaseBtn.addEventListener("click", () => {
  if (cash.value === "") {
    alert("Enter Cash Please");
  } else {
    const status = checkCashRegister(price, cash.value, cid);
    changeDue(status);
  }
});
changeDueClosebtn.addEventListener("click", () => {
  changeDueDiv.classList.add("hide");
});
