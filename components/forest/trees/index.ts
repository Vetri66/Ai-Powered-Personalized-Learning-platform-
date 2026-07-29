import type { TreeStage } from "./types"
import { AutumnMapleTree } from "./autumn-maple-tree"
import { CherryBlossomTree } from "./cherry-blossom-tree"
import { ChristmasPineTree } from "./christmas-pine-tree"
import { CloudSakuraTree } from "./cloud-sakura-tree"
import { JacarandaTree } from "./jacaranda-tree"
import { LotusBloomTree } from "./lotus-bloom-tree"
import { PlumBlossomTree } from "./plum-blossom-tree"
import { RoseFloralTree } from "./rose-floral-tree"
import { StarGalaxyTree } from "./star-galaxy-tree"
import { WeepingWillowTree } from "./weeping-willow-tree"

type TreeRarity = "common" | "premium" | "rare"

export type TreeId =
  | "cherry"
  | "autumn"
  | "star"
  | "christmas"
  | "plum"
  | "rose"
  | "lotus"
  | "cloud"
  | "willow"
  | "jacaranda"

export type TreeDefinition = {
  id: TreeId
  name: string
  duration: number
  description: string
  rarity: TreeRarity
  colors: string
  component: ({ stage, className }: { stage: TreeStage; className?: string }) => JSX.Element
}

export const TREE_DEFINITIONS: TreeDefinition[] = [
  {
    id: "cherry",
    name: "Cherry Blossom",
    duration: 25,
    description: "Soft sakura petals and morning calm.",
    rarity: "common",
    colors: "#FFB7C5",
    component: CherryBlossomTree,
  },
  {
    id: "autumn",
    name: "Autumn Maple",
    duration: 60,
    description: "Warm leaves and drifting ember light.",
    rarity: "common",
    colors: "#FF6B35",
    component: AutumnMapleTree,
  },
  {
    id: "star",
    name: "Star Galaxy",
    duration: 90,
    description: "Cosmic wonder with twinkling stars.",
    rarity: "premium",
    colors: "#1A237E",
    component: StarGalaxyTree,
  },
  {
    id: "christmas",
    name: "Christmas Pine",
    duration: 60,
    description: "Festive evergreen with glowing ornaments.",
    rarity: "common",
    colors: "#0F5132",
    component: ChristmasPineTree,
  },
  {
    id: "plum",
    name: "Plum Blossom",
    duration: 90,
    description: "Twisted branches with vivid plum bloom.",
    rarity: "premium",
    colors: "#E91E63",
    component: PlumBlossomTree,
  },
  {
    id: "rose",
    name: "Rose Floral",
    duration: 45,
    description: "Velvet floral canopy with warm pink glow.",
    rarity: "common",
    colors: "#EC407A",
    component: RoseFloralTree,
  },
  {
    id: "lotus",
    name: "Lotus Bloom",
    duration: 75,
    description: "Calm layered petals with serene bloom energy.",
    rarity: "premium",
    colors: "#F8BBD0",
    component: LotusBloomTree,
  },
  {
    id: "cloud",
    name: "Cloud Sakura",
    duration: 120,
    description: "Rare cloud-like canopy and soft glow.",
    rarity: "rare",
    colors: "#FFF0F5",
    component: CloudSakuraTree,
  },
  {
    id: "willow",
    name: "Weeping Willow",
    duration: 120,
    description: "Elegant hanging branches with flowing motion.",
    rarity: "rare",
    colors: "#90EE90",
    component: WeepingWillowTree,
  },
  {
    id: "jacaranda",
    name: "Jacaranda",
    duration: 120,
    description: "Umbrella canopy with purple flower rain.",
    rarity: "rare",
    colors: "#9C27B0",
    component: JacarandaTree,
  },
]

export * from "./types"
