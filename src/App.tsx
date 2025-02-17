import "./styles.css";
import { useState, useEffect } from "react";
import {
  run,
  getTooltips,
  TICK_RATE,
  GameState,
  BoardCard,
  BoardSkill,
  Player,
  BoardCardOrSkill
} from "./Engine.ts";

import { V2Card, V2Cards } from "./types/cardTypes";
import { EncounterDays } from "./types/encounterTypes";
import React from "react";
import {
  getInitialGameState,
  MonsterConfig,
  PlayerCardConfig,
  PlayerConfig,
  PlayerSkillConfig
} from "./GameState.ts";
import { Tier } from "./types/shared.ts";

import ValidSkillNames from "./json/ValidSkillNames.json";
import ValidObjectNames from "./json/ValidObjectNames.json";

const CARD_HEIGHT = 180;

function Tooltip({
  boardCard,
  gameState,
  playerID,
  boardCardID
}: {
  boardCard: BoardCardOrSkill;
  gameState: GameState;
  playerID: number;
  boardCardID: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        maxWidth: 300,
        backgroundColor: "#222",
        color: "white",
        border: "1px solid black",
        borderRadius: 5,
        padding: "5px 10px",
        zIndex: 1,
        minWidth: 200
      }}
      className="tooltip"
    >
      <div style={{ margin: "5px 0px 5px 0", fontWeight: "bold" }}>
        {boardCard.Localization.Title.Text}
      </div>
      {getTooltips(gameState, playerID, boardCardID).map((tooltip, i) => (
        <div style={{ margin: "10px 10px" }} key={"tooltip" + i}>
          {tooltip}
        </div>
      ))}
    </div>
  );
}

