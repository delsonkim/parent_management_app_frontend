import type { Child, Parent } from "./types"

export const parent: Parent = {
  id: "p_001",
  firstName: "Sarah",
  lastName: "Tan",
  email: "sarah.tan@example.com",
}

export const child: Child = {
  id: "c_001",
  parentId: parent.id,
  firstName: "Aiden",
  level: "Primary 5",
}
