export type TopicNode = {
  id: string
  title: string

  // hierarchy
  children?: TopicNode[]

  // leaf-only fields
  difficulty?: "easy" | "medium" | "hard"
  completed?: boolean
  notes?: string
  description?: string
  resources?: {
    id: string
    type: "article" | "video"
    title: string
    url: string
  }[]
}