function BoardCardElement({
  boardCard,
  gameState,
  playerID,
  boardCardID
}: {
  boardCard: BoardCard;
  gameState: GameState;
  playerID: number;
  boardCardID: number;
}) {
  const card = boardCard.card;
  const tier = boardCard.tier;
  const cardWidth =
    card.Size === "Small"
      ? CARD_HEIGHT / 2
      : card.Size === "Medium"
        ? CARD_HEIGHT / 1
        : CARD_HEIGHT * 1.5;

  const localeText = card.Localization.Title.Text;
  const imgUrl = `https://www.howbazaar.gg/images/items/${localeText.replace(
    /[ '\-&]/g,
    ""
  )}.avif`;

  const paddingTop = 0.06;
  const paddingLeft = 0.03;
  const paddingBottom = 0.1;
  const paddingRight = 0.04;

  const sizesOneLetter = {
    Large: "L",
    Medium: "M",
    Small: "S"
  };
  const frameUrl = `https://www.bazaarplanner.com/images/fromBT/CardFrame_${tier}_${sizesOneLetter[card.Size]}_TUI.png`;

  return (
    <div className="tooltipContainer" style={{ position: "relative" }}>
      <div
        style={{ position: "absolute", top: 2, right: 2, zIndex: 1 }}
        className="tooltip"
      >
        <button>⚙️</button>
      </div>
      <div
        style={{
          margin: 5,
          position: "relative",
          height: CARD_HEIGHT,
          width: cardWidth,
          marginTop: 5,
          opacity: boardCard.isDisabled ? 0.1 : 1
        }}
      >
        <div
          style={{
            position: "absolute",
            top: CARD_HEIGHT * paddingTop,
            left: CARD_HEIGHT * paddingLeft,
            bottom: CARD_HEIGHT * paddingBottom,
            right: CARD_HEIGHT * paddingRight
          }}
        >
          <img
            src={imgUrl}
            style={{
              filter: boardCard.Freeze > 0 ? "grayscale(1)" : "",
              opacity: boardCard.Freeze > 0 ? 0.5 : 1,
              borderRadius: 5
            }}
            width="100%"
            height="100%"
          />
        </div>
        <img
          src={frameUrl}
          style={{
            position: "absolute"
          }}
          width="100%"
          height="100%"
        />
        {"CooldownMax" in boardCard ? (
          <div
            style={{
              position: "absolute",
              left: CARD_HEIGHT * paddingLeft,
              right: CARD_HEIGHT * paddingRight,
              bottom:
                CARD_HEIGHT * paddingBottom +
                (boardCard.tick / boardCard.CooldownMax) *
                  (CARD_HEIGHT -
                    CARD_HEIGHT * (paddingTop + paddingBottom) -
                    2),
              borderTop: "2px solid white",
              color: "white",
              textAlign: "right",
              fontSize: "8pt",
              boxSizing: "border-box",
              height: 2
            }}
          >
            <span
              style={{
                position: "absolute",
                ...(boardCard.tick / boardCard.CooldownMax > 0.5
                  ? { top: 1 }
                  : { bottom: 3 }),
                right: 2,
                display: "inline-block"
              }}
            >
              {(boardCard.tick / 1000).toFixed(1)} /{" "}
              {(boardCard.CooldownMax / 1000).toFixed(1)}
            </span>
          </div>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            color: "white",
            whiteSpace: "preserve nowrap"
          }}
        >
          {boardCard.Freeze > 0 ? (
            <div
              style={{
                background: "rgba(0.2, 0.2, 0.2, 0.5)",
                padding: "2px 5px",
                borderRadius: 5,
                margin: 2
              }}
            >
              ❄️ {(boardCard.Freeze / 1000).toFixed(1)}
            </div>
          ) : null}
          {boardCard.Slow > 0 ? (
            <div
              style={{
                background: "rgba(0.2, 0.2, 0.2, 0.5)",
                padding: "2px 5px",
                borderRadius: 5,
                margin: 2
              }}
            >
              🐌 {(boardCard.Slow / 1000).toFixed(1)}
            </div>
          ) : null}
          {boardCard.Haste > 0 ? (
            <div
              style={{
                background: "rgba(0.2, 0.2, 0.2, 0.5)",
                padding: "2px 5px",
                borderRadius: 5,
                margin: 2
              }}
            >
              ⏱️ {(boardCard.Haste / 1000).toFixed(1)}
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            top: (CARD_HEIGHT * paddingTop) / 2
          }}
        >
          {boardCard.DamageAmount !== undefined && (
            <div
              style={{
                backgroundColor: "red",
                padding: "2px 5px",
                margin: "0 2px",
                borderRadius: 5,
                color: "white"
              }}
            >
              {boardCard.DamageAmount}
            </div>
          )}
          {boardCard.HealAmount !== undefined && (
            <div
              style={{
                backgroundColor: "limegreen",
                padding: "2px 5px",
                margin: "0 2px",
                borderRadius: 5,
                color: "white"
              }}
            >
              {boardCard.HealAmount}
            </div>
          )}
          {boardCard.BurnApplyAmount !== undefined && (
            <div
              style={{
                backgroundColor: "orange",
                padding: "2px 5px",
                margin: "0 2px",
                borderRadius: 5,
                color: "white"
              }}
            >
              {boardCard.BurnApplyAmount}
            </div>
          )}
          {boardCard.PoisonApplyAmount !== undefined && (
            <div
              style={{
                backgroundColor: "purple",
                padding: "2px 5px",
                margin: "0 2px",
                borderRadius: 5,
                color: "white"
              }}
            >
              {boardCard.PoisonApplyAmount}
            </div>
          )}
          {boardCard.ShieldApplyAmount !== undefined && (
            <div
              style={{
                backgroundColor: "yellow",
                borderRadius: 5,
                padding: "2px 5px",
                margin: "0 2px"
              }}
            >
              {boardCard.ShieldApplyAmount}
            </div>
          )}
        </div>
        {boardCard.CritChance > 0 && (
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 0,
              backgroundColor: "red",
              padding: "1px 3px",
              borderRadius: 5,
              fontSize: "9pt",
              color: "white"
            }}
          >
            🎯 {boardCard.CritChance + "%"}
          </div>
        )}
        {boardCard.SellPrice !== undefined && (
          <div
            style={{
              position: "absolute",
              bottom: 4,
              left: 0,
              backgroundColor: "orange",
              padding: "1px 3px",
              borderRadius: 5,
              fontSize: "9pt",
              color: "white"
            }}
          >
            💰 {boardCard.SellPrice}
          </div>
        )}
        {boardCard.Multicast !== undefined && boardCard.Multicast > 1 && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: 20,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              padding: "1px 3px",
              borderRadius: 5,
              fontSize: "9pt",
              color: "white"
            }}
          >
            x{boardCard.Multicast}
          </div>
        )}
        {boardCard.AmmoMax && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 22,
              display: "flex",
              backgroundColor: "gray",
              padding: "2px 5px",
              borderRadius: 5
            }}
          >
            {[...new Array(boardCard.AmmoMax)].map((_, i) => {
              return (
                <div
                  key={"ammo" + i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 4,
                    backgroundColor:
                      (boardCard.Ammo ?? 0) > i ? "orange" : "transparent",
                    margin: "1px 1px",
                    border: "1px solid orange"
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
      <Tooltip
        boardCard={boardCard}
        gameState={gameState}
        playerID={playerID}
        boardCardID={boardCardID}
      />
    </div>
  );
}

function BoardSkillElement({
  boardSkill,
  gameState,
  playerID,
  boardCardID
}: {
  boardSkill: BoardSkill;
  gameState: GameState;
  playerID: number;
  boardCardID: number;
}) {
  const card = boardSkill.card;
  const tier = boardSkill.tier;

  const IMAGE_SIZE = 60;
  const borderSize = 0.1;

  const localeText = card.Localization.Title.Text;
  const imgUrl = `https://www.howbazaar.gg/images/skills/${localeText.replace(
    /[ '\-&]/g,
    ""
  )}.avif`;

  const frameUrl = `https://www.bazaarplanner.com/images/fromBT/skill_tier_${tier.toLowerCase()}.png`;

  return (
    <div className="tooltipContainer">
      <div
        style={{
          margin: 5,
          position: "relative",
          height: IMAGE_SIZE,
          width: IMAGE_SIZE
        }}
      >
        <div
          style={{
            position: "absolute",
            top: IMAGE_SIZE * borderSize,
            left: IMAGE_SIZE * borderSize,
            right: IMAGE_SIZE * borderSize,
            bottom: IMAGE_SIZE * borderSize
          }}
        >
          <img
            src={imgUrl}
            style={{
              borderRadius: "100%"
            }}
            height="100%"
            width="100%"
          />
        </div>
        <img
          src={frameUrl}
          style={{ position: "absolute", top: 0, left: 0 }}
          width="100%"
          height="100%"
        />
      </div>
      <Tooltip
        boardCard={boardSkill}
        gameState={gameState}
        playerID={playerID}
        boardCardID={boardCardID}
      />
    </div>
  );
}

function GameStep({ gameState }: { gameState: GameState }) {
  return (
    <div>
      {gameState.players.map((player: Player, playerID: number) => {
        const ticks = Math.floor(player.HealthMax / 50);
        const healthBar = (
          <div
            key="healthbar"
            style={{
              border: "1px solid #3abf39",
              borderRadius: 5,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(87, 66, 52, 0.4)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                backgroundColor:
                  Number(player.Poison) > 0 ? "#076044" : "#1da81c",
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: Math.max(0, player.Health / player.HealthMax) * 100 + "%"
              }}
            />
            <div
              style={{
                backgroundColor: "rgba(217, 174, 45, 0.5)",
                position: "absolute",
                top: 0,
                bottom: "50%",
                left: 0,
                width: Math.min(1, player.Shield / player.HealthMax) * 100 + "%"
              }}
            />
            {[...new Array(ticks)].map((_, i) => {
              if (i === 0) {
                return;
              }
              return (
                <div
                  key={"tick" + i}
                  style={{
                    backgroundColor: "#3abf39",
                    position: "absolute",
                    opacity: 0.5,
                    width: 1,
                    top: i % 5 === 0 ? 1 : 5,
                    bottom: i % 5 === 0 ? 1 : 5,
                    left: (i / ticks) * 100 + "%"
                  }}
                />
              );
            })}
            <div
              style={{
                position: "relative",
                fontSize: "20pt",
                textShadow:
                  "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                fontSmooth: "antialiased"
              }}
            >
              <span
                style={{
                  color: "white",
                  display: "inline-block",
                  margin: "0 5px"
                }}
              >
                {Math.floor(player.Health)}
              </span>
              {player.Shield >= 1 ? (
                <span
                  style={{
                    color: "#ffd62e",
                    display: "inline-block",
                    margin: "0 5px"
                  }}
                >
                  {Math.floor(player.Shield)}
                </span>
              ) : null}
              {Number(player.Poison) > 0 ? (
                <span
                  style={{
                    color: "#1e976d",
                    display: "inline-block",
                    margin: "0 5px"
                  }}
                >
                  {player.Poison}
                </span>
              ) : null}
              {Number(player.Burn) > 0 ? (
                <span
                  style={{
                    color: "#d99c3e",
                    display: "inline-block",
                    margin: "0 5px"
                  }}
                >
                  {player.Burn}
                </span>
              ) : null}
              {Number(player.HealthRegen) > 0 ? (
                <span
                  style={{
                    color: "#96dd4b",
                    display: "inline-block",
                    margin: "0 5px"
                  }}
                >
                  {player.HealthRegen}
                </span>
              ) : null}
            </div>
          </div>
        );
        const board = (
          <div key="board" style={{ display: "flex" }}>
            {player.board
              .filter((x): x is BoardCard => x.card.$type === "TCardItem")
              .map((boardCard: BoardCard, i: number) => (
                <BoardCardElement
                  boardCard={boardCard}
                  gameState={gameState}
                  key={i}
                  playerID={playerID}
                  boardCardID={i}
                />
              ))}
          </div>
        );
        const boardSkills = (
          <div key="skills" style={{ display: "flex" }}>
            {player.board
              .filter((x): x is BoardSkill => x.card.$type === "TCardSkill")
              .map(
                (boardSkill: BoardSkill, i: React.Key | null | undefined) => (
                  <BoardSkillElement
                    boardSkill={boardSkill}
                    gameState={gameState}
                    key={i}
                    playerID={playerID}
                    boardCardID={player.board.indexOf(boardSkill)}
                  />
                )
              )}
          </div>
        );
        const display =
          playerID === 0
            ? [boardSkills, healthBar, board]
            : [board, healthBar, boardSkills];
        return <div key={playerID}>{display}</div>;
      })}
    </div>
  );
}

function stepCountToSeconds(stepCount: number) {
  return (stepCount * TICK_RATE) / 1000;
}

function Game({ steps }: { steps: GameState[] }) {
  const [stepCount, setStepCount] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const [autoReset, setAutoReset] = useState(false);

  // If you live reload with a step higher than the length, it would throw.
  let boundedStepCount = Math.min(steps.length - 1, stepCount);

  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      setStepCount((prev) =>
        prev >= steps.length - 1 ? (autoReset ? 0 : prev) : prev + 1
      );
    }, 100);

    return () => clearInterval(interval);
  }, [autoScroll, autoReset]);

  return (
    <div>
      <GameStep gameState={steps[boundedStepCount]} />
      <input
        style={{ width: "100%", marginTop: 20 }}
        type="range"
        min="0"
        max={steps.length - 1}
        value={boundedStepCount}
        onChange={(e) => setStepCount(Number(e.target.value))}
      />
      <div style={{ marginTop: 10 }}>
        <label style={{ marginRight: 10 }}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />{" "}
          Auto Advance
        </label>
        <label>
          <input
            type="checkbox"
            checked={autoReset}
            onChange={(e) => setAutoReset(e.target.checked)}
          />{" "}
          Auto Restart
        </label>
      </div>

      <p>Time: {stepCountToSeconds(boundedStepCount).toFixed(1)}s </p>
      <p>
        Steps: {boundedStepCount}/{steps.length - 1}
      </p>
    </div>
  );
}

