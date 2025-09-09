let state = {
  health: 100,
  maxHealth: 100,
  inventory: ["Зелье лечения"],
  experience: 0,
  level: 1,
  weapon: { name: "Кулаки", damage: 10 },
  armor: { name: "Без брони", defense: 0 }
};

let enemy = null;

function gainXP(amount) {
  state.experience += amount;
  if (state.experience >= state.level * 50) {
    state.experience = 0;
    state.level++;
    state.maxHealth += 20;
    state.health = state.maxHealth;
    state.weapon.damage += 5;
    alert(`Новый уровень! Теперь у вас ${state.level} уровень. Здоровье восстановлено, урон увеличен.`);
  }
}

function updateHUD() {
  document.getElementById('hud').innerHTML = `
    Здоровье: ${state.health}/${state.maxHealth}<br>
    Уровень: ${state.level}<br>
    Опыт: ${state.experience}/50<br>
    Оружие: ${state.weapon.name} (урон: ${state.weapon.damage})<br>
    Броня: ${state.armor.name} (защита: ${state.armor.defense})<br>
    Инвентарь: ${state.inventory.join(", ") || "пусто"}
  `;
}

function startBattle(enemyName, enemyHealth, enemyDamage) {
  enemy = { name: enemyName, health: enemyHealth, damage: enemyDamage };
  showBattleScene();
}

function showBattleScene() {
  document.getElementById('story').textContent = `На вас нападает ${enemy.name}! Здоровье врага: ${enemy.health}`;
  const choices = document.getElementById('choices');
  choices.innerHTML = "";

  const attackBtn = document.createElement("button");
  attackBtn.textContent = "Атаковать";
  attackBtn.onclick = () => {
    const damageToEnemy = state.weapon.damage;
    enemy.health -= damageToEnemy;

    if (enemy.health <= 0) {
      document.getElementById('story').textContent = `Вы победили ${enemy.name}!`;
      gainXP(50);
      lootDrop();
      showChoices([{ text: "Продолжить путь", next: "exit" }]);
      return;
    }

    const damageToPlayer = Math.max(0, enemy.damage - state.armor.defense);
    state.health -= damageToPlayer;

    if (state.health <= 0) {
      document.getElementById('story').textContent = `Вы получили смертельный удар от ${enemy.name}!`;
      showChoices([{ text: "Начать заново", next: "restart" }]);
      return;
    }

    showBattleScene();
  };
  choices.appendChild(attackBtn);

  const blockBtn = document.createElement("button");
  blockBtn.textContent = "Блокировать";
  blockBtn.onclick = () => {
    const reducedDamage = Math.max(0, Math.floor(enemy.damage / 2) - state.armor.defense);
    state.health -= reducedDamage;
    showBattleScene();
  };
  choices.appendChild(blockBtn);

  const potionBtn = document.createElement("button");
  potionBtn.textContent = "Использовать зелье";
  potionBtn.onclick = () => {
    const potionIndex = state.inventory.indexOf("Зелье лечения");
    if (potionIndex !== -1) {
      state.inventory.splice(potionIndex, 1);
      state.health = Math.min(state.maxHealth, state.health + 30);
      showBattleScene();
    } else {
      alert("У вас нет зелий!");
    }
  };
  choices.appendChild(potionBtn);

  updateHUD();
}

function lootDrop() {
  const loot = [
    { type: "weapon", name: "Острый меч", damage: 20 },
    { type: "armor", name: "Кожаная броня", defense: 5 },
    { type: "potion", name: "Зелье лечения" }
  ];
  const found = loot[Math.floor(Math.random() * loot.length)];

  if (found.type === "weapon") {
    state.weapon = { name: found.name, damage: found.damage };
    alert(`Вы нашли новое оружие: ${found.name} (урон: ${found.damage})`);
  } else if (found.type === "armor") {
    state.armor = { name: found.name, defense: found.defense };
    alert(`Вы нашли броню: ${found.name} (защита: ${found.defense})`);
  } else {
    state.inventory.push(found.name);
    alert(`Вы нашли: ${found.name}`);
  }
}

function showChoices(choices) {
  const container = document.getElementById('choices');
  container.innerHTML = "";
  choices.forEach(choice => {
    const button = document.createElement("button");
    button.textContent = choice.text;
    button.onclick = () => {
      if (choice.next === "restart") {
        state = { health: 100, maxHealth: 100, inventory: ["Зелье лечения"], experience: 0, level: 1, weapon: { name: "Кулаки", damage: 10 }, armor: { name: "Без брони", defense: 0 } };
        showScene("start");
      } else {
        showScene(choice.next);
      }
    };
    container.appendChild(button);
  });
}

const scenes = {
  start: {
    text: "Вы просыпаетесь в тёмном лесу. Впереди две тропинки.",
    choices: [
      { text: "Пойти налево", next: "wolf" },
      { text: "Пойти направо", next: "goblin" }
    ]
  },
  wolf: {
    text: "Вы встречаете голодного волка!",
    choices: [],
    onEnter: () => startBattle("Волк", 40, 12)
  },
  goblin: {
    text: "Из кустов выскакивает гоблин!",
    choices: [],
    onEnter: () => startBattle("Гоблин", 50, 15)
  },
  HobGoblin: {
    text: "На вашем пути встал огромный Хоб-Гоблин",
    choises: [],
    text: ""
  },
  exit: {
    text: "Вы выбрались из леса победителем!",
    choices: [
      { text: "Начать заново", next: "restart" }
    ]
  }
};

function showScene(sceneName) {
  const scene = scenes[sceneName];
  if (scene.onEnter) scene.onEnter();
  else {
    document.getElementById('story').textContent = scene.text;
    showChoices(scene.choices);
    updateHUD();
  }
}

showScene("start");