function TooltipWithoutGameState({
  Cards,
  card,
  tier
}: {
  Cards: V2Cards;
  card: V2Card;
  tier: Tier;
}) {
  const gameState = getInitialGameState(Cards, {} as EncounterDays, [
    {
      type: "player",
      health: 1000,
      cards: card
        ? [
            {
              name: card.Localization.Title.Text,
              tier
            }
          ]
        : []
    },
    { type: "player", health: 1000 }
  ]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        pointerEvents: "none",
        left: 80,
        width: 200
      }}
    >
      <Tooltip
        boardCard={gameState.players[0].board[0]}
        gameState={gameState}
        playerID={0}
        boardCardID={0}
      />
    </div>
  );
}

function CardSearch({
  Cards,
  onSelectCard,
  onSelectSkill
}: {
  Cards: V2Cards;
  onSelectCard: (card: V2Card) => void;
  onSelectSkill: (card: V2Card) => void;
}) {
  const [search, setSearch] = useState("");
  const [hoveredCard, setHoveredCard] = useState<{
    card: V2Card;
    tier: Tier;
  } | null>(null);

  const searchLower = search.toLowerCase();
  const filteredCards = Object.values(Cards).filter((card) => {
    const cardName = card.Localization.Title.Text;

    // Filter by valid names based on card type
    if (card.$type === "TCardSkill") {
      return (
        ValidSkillNames.includes(cardName) &&
        cardName.toLowerCase().includes(searchLower)
      );
    } else if (card.$type === "TCardItem") {
      return (
        ValidObjectNames.includes(cardName) &&
        cardName.toLowerCase().includes(searchLower)
      );
    }
    return false;
  });

  // Separate cards into items and skills and sort them by name
  const items = filteredCards
    .filter((card) => card.$type === "TCardItem")
    .sort((a, b) =>
      a.Localization.Title.Text.localeCompare(b.Localization.Title.Text)
    );
  const skills = filteredCards
    .filter((card) => card.$type === "TCardSkill")
    .sort((a, b) =>
      a.Localization.Title.Text.localeCompare(b.Localization.Title.Text)
    );

  const CONTAINER_SIZE = 70;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 300,
        padding: 10,
        borderLeft: "1px solid #444",
        overflowY: "auto",
        position: "relative"
      }}
    >
      <input
        type="text"
        placeholder="Search cards..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "90%",
          padding: "8px",
          marginBottom: "10px"
        }}
      />
      <div>
        {items.length > 0 && (
          <>
            <h3 style={{ marginBottom: 10 }}>Items</h3>
            {items.map((card) => {
              const imgWidth =
                card.Size === "Small"
                  ? CONTAINER_SIZE / 2
                  : card.Size === "Large"
                    ? CONTAINER_SIZE * 1.5
                    : CONTAINER_SIZE;

              const paddingTop = 0.06;
              const paddingLeft = 0.03;
              const paddingBottom = 0.08;
              const paddingRight = 0.02;

              const sizesOneLetter = {
                Large: "L",
                Medium: "M",
                Small: "S"
              };
              const frameUrl = `https://www.bazaarplanner.com/images/fromBT/CardFrame_${card.StartingTier}_${sizesOneLetter[card.Size]}_TUI.png`;

              return (
                <div
                  key={card.Id}
                  style={{
                    marginBottom: 2,
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    cursor: "pointer"
                  }}
                  className="tooltipContainer"
                  onClick={() => onSelectCard(card)}
                  onMouseEnter={(e) => {
                    setHoveredCard({
                      card,
                      tier: card.StartingTier
                    });
                  }}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    style={{
                      width: CONTAINER_SIZE * 1.5,
                      height: CONTAINER_SIZE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <div
                      style={{
                        width: imgWidth,
                        height: CONTAINER_SIZE,
                        position: "relative",
                        display: "inline-block"
                      }}
                    >
                      <img
                        src={`https://www.howbazaar.gg/images/items/${card.Localization.Title.Text?.replace(/[ '\-&]/g, "") ?? ""}.avif`}
                        style={{
                          position: "absolute",
                          left: paddingLeft * CONTAINER_SIZE,
                          right: paddingRight * CONTAINER_SIZE,
                          top: paddingTop * CONTAINER_SIZE,
                          bottom: paddingBottom * CONTAINER_SIZE
                        }}
                        width={imgWidth * (1 - paddingLeft - paddingRight)}
                        height={
                          CONTAINER_SIZE * (1 - paddingTop - paddingBottom)
                        }
                        alt={card.Localization.Title.Text}
                      />
                      <img
                        src={frameUrl}
                        style={{ position: "absolute", top: 0, left: 0 }}
                        width="100%"
                        height="100%"
                      />
                    </div>
                  </div>
                  <span style={{ marginLeft: 10 }}>
                    {card.Localization.Title.Text}
                  </span>
                  {hoveredCard && hoveredCard.card === card && (
                    <TooltipWithoutGameState
                      Cards={Cards}
                      card={card}
                      tier={hoveredCard.tier}
                    />
                  )}
                </div>
              );
            })}
          </>
        )}

        {skills.length > 0 && (
          <>
            <h3 style={{ marginTop: 20, marginBottom: 10 }}>Skills</h3>
            {skills.map((card) => {
              const borderSize = 0.1;

              const frameUrl = `https://www.bazaarplanner.com/images/fromBT/skill_tier_${card.StartingTier.toLowerCase()}.png`;
              return (
                <div
                  key={card.Id}
                  style={{
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    cursor: "pointer"
                  }}
                  className="tooltipContainer"
                  onClick={() => onSelectSkill(card)}
                  onMouseEnter={(e) => {
                    setHoveredCard({
                      card,
                      tier: card.StartingTier
                    });
                  }}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    style={{
                      width: CONTAINER_SIZE,
                      height: CONTAINER_SIZE,
                      position: "relative",
                      display: "inline-block"
                    }}
                  >
                    <img
                      src={`https://www.howbazaar.gg/images/skills/${card.Localization.Title.Text?.replace(/[ '\-&]/g, "") ?? ""}.avif`}
                      style={{
                        position: "absolute",
                        left: borderSize * CONTAINER_SIZE,
                        right: borderSize * CONTAINER_SIZE,
                        top: borderSize * CONTAINER_SIZE,
                        bottom: borderSize * CONTAINER_SIZE,
                        borderRadius: "100%"
                      }}
                      width={CONTAINER_SIZE * (1 - 2 * borderSize)}
                      height={CONTAINER_SIZE * (1 - 2 * borderSize)}
                      alt={card.Localization.Title.Text}
                    />
                    <img
                      src={frameUrl}
                      style={{ position: "absolute", top: 0, left: 0 }}
                      width="100%"
                      height="100%"
                    />
                  </div>
                  <span style={{ marginLeft: 10 }}>
                    {card.Localization.Title.Text}
                  </span>
                  {hoveredCard && hoveredCard.card === card && (
                    <TooltipWithoutGameState
                      Cards={Cards}
                      card={card}
                      tier={hoveredCard.tier}
                    />
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default function App({
  Cards,
  Encounters
}: {
  Cards: V2Cards;
  Encounters: EncounterDays;
}) {
  const [monsterConfig, setMonsterConfig] = useState<MonsterConfig | null>(
    null
  );
  const [playerCards, setPlayerCards] = useState<PlayerCardConfig[]>([]);
  const [playerSkills, setPlayerSkills] = useState<PlayerSkillConfig[]>([]);
  const playerConfig = {
    type: "player",
    health: 3500,
    healthRegen: 0,
    cards: playerCards,
    skills: playerSkills
  } as PlayerConfig;

  const initialGameState = getInitialGameState(Cards, Encounters, [
    monsterConfig ?? { type: "player", health: 5 },
    playerConfig
  ]);
  const steps = run(initialGameState, 10000);

  const encounters = Encounters.data
    .map((data) => {
      return data.groups
        .map((day) => {
          return day
            .map((card) => {
              return { card, day: data.day };
            })
            .flat();
        })
        .flat();
    })
    .flat();

  return (
    <div
      style={{ display: "flex", height: "calc(100vh - 20px)" }}
      className="App"
    >
      <div style={{ flex: 1, marginRight: 10 }}>
        <select
          onChange={(e) => {
            setMonsterConfig(
              e.target.value ? { type: "monster", name: e.target.value } : null
            );
          }}
        >
          <option value="">Select an encounter</option>
          {encounters.map((encounter) => {
            return (
              <option
                value={encounter.card.cardName}
                key={encounter.card.cardId}
              >
                Day {encounter.day} - {encounter.card.cardName}
              </option>
            );
          })}
        </select>
        <Game steps={steps} />
      </div>
      <CardSearch
        Cards={Cards}
        onSelectCard={(card) =>
          setPlayerCards([
            ...playerCards,
            { name: card.Localization.Title.Text, tier: card.StartingTier }
          ])
        }
        onSelectSkill={(card) =>
          setPlayerSkills([
            ...playerSkills,
            { name: card.Localization.Title.Text, tier: card.StartingTier }
          ])
        }
      />
    </div>
  );
}
